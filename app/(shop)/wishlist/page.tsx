'use client';

import { useEffect, useState } from 'react';
import { useWishlist } from '@/contexts/WishlistContext';
import { useCart } from '@/contexts/CartContext';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import Image from 'next/image';

interface WishlistProduct {
    id: string;
    productId: string;
    createdAt: string;
    product: {
        id: string;
        name: string;
        description: string;
        price: string;
        material: string;
        categoryId: string;
        active: boolean;
        colors: Array<{
            id: string;
            color: string;
            colorCode: string;
            inStock: boolean;
            images: Array<{
                id: string;
                url: string;
                altText: string | null;
                displayOrder: number;
            }>;
        }>;
    };
}

export default function WishlistPage() {
    const { wishlistItems, removeFromWishlist, isLoading, isSyncing } = useWishlist();
    const { addToCart } = useCart();
    const { data: session } = useSession();
    const [products, setProducts] = useState<WishlistProduct[]>([]);
    const [loadingProducts, setLoadingProducts] = useState(true);
    const [addingToCart, setAddingToCart] = useState<string | null>(null);

    // Fetch product details for wishlist items
    useEffect(() => {
        const fetchProducts = async () => {
            if (session?.user?.id) {
                // Fetch from backend for authenticated users
                try {
                    const response = await fetch('/api/wishlist');
                    if (response.ok) {
                        const data = await response.json();
                        setProducts(data.items);
                    }
                } catch (error) {
                    console.error('Error fetching wishlist products:', error);
                } finally {
                    setLoadingProducts(false);
                }
            } else {
                // Fetch products by IDs for non-authenticated users
                if (wishlistItems.length > 0) {
                    try {
                        const productPromises = wishlistItems.map(async (productId) => {
                            const response = await fetch(`/api/products/${productId}`);
                            if (response.ok) {
                                const product = await response.json();
                                return {
                                    id: productId,
                                    productId: productId,
                                    createdAt: new Date().toISOString(),
                                    product,
                                };
                            }
                            return null;
                        });

                        const fetchedProducts = await Promise.all(productPromises);
                        setProducts(fetchedProducts.filter((p): p is WishlistProduct => p !== null));
                    } catch (error) {
                        console.error('Error fetching products:', error);
                    } finally {
                        setLoadingProducts(false);
                    }
                } else {
                    setLoadingProducts(false);
                }
            }
        };

        fetchProducts();
    }, [wishlistItems, session?.user?.id]);

    const handleRemoveFromWishlist = async (productId: string) => {
        await removeFromWishlist(productId);
        setProducts((prev) => prev.filter((item) => item.productId !== productId));
    };

    const handleAddToCart = async (product: WishlistProduct['product']) => {
        setAddingToCart(product.id);
        try {
            const firstColor = product.colors && product.colors.length > 0 ? product.colors[0] : null;
            await addToCart({
                productId: product.id,
                productColorId: firstColor ? firstColor.color : undefined,
                quantity: 1,
            });
        } catch (error) {
            console.error('Error adding to cart:', error);
        } finally {
            setAddingToCart(null);
        }
    };

    if (isSyncing || loadingProducts) {
        return (
            <div className="min-h-screen bg-cream pt-32 pb-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-center py-20">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-maroon mx-auto mb-4"></div>
                            <p className="text-gray-600">Loading your wishlist...</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (products.length === 0) {
        return (
            <div className="min-h-screen bg-cream pt-32 pb-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h1 className="text-4xl font-bold text-maroon mb-8 text-center">My Wishlist</h1>

                    <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
                        <svg
                            className="w-24 h-24 mx-auto mb-6 text-gray-300"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1.5}
                                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                            />
                        </svg>
                        <h2 className="text-2xl font-bold text-gray-800 mb-3">Your Wishlist is Empty</h2>
                        <p className="text-gray-600 mb-8 max-w-md mx-auto">
                            Save your favorite sarees to your wishlist and shop them later!
                        </p>
                        <Link
                            href="/shop"
                            className="inline-block bg-maroon text-white px-8 py-3 rounded-lg font-semibold hover:bg-deep-maroon transition-colors shadow-lg hover:shadow-xl"
                        >
                            Browse Products
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-cream pt-32 pb-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-maroon mb-2">My Wishlist</h1>
                    <p className="text-gray-600">
                        {products.length} {products.length === 1 ? 'item' : 'items'} saved
                    </p>
                </div>

                {/* Products Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {products.map((item) => {
                        const product = item.product;
                        const firstColor = product.colors && product.colors.length > 0 ? product.colors[0] : null;
                        const firstImage = firstColor?.images && firstColor.images.length > 0 ? firstColor.images[0] : null;

                        return (
                            <div key={item.id} className="bg-white rounded-2xl shadow-lg overflow-hidden card-hover">
                                <Link href={`/product/${product.id}`}>
                                    {/* Product Image */}
                                    <div className="aspect-square bg-gradient-to-br from-maroon via-indian-red to-saffron relative group overflow-hidden">
                                        {firstImage ? (
                                            <Image
                                                src={firstImage.url}
                                                alt={firstImage.altText || product.name}
                                                fill
                                                className="object-cover"
                                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                                            />
                                        ) : (
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <svg className="w-24 h-24 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                                                </svg>
                                            </div>
                                        )}

                                        {/* Hover overlay */}
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                                            <span className="text-white text-lg font-semibold">View Details</span>
                                        </div>
                                    </div>
                                </Link>

                                {/* Product Info */}
                                <div className="p-6">
                                    <Link href={`/product/${product.id}`}>
                                        <h3 className="text-xl font-bold text-maroon mb-2 hover:text-saffron transition-colors line-clamp-2">
                                            {product.name}
                                        </h3>
                                    </Link>

                                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                                        {product.description}
                                    </p>

                                    <div className="flex items-center justify-between mb-4">
                                        <span className="text-2xl font-bold text-maroon">
                                            ₹{Number(product.price).toLocaleString('en-IN')}
                                        </span>
                                        <span className="text-sm text-gray-500">{product.material}</span>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="grid grid-cols-2 gap-2">
                                        <button
                                            onClick={() => handleAddToCart(product)}
                                            disabled={addingToCart === product.id}
                                            className="py-2 px-4 rounded-md font-medium bg-maroon text-white hover:bg-deep-maroon transition-colors disabled:opacity-50"
                                        >
                                            {addingToCart === product.id ? 'Adding...' : 'Add to Cart'}
                                        </button>
                                        <button
                                            onClick={() => handleRemoveFromWishlist(product.id)}
                                            disabled={isLoading}
                                            className="py-2 px-4 rounded-md font-medium border-2 border-red-600 text-red-600 hover:bg-red-600 hover:text-white transition-colors disabled:opacity-50 flex items-center justify-center gap-1"
                                        >
                                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                                <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                            </svg>
                                            Remove
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
