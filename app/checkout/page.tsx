'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/contexts/CartContext';
import { Address, PaymentMethod } from '@/types/customer';

export default function CheckoutPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { items, itemCount, totalAmount, clearCart } = useCart();

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>('');
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('COD');
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Address form state
  const [addressForm, setAddressForm] = useState({
    name: '',
    phoneNumber: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    pincode: '',
    isDefault: false,
  });

  // Redirect if not logged in
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push(`/login?callbackUrl=/checkout`);
    }
  }, [status, router]);

  // Redirect if cart is empty
  useEffect(() => {
    if (itemCount === 0 && status === 'authenticated') {
      router.push('/cart');
    }
  }, [itemCount, status, router]);

  // Fetch addresses
  useEffect(() => {
    if (session?.user?.id) {
      fetchAddresses();
    }
  }, [session]);

  const fetchAddresses = async () => {
    try {
      const response = await fetch('/api/addresses');
      if (response.ok) {
        const data = await response.json();
        setAddresses(data);
        // Auto-select default address
        const defaultAddr = data.find((addr: Address) => addr.isDefault);
        if (defaultAddr) {
          setSelectedAddressId(defaultAddr.id);
        } else if (data.length > 0) {
          setSelectedAddressId(data[0].id);
        }
      }
    } catch (error) {
      console.error('Error fetching addresses:', error);
    }
  };

  const handleAddressFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;

    let processedValue = value;

    // Phone number: only digits, max 10
    if (name === 'phoneNumber') {
      processedValue = value.replace(/\D/g, '').slice(0, 10);
    }

    // Pincode: only digits, max 6
    if (name === 'pincode') {
      processedValue = value.replace(/\D/g, '').slice(0, 6);
    }

    setAddressForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : processedValue,
    }));
  };

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch('/api/addresses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(addressForm),
      });

      if (response.ok) {
        const newAddress = await response.json();
        setAddresses([...addresses, newAddress]);
        setSelectedAddressId(newAddress.id);
        setShowAddressForm(false);
        // Reset form
        setAddressForm({
          name: '',
          phoneNumber: '',
          addressLine1: '',
          addressLine2: '',
          city: '',
          state: '',
          pincode: '',
          isDefault: false,
        });
      } else {
        const error = await response.json();
        setError(error.message || 'Failed to add address');
      }
    } catch (error) {
      setError('Failed to add address');
    }
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddressId) {
      setError('Please select a delivery address');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          addressId: selectedAddressId,
          paymentMethod,
          notes,
        }),
      });

      if (response.ok) {
        const order = await response.json();
        await clearCart();
        router.push(`/order-confirmation?orderId=${order.id}`);
      } else {
        const error = await response.json();
        setError(error.message || 'Failed to place order');
      }
    } catch (error) {
      setError('Failed to place order. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-maroon mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-maroon mb-8">Checkout</h1>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Checkout Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Delivery Address */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800">Delivery Address</h2>
                <button
                  onClick={() => setShowAddressForm(!showAddressForm)}
                  className="text-maroon hover:text-deep-maroon font-medium text-sm"
                >
                  {showAddressForm ? 'Cancel' : '+ Add New Address'}
                </button>
              </div>

              {showAddressForm ? (
                <form onSubmit={handleAddAddress} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      type="text"
                      name="name"
                      value={addressForm.name}
                      onChange={handleAddressFormChange}
                      placeholder="Full Name *"
                      required
                      className="border border-gray-300 rounded-md px-3 py-2"
                    />
                    <input
                      type="tel"
                      name="phoneNumber"
                      value={addressForm.phoneNumber}
                      onChange={handleAddressFormChange}
                      placeholder="Phone Number *"
                      required
                      maxLength={10}
                      pattern="[0-9]{10}"
                      className="border border-gray-300 rounded-md px-3 py-2"
                    />
                  </div>
                  <input
                    type="text"
                    name="addressLine1"
                    value={addressForm.addressLine1}
                    onChange={handleAddressFormChange}
                    placeholder="Address Line 1 *"
                    required
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                  <input
                    type="text"
                    name="addressLine2"
                    value={addressForm.addressLine2}
                    onChange={handleAddressFormChange}
                    placeholder="Address Line 2 (Optional)"
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <input
                      type="text"
                      name="city"
                      value={addressForm.city}
                      onChange={handleAddressFormChange}
                      placeholder="City *"
                      required
                      className="border border-gray-300 rounded-md px-3 py-2"
                    />
                    <input
                      type="text"
                      name="state"
                      value={addressForm.state}
                      onChange={handleAddressFormChange}
                      placeholder="State *"
                      required
                      className="border border-gray-300 rounded-md px-3 py-2"
                    />
                    <input
                      type="text"
                      name="pincode"
                      value={addressForm.pincode}
                      onChange={handleAddressFormChange}
                      placeholder="Pincode *"
                      required
                      maxLength={6}
                      pattern="[0-9]{6}"
                      className="border border-gray-300 rounded-md px-3 py-2"
                    />
                  </div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="isDefault"
                      checked={addressForm.isDefault}
                      onChange={handleAddressFormChange}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-600">Set as default address</span>
                  </label>
                  <button
                    type="submit"
                    className="btn-primary px-6 py-2 rounded-md"
                  >
                    Save Address
                  </button>
                </form>
              ) : (
                <div className="space-y-3">
                  {addresses.length === 0 ? (
                    <p className="text-gray-500">No saved addresses. Please add a new address.</p>
                  ) : (
                    addresses.map((address) => (
                      <label
                        key={address.id}
                        className={`block border rounded-lg p-4 cursor-pointer transition-colors ${
                          selectedAddressId === address.id
                            ? 'border-maroon bg-maroon bg-opacity-5'
                            : 'border-gray-300 hover:border-maroon'
                        }`}
                      >
                        <input
                          type="radio"
                          name="address"
                          value={address.id}
                          checked={selectedAddressId === address.id}
                          onChange={(e) => setSelectedAddressId(e.target.value)}
                          className="mr-3"
                        />
                        <div className="inline-block">
                          <p className="font-semibold text-gray-800">{address.name}</p>
                          <p className="text-sm text-gray-600">{address.phoneNumber}</p>
                          <p className="text-sm text-gray-600">
                            {address.addressLine1}
                            {address.addressLine2 && `, ${address.addressLine2}`}
                          </p>
                          <p className="text-sm text-gray-600">
                            {address.city}, {address.state} - {address.pincode}
                          </p>
                          {address.isDefault && (
                            <span className="inline-block mt-1 text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                              Default
                            </span>
                          )}
                        </div>
                      </label>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* Payment Method */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Payment Method</h2>
              <div className="space-y-3">
                <label className="flex items-center border border-gray-300 rounded-lg p-4 cursor-pointer hover:border-maroon">
                  <input
                    type="radio"
                    name="payment"
                    value="COD"
                    checked={paymentMethod === 'COD'}
                    onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                    className="mr-3"
                  />
                  <div>
                    <p className="font-semibold">Cash on Delivery</p>
                    <p className="text-sm text-gray-600">Pay when you receive the order</p>
                  </div>
                </label>
                <label className="flex items-center border border-gray-300 rounded-lg p-4 cursor-pointer hover:border-maroon">
                  <input
                    type="radio"
                    name="payment"
                    value="UPI"
                    checked={paymentMethod === 'UPI'}
                    onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                    className="mr-3"
                  />
                  <div>
                    <p className="font-semibold">UPI Payment</p>
                    <p className="text-sm text-gray-600">Pay using UPI apps</p>
                  </div>
                </label>
              </div>
            </div>

            {/* Order Notes */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Order Notes (Optional)</h2>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any special instructions for your order?"
                rows={4}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              />
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Order Summary</h2>

              <div className="space-y-2 mb-4 max-h-60 overflow-y-auto">
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-gray-600">
                      {item.product?.name} x {item.quantity}
                    </span>
                    <span className="text-gray-800">
                      ₹{(parseFloat(item.product?.price || '0') * item.quantity).toLocaleString('en-IN')}
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-200 pt-4 space-y-3">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal ({itemCount} items)</span>
                  <span>₹{totalAmount.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span className="text-green-600">FREE</span>
                </div>
                <div className="border-t border-gray-200 pt-3 flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span className="text-maroon">₹{totalAmount.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <button
                onClick={handlePlaceOrder}
                disabled={isLoading || !selectedAddressId}
                className="w-full btn-primary py-3 rounded-md font-semibold mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Placing Order...' : 'Place Order'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
