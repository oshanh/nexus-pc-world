import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import AccessDenied from '../../components/AccessDenied';
import AdminLayout from '../../components/AdminLayout';
import Toast from '../../components/Toast';
import GamingButton from '../../components/GamingButton';
import { adminPaymentSettingsService, type AdminPaymentSettings, type BankAccount } from '../../services/adminPaymentSettingsService';

type BankAccountDraft = BankAccount & { key: string };

type AdminPaymentSettingsDraft = Omit<AdminPaymentSettings, 'bankAccounts'> & {
  bankAccounts: BankAccountDraft[];
};

const makeAccountKey = () => `bank-${Date.now()}-${Math.floor(Math.random() * 1_000_000)}`;

const AdminPaymentSettingsPage: React.FC<{ navigateTo: (path: string) => void }> = ({ navigateTo }) => {
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

  const emptySettings = useMemo<AdminPaymentSettingsDraft>(() => ({
    deliveryCharge: 0,
    bankTransferInstructions: '',
    bankAccounts: [
      {
        key: makeAccountKey(),
        bankName: '',
        accountName: '',
        accountNumber: '',
        branch: '',
      }
    ]
  }), []);

  const [settings, setSettings] = useState<AdminPaymentSettingsDraft>(emptySettings);
  const [isLoadingSettings, setIsLoadingSettings] = useState(false);
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  const updateBankAccount = (key: string, patch: Partial<BankAccount>) => {
    setSettings(prev => ({
      ...prev,
      bankAccounts: prev.bankAccounts.map((a) => a.key === key ? { ...a, ...patch } : a)
    }));
  };

  const addBankAccount = () => {
    setSettings(prev => ({
      ...prev,
      bankAccounts: [
        ...(prev.bankAccounts || []),
        { key: makeAccountKey(), bankName: '', accountName: '', accountNumber: '', branch: '' }
      ]
    }));
  };

  const removeBankAccount = (key: string) => {
    setSettings(prev => ({
      ...prev,
      bankAccounts: (prev.bankAccounts || []).filter((a) => a.key !== key)
    }));
  };

  useEffect(() => {
    if (!isAdmin) return;
    let cancelled = false;

    (async () => {
      try {
        setIsLoadingSettings(true);
        const res = await adminPaymentSettingsService.get();
        const s = res?.settings;
        if (!cancelled && s) {
          setSettings({
            deliveryCharge: Number(s.deliveryCharge) || 0,
            bankTransferInstructions: String(s.bankTransferInstructions || ''),
            bankAccounts: Array.isArray(s.bankAccounts) && s.bankAccounts.length > 0
              ? s.bankAccounts.map((a) => ({
                key: makeAccountKey(),
                bankName: String(a?.bankName || ''),
                accountName: String(a?.accountName || ''),
                accountNumber: String(a?.accountNumber || ''),
                branch: String(a?.branch || ''),
              }))
              : [{ key: makeAccountKey(), bankName: '', accountName: '', accountNumber: '', branch: '' }],
          });
        }
      } catch (err: any) {
        console.warn('Failed to load admin payment settings', err);
        if (!cancelled) showToast('error', err?.message || 'Failed to load payment settings');
      } finally {
        if (!cancelled) setIsLoadingSettings(false);
      }
    })();

    return () => { cancelled = true; };
  }, [isAdmin]);

  if (!isAdmin) {
    return (
      <AccessDenied
        title="Access Denied"
        description="You do not have permission to view payment settings."
        backText="Return to Home"
        onBack={() => navigateTo('/')}
      />
    );
  }

  return (
    <AdminLayout title="Payment Settings">
      <Toast message={toast.message} type={toast.type} visible={toast.visible} />

      <section className="py-0">
        <div className="container mx-auto px-6">
          <p className="text-gray-400 mb-6">Update delivery charges and bank transfer details used on the payment page.</p>

          <div className="bg-nexus-dark rounded-lg p-6 border border-nexus-purple/20 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-300 mb-2" htmlFor="deliveryCharge">
                  Delivery Charge (Rs)
                </label>
                <input
                  id="deliveryCharge"
                  type="number"
                  min={0}
                  value={Number(settings.deliveryCharge) || 0}
                  disabled={isLoadingSettings || isSavingSettings}
                  onChange={(e) => setSettings(prev => ({ ...prev, deliveryCharge: Math.max(0, Number(e.target.value) || 0) }))}
                  onWheel={(e) => {
                    // Prevent accidental value change when scrolling.
                    e.currentTarget.blur();
                  }}
                  className={fieldClassName}
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm text-gray-300 mb-2" htmlFor="instructions">
                  Bank Transfer Instructions
                </label>
                <textarea
                  id="instructions"
                  value={settings.bankTransferInstructions}
                  disabled={isLoadingSettings || isSavingSettings}
                  onChange={(e) => setSettings(prev => ({ ...prev, bankTransferInstructions: e.target.value }))}
                  rows={3}
                  className={`${fieldClassName} resize-y`}
                />
              </div>

              <div className="md:col-span-2">
                <div className="flex items-center justify-between gap-3 mb-2">
                  <div className="text-sm text-gray-300">Bank Accounts</div>
                  <GamingButton
                    onClick={addBankAccount}
                    variant="secondary"
                    disabled={isLoadingSettings || isSavingSettings}
                  >
                    Add Bank
                  </GamingButton>
                </div>

                <div className="space-y-4">
                  {(settings.bankAccounts || []).map((account, index) => (
                    <div key={account.key} className="rounded-lg border border-nexus-gray/60 bg-nexus-dark/30 p-4">
                      <div className="flex items-center justify-between gap-3 mb-3">
                        <div className="text-sm text-gray-400">Bank #{index + 1}</div>
                        <GamingButton
                          onClick={() => removeBankAccount(account.key)}
                          variant="secondary"
                          disabled={isLoadingSettings || isSavingSettings || (settings.bankAccounts || []).length <= 1}
                        >
                          Remove
                        </GamingButton>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm text-gray-300 mb-2" htmlFor={`bankName-${account.key}`}>
                            Bank Name
                          </label>
                          <input
                            id={`bankName-${account.key}`}
                            type="text"
                            value={account.bankName}
                            disabled={isLoadingSettings || isSavingSettings}
                            onChange={(e) => updateBankAccount(account.key, { bankName: e.target.value })}
                            className={fieldClassName}
                          />
                        </div>

                        <div>
                          <label className="block text-sm text-gray-300 mb-2" htmlFor={`accountName-${account.key}`}>
                            Account Name
                          </label>
                          <input
                            id={`accountName-${account.key}`}
                            type="text"
                            value={account.accountName}
                            disabled={isLoadingSettings || isSavingSettings}
                            onChange={(e) => updateBankAccount(account.key, { accountName: e.target.value })}
                            className={fieldClassName}
                          />
                        </div>

                        <div>
                          <label className="block text-sm text-gray-300 mb-2" htmlFor={`accountNumber-${account.key}`}>
                            Account Number
                          </label>
                          <input
                            id={`accountNumber-${account.key}`}
                            type="text"
                            value={account.accountNumber}
                            disabled={isLoadingSettings || isSavingSettings}
                            onChange={(e) => updateBankAccount(account.key, { accountNumber: e.target.value })}
                            className={fieldClassName}
                          />
                        </div>

                        <div>
                          <label className="block text-sm text-gray-300 mb-2" htmlFor={`branch-${account.key}`}>
                            Branch
                          </label>
                          <input
                            id={`branch-${account.key}`}
                            type="text"
                            value={account.branch}
                            disabled={isLoadingSettings || isSavingSettings}
                            onChange={(e) => updateBankAccount(account.key, { branch: e.target.value })}
                            className={fieldClassName}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <GamingButton
                onClick={async () => {
                  try {
                    setIsSavingSettings(true);
                    const payload: AdminPaymentSettings = {
                      deliveryCharge: Number(settings.deliveryCharge) || 0,
                      bankTransferInstructions: String(settings.bankTransferInstructions || ''),
                      bankAccounts: (settings.bankAccounts || []).map(({ key, ...rest }) => rest),
                    };

                    const res = await adminPaymentSettingsService.update(payload);
                    if (res?.settings) {
                      setSettings({
                        deliveryCharge: Number(res.settings.deliveryCharge) || 0,
                        bankTransferInstructions: String(res.settings.bankTransferInstructions || ''),
                        bankAccounts: Array.isArray(res.settings.bankAccounts) && res.settings.bankAccounts.length > 0
                          ? res.settings.bankAccounts.map((a) => ({
                            key: makeAccountKey(),
                            bankName: String(a?.bankName || ''),
                            accountName: String(a?.accountName || ''),
                            accountNumber: String(a?.accountNumber || ''),
                            branch: String(a?.branch || ''),
                          }))
                          : [{ key: makeAccountKey(), bankName: '', accountName: '', accountNumber: '', branch: '' }],
                      });
                    }

                    showToast('success', 'Payment settings updated', 2500);
                  } catch (err: any) {
                    console.warn('Failed to update payment settings', err);
                    showToast('error', err?.message || 'Failed to update payment settings', 3500);
                  } finally {
                    setIsSavingSettings(false);
                  }
                }}
                variant="primary"
                disabled={isLoadingSettings || isSavingSettings}
              >
                {isSavingSettings ? 'Saving...' : 'Save Settings'}
              </GamingButton>

              <GamingButton
                onClick={() => setSettings(emptySettings)}
                variant="secondary"
                disabled={isLoadingSettings || isSavingSettings}
              >
                Reset
              </GamingButton>
            </div>
          </div>
        </div>
      </section>
    </AdminLayout>
  );
};

export default AdminPaymentSettingsPage;
