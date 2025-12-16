import React, { createContext, useState, useContext, useEffect, useMemo } from 'react';
import { useAuth } from './AuthContext';
import { userService } from '../services/userService';
import type { Product } from '../types';

interface WishlistContextType {
  wishlistItems: Product[];
  addToWishlist: (product: Product) => void;
  removeFromWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  wishlistCount: number;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();

  const storageKey = (uid?: string | null) => `nexusWishlist:${uid ?? 'guest'}`;

  const [wishlistItems, setWishlistItems] = useState<Product[]>([]);

  // Load initial data and handle migration on auth changes
  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const uid = user?.id;
        if (!uid) {
          const guestRaw = localStorage.getItem(storageKey(null));
          const guest = guestRaw ? JSON.parse(guestRaw) : [];
          if (mounted) setWishlistItems(guest);
          return;
        }

        const [serverRes, guestRaw] = await Promise.all([
          userService.getWishlist().catch(() => ({ wishlist: [] })),
          (async () => localStorage.getItem(storageKey(null)))(),
        ]);
        const serverWishlist = serverRes?.wishlist || [];
        const guestWishlist = guestRaw ? JSON.parse(guestRaw) : [];

        if (guestWishlist.length === 0) {
          if (mounted) setWishlistItems(serverWishlist);
          try { localStorage.removeItem(storageKey(null)); } catch {}
          return;
        }

        const ids = new Set(serverWishlist.map((p: Product) => p.id));
        const merged = [...serverWishlist];
        [...guestWishlist].forEach((p: Product) => { if (!ids.has(p.id)) { ids.add(p.id); merged.push(p); } });
        if (mounted) setWishlistItems(merged);

        try {
          await userService.updateWishlist(merged);
          localStorage.removeItem(storageKey(null));
        } catch (err) {
          console.warn('Failed to persist merged wishlist to server', err);
        }
      } catch (err) {
        console.warn('Wishlist load/migration failed', err);
      }
    };
    load();
    return () => { mounted = false; };
  }, [user?.id]);

  // Persist to localStorage only for guests
  useEffect(() => {
    if (user?.id) return;
    try {
      localStorage.setItem(storageKey(null), JSON.stringify(wishlistItems));
    } catch (err) {
      // ignore
    }
  }, [wishlistItems, user?.id]);

  const addToWishlist = async (product: Product) => {
    if (!user?.id) {
      setWishlistItems(prevItems => prevItems.some(item => item.id === product.id) ? prevItems : [...prevItems, product]);
      return;
    }
    try {
      const res = await userService.addWishlistItem(product);
      const updated = res?.wishlist ?? [];
      setWishlistItems(updated);
    } catch (err) {
      console.warn('Failed to add wishlist item to server', err);
    }
  };

  const removeFromWishlist = async (productId: string) => {
    if (!user?.id) {
      setWishlistItems(prevItems => prevItems.filter(item => item.id !== productId));
      return;
    }
    try {
      const res = await userService.removeWishlistItem(productId);
      const updated = res?.wishlist ?? [];
      setWishlistItems(updated);
    } catch (err) {
      console.warn('Failed to remove wishlist item from server', err);
    }
  };
  
  const isInWishlist = (productId: string): boolean => {
      return wishlistItems.some(item => item.id === productId);
  };

  const wishlistContextValue = useMemo(() => {
    const wishlistCount = wishlistItems.length;
    return {
      wishlistItems,
      addToWishlist,
      removeFromWishlist,
      isInWishlist,
      wishlistCount,
    };
  }, [wishlistItems]);

  return (
    <WishlistContext.Provider value={wishlistContextValue}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};