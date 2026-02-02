import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import AccessDenied from '../../components/AccessDenied';
import AdminLayout from '../../components/AdminLayout';
import Toast from '../../components/Toast';
import GamingButton from '../../components/GamingButton';
import { useProducts } from '../../contexts/ProductContext';
import { adminWebsiteSettingsService, type Faq, type Promotion, type TeamMember, type WebsiteSettings } from '../../services/adminWebsiteSettingsService';
import { toAbsoluteApiUrl } from '../../utils/toAbsoluteApiUrl';

type PromotionDraft = Promotion & { key: string };

type FaqDraft = Faq & { key: string };

type EmailDraft = { key: string; value: string };
type PhoneDraft = { key: string; value: string };
type OpeningHourDraft = { key: string; days: string; hours: string };
type LocationDraft = { key: string; label: string; address: string; mapUrl: string };
type TeamMemberDraft = TeamMember & { key: string };

type WebsiteSettingsDraft = {
  socialLinks: WebsiteSettings['socialLinks'];
  contactInfo: {
    emails: EmailDraft[];
    phoneNumbers: PhoneDraft[];
    openingHours: OpeningHourDraft[];
    locations: LocationDraft[];
  };
  featuredProducts: WebsiteSettings['featuredProducts'];
  promotions: PromotionDraft[];
  faqs: FaqDraft[];
  teamMembers: TeamMemberDraft[];
};

const makeKey = () => `promo-${Date.now()}-${Math.floor(Math.random() * 1_000_000)}`;

type TabId = 'social' | 'contact' | 'promotions' | 'featured' | 'faqs' | 'team';

const toDraftSettings = (s: WebsiteSettings): WebsiteSettingsDraft => ({
  socialLinks: {
    facebook: String(s.socialLinks?.facebook || ''),
    twitter: String(s.socialLinks?.twitter || ''),
    instagram: String(s.socialLinks?.instagram || ''),
  },
  contactInfo: {
    emails: Array.isArray(s.contactInfo?.emails) && s.contactInfo.emails.length > 0
      ? s.contactInfo.emails.map((v) => ({ key: makeKey(), value: String(v || '') }))
      : [{ key: makeKey(), value: '' }],
    phoneNumbers: Array.isArray(s.contactInfo?.phoneNumbers) && s.contactInfo.phoneNumbers.length > 0
      ? s.contactInfo.phoneNumbers.map((v) => ({ key: makeKey(), value: String(v || '') }))
      : [{ key: makeKey(), value: '' }],
    openingHours: Array.isArray(s.contactInfo?.openingHours) && s.contactInfo.openingHours.length > 0
      ? s.contactInfo.openingHours.map((h) => ({ key: makeKey(), days: String(h?.days || ''), hours: String(h?.hours || '') }))
      : [{ key: makeKey(), days: '', hours: '' }],
    locations: Array.isArray(s.contactInfo?.locations) && s.contactInfo.locations.length > 0
      ? s.contactInfo.locations.map((l) => ({
        key: makeKey(),
        label: String(l?.label || ''),
        address: String(l?.address || ''),
        mapUrl: String(l?.mapUrl || ''),
      }))
      : [{ key: makeKey(), label: '', address: '', mapUrl: '' }],
  },
  featuredProducts: {
    desktopProductId: String(s.featuredProducts?.desktopProductId || ''),
    laptopProductId: String(s.featuredProducts?.laptopProductId || ''),
  },
  promotions: Array.isArray(s.promotions)
    ? s.promotions.map((p) => ({
      key: makeKey(),
      id: String(p.id || ''),
      imageUrl: toAbsoluteApiUrl(String(p.imageUrl || '')),
      alt: String(p.alt || ''),
      visible: Boolean(p.visible),
      sortOrder: Number(p.sortOrder) || 0,
      createdAt: p.createdAt,
    }))
    : [],
  faqs: Array.isArray(s.faqs)
    ? s.faqs.map((f) => ({
      key: makeKey(),
      id: String(f.id || ''),
      question: String(f.question || ''),
      answer: String(f.answer || ''),
      visible: Boolean(f.visible),
      sortOrder: Number(f.sortOrder) || 0,
      createdAt: f.createdAt,
    }))
    : [],
  teamMembers: Array.isArray(s.teamMembers)
    ? s.teamMembers.map((m) => ({
      key: makeKey(),
      id: String(m.id || ''),
      name: String(m.name || ''),
      title: String(m.title || ''),
      bio: String(m.bio || ''),
      imageUrl: toAbsoluteApiUrl(String(m.imageUrl || '')),
      visible: Boolean(m.visible),
      sortOrder: Number(m.sortOrder) || 0,
      createdAt: m.createdAt,
    }))
    : [],
});

const AdminWebsiteSettingsPage: React.FC<{ navigateTo: (path: string) => void }> = ({ navigateTo }) => {
  const { isAdmin } = useAuth();
  const { products } = useProducts();

  const [activeTab, setActiveTab] = useState<TabId>('social');

  const fieldClassName =
    'w-full bg-nexus-gray border border-nexus-purple/30 rounded py-2 px-3 text-white focus:ring-2 focus:ring-nexus-blue focus:outline-none ' +
    'focus:outline-none focus:ring-2 focus:ring-nexus-blue focus:border-transparent transition-colors ' +
    'disabled:opacity-60 disabled:cursor-not-allowed';

  const [toast, setToast] = useState<{ visible: boolean; message: string; type: 'success' | 'error' }>({
    visible: false,
    message: '',
    type: 'success',
  });

  const showToast = (type: 'success' | 'error', message: string, timeoutMs: number = 3000) => {
    setToast({ visible: true, type, message });
    globalThis.setTimeout(() => setToast(prev => ({ ...prev, visible: false })), timeoutMs);
  };

  const normalizeLinkInput = (v: string) => {
    const s = String(v || '').trim();
    if (!s) return '';
    if (/^[a-z][a-z0-9+.-]*:\/\//i.test(s)) return s;
    if (s.startsWith('//')) return `https:${s}`;
    if (/^[^\s]+\.[^\s]+$/i.test(s)) return `https://${s}`;
    return '';
  };

  const emptySettings = useMemo<WebsiteSettingsDraft>(() => ({
    socialLinks: { facebook: '', twitter: '', instagram: '' },
    contactInfo: {
      emails: [{ key: makeKey(), value: '' }],
      phoneNumbers: [{ key: makeKey(), value: '' }],
      openingHours: [{ key: makeKey(), days: '', hours: '' }],
      locations: [{ key: makeKey(), label: '', address: '', mapUrl: '' }],
    },
    featuredProducts: { desktopProductId: '', laptopProductId: '' },
    promotions: [],
    faqs: [],
    teamMembers: [],
  }), []);

  const [settings, setSettings] = useState<WebsiteSettingsDraft>(emptySettings);
  const [isLoading, setIsLoading] = useState(false);
  const [isSavingPromos, setIsSavingPromos] = useState(false);
  const [isSavingSocial, setIsSavingSocial] = useState(false);
  const [isSavingContact, setIsSavingContact] = useState(false);
  const [isSavingFeatured, setIsSavingFeatured] = useState(false);
  const [isSavingFaq, setIsSavingFaq] = useState(false);
  const [isSavingTeam, setIsSavingTeam] = useState(false);

  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadAlt, setUploadAlt] = useState('');
  const [uploadVisible, setUploadVisible] = useState(true);
  const [isUploading, setIsUploading] = useState(false);

  const [newFaq, setNewFaq] = useState<{ question: string; answer: string; visible: boolean; sortOrder: number }>({
    question: '',
    answer: '',
    visible: true,
    sortOrder: 0,
  });

  const [newTeamMember, setNewTeamMember] = useState<{ name: string; title: string; bio: string; visible: boolean; sortOrder: number }>({
    name: '',
    title: '',
    bio: '',
    visible: true,
    sortOrder: 0,
  });
  const [teamUploadFile, setTeamUploadFile] = useState<{ [memberId: string]: File | null }>({});
  const [isUploadingTeam, setIsUploadingTeam] = useState(false);

  const load = async () => {
    setIsLoading(true);
    try {
      const res = await adminWebsiteSettingsService.get();
      const s = res?.settings;
      setSettings(s ? toDraftSettings(s) : emptySettings);
    } catch (err: any) {
      console.warn('Failed to load website settings', err);
      showToast('error', err?.message || 'Failed to load website settings', 3500);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!isAdmin) return;
    let cancelled = false;

    (async () => {
      await load();
      if (cancelled) return;
    })();

    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin]);

  const updatePromotionDraft = (key: string, patch: Partial<PromotionDraft>) => {
    setSettings(prev => ({
      ...prev,
      promotions: (prev.promotions || []).map((p) => (p.key === key ? { ...p, ...patch } : p))
    }));
  };

  const updateFaqDraft = (key: string, patch: Partial<FaqDraft>) => {
    setSettings(prev => ({
      ...prev,
      faqs: (prev.faqs || []).map((f) => (f.key === key ? { ...f, ...patch } : f))
    }));
  };

  const updateTeamMemberDraft = (key: string, patch: Partial<TeamMemberDraft>) => {
    setSettings(prev => ({
      ...prev,
      teamMembers: (prev.teamMembers || []).map((m) => (m.key === key ? { ...m, ...patch } : m))
    }));
  };

  const updateDraftList = <T extends { key: string }>(list: T[], key: string, patch: Partial<T>) =>
    list.map((x) => (x.key === key ? { ...x, ...patch } : x));

  const addEmail = () => setSettings(prev => ({
    ...prev,
    contactInfo: {
      ...prev.contactInfo,
      emails: [...(prev.contactInfo.emails || []), { key: makeKey(), value: '' }],
    }
  }));
  const updateEmail = (emailKey: string, value: string) => setSettings(prev => ({
    ...prev,
    contactInfo: {
      ...prev.contactInfo,
      emails: updateDraftList(prev.contactInfo.emails || [], emailKey, { value }),
    }
  }));
  const removeEmail = (emailKey: string) => setSettings(prev => ({
    ...prev,
    contactInfo: {
      ...prev.contactInfo,
      emails: (prev.contactInfo.emails || []).filter(x => x.key !== emailKey),
    }
  }));

  const addPhone = () => setSettings(prev => ({
    ...prev,
    contactInfo: {
      ...prev.contactInfo,
      phoneNumbers: [...(prev.contactInfo.phoneNumbers || []), { key: makeKey(), value: '' }],
    }
  }));
  const updatePhone = (phoneKey: string, value: string) => setSettings(prev => ({
    ...prev,
    contactInfo: {
      ...prev.contactInfo,
      phoneNumbers: updateDraftList(prev.contactInfo.phoneNumbers || [], phoneKey, { value }),
    }
  }));
  const removePhone = (phoneKey: string) => setSettings(prev => ({
    ...prev,
    contactInfo: {
      ...prev.contactInfo,
      phoneNumbers: (prev.contactInfo.phoneNumbers || []).filter(x => x.key !== phoneKey),
    }
  }));

  const addOpeningHour = () => setSettings(prev => ({
    ...prev,
    contactInfo: {
      ...prev.contactInfo,
      openingHours: [...(prev.contactInfo.openingHours || []), { key: makeKey(), days: '', hours: '' }],
    }
  }));
  const updateOpeningHour = (hourKey: string, patch: Partial<OpeningHourDraft>) => setSettings(prev => ({
    ...prev,
    contactInfo: {
      ...prev.contactInfo,
      openingHours: updateDraftList(prev.contactInfo.openingHours || [], hourKey, patch),
    }
  }));
  const removeOpeningHour = (hourKey: string) => setSettings(prev => ({
    ...prev,
    contactInfo: {
      ...prev.contactInfo,
      openingHours: (prev.contactInfo.openingHours || []).filter(x => x.key !== hourKey),
    }
  }));

  const addLocation = () => setSettings(prev => ({
    ...prev,
    contactInfo: {
      ...prev.contactInfo,
      locations: [...(prev.contactInfo.locations || []), { key: makeKey(), label: '', address: '', mapUrl: '' }],
    }
  }));
  const updateLocation = (locKey: string, patch: Partial<LocationDraft>) => setSettings(prev => ({
    ...prev,
    contactInfo: {
      ...prev.contactInfo,
      locations: updateDraftList(prev.contactInfo.locations || [], locKey, patch),
    }
  }));
  const removeLocation = (locKey: string) => setSettings(prev => ({
    ...prev,
    contactInfo: {
      ...prev.contactInfo,
      locations: (prev.contactInfo.locations || []).filter(x => x.key !== locKey),
    }
  }));

  if (!isAdmin) {
    return (
      <AccessDenied
        title="Access Denied"
        description="You do not have permission to view website settings."
        backText="Return to Home"
        onBack={() => navigateTo('/')}
      />
    );
  }

  return (
    <AdminLayout title="Website Settings">
      <Toast message={toast.message} type={toast.type} visible={toast.visible} />

      <section className="py-0">
        <div className="container mx-auto px-6">
          <p className="text-gray-400 mb-6">Manage website content in organized sections.</p>

          <div className="flex flex-wrap gap-3 mb-6">
            <GamingButton onClick={() => setActiveTab('social')} variant={activeTab === 'social' ? 'primary' : 'secondary'} size="sm" disabled={isLoading}>Social Media Links</GamingButton>
            <GamingButton onClick={() => setActiveTab('contact')} variant={activeTab === 'contact' ? 'primary' : 'secondary'} size="sm" disabled={isLoading}>Contact Page Info</GamingButton>
            <GamingButton onClick={() => setActiveTab('promotions')} variant={activeTab === 'promotions' ? 'primary' : 'secondary'} size="sm" disabled={isLoading}>Promotions</GamingButton>
            <GamingButton onClick={() => setActiveTab('featured')} variant={activeTab === 'featured' ? 'primary' : 'secondary'} size="sm" disabled={isLoading}>Featured Products</GamingButton>
            <GamingButton onClick={() => setActiveTab('faqs')} variant={activeTab === 'faqs' ? 'primary' : 'secondary'} size="sm" disabled={isLoading}>FAQs</GamingButton>
            <GamingButton onClick={() => setActiveTab('team')} variant={activeTab === 'team' ? 'primary' : 'secondary'} size="sm" disabled={isLoading}>Team Members</GamingButton>
          </div>

          {activeTab === 'social' && (
            <div className="bg-nexus-dark rounded-lg p-6 border border-nexus-purple/20 shadow-sm">
              <h2 className="text-xl font-bold text-white mb-4">Social Media Links</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-300 mb-2" htmlFor="facebook">Facebook URL</label>
                  <input
                    id="facebook"
                    type="url"
                    value={settings.socialLinks.facebook}
                    disabled={isLoading || isSavingSocial}
                    onChange={(e) => setSettings(prev => ({ ...prev, socialLinks: { ...prev.socialLinks, facebook: e.target.value } }))}
                    className={fieldClassName}
                    placeholder="https://facebook.com/yourpage"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-300 mb-2" htmlFor="twitter">Twitter/X URL</label>
                  <input
                    id="twitter"
                    type="url"
                    value={settings.socialLinks.twitter}
                    disabled={isLoading || isSavingSocial}
                    onChange={(e) => setSettings(prev => ({ ...prev, socialLinks: { ...prev.socialLinks, twitter: e.target.value } }))}
                    className={fieldClassName}
                    placeholder="https://twitter.com/yourhandle"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm text-gray-300 mb-2" htmlFor="instagram">Instagram URL</label>
                  <input
                    id="instagram"
                    type="url"
                    value={settings.socialLinks.instagram}
                    disabled={isLoading || isSavingSocial}
                    onChange={(e) => setSettings(prev => ({ ...prev, socialLinks: { ...prev.socialLinks, instagram: e.target.value } }))}
                    className={fieldClassName}
                    placeholder="https://instagram.com/yourprofile"
                  />
                </div>
              </div>

              <div className="mt-6 flex flex-col sm:flex-row gap-3">
                <GamingButton
                  onClick={async () => {
                    try {
                      setIsSavingSocial(true);
                      await adminWebsiteSettingsService.update({
                        socialLinks: {
                          facebook: normalizeLinkInput(settings.socialLinks.facebook),
                          twitter: normalizeLinkInput(settings.socialLinks.twitter),
                          instagram: normalizeLinkInput(settings.socialLinks.instagram),
                        },
                      });
                      showToast('success', 'Social links updated', 2500);
                    } catch (err: any) {
                      console.warn('Failed to update social links', err);
                      showToast('error', err?.message || 'Failed to update social links', 3500);
                    } finally {
                      setIsSavingSocial(false);
                    }
                  }}
                  variant="primary"
                  disabled={isLoading || isSavingSocial}
                >
                  {isSavingSocial ? 'Saving...' : 'Save Social Links'}
                </GamingButton>

                <GamingButton
                  onClick={() => setSettings(emptySettings)}
                  variant="secondary"
                  disabled={isLoading || isSavingSocial}
                >
                  Reset
                </GamingButton>
              </div>
            </div>
          )}

          {activeTab === 'contact' && (
            <div className="bg-nexus-dark rounded-lg p-6 border border-nexus-purple/20 shadow-sm">
              <h2 className="text-xl font-bold text-white mb-4">Contact Page Info</h2>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="rounded-lg border border-nexus-gray/60 bg-nexus-dark/30 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="text-sm text-gray-300">Emails</div>
                    <GamingButton onClick={addEmail} variant="secondary" disabled={isLoading || isSavingContact}>Add</GamingButton>
                  </div>
                  <div className="space-y-3">
                    {(settings.contactInfo.emails || []).map((e) => (
                      <div key={e.key} className="flex gap-3">
                        <input
                          type="text"
                          value={e.value}
                          disabled={isLoading || isSavingContact}
                          onChange={(ev) => updateEmail(e.key, ev.target.value)}
                          className={fieldClassName}
                          placeholder="support@example.com"
                        />
                        <GamingButton
                          onClick={() => removeEmail(e.key)}
                          variant="secondary"
                          disabled={isLoading || isSavingContact || (settings.contactInfo.emails || []).length <= 1}
                        >
                          Remove
                        </GamingButton>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-lg border border-nexus-gray/60 bg-nexus-dark/30 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="text-sm text-gray-300">Phone Numbers</div>
                    <GamingButton onClick={addPhone} variant="secondary" disabled={isLoading || isSavingContact}>Add</GamingButton>
                  </div>
                  <div className="space-y-3">
                    {(settings.contactInfo.phoneNumbers || []).map((p) => (
                      <div key={p.key} className="flex gap-3">
                        <input
                          type="text"
                          value={p.value}
                          disabled={isLoading || isSavingContact}
                          onChange={(ev) => updatePhone(p.key, ev.target.value)}
                          className={fieldClassName}
                          placeholder="+94 ..."
                        />
                        <GamingButton
                          onClick={() => removePhone(p.key)}
                          variant="secondary"
                          disabled={isLoading || isSavingContact || (settings.contactInfo.phoneNumbers || []).length <= 1}
                        >
                          Remove
                        </GamingButton>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-lg border border-nexus-gray/60 bg-nexus-dark/30 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="text-sm text-gray-300">Open Days & Hours</div>
                    <GamingButton onClick={addOpeningHour} variant="secondary" disabled={isLoading || isSavingContact}>Add</GamingButton>
                  </div>
                  <div className="space-y-3">
                    {(settings.contactInfo.openingHours || []).map((h) => (
                      <div key={h.key} className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <input
                          type="text"
                          value={h.days}
                          disabled={isLoading || isSavingContact}
                          onChange={(ev) => updateOpeningHour(h.key, { days: ev.target.value })}
                          className={fieldClassName}
                          placeholder="Mon - Sat"
                        />
                        <input
                          type="text"
                          value={h.hours}
                          disabled={isLoading || isSavingContact}
                          onChange={(ev) => updateOpeningHour(h.key, { hours: ev.target.value })}
                          className={fieldClassName}
                          placeholder="10am - 8pm"
                        />
                        <GamingButton
                          onClick={() => removeOpeningHour(h.key)}
                          variant="secondary"
                          disabled={isLoading || isSavingContact || (settings.contactInfo.openingHours || []).length <= 1}
                        >
                          Remove
                        </GamingButton>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-lg border border-nexus-gray/60 bg-nexus-dark/30 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="text-sm text-gray-300">Locations</div>
                    <GamingButton onClick={addLocation} variant="secondary" disabled={isLoading || isSavingContact}>Add</GamingButton>
                  </div>
                  <div className="space-y-4">
                    {(settings.contactInfo.locations || []).map((l) => (
                      <div key={l.key} className="grid grid-cols-1 gap-3">
                        <input
                          type="text"
                          value={l.label}
                          disabled={isLoading || isSavingContact}
                          onChange={(ev) => updateLocation(l.key, { label: ev.target.value })}
                          className={fieldClassName}
                          placeholder="Main Branch"
                        />
                        <input
                          type="text"
                          value={l.address}
                          disabled={isLoading || isSavingContact}
                          onChange={(ev) => updateLocation(l.key, { address: ev.target.value })}
                          className={fieldClassName}
                          placeholder="Address"
                        />
                        <input
                          type="url"
                          value={l.mapUrl}
                          disabled={isLoading || isSavingContact}
                          onChange={(ev) => updateLocation(l.key, { mapUrl: ev.target.value })}
                          className={fieldClassName}
                          placeholder="Map image URL (optional)"
                        />
                        <GamingButton
                          onClick={() => removeLocation(l.key)}
                          variant="secondary"
                          disabled={isLoading || isSavingContact || (settings.contactInfo.locations || []).length <= 1}
                        >
                          Remove Location
                        </GamingButton>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-6 flex flex-col sm:flex-row gap-3">
                <GamingButton
                  onClick={async () => {
                    try {
                      setIsSavingContact(true);
                      await adminWebsiteSettingsService.update({
                        contactInfo: {
                          emails: (settings.contactInfo.emails || []).map(x => String(x.value || '')).filter(Boolean),
                          phoneNumbers: (settings.contactInfo.phoneNumbers || []).map(x => String(x.value || '')).filter(Boolean),
                          openingHours: (settings.contactInfo.openingHours || []).map(x => ({ days: String(x.days || ''), hours: String(x.hours || '') })).filter(x => x.days || x.hours),
                          locations: (settings.contactInfo.locations || []).map(x => ({ label: String(x.label || ''), address: String(x.address || ''), mapUrl: String(x.mapUrl || '') })).filter(x => x.label || x.address || x.mapUrl),
                        }
                      });
                      showToast('success', 'Contact info updated', 2500);
                    } catch (err: any) {
                      console.warn('Failed to update contact info', err);
                      showToast('error', err?.message || 'Failed to update contact info', 3500);
                    } finally {
                      setIsSavingContact(false);
                    }
                  }}
                  variant="primary"
                  disabled={isLoading || isSavingContact}
                >
                  {isSavingContact ? 'Saving...' : 'Save Contact Info'}
                </GamingButton>

                <GamingButton
                  onClick={() => setSettings(emptySettings)}
                  variant="secondary"
                  disabled={isLoading || isSavingContact}
                >
                  Reset
                </GamingButton>
              </div>
            </div>
          )}

          {activeTab === 'promotions' && (
            <div className="bg-nexus-dark rounded-lg p-6 border border-nexus-purple/20 shadow-sm">
              <h2 className="text-xl font-bold text-white mb-4">Promotions</h2>

              <div className="rounded-lg border border-nexus-gray/60 bg-nexus-dark/30 p-4 mb-4">
                <div className="text-sm text-gray-300 mb-3">Upload New Promotion</div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-300 mb-2" htmlFor="promoImage">Image</label>
                    <input
                      id="promoImage"
                      type="file"
                      accept="image/*"
                      disabled={isLoading || isUploading}
                      onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                      className="block w-full text-sm text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-nexus-gray file:text-white hover:file:bg-nexus-gray/80"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-gray-300 mb-2" htmlFor="promoAlt">Alt Text</label>
                    <input
                      id="promoAlt"
                      type="text"
                      value={uploadAlt}
                      disabled={isLoading || isUploading}
                      onChange={(e) => setUploadAlt(e.target.value)}
                      className={fieldClassName}
                      placeholder="Promo description"
                    />
                  </div>

                  <div className="md:col-span-2 flex items-center gap-3">
                    <input
                      id="promoVisible"
                      type="checkbox"
                      checked={uploadVisible}
                      disabled={isLoading || isUploading}
                      onChange={(e) => setUploadVisible(e.target.checked)}
                      className="h-4 w-4"
                    />
                    <label htmlFor="promoVisible" className="text-sm text-gray-300">Visible</label>
                  </div>
                </div>

                <div className="mt-4">
                  <GamingButton
                    onClick={async () => {
                      if (!uploadFile) {
                        showToast('error', 'Please select an image', 2500);
                        return;
                      }

                      try {
                        setIsUploading(true);
                        await adminWebsiteSettingsService.uploadPromotion(uploadFile, { alt: uploadAlt, visible: uploadVisible });
                        setUploadFile(null);
                        setUploadAlt('');
                        setUploadVisible(true);
                        await load();
                        showToast('success', 'Promotion uploaded', 2500);
                      } catch (err: any) {
                        console.warn('Failed to upload promotion', err);
                        showToast('error', err?.message || 'Failed to upload promotion', 3500);
                      } finally {
                        setIsUploading(false);
                      }
                    }}
                    variant="primary"
                    disabled={isLoading || isUploading || !uploadFile}
                  >
                    {isUploading ? 'Uploading...' : 'Upload'}
                  </GamingButton>
                </div>
              </div>

              <div className="space-y-4">
                {(settings.promotions || []).length === 0 && (
                  <div className="text-sm text-gray-400">No promotions uploaded yet.</div>
                )}

                {(settings.promotions || []).map((p, idx) => (
                  <div key={p.key} className="rounded-lg border border-nexus-gray/60 bg-nexus-dark/30 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="text-sm text-gray-400">Promotion #{idx + 1}</div>
                      <GamingButton
                        onClick={async () => {
                          try {
                            setIsSavingPromos(true);
                            await adminWebsiteSettingsService.deletePromotion(p.id);
                            await load();
                            showToast('success', 'Promotion deleted', 2000);
                          } catch (err: any) {
                            console.warn('Failed to delete promotion', err);
                            showToast('error', err?.message || 'Failed to delete promotion', 3500);
                          } finally {
                            setIsSavingPromos(false);
                          }
                        }}
                        variant="secondary"
                        disabled={isLoading || isSavingPromos || isUploading}
                      >
                        Delete
                      </GamingButton>
                    </div>

                    {p.imageUrl && (
                      <div className="mt-3">
                        <img
                          src={p.imageUrl}
                          alt={p.alt || 'Promotion image'}
                          className="w-full max-w-sm rounded-md border border-nexus-purple/20"
                        />
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      <div>
                        <label className="block text-sm text-gray-300 mb-2" htmlFor={`alt-${p.key}`}>Alt Text</label>
                        <input
                          id={`alt-${p.key}`}
                          type="text"
                          value={p.alt}
                          disabled={isLoading || isSavingPromos}
                          onChange={(e) => updatePromotionDraft(p.key, { alt: e.target.value })}
                          className={fieldClassName}
                        />
                      </div>

                      <div>
                        <label className="block text-sm text-gray-300 mb-2" htmlFor={`sort-${p.key}`}>Sort Order</label>
                        <input
                          id={`sort-${p.key}`}
                          type="number"
                          value={Number(p.sortOrder) || 0}
                          disabled={isLoading || isSavingPromos}
                          onChange={(e) => updatePromotionDraft(p.key, { sortOrder: Number(e.target.value) || 0 })}
                          className={fieldClassName}
                        />
                      </div>

                      <div className="md:col-span-2 flex items-center gap-3">
                        <input
                          id={`visible-${p.key}`}
                          type="checkbox"
                          checked={p.visible}
                          disabled={isLoading || isSavingPromos}
                          onChange={(e) => updatePromotionDraft(p.key, { visible: e.target.checked })}
                          className="h-4 w-4"
                        />
                        <label htmlFor={`visible-${p.key}`} className="text-sm text-gray-300">Visible</label>
                      </div>
                    </div>

                    <div className="mt-4">
                      <GamingButton
                        onClick={async () => {
                          try {
                            setIsSavingPromos(true);
                            await adminWebsiteSettingsService.updatePromotion(p.id, {
                              alt: String(p.alt || ''),
                              visible: Boolean(p.visible),
                              sortOrder: Number(p.sortOrder) || 0,
                            });
                            showToast('success', 'Promotion updated', 2000);
                          } catch (err: any) {
                            console.warn('Failed to update promotion', err);
                            showToast('error', err?.message || 'Failed to update promotion', 3500);
                          } finally {
                            setIsSavingPromos(false);
                          }
                        }}
                        variant="primary"
                        disabled={isLoading || isSavingPromos || isUploading}
                      >
                        Save Promotion
                      </GamingButton>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'featured' && (
            <div className="bg-nexus-dark rounded-lg p-6 border border-nexus-purple/20 shadow-sm">
              <h2 className="text-xl font-bold text-white mb-4">Featured Products</h2>
              <p className="text-gray-400 mb-6">Choose which Desktop and Laptop appear in the Featured Products section.</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-300 mb-2" htmlFor="featuredDesktop">Featured Desktop</label>
                  <select
                    id="featuredDesktop"
                    value={settings.featuredProducts.desktopProductId}
                    disabled={isLoading || isSavingFeatured}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      featuredProducts: { ...prev.featuredProducts, desktopProductId: e.target.value }
                    }))}
                    className={fieldClassName}
                  >
                    <option value="">(Auto: first Desktop)</option>
                    {products.filter(p => p.category === 'Desktop').map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-gray-300 mb-2" htmlFor="featuredLaptop">Featured Laptop</label>
                  <select
                    id="featuredLaptop"
                    value={settings.featuredProducts.laptopProductId}
                    disabled={isLoading || isSavingFeatured}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      featuredProducts: { ...prev.featuredProducts, laptopProductId: e.target.value }
                    }))}
                    className={fieldClassName}
                  >
                    <option value="">(Auto: first Laptop)</option>
                    {products.filter(p => p.category === 'Laptop').map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                <GamingButton
                  onClick={async () => {
                    try {
                      setIsSavingFeatured(true);
                      await adminWebsiteSettingsService.update({
                        featuredProducts: {
                          desktopProductId: String(settings.featuredProducts.desktopProductId || ''),
                          laptopProductId: String(settings.featuredProducts.laptopProductId || ''),
                        }
                      });
                      showToast('success', 'Featured products updated', 2500);
                    } catch (err: any) {
                      console.warn('Failed to update featured products', err);
                      showToast('error', err?.message || 'Failed to update featured products', 3500);
                    } finally {
                      setIsSavingFeatured(false);
                    }
                  }}
                  variant="primary"
                  disabled={isLoading || isSavingFeatured}
                >
                  {isSavingFeatured ? 'Saving...' : 'Save Featured'}
                </GamingButton>
              </div>
            </div>
          )}

          {activeTab === 'faqs' && (
            <div className="bg-nexus-dark rounded-lg p-6 border border-nexus-purple/20 shadow-sm">
              <h2 className="text-xl font-bold text-white mb-4">FAQs</h2>

              <div className="rounded-lg border border-nexus-gray/60 bg-nexus-dark/30 p-4 mb-4">
                <div className="text-sm text-gray-300 mb-3">Add New FAQ</div>
                <div className="grid grid-cols-1 gap-3">
                  <input
                    type="text"
                    value={newFaq.question}
                    onChange={(e) => setNewFaq(prev => ({ ...prev, question: e.target.value }))}
                    className={fieldClassName}
                    placeholder="Question"
                    disabled={isLoading || isSavingFaq}
                  />
                  <textarea
                    value={newFaq.answer}
                    onChange={(e) => setNewFaq(prev => ({ ...prev, answer: e.target.value }))}
                    className={`${fieldClassName} resize-y`}
                    rows={3}
                    placeholder="Answer"
                    disabled={isLoading || isSavingFaq}
                  />
                  <div className="flex items-center gap-3">
                    <input
                      id="newFaqVisible"
                      type="checkbox"
                      checked={newFaq.visible}
                      onChange={(e) => setNewFaq(prev => ({ ...prev, visible: e.target.checked }))}
                      disabled={isLoading || isSavingFaq}
                      className="h-4 w-4"
                    />
                    <label htmlFor="newFaqVisible" className="text-sm text-gray-300">Visible</label>
                  </div>
                  <GamingButton
                    onClick={async () => {
                      try {
                        setIsSavingFaq(true);
                        await adminWebsiteSettingsService.createFaq({
                          question: String(newFaq.question || ''),
                          answer: String(newFaq.answer || ''),
                          visible: Boolean(newFaq.visible),
                          sortOrder: Number(newFaq.sortOrder) || 0,
                        });
                        setNewFaq({ question: '', answer: '', visible: true, sortOrder: 0 });
                        await load();
                        showToast('success', 'FAQ created', 2000);
                      } catch (err: any) {
                        console.warn('Failed to create FAQ', err);
                        showToast('error', err?.message || 'Failed to create FAQ', 3500);
                      } finally {
                        setIsSavingFaq(false);
                      }
                    }}
                    variant="primary"
                    disabled={isLoading || isSavingFaq}
                  >
                    {isSavingFaq ? 'Saving...' : 'Add FAQ'}
                  </GamingButton>
                </div>
              </div>

              <div className="space-y-4">
                {(settings.faqs || []).length === 0 && (
                  <div className="text-sm text-gray-400">No FAQs yet.</div>
                )}

                {(settings.faqs || []).map((f, idx) => (
                  <div key={f.key} className="rounded-lg border border-nexus-gray/60 bg-nexus-dark/30 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="text-sm text-gray-400">FAQ #{idx + 1}</div>
                      <GamingButton
                        onClick={async () => {
                          try {
                            setIsSavingFaq(true);
                            await adminWebsiteSettingsService.deleteFaq(f.id);
                            await load();
                            showToast('success', 'FAQ deleted', 2000);
                          } catch (err: any) {
                            console.warn('Failed to delete FAQ', err);
                            showToast('error', err?.message || 'Failed to delete FAQ', 3500);
                          } finally {
                            setIsSavingFaq(false);
                          }
                        }}
                        variant="secondary"
                        disabled={isLoading || isSavingFaq}
                      >
                        Delete
                      </GamingButton>
                    </div>

                    <div className="grid grid-cols-1 gap-3 mt-4">
                      <input
                        type="text"
                        value={f.question}
                        disabled={isLoading || isSavingFaq}
                        onChange={(e) => updateFaqDraft(f.key, { question: e.target.value })}
                        className={fieldClassName}
                        placeholder="Question"
                      />
                      <textarea
                        value={f.answer}
                        disabled={isLoading || isSavingFaq}
                        onChange={(e) => updateFaqDraft(f.key, { answer: e.target.value })}
                        className={`${fieldClassName} resize-y`}
                        rows={3}
                        placeholder="Answer"
                      />

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm text-gray-300 mb-2" htmlFor={`faq-sort-${f.key}`}>Sort Order</label>
                          <input
                            id={`faq-sort-${f.key}`}
                            type="number"
                            value={Number(f.sortOrder) || 0}
                            disabled={isLoading || isSavingFaq}
                            onChange={(e) => updateFaqDraft(f.key, { sortOrder: Number(e.target.value) || 0 })}
                            className={fieldClassName}
                          />
                        </div>
                        <div className="flex items-center gap-3 mt-7">
                          <input
                            id={`faq-visible-${f.key}`}
                            type="checkbox"
                            checked={f.visible}
                            disabled={isLoading || isSavingFaq}
                            onChange={(e) => updateFaqDraft(f.key, { visible: e.target.checked })}
                            className="h-4 w-4"
                          />
                          <label htmlFor={`faq-visible-${f.key}`} className="text-sm text-gray-300">Visible</label>
                        </div>
                      </div>

                      <GamingButton
                        onClick={async () => {
                          try {
                            setIsSavingFaq(true);
                            await adminWebsiteSettingsService.updateFaq(f.id, {
                              question: String(f.question || ''),
                              answer: String(f.answer || ''),
                              visible: Boolean(f.visible),
                              sortOrder: Number(f.sortOrder) || 0,
                            });
                            showToast('success', 'FAQ updated', 2000);
                          } catch (err: any) {
                            console.warn('Failed to update FAQ', err);
                            showToast('error', err?.message || 'Failed to update FAQ', 3500);
                          } finally {
                            setIsSavingFaq(false);
                          }
                        }}
                        variant="primary"
                        disabled={isLoading || isSavingFaq}
                      >
                        Save FAQ
                      </GamingButton>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'team' && (
            <div className="bg-nexus-dark rounded-lg p-6 border border-nexus-purple/20 shadow-sm">
              <h2 className="text-xl font-bold text-white mb-4">Team Members</h2>

              <div className="rounded-lg border border-nexus-gray/60 bg-nexus-dark/30 p-4 mb-6">
                <div className="text-sm text-gray-300 mb-3">Add New Team Member</div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-300 mb-2" htmlFor="newName">Name *</label>
                    <input
                      id="newName"
                      type="text"
                      value={newTeamMember.name}
                      onChange={(e) => setNewTeamMember(prev => ({ ...prev, name: e.target.value }))}
                      className={fieldClassName}
                      placeholder="e.g. Alex Johnson"
                      disabled={isLoading || isSavingTeam}
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-300 mb-2" htmlFor="newTitle">Title</label>
                    <input
                      id="newTitle"
                      type="text"
                      value={newTeamMember.title}
                      onChange={(e) => setNewTeamMember(prev => ({ ...prev, title: e.target.value }))}
                      className={fieldClassName}
                      placeholder="e.g. Lead Builder"
                      disabled={isLoading || isSavingTeam}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm text-gray-300 mb-2" htmlFor="newBio">Bio</label>
                    <textarea
                      id="newBio"
                      value={newTeamMember.bio}
                      onChange={(e) => setNewTeamMember(prev => ({ ...prev, bio: e.target.value }))}
                      className={`${fieldClassName} resize-y`}
                      rows={3}
                      placeholder="A short bio..."
                      disabled={isLoading || isSavingTeam}
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      id="newTeamVisible"
                      type="checkbox"
                      checked={newTeamMember.visible}
                      onChange={(e) => setNewTeamMember(prev => ({ ...prev, visible: e.target.checked }))}
                      disabled={isLoading || isSavingTeam}
                      className="h-4 w-4"
                    />
                    <label htmlFor="newTeamVisible" className="text-sm text-gray-300">Visible</label>
                  </div>
                </div>
                <div className="mt-4">
                  <GamingButton
                    onClick={async () => {
                      if (!newTeamMember.name.trim()) {
                        showToast('error', 'Name is required', 2500);
                        return;
                      }
                      try {
                        setIsSavingTeam(true);
                        await adminWebsiteSettingsService.createTeamMember(newTeamMember);
                        setNewTeamMember({ name: '', title: '', bio: '', visible: true, sortOrder: 0 });
                        await load();
                        showToast('success', 'Team member added', 2000);
                      } catch (err: any) {
                        console.warn('Failed to add team member', err);
                        showToast('error', err?.message || 'Failed to add team member', 3500);
                      } finally {
                        setIsSavingTeam(false);
                      }
                    }}
                    variant="primary"
                    disabled={isLoading || isSavingTeam}
                  >
                    {isSavingTeam ? 'Adding...' : 'Add Team Member'}
                  </GamingButton>
                </div>
              </div>

              <div className="space-y-6">
                {(settings.teamMembers || []).length === 0 && (
                  <div className="text-sm text-gray-400">No team members added yet.</div>
                )}

                {(settings.teamMembers || []).map((m, idx) => (
                  <div key={m.key} className="rounded-lg border border-nexus-gray/60 bg-nexus-dark/30 p-4">
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <div className="text-sm text-gray-400">Team Member #{idx + 1}</div>
                      <GamingButton
                        onClick={async () => {
                          if (!confirm(`Are you sure you want to delete ${m.name}?`)) return;
                          try {
                            setIsSavingTeam(true);
                            await adminWebsiteSettingsService.deleteTeamMember(m.id);
                            await load();
                            showToast('success', 'Team member deleted', 2000);
                          } catch (err: any) {
                            console.warn('Failed to delete team member', err);
                            showToast('error', err?.message || 'Failed to delete team member', 3500);
                          } finally {
                            setIsSavingTeam(false);
                          }
                        }}
                        variant="secondary"
                        disabled={isLoading || isSavingTeam}
                      >
                        Delete
                      </GamingButton>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      <div className="lg:col-span-1">
                        <label className="block text-sm text-gray-300 mb-2">Portrait</label>
                        <div className="mb-3">
                          {m.imageUrl ? (
                            <img src={m.imageUrl} alt={m.name} className="w-32 h-32 rounded-full object-cover border-2 border-nexus-blue mb-2" />
                          ) : (
                            <div className="w-32 h-32 rounded-full bg-nexus-gray flex items-center justify-center text-gray-500 border-2 border-dashed border-gray-600 mb-2">No Photo</div>
                          )}
                        </div>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => setTeamUploadFile(prev => ({ ...prev, [m.id]: e.target.files?.[0] || null }))}
                          className="block w-full text-xs text-gray-400 file:mr-3 file:py-1 file:px-3 file:rounded file:border-0 file:text-xs file:bg-nexus-gray file:text-white hover:file:bg-nexus-gray/80 mb-2"
                        />
                        <GamingButton
                          onClick={async () => {
                            const file = teamUploadFile[m.id];
                            if (!file) {
                              showToast('error', 'Select a file first', 2000);
                              return;
                            }
                            try {
                              setIsUploadingTeam(true);
                              await adminWebsiteSettingsService.uploadTeamMemberPortrait(m.id, file);
                              setTeamUploadFile(prev => ({ ...prev, [m.id]: null }));
                              await load();
                              showToast('success', 'Portrait updated', 2000);
                            } catch (err: any) {
                              console.warn('Failed to upload portrait', err);
                              showToast('error', err?.message || 'Failed to upload portrait', 3500);
                            } finally {
                              setIsUploadingTeam(false);
                            }
                          }}
                          variant="secondary"
                          size="sm"
                          disabled={isLoading || isUploadingTeam || !teamUploadFile[m.id]}
                        >
                          {isUploadingTeam ? 'Uploading...' : 'Upload Photo'}
                        </GamingButton>
                      </div>

                      <div className="lg:col-span-2 grid grid-cols-1 gap-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm text-gray-300 mb-2" htmlFor={`name-${m.key}`}>Name</label>
                            <input
                              id={`name-${m.key}`}
                              type="text"
                              value={m.name}
                              disabled={isLoading || isSavingTeam}
                              onChange={(e) => updateTeamMemberDraft(m.key, { name: e.target.value })}
                              className={fieldClassName}
                            />
                          </div>
                          <div>
                            <label className="block text-sm text-gray-300 mb-2" htmlFor={`title-${m.key}`}>Title</label>
                            <input
                              id={`title-${m.key}`}
                              type="text"
                              value={m.title}
                              disabled={isLoading || isSavingTeam}
                              onChange={(e) => updateTeamMemberDraft(m.key, { title: e.target.value })}
                              className={fieldClassName}
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm text-gray-300 mb-2" htmlFor={`bio-${m.key}`}>Bio</label>
                          <textarea
                            id={`bio-${m.key}`}
                            value={m.bio}
                            disabled={isLoading || isSavingTeam}
                            onChange={(e) => updateTeamMemberDraft(m.key, { bio: e.target.value })}
                            className={`${fieldClassName} resize-y`}
                            rows={3}
                          />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm text-gray-300 mb-2" htmlFor={`team-sort-${m.key}`}>Sort Order</label>
                            <input
                              id={`team-sort-${m.key}`}
                              type="number"
                              value={Number(m.sortOrder) || 0}
                              disabled={isLoading || isSavingTeam}
                              onChange={(e) => updateTeamMemberDraft(m.key, { sortOrder: Number(e.target.value) || 0 })}
                              className={fieldClassName}
                            />
                          </div>
                          <div className="flex items-center gap-3 md:mt-7">
                            <input
                              id={`team-visible-${m.key}`}
                              type="checkbox"
                              checked={m.visible}
                              disabled={isLoading || isSavingTeam}
                              onChange={(e) => updateTeamMemberDraft(m.key, { visible: e.target.checked })}
                              className="h-4 w-4"
                            />
                            <label htmlFor={`team-visible-${m.key}`} className="text-sm text-gray-300">Visible</label>
                          </div>
                        </div>
                        <GamingButton
                          onClick={async () => {
                            try {
                              setIsSavingTeam(true);
                              await adminWebsiteSettingsService.updateTeamMember(m.id, {
                                name: String(m.name || ''),
                                title: String(m.title || ''),
                                bio: String(m.bio || ''),
                                visible: Boolean(m.visible),
                                sortOrder: Number(m.sortOrder) || 0,
                              });
                              showToast('success', 'Team member updated', 2000);
                            } catch (err: any) {
                              console.warn('Failed to update team member', err);
                              showToast('error', err?.message || 'Failed to update team member', 3500);
                            } finally {
                              setIsSavingTeam(false);
                            }
                          }}
                          variant="primary"
                          disabled={isLoading || isSavingTeam}
                        >
                          Save Changes
                        </GamingButton>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </AdminLayout>
  );
};

export default AdminWebsiteSettingsPage;
