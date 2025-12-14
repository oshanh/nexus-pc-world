
import React, { createContext, useState, useContext, useEffect } from 'react';
import { PRODUCTS as INITIAL_PRODUCTS } from '../constants';
import type { Product } from '../types';

interface ProductContextType {
  products: Product[];
  addProduct: (product: Omit<Product, 'id'>) => void;
  deleteProduct: (id: number) => void;
  updateProduct: (id: number, product: Partial<Product>) => void;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export const ProductProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>(() => {
    try {
        const stored = localStorage.getItem('nexusProducts');
        return stored ? JSON.parse(stored) : INITIAL_PRODUCTS;
    } catch (e) {
        console.error("Failed to load products from local storage", e);
        return INITIAL_PRODUCTS;
    }
  });

  useEffect(() => {
    localStorage.setItem('nexusProducts', JSON.stringify(products));
  }, [products]);

  const addProduct = (newProductData: Omit<Product, 'id'>) => {
    // Generate a simple numeric ID based on the highest existing ID
    const newId = products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1;
    const newProduct = { ...newProductData, id: newId };
    setProducts(prev => [newProduct, ...prev]); // Add to beginning of list
  };

  const deleteProduct = (id: number) => {
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  const updateProduct = (id: number, updatedProduct: Partial<Product>) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, ...updatedProduct } : p));
  };

  return (
    <ProductContext.Provider value={{ products, addProduct, deleteProduct, updateProduct }}>
      {children}
    </ProductContext.Provider>
  );
};

export const useProducts = () => {
  const context = useContext(ProductContext);
  if (context === undefined) {
    throw new Error('useProducts must be used within a ProductProvider');
  }
  return context;
};
