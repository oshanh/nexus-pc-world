import { client } from '../api/client';

export type BankAccount = {
  bankName: string;
  accountName: string;
  accountNumber: string;
  branch: string;
};

export type AdminPaymentSettings = {
  deliveryCharge: number;
  bankTransferInstructions: string;
  bankAccounts: BankAccount[];
};

export const adminPaymentSettingsService = {
  get: async (): Promise<{ settings: AdminPaymentSettings | null }> => {
    return client.get('/admin/payment/settings');
  },
  update: async (settings: AdminPaymentSettings): Promise<{ settings: AdminPaymentSettings }> => {
    return client.put('/admin/payment/settings', { settings });
  },
};
