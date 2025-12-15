
import React, { createContext, useState, useContext, useEffect } from 'react';
import type { Product } from '../types';
import { productService } from '../services/productService';

interface ProductContextType {
  products: Product[];
  addProduct: (product: Omit<Product, 'id'>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  updateProduct: (id: string, product: Partial<Product>) => Promise<void>;
  loading: boolean;
  error: string | null;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export const ProductProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = async () => {
    try {
      const data = await productService.getAll();
      setProducts(data);
      setError(null);
    } catch (err) {
      console.error(err);
      setError('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const addProduct = async (newProductData: Omit<Product, 'id'>) => {
    try {
      const newProduct = await productService.create(newProductData);
      setProducts(prev => [...prev, newProduct]);
    } catch (err) {
      console.error(err);
      setError('Failed to add product');
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      await productService.delete(id);
      setProducts(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      console.error(err);
      setError('Failed to delete product');
    }
  };

  const updateProduct = async (id: string, updatedProduct: Partial<Product>) => {
    try {
      const data = await productService.update(id, updatedProduct);
      setProducts(prev => prev.map(p => p.id === id ? data : p));
    } catch (err) {
      console.error(err);
      setError('Failed to update product');
    }
  };

  return (
    <ProductContext.Provider value={{ products, addProduct, deleteProduct, updateProduct, loading, error }}>
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
