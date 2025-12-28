
import React, { createContext, useCallback, useMemo, useState, useContext, useEffect } from 'react';
import type { Product, StockInPayload, StockInRecord } from '../types';
import { productService } from '../services/productService';

interface ProductContextType {
  products: Product[];
  addProduct: (product: Omit<Product, 'id'>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  updateProduct: (id: string, product: Partial<Product>) => Promise<Product>;
  stockInProduct: (id: string, payload: StockInPayload) => Promise<{ product: Product; record: StockInRecord }>;
  loading: boolean;
  error: string | null;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export const ProductProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = useCallback(async () => {
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
  }, []);

  useEffect(() => {
    fetchProducts();
  }, []);

  const addProduct = useCallback(async (newProductData: Omit<Product, 'id'>) => {
    try {
      const newProduct = await productService.create(newProductData);
      setProducts(prev => [...prev, newProduct]);
    } catch (err) {
      console.error(err);
      setError('Failed to add product');
      throw err;
    }
  }, []);

  const deleteProduct = useCallback(async (id: string) => {
    try {
      await productService.delete(id);
      setProducts(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      console.error(err);
      setError('Failed to delete product');
      throw err;
    }
  }, []);

  const updateProduct = useCallback(async (id: string, updatedProduct: Partial<Product>) => {
    try {
      const data = await productService.update(id, updatedProduct);
      setProducts(prev => {
        const exists = prev.some(p => p.id === id);

        if (data.isActive === false) {
          return prev.filter(p => p.id !== id);
        }

        if (exists) {
          return prev.map(p => p.id === id ? data : p);
        }

        return [...prev, data];
      });
      return data;
    } catch (err) {
      console.error(err);
      setError('Failed to update product');
      throw err;
    }
  }, []);

  const stockInProduct = useCallback(async (id: string, payload: StockInPayload) => {
    try {
      const data = await productService.stockIn(id, payload);
      setProducts(prev => prev.map(p => p.id === id ? data.product : p));
      return data;
    } catch (err) {
      console.error(err);
      setError('Failed to stock in product');
      throw err;
    }
  }, []);

  const contextValue = useMemo(
    () => ({ products, addProduct, deleteProduct, updateProduct, stockInProduct, loading, error }),
    [products, addProduct, deleteProduct, updateProduct, stockInProduct, loading, error]
  );

  return (
    <ProductContext.Provider value={contextValue}>
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
