'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

interface WishlistContextType {
    wishlistItems: string[]; // List of product IDs
    addToWishlist: (productId: string) => void;
    removeFromWishlist: (productId: string) => void;
    isInWishlist: (productId: string) => boolean;
    toggleWishlist: (productId: string) => void;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: React.ReactNode }) {
    const [wishlistItems, setWishlistItems] = useState<string[]>([]);

    // Load from localStorage on mount
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const stored = localStorage.getItem('wishlist_items');
            if (stored) {
                try {
                    setWishlistItems(JSON.parse(stored));
                } catch (e) {
                    console.error('Failed to parse wishlist items', e);
                }
            }
        }
    }, []);

    // Sync to localStorage whenever items change
    useEffect(() => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('wishlist_items', JSON.stringify(wishlistItems));
        }
    }, [wishlistItems]);

    const addToWishlist = useCallback((productId: string) => {
        setWishlistItems((prev) => {
            if (prev.includes(productId)) return prev;
            return [...prev, productId];
        });
    }, []);

    const removeFromWishlist = useCallback((productId: string) => {
        setWishlistItems((prev) => prev.filter((id) => id !== productId));
    }, []);

    const toggleWishlist = useCallback((productId: string) => {
        setWishlistItems((prev) => {
            if (prev.includes(productId)) {
                return prev.filter((id) => id !== productId);
            } else {
                return [...prev, productId];
            }
        });
    }, []);

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
