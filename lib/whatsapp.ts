/**
 * WhatsApp Integration Utilities
 * Generate WhatsApp links for sending order updates
 */

interface OrderDetails {
  orderNumber: string;
  customerName: string;
  status: string;
  total: string;
  items?: Array<{
    productName: string;
    quantity: number;
    price: string;
  }>;
}

/**
 * Generate WhatsApp message for order status update
 */
export function generateOrderUpdateMessage(order: OrderDetails): string {
  const statusMessages: Record<string, string> = {
    PENDING: 'Your order has been received and is being processed.',
    CONFIRMED: 'Your order has been confirmed! 🎉',
    PROCESSING: 'Your order is being prepared for shipment.',
    SHIPPED: 'Your order has been shipped! 📦',
    DELIVERED: 'Your order has been delivered! ✅',
    CANCELLED: 'Your order has been cancelled.',
  };

  const statusMessage = statusMessages[order.status] || 'Your order status has been updated.';

  let message = `Hello ${order.customerName}! 👋\n\n`;
  message += `${statusMessage}\n\n`;
  message += `*Order Details:*\n`;
  message += `Order #: ${order.orderNumber}\n`;
  message += `Status: ${order.status}\n`;
  message += `Total: ₹${order.total}\n`;

  if (order.items && order.items.length > 0) {
    message += `\n*Items:*\n`;
    order.items.forEach((item, index) => {
      message += `${index + 1}. ${item.productName} (x${item.quantity}) - ₹${item.price}\n`;
    });
  }

  message += `\nThank you for shopping with Sudhakant Sarees! 🙏`;

  return message;
}

/**
 * Generate WhatsApp link with pre-filled message
 * @param phoneNumber - Customer's 10-digit phone number (without country code)
 * @param message - Message to send
 * @returns WhatsApp API URL
 */
export function generateWhatsAppLink(phoneNumber: string, message: string): string {
  // Format: 91 (India) + 10-digit phone number
  const formattedPhone = `91${phoneNumber}`;

  // URL encode the message
  const encodedMessage = encodeURIComponent(message);

  // Generate WhatsApp API link
  return `https://api.whatsapp.com/send?phone=${formattedPhone}&text=${encodedMessage}`;
}

/**
 * Generate WhatsApp link for order update
 */
export function generateOrderUpdateWhatsAppLink(
  phoneNumber: string,
  orderDetails: OrderDetails
): string {
  const message = generateOrderUpdateMessage(orderDetails);
  return generateWhatsAppLink(phoneNumber, message);
}
