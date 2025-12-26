import { client } from '../api/client';
import type { Product, StockInPayload, StockInRecord } from '../types';

export const productService = {
  getAll: async (): Promise<Product[]> => {
    return client.get('/products');
  },
  getInactive: async (): Promise<Product[]> => {
    return client.get('/products/inactive');
  },
  getById: async (id: string): Promise<Product> => {
    return client.get(`/products/${id}`);
  },
  create: async (product: Omit<Product, 'id'>): Promise<Product> => {
    return client.post('/products', product);
  },
  update: async (id: string, product: Partial<Product>): Promise<Product> => {
    return client.put(`/products/${id}`, product);
  },
  delete: async (id: string): Promise<{ message: string }> => {
    return client.delete(`/products/${id}`);
  },

  stockIn: async (id: string, payload: StockInPayload): Promise<{ product: Product; record: StockInRecord }> => {
    return client.post(`/products/${id}/stock-in`, payload);
  },

  getStockInHistory: async (id: string): Promise<{ history: StockInRecord[] }> => {
    return client.get(`/products/${id}/stock-in/history`);
  },
};
