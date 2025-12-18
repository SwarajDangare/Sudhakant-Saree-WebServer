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
    isWishlistOpen: boolean;
    setIsWishlistOpen: (isOpen: boolean) => void;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: React.ReactNode }) {
    const [wishlistItems, setWishlistItems] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isSyncing, setIsSyncing] = useState(false);
    const [isWishlistOpen, setIsWishlistOpen] = useState(false);
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
        // Optimistically update UI using functional setState to avoid stale closure
        setWishlistItems((prev) => {
            if (prev.includes(productId)) return prev;
            return [...prev, productId];
        });

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
                setIsWishlistOpen(true);
            }
        } else {
            // For non-authenticated, it was already updated optimistically
            setIsWishlistOpen(true);
        }
    }, [session?.user?.id]);

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
        // Determine if the item is currently in the wishlist *before* the optimistic update
        // This value will be used for the backend call.
        const isCurrentlyInWishlist = wishlistItems.includes(productId);

        // Optimistically update UI
        setWishlistItems((prev) => {
            if (prev.includes(productId)) {
                return prev.filter((id) => id !== productId);
            } else {
                return [...prev, productId];
            }
        });

        // If user is authenticated, sync to backend
        if (session?.user?.id) {
            setIsLoading(true);
            try {
                if (isCurrentlyInWishlist) {
                    // Remove from wishlist
                    const response = await fetch(`/api/wishlist?productId=${productId}`, {
                        method: 'DELETE',
                    });

                    if (!response.ok) {
                        // Revert on error - add back
                        setWishlistItems((prev) => [...prev, productId]);
                        console.error('Failed to remove from wishlist');
                    }
                } else {
                    // Add to wishlist
                    const response = await fetch('/api/wishlist', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ productId }),
                    });

                    if (!response.ok) {
                        // Revert on error - remove
                        setWishlistItems((prev) => prev.filter((id) => id !== productId));
                        console.error('Failed to add to wishlist');
                    }
                }
            } catch (error) {
                // Revert on error
                setWishlistItems((prev) => {
                    if (isCurrentlyInWishlist) { // If it was in wishlist, add it back
                        return [...prev, productId];
                    } else { // If it was not in wishlist, remove it
                        return prev.filter((id) => id !== productId);
                    }
                });
                console.error('Error toggling wishlist:', error);
            } finally {
                setIsLoading(false);
                if (!isCurrentlyInWishlist) {
                    setIsWishlistOpen(true);
                }
            }
        } else {
            // For non-authenticated
            if (!isCurrentlyInWishlist) {
                setIsWishlistOpen(true);
            }
        }
    }, [session?.user?.id, wishlistItems]); // wishlistItems is needed here to capture its value at the time of call for `isCurrentlyInWishlist`

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
                isWishlistOpen,
                setIsWishlistOpen,
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
