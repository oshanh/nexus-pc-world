import { client } from '../api/client';

export const userService = {
  // Cart
  getCart: async () => client.get('/user/cart'),
  setCart: async (items: any[]) => client.put('/user/cart', { items }),
  addCartItem: async (item: any) => client.post('/user/cart/items', { item }),
  increaseCartItemQuantity: async (id: string, amount: number = 1) => client.post(`/user/cart/items/${id}/increase`, { amount }),
  decreaseCartItemQuantity: async (id: string, amount: number = 1) => client.post(`/user/cart/items/${id}/decrease`, { amount }),
  deleteCartItem: async (id: string) => client.delete(`/user/cart/items/${id}`),

  // Wishlist
  getWishlist: async () => client.get('/user/wishlist'),
  updateWishlist: async (items: any[]) => client.put('/user/wishlist', { items }),
  addWishlistItem: async (item: any) => client.post('/user/wishlist', { item }),
  removeWishlistItem: async (id: string) => client.delete(`/user/wishlist/${id}`),

  // Orders
  getOrders: async () => client.get('/user/orders'),
  getAccountOrders: async () => client.get('/user/account/orders'),
  createOrder: async (payload: any) => client.post('/user/orders', payload),

  // Payment
  getPaymentSettings: async () => client.get('/user/payment/settings'),
  uploadBankTransferReceipt: async (file: File) => {
    const form = new FormData();
    form.append('receipt', file);
    return client.postForm('/user/payment/bank-transfer/receipt', form);
  },

  // Account
  getAccount: async () => client.get('/user/account'),
  updateAccount: async (payload: any) => client.put('/user/account', payload),
};
