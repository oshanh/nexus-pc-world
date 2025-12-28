import { client } from '../api/client';

export const userService = {
  // Cart
  getCart: async () => client.get('/user/cart'),
  updateCart: async (items: any[]) => client.put('/user/cart', { items }),
  addCartItem: async (item: any) => client.post('/user/cart/items', { item }),
  removeCartItem: async (id: string) => client.delete(`/user/cart/items/${id}`),

  // Wishlist
  getWishlist: async () => client.get('/user/wishlist'),
  updateWishlist: async (items: any[]) => client.put('/user/wishlist', { items }),
  addWishlistItem: async (item: any) => client.post('/user/wishlist', { item }),
  removeWishlistItem: async (id: string) => client.delete(`/user/wishlist/${id}`),

  // Orders
  getOrders: async () => client.get('/user/orders'),
  createOrder: async (payload: any) => client.post('/user/orders', payload),
};
