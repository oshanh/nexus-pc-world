import { client } from '../api/client';

export type SocialLinks = {
  facebook: string;
  twitter: string;
  instagram: string;
};

export type Promotion = {
  id: string;
  imageUrl: string;
  alt: string;
  visible: boolean;
  sortOrder: number;
  createdAt?: string;
};

export type WebsiteSettings = {
  socialLinks: SocialLinks;
  promotions: Promotion[];
};

export const adminWebsiteSettingsService = {
  get: async (): Promise<{ settings: WebsiteSettings | null }> => {
    return client.get('/admin/website/settings');
  },
  update: async (settings: Partial<WebsiteSettings>): Promise<{ settings: WebsiteSettings }> => {
    return client.put('/admin/website/settings', { settings });
  },
  uploadPromotion: async (file: File, options?: { alt?: string; visible?: boolean }): Promise<{ promotion: Promotion }> => {
    const fd = new FormData();
    fd.append('image', file);
    if (options?.alt != null) fd.append('alt', options.alt);
    if (options?.visible != null) fd.append('visible', options.visible ? 'true' : 'false');
    return client.postForm('/admin/website/promotions/upload', fd);
  },
  updatePromotion: async (promotionId: string, patch: Partial<Pick<Promotion, 'alt' | 'visible' | 'sortOrder'>>): Promise<{ promotion: Promotion }> => {
    return client.put(`/admin/website/promotions/${encodeURIComponent(promotionId)}`, patch);
  },
  deletePromotion: async (promotionId: string): Promise<{ ok: boolean }> => {
    return client.delete(`/admin/website/promotions/${encodeURIComponent(promotionId)}`);
  },
};
