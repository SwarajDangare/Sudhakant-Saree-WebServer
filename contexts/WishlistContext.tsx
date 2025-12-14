'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';

interface WishlistContextType {
    wishlistItems: string[]; // List of product IDs
    addToWishlist: (productId: string) => Promise<void>;
    removeFromWishlist: (productId: string) => Promise<void>;
    isInWishlist: (productId: string) => boolean;
    toggleWishlist: (productId: string) => Promise<void>;
    isLoading: boolean;
    isSyncing: boolean;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: React.ReactNode }) {
    const [wishlistItems, setWishlistItems] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isSyncing, setIsSyncing] = useState(false);
    const [hasLoadedFromBackend, setHasLoadedFromBackend] = useState(false);
    const { data: session, status } = useSession();

    // Load from localStorage on mount (for non-authenticated users)
    useEffect(() => {
        if (typeof window !== 'undefined' && status !== 'loading') {
            const stored = localStorage.getItem('wishlist_items');
            if (stored) {
                try {
                    setWishlistItems(JSON.parse(stored));
                } catch (e) {
                    console.error('Failed to parse wishlist items', e);
                }
            }
        }
    }, [status]);

    // Sync with backend when user logs in
    useEffect(() => {
        const syncWithBackend = async () => {
            if (session?.user?.id && !hasLoadedFromBackend) {
                setIsSyncing(true);
                try {
                    // Get localStorage items before fetching from backend
                    const localItems = [...wishlistItems];

                    // Fetch wishlist from backend
                    const response = await fetch('/api/wishlist');
                    if (response.ok) {
                        const data = await response.json();
                        const backendItems = data.items.map((item: any) => item.productId);

                        // Merge localStorage items with backend items
                        const mergedItems = Array.from(new Set([...backendItems, ...localItems]));

                        // If there are new items from localStorage, sync them to backend
                        const newItems = localItems.filter(id => !backendItems.includes(id));
                        if (newItems.length > 0) {
                            await fetch('/api/wishlist', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ productIds: newItems }),
                            });
                        }

                        setWishlistItems(mergedItems);
                        localStorage.setItem('wishlist_items', JSON.stringify(mergedItems));
                        setHasLoadedFromBackend(true);
                    }
                } catch (error) {
                    console.error('Failed to sync wishlist with backend:', error);
                } finally {
                    setIsSyncing(false);
                }
            }
        };

        syncWithBackend();
    }, [session?.user?.id, hasLoadedFromBackend]);

    // Reset hasLoadedFromBackend when user logs out
    useEffect(() => {
        if (!session?.user?.id) {
            setHasLoadedFromBackend(false);
        }
    }, [session?.user?.id]);

    // Sync to localStorage whenever items change (for non-authenticated users)
    useEffect(() => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('wishlist_items', JSON.stringify(wishlistItems));
        }
    }, [wishlistItems]);

    const addToWishlist = useCallback(async (productId: string) => {
        if (wishlistItems.includes(productId)) return;

        // Optimistically update UI
        setWishlistItems((prev) => [...prev, productId]);

        // If user is authenticated, sync to backend
        if (session?.user?.id) {
            setIsLoading(true);
            try {
                const response = await fetch('/api/wishlist', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ productId }),
                });

                if (!response.ok) {
                    // Revert on error
                    setWishlistItems((prev) => prev.filter((id) => id !== productId));
                    console.error('Failed to add to wishlist');
                }
            } catch (error) {
                // Revert on error
                setWishlistItems((prev) => prev.filter((id) => id !== productId));
                console.error('Error adding to wishlist:', error);
            } finally {
                setIsLoading(false);
            }
        }
    }, [wishlistItems, session?.user?.id]);

    const removeFromWishlist = useCallback(async (productId: string) => {
        // Optimistically update UI
        setWishlistItems((prev) => prev.filter((id) => id !== productId));

        // If user is authenticated, sync to backend
        if (session?.user?.id) {
            setIsLoading(true);
            try {
                const response = await fetch(`/api/wishlist?productId=${productId}`, {
                    method: 'DELETE',
                });

                if (!response.ok) {
                    // Revert on error
                    setWishlistItems((prev) => [...prev, productId]);
                    console.error('Failed to remove from wishlist');
                }
            } catch (error) {
                // Revert on error
                setWishlistItems((prev) => [...prev, productId]);
                console.error('Error removing from wishlist:', error);
            } finally {
                setIsLoading(false);
            }
        }
    }, [session?.user?.id]);

    const toggleWishlist = useCallback(async (productId: string) => {
        if (wishlistItems.includes(productId)) {
            await removeFromWishlist(productId);
        } else {
            await addToWishlist(productId);
        }
    }, [wishlistItems, addToWishlist, removeFromWishlist]);

    const isInWishlist = useCallback((productId: string) => {
        return wishlistItems.includes(productId);
    }, [wishlistItems]);

    return (
        <WishlistContext.Provider
            value={{
                wishlistItems,
                addToWishlist,
                removeFromWishlist,
                isInWishlist,
                toggleWishlist,
                isLoading,
                isSyncing,
            }}
        >
            {children}
        </WishlistContext.Provider>
    );
}

export function useWishlist() {
    const context = useContext(WishlistContext);
    if (context === undefined) {
        throw new Error('useWishlist must be used within a WishlistProvider');
    }
    return context;
}
