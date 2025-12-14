
import React, { createContext, useState, useContext, useEffect } from 'react';
import type { Product } from '../types';

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

  const API_URL = 'http://localhost:5000/api/products';

  const fetchProducts = async () => {
    try {
      const response = await fetch(API_URL);
      if (!response.ok) throw new Error('Failed to fetch products');
      const data = await response.json();
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
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProductData),
      });
      if (!response.ok) throw new Error('Failed to add product');
      const newProduct = await response.json();
      setProducts(prev => [...prev, newProduct]);
    } catch (err) {
      console.error(err);
      setError('Failed to add product');
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete product');
      setProducts(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      console.error(err);
      setError('Failed to delete product');
    }
  };

  const updateProduct = async (id: string, updatedProduct: Partial<Product>) => {
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedProduct),
      });
      if (!response.ok) throw new Error('Failed to update product');
      const data = await response.json();
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
