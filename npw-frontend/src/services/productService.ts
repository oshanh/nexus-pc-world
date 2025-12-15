import { client } from '../api/client';
import type { Product } from '../types';

export const productService = {
  getAll: async (): Promise<Product[]> => {
    return client.get('/products');
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
};
