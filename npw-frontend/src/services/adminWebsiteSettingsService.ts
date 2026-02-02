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

export type OpeningHour = {
  days: string;
  hours: string;
};

export type Location = {
  label: string;
  address: string;
  mapUrl: string;
};

export type ContactInfo = {
  emails: string[];
  phoneNumbers: string[];
  openingHours: OpeningHour[];
  locations: Location[];
};

export type FeaturedProducts = {
  desktopProductId: string;
  laptopProductId: string;
};

export type Faq = {
  id: string;
  question: string;
  answer: string;
  visible: boolean;
  sortOrder: number;
  createdAt?: string;
};

export type TeamMember = {
  id: string;
  name: string;
  title: string;
  bio: string;
  imageUrl: string;
  visible: boolean;
  sortOrder: number;
  createdAt?: string;
};

export type WebsiteSettings = {
  socialLinks: SocialLinks;
  contactInfo: ContactInfo;
  featuredProducts: FeaturedProducts;
  promotions: Promotion[];
  faqs: Faq[];
  teamMembers: TeamMember[];
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

  createFaq: async (payload: { question: string; answer: string; visible?: boolean; sortOrder?: number }): Promise<{ faq: Faq }> => {
    return client.post('/admin/website/faqs', payload);
  },
  updateFaq: async (faqId: string, patch: Partial<Pick<Faq, 'question' | 'answer' | 'visible' | 'sortOrder'>>): Promise<{ faq: Faq }> => {
    return client.put(`/admin/website/faqs/${encodeURIComponent(faqId)}`, patch);
  },
  deleteFaq: async (faqId: string): Promise<{ ok: boolean }> => {
    return client.delete(`/admin/website/faqs/${encodeURIComponent(faqId)}`);
  },

  createTeamMember: async (payload: { name: string; title?: string; bio?: string; visible?: boolean; sortOrder?: number }): Promise<{ teamMember: TeamMember }> => {
    return client.post('/admin/website/team', payload);
  },
  updateTeamMember: async (memberId: string, patch: Partial<Pick<TeamMember, 'name' | 'title' | 'bio' | 'visible' | 'sortOrder'>>): Promise<{ teamMember: TeamMember }> => {
    return client.put(`/admin/website/team/${encodeURIComponent(memberId)}`, patch);
  },
  deleteTeamMember: async (memberId: string): Promise<{ ok: boolean }> => {
    return client.delete(`/admin/website/team/${encodeURIComponent(memberId)}`);
  },
  uploadTeamMemberPortrait: async (memberId: string, file: File): Promise<{ teamMember: TeamMember }> => {
    const fd = new FormData();
    fd.append('image', file);
    return client.postForm(`/admin/website/team/${encodeURIComponent(memberId)}/portrait`, fd);
  },
};
