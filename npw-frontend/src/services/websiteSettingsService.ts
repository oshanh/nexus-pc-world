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

export type PublicOpeningHour = {
  days: string;
  hours: string;
};

export type PublicLocation = {
  label: string;
  address: string;
  mapUrl: string;
};

export type PublicContactInfo = {
  emails: string[];
  phoneNumbers: string[];
  openingHours: PublicOpeningHour[];
  locations: PublicLocation[];
};

export type PublicFeaturedProducts = {
  desktopProductId: string;
  laptopProductId: string;
};

export type PublicFaq = {
  id: string;
  question: string;
  answer: string;
  visible: boolean;
  sortOrder: number;
  createdAt?: string;
};

export type PublicTeamMember = {
  id: string;
  name: string;
  title: string;
  bio: string;
  imageUrl: string;
  visible: boolean;
  sortOrder: number;
  createdAt?: string;
};

export type PublicWebsiteSettings = {
  socialLinks: PublicSocialLinks;
  contactInfo: PublicContactInfo;
  featuredProducts: PublicFeaturedProducts;
  promotions: PublicPromotion[];
  faqs: PublicFaq[];
  teamMembers: PublicTeamMember[];
};

export const websiteSettingsService = {
  getPublic: async (): Promise<{ settings: PublicWebsiteSettings | null }> => {
    return client.get('/public/website/settings');
  },
};
