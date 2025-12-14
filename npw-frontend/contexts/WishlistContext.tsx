import React, { createContext, useState, useContext, useEffect, useMemo } from 'react';
import type { Product } from '../types';

interface WishlistContextType {
  wishlistItems: Product[];
  addToWishlist: (product: Product) => void;
  removeFromWishlist: (productId: number) => void;
  isInWishlist: (productId: number) => boolean;
  wishlistCount: number;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [wishlistItems, setWishlistItems] = useState<Product[]>(() => {
      try {
          const localData = localStorage.getItem('nexusWishlist');
          return localData ? JSON.parse(localData) : [];
      } catch (error) {
          console.error("Could not parse wishlist data from localStorage", error);
          return [];
      }
  });

  useEffect(() => {
      localStorage.setItem('nexusWishlist', JSON.stringify(wishlistItems));
  }, [wishlistItems]);

  const addToWishlist = (product: Product) => {
    setWishlistItems(prevItems => {
      if (prevItems.some(item => item.id === product.id)) {
        return prevItems; // Already exists, do nothing.
      }
      return [...prevItems, product];
    });
  };

  const removeFromWishlist = (productId: number) => {
    setWishlistItems(prevItems => prevItems.filter(item => item.id !== productId));
  };
  
  const isInWishlist = (productId: number): boolean => {
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