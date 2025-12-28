import { client } from '../api/client';

export const categoryService = {
  getCategories: async () => client.get('/categories'),
  createCategory: async (payload: any) => client.post('/categories', payload),
  updateCategory: async (id: string, payload: any) => client.put(`/categories/${id}`, payload),
  deleteCategory: async (id: string) => client.delete(`/categories/${id}`),
  addSubcategory: async (id: string, sub: string) => client.post(`/categories/${id}/subcategories`, { sub }),
  removeSubcategory: async (id: string, sub: string) => client.delete(`/categories/${id}/subcategories/${encodeURIComponent(sub)}`),
};
