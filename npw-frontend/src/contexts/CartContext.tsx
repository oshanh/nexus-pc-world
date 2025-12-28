import React, { createContext, useState, useContext, useEffect, useMemo } from 'react';
import { useAuth } from './AuthContext';
import { userService } from '../services/userService';
import type { Product, CartItem } from '../types';

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  increaseQuantity: (productId: string, amount?: number) => void;
  decreaseQuantity: (productId: string, amount?: number) => void;
  clearCart: () => Promise<void>;
  cartCount: number;
  cartTotal: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const parsePrice = (price: string | number): number => {
    if (typeof price === 'number') return price;
  return Number.parseFloat(String(price).replaceAll(/[^0-9.]/g, '')) || 0;
};

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();

  const storageKey = (uid?: string | null) => `nexusCart:${uid ?? 'guest'}`;

  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  // Load initial data and handle migration on auth changes
  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const uid = user?.id;
        if (!uid) {
          // Guest user: load from localStorage
          const guestRaw = localStorage.getItem(storageKey(null));
          const guest = guestRaw ? JSON.parse(guestRaw) : [];
          if (mounted) setCartItems(guest);
          return;
        }

        // Authenticated: fetch server cart and merge guest items
        const [serverRes, guestRaw] = await Promise.all([
          userService.getCart().catch(() => ({ cart: [] })),
          (async () => localStorage.getItem(storageKey(null)))(),
        ]);
        const serverCart = serverRes?.cart || [];
        const guestCart = guestRaw ? JSON.parse(guestRaw) : [];

        if (guestCart.length === 0) {
          if (mounted) setCartItems(serverCart);
          // ensure no stale guest data
          try { localStorage.removeItem(storageKey(null)); } catch {}
          return;
        }

        // Merge serverCart and guestCart (sum quantities)
        const mergedMap = new Map<string, CartItem>();
        [...serverCart, ...guestCart].forEach((item: CartItem) => {
          const existing = mergedMap.get(item.id);
          if (existing) mergedMap.set(item.id, { ...existing, quantity: existing.quantity + (item.quantity || 1) });
          else mergedMap.set(item.id, { ...item, quantity: item.quantity || 1 });
        });
        const merged = Array.from(mergedMap.values());
        if (mounted) setCartItems(merged);
        // Persist merged cart server-side and clear guest localStorage
        try {
          await userService.setCart(merged);
          localStorage.removeItem(storageKey(null));
        } catch (err) {
          console.warn('Failed to persist merged cart to server', err);
        }
      } catch (err) {
        console.warn('Cart load/migration failed', err);
      }
    };
    load();
    return () => { mounted = false; };
  }, [user?.id]);

  // Persist to localStorage only for guests
  useEffect(() => {
    if (user?.id) return;
    try {
      localStorage.setItem(storageKey(null), JSON.stringify(cartItems));
    } catch (err) {
      console.warn('Failed to persist cart', err);
    }
  }, [cartItems, user?.id]);

  const addToCart = async (product: Product) => {
    if (!user?.id) {
      // Guest: local only
      setCartItems(prevItems => {
        const existingItem = prevItems.find(item => item.id === product.id);
        if (existingItem) {
          return prevItems.map(item =>
            item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
          );
        }
        return [...prevItems, { ...product, quantity: 1 }];
      });
      return;
    }

    // Authenticated: perform server-side add and use server result
    try {
      const res = await userService.addCartItem({ ...product, quantity: 1 });
      console.log('addCartItem response:', res);
      const updated = res?.cart ?? [];
      setCartItems(updated);
    } catch (err) {
      console.warn('Failed to add item to server cart', err);
    }
  };

  const removeFromCart = async (productId: string) => {
    if (!user?.id) {
      setCartItems(prevItems => prevItems.filter(item => item.id !== productId));
      return;
    }
    try {
      const res = await userService.deleteCartItem(productId);
      const updated = res?.cart ?? [];
      setCartItems(updated);
    } catch (err) {
      console.warn('Failed to remove item from server cart', err);
    }
  };

  const increaseQuantity = async (productId: string, amount: number = 1) => {
    const delta = Math.max(1, Number(amount) || 1);

    if (!user?.id) {
      setCartItems((prevItems) =>
        prevItems.map((item) =>
          item.id === productId ? { ...item, quantity: item.quantity + delta } : item
        )
      );
      return;
    }

    try {
      const res = await userService.increaseCartItemQuantity(productId, delta);
      const updated = res?.cart ?? [];
      setCartItems(updated);
    } catch (err) {
      console.warn('Failed to increase quantity on server', err);
    }
  };

  const decreaseQuantity = async (productId: string, amount: number = 1) => {
    const delta = Math.max(1, Number(amount) || 1);

    if (!user?.id) {
      setCartItems((prevItems) => {
        const next = prevItems
          .map((item) => (item.id === productId ? { ...item, quantity: item.quantity - delta } : item))
          .filter((item) => item.quantity > 0);
        return next;
      });
      return;
    }

    try {
      const res = await userService.decreaseCartItemQuantity(productId, delta);
      const updated = res?.cart ?? [];
      setCartItems(updated);
    } catch (err) {
      console.warn('Failed to decrease quantity on server', err);
    }
  };

  const clearCart = async () => {
    if (!user?.id) {
      setCartItems([]);
      return;
    }
    try {
      const res = await userService.setCart([]);
      const updated = res?.cart ?? [];
      setCartItems(updated);
    } catch (err) {
      console.warn('Failed to clear server cart', err);
    }
  };

  const cartContextValue = useMemo(() => {
    const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);
    const cartTotal = cartItems.reduce((total, item) => total + parsePrice(item.price) * item.quantity, 0);
    return {
      cartItems,
      addToCart,
      removeFromCart,
      increaseQuantity,
      decreaseQuantity,
      clearCart,
      cartCount,
      cartTotal,
    };
  }, [cartItems]);

  return (
    <CartContext.Provider value={cartContextValue}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
