import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import AccessDenied from '../../components/AccessDenied';
import AdminLayout from '../../components/AdminLayout';
import Toast from '../../components/Toast';
import GamingButton from '../../components/GamingButton';
import { adminWebsiteSettingsService, type Promotion, type WebsiteSettings } from '../../services/adminWebsiteSettingsService';
import { API_BASE_URL } from '../../api/client';

const toAbsoluteApiUrl = (maybeRelative: string) => {
  const s = String(maybeRelative || '').trim();
  if (!s) return '';
  if (/^https?:\/\//i.test(s)) return s;
  if (s.startsWith('/')) {
    const apiOrigin = API_BASE_URL.replace(/\/?api\/?$/, '');
    return `${apiOrigin}${s}`;
  }
  return s;
};

type PromotionDraft = Promotion & { key: string };

type WebsiteSettingsDraft = Omit<WebsiteSettings, 'promotions'> & {
  promotions: PromotionDraft[];
};

const makeKey = () => `promo-${Date.now()}-${Math.floor(Math.random() * 1_000_000)}`;

const AdminWebsiteSettingsPage: React.FC<{ navigateTo: (path: string) => void }> = ({ navigateTo }) => {
  const { isAdmin } = useAuth();

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

  const emptySettings = useMemo<WebsiteSettingsDraft>(() => ({
    socialLinks: { facebook: '', twitter: '', instagram: '' },
    promotions: [],
  }), []);

  const [settings, setSettings] = useState<WebsiteSettingsDraft>(emptySettings);
  const [isLoading, setIsLoading] = useState(false);
  const [isSavingLinks, setIsSavingLinks] = useState(false);
  const [isSavingPromos, setIsSavingPromos] = useState(false);

  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadAlt, setUploadAlt] = useState('');
  const [uploadVisible, setUploadVisible] = useState(true);
  const [isUploading, setIsUploading] = useState(false);

  const load = async () => {
    setIsLoading(true);
    try {
      const res = await adminWebsiteSettingsService.get();
      const s = res?.settings;
      if (s) {
        setSettings({
          socialLinks: {
            facebook: String(s.socialLinks?.facebook || ''),
            twitter: String(s.socialLinks?.twitter || ''),
            instagram: String(s.socialLinks?.instagram || ''),
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
        });
      } else {
        setSettings(emptySettings);
      }
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
          <p className="text-gray-400 mb-6">Update footer social links and manage promotion carousel images.</p>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-nexus-dark rounded-lg p-6 border border-nexus-purple/20 shadow-sm">
              <h2 className="text-xl font-bold text-white mb-4">Footer Social Links</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-300 mb-2" htmlFor="facebook">Facebook URL</label>
                  <input
                    id="facebook"
                    type="url"
                    value={settings.socialLinks.facebook}
                    disabled={isLoading || isSavingLinks}
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
                    disabled={isLoading || isSavingLinks}
                    onChange={(e) => setSettings(prev => ({ ...prev, socialLinks: { ...prev.socialLinks, twitter: e.target.value } }))}
                    className={fieldClassName}
                    placeholder="https://twitter.com/yourhandle"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-300 mb-2" htmlFor="instagram">Instagram URL</label>
                  <input
                    id="instagram"
                    type="url"
                    value={settings.socialLinks.instagram}
                    disabled={isLoading || isSavingLinks}
                    onChange={(e) => setSettings(prev => ({ ...prev, socialLinks: { ...prev.socialLinks, instagram: e.target.value } }))}
                    className={fieldClassName}
                    placeholder="https://instagram.com/yourprofile"
                  />
                </div>

                <div className="flex gap-3">
                  <GamingButton
                    onClick={async () => {
                      try {
                        setIsSavingLinks(true);
                        await adminWebsiteSettingsService.update({
                          socialLinks: {
                            facebook: String(settings.socialLinks.facebook || ''),
                            twitter: String(settings.socialLinks.twitter || ''),
                            instagram: String(settings.socialLinks.instagram || ''),
                          },
                        });
                        showToast('success', 'Social links updated', 2500);
                      } catch (err: any) {
                        console.warn('Failed to update social links', err);
                        showToast('error', err?.message || 'Failed to update social links', 3500);
                      } finally {
                        setIsSavingLinks(false);
                      }
                    }}
                    variant="primary"
                    disabled={isLoading || isSavingLinks || isSavingPromos || isUploading}
                  >
                    {isSavingLinks ? 'Saving...' : 'Save Links'}
                  </GamingButton>

                  <GamingButton
                    onClick={() => setSettings(emptySettings)}
                    variant="secondary"
                    disabled={isLoading || isSavingLinks || isSavingPromos || isUploading}
                  >
                    Reset
                  </GamingButton>
                </div>
              </div>
            </div>

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
                        disabled={isLoading || isSavingPromos || isUploading || isSavingLinks}
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
          </div>
        </div>
      </section>
    </AdminLayout>
  );
};

export default AdminWebsiteSettingsPage;
