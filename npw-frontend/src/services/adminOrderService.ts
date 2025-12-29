import { client } from '../api/client';

export type AdminOrder = {
  id: string;
  items: Array<{ id: string; name: string; price: string | number; quantity: number }>;
  total: number;
  billingAddress?: any;
  shippingAddress?: any;
  shipToDifferentAddress?: boolean;
  payment?: {
    method?: string;
    status?: string;
    deliveryCharge?: number;
    bankTransferReceiptUrl?: string;
    bankTransferReceiptFilename?: string;
    bankTransferReceiptMimeType?: string;
    bankTransferReceiptUploadedAt?: string;
  };
  createdAt?: string;
  customer?: {
    id: string;
    username: string;
    email: string;
  };
};

export const adminOrderService = {
  getAll: async (): Promise<{ orders: AdminOrder[] }> => client.get('/admin/orders'),
  updatePaymentStatus: async (orderId: string, paymentStatus: string): Promise<{ order: AdminOrder }> =>
    client.put(`/admin/orders/${encodeURIComponent(orderId)}/payment-status`, { paymentStatus }),
};
