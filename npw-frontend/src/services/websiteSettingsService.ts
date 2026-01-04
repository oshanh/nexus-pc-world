import { client } from '../api/client';

export type PublicSocialLinks = {
  facebook: string;
  twitter: string;
  instagram: string;
};

export type PublicPromotion = {
  id: string;
  imageUrl: string;
  alt: string;
  visible: boolean;
  sortOrder: number;
  createdAt?: string;
};

export type PublicWebsiteSettings = {
  socialLinks: PublicSocialLinks;
  promotions: PublicPromotion[];
};

export const websiteSettingsService = {
  getPublic: async (): Promise<{ settings: PublicWebsiteSettings | null }> => {
    return client.get('/public/website/settings');
  },
};
