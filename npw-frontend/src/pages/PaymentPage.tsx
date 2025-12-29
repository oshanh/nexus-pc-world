import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import Toast from '../components/Toast';
import GamingButton from '../components/GamingButton';
import AccessDenied from '../components/AccessDenied';
import OrderConfirmation, { type ConfirmedOrder } from '../components/checkout/OrderConfirmation';
import { userService } from '../services/userService';
import type { Address } from '../components/checkout/AddressFields';

type PaymentMethod = 'cod' | 'bank_transfer' | 'payhere';

type CheckoutDraft = {
  billingAddress: Address;
  shippingAddress: Address;
  shipToDifferentAddress: boolean;
};

type PaymentSettings = {
  deliveryCharge: number;
  bankDetails: {
    instructions: string;
    bankName: string;
    accountName: string;
    accountNumber: string;
    branch: string;
  };
};

type UploadedReceipt = {
  url: string;
  filename: string;
  mimeType: string;
};

const paymentMethodInputId = (method: PaymentMethod) => `payment-method-${method}`;

const loadCheckoutDraft = (uid: string) => {
  try {
    const raw = localStorage.getItem(`nexusCheckoutDraft:${uid}`);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return null;
    return parsed as CheckoutDraft;
  } catch {
    return null;
  }
};

const clearCheckoutDraft = (uid: string) => {
  try {
    localStorage.removeItem(`nexusCheckoutDraft:${uid}`);
  } catch {
    // ignore
  }
};

const PaymentPage: React.FC<{ navigateTo: (path: string) => void }> = ({ navigateTo }) => {
  const { user } = useAuth();
  const { cartItems, cartTotal, clearCart } = useCart();

  const isAuthenticated = Boolean(user?.id);

  const [toast, setToast] = useState<{ visible: boolean; message: string; type: 'success' | 'error' }>({
    visible: false,
    message: '',
    type: 'success',
  });

  const showToast = (type: 'success' | 'error', message: string, timeoutMs: number = 3000) => {
    setToast({ visible: true, type, message });
    globalThis.setTimeout(() => setToast(prev => ({ ...prev, visible: false })), timeoutMs);
  };

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cod');
  const [settings, setSettings] = useState<PaymentSettings | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState<ConfirmedOrder | null>(null);
  const [bankReceiptFile, setBankReceiptFile] = useState<File | null>(null);
  const [uploadedReceipt, setUploadedReceipt] = useState<UploadedReceipt | null>(null);

  const orderItemsSnapshot = useMemo(() => cartItems, [cartItems]);

  useEffect(() => {
    if (!confirmedOrder) return;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [confirmedOrder]);

  useEffect(() => {
    if (!isAuthenticated) return;
    (async () => {
      try {
        const res = await userService.getPaymentSettings();
        const s = res?.settings;
        if (s && typeof s === 'object') {
          setSettings({
            deliveryCharge: Number(s.deliveryCharge) || 0,
            bankDetails: {
              instructions: String(s.bankDetails?.instructions ?? ''),
              bankName: String(s.bankDetails?.bankName ?? ''),
              accountName: String(s.bankDetails?.accountName ?? ''),
              accountNumber: String(s.bankDetails?.accountNumber ?? ''),
              branch: String(s.bankDetails?.branch ?? ''),
            },
          });
        }
      } catch (err) {
        console.warn('Failed to load payment settings', err);
      }
    })();
  }, [isAuthenticated]);

  const deliveryCharge = Math.max(0, Number(settings?.deliveryCharge) || 0);
  const grandTotal = cartTotal + deliveryCharge;

  const handleConfirmOrder = () => {
    (async () => {
      try {
        if (!isAuthenticated || !user?.id) return;

        if (cartItems.length === 0) {
          showToast('error', 'Your cart is empty.', 2500);
          return;
        }

        const draft = loadCheckoutDraft(user.id);
        if (!draft) {
          showToast('error', 'Checkout details are missing. Please return to checkout.', 3500);
          return;
        }

        if (paymentMethod === 'payhere') {
          showToast('error', 'PayHere payment is not set up yet.', 3500);
          return;
        }

        let receipt = uploadedReceipt;
        if (paymentMethod === 'bank_transfer') {
          if (!receipt && bankReceiptFile) {
            const uploadRes = await userService.uploadBankTransferReceipt(bankReceiptFile);
            const r = uploadRes?.receipt;
            const url = String(r?.downloadUrl || r?.url || '');
            if (url) {
              receipt = {
                url,
                filename: String(r.filename || ''),
                mimeType: String(r.mimeType || ''),
              };
              setUploadedReceipt(receipt);
            }
          }

          if (!receipt?.url) {
            showToast('error', 'Please upload your bank transfer receipt.', 3500);
            return;
          }
        }

        setIsProcessing(true);

        const res = await userService.createOrder({
          items: cartItems,
          total: grandTotal,
          billingAddress: draft.billingAddress,
          shippingAddress: draft.shippingAddress,
          shipToDifferentAddress: draft.shipToDifferentAddress,
          paymentMethod,
          deliveryCharge,
          bankTransferReceiptUrl: receipt?.url,
          bankTransferReceiptFilename: receipt?.filename,
          bankTransferReceiptMimeType: receipt?.mimeType,
        });

        const order = res?.order || { id: `NEXUS-${Date.now()}-${Math.floor(Math.random() * 1000)}` };
        setConfirmedOrder({ items: orderItemsSnapshot, total: grandTotal, orderNumber: String(order.id) });
        clearCheckoutDraft(user.id);
        await clearCart();
        setIsProcessing(false);
      } catch (err: any) {
        console.warn('Payment failed', err);
        showToast('error', err?.message || 'Payment failed. Please try again.');
        setIsProcessing(false);
      }
    })();
  };

  if (confirmedOrder) {
    return (
      <section className="py-20 min-h-[80vh] flex items-center justify-center">
        <div className="container mx-auto px-6">
          <OrderConfirmation order={confirmedOrder} navigateTo={navigateTo} />
        </div>
      </section>
    );
  }

  if (!isAuthenticated) {
    return (
      <section className="py-16 min-h-[80vh]">
        <div className="container mx-auto px-6">
          <AccessDenied
            title="Please log in"
            description="You need to be logged in to pay for your order."
            backText="Go to Login"
            onBack={() => navigateTo('/login')}
            className="min-h-[60vh]"
          />
        </div>
      </section>
    );
  }

  if (cartItems.length === 0) {
    return (
      <section className="py-20 min-h-[80vh] flex items-center justify-center">
        <Toast message={toast.message} type={toast.type} visible={toast.visible} />
        <div className="container mx-auto px-6">
          <div className="text-center bg-nexus-dark/50 p-8 sm:p-12 rounded-lg border border-nexus-gray max-w-2xl mx-auto">
            <h2 className="text-2xl font-exo font-bold text-white mb-2">Your cart is empty</h2>
            <p className="text-gray-400 mb-8">Please add products before making a payment.</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <GamingButton onClick={() => navigateTo('/products')} variant="cta">
                Go Shopping
              </GamingButton>
              <GamingButton onClick={() => navigateTo('/cart')} variant="secondary">
                Go to Cart
              </GamingButton>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 min-h-[80vh]">
      <Toast message={toast.message} type={toast.type} visible={toast.visible} />

      <div className="container mx-auto px-6">
        <h1 className="text-4xl font-exo text-center font-bold mb-12">Payment</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-nexus-dark/50 p-6 rounded-lg border border-nexus-gray">
              <h2 className="text-2xl font-exo font-bold text-white mb-2">Choose Payment Method</h2>
              <p className="text-gray-400 mb-6">Select how you want to pay for this order.</p>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <input
                    id={paymentMethodInputId('cod')}
                    type="radio"
                    name="payment-method"
                    className="mt-1 h-4 w-4"
                    checked={paymentMethod === 'cod'}
                    onChange={() => setPaymentMethod('cod')}
                    disabled={isProcessing}
                  />
                  <label htmlFor={paymentMethodInputId('cod')} className="cursor-pointer">
                    <div className="text-white font-exo font-bold">Cash on Delivery</div>
                    <div className="text-sm text-gray-400">Pay when your order is delivered.</div>
                  </label>
                </div>

                <div className="flex items-start gap-3">
                  <input
                    id={paymentMethodInputId('bank_transfer')}
                    type="radio"
                    name="payment-method"
                    className="mt-1 h-4 w-4"
                    checked={paymentMethod === 'bank_transfer'}
                    onChange={() => setPaymentMethod('bank_transfer')}
                    disabled={isProcessing}
                  />
                  <label htmlFor={paymentMethodInputId('bank_transfer')} className="cursor-pointer">
                    <div className="text-white font-exo font-bold">Bank Transfer</div>
                    <div className="text-sm text-gray-400">Transfer to our bank account and upload the receipt.</div>
                  </label>
                </div>

                <div className="flex items-start gap-3">
                  <input
                    id={paymentMethodInputId('payhere')}
                    type="radio"
                    name="payment-method"
                    className="mt-1 h-4 w-4"
                    checked={paymentMethod === 'payhere'}
                    onChange={() => setPaymentMethod('payhere')}
                    disabled={isProcessing}
                  />
                  <label htmlFor={paymentMethodInputId('payhere')} className="cursor-pointer">
                    <div className="text-white font-exo font-bold">PayHere</div>
                    <div className="text-sm text-gray-400">Online payment gateway (coming soon).</div>
                  </label>
                </div>
              </div>
            </div>

            {paymentMethod === 'cod' && (
              <div className="bg-nexus-dark/50 p-6 rounded-lg border border-nexus-gray">
                <h2 className="text-2xl font-exo font-bold text-white mb-2">Cash on Delivery</h2>
                <p className="text-gray-400">You will pay in cash when the order arrives.</p>
              </div>
            )}

            {paymentMethod === 'bank_transfer' && (
              <div className="bg-nexus-dark/50 p-6 rounded-lg border border-nexus-gray">
                <h2 className="text-2xl font-exo font-bold text-white mb-2">Bank Transfer</h2>
                <p className="text-gray-400 mb-6">Use the details below and upload your receipt.</p>

                <div className="text-sm text-gray-300 space-y-2">
                  {settings?.bankDetails?.instructions && (
                    <div className="text-gray-400">{settings.bankDetails.instructions}</div>
                  )}
                  {settings?.bankDetails?.bankName && (
                    <div><span className="text-gray-500">Bank:</span> {settings.bankDetails.bankName}</div>
                  )}
                  {settings?.bankDetails?.accountName && (
                    <div><span className="text-gray-500">Account Name:</span> {settings.bankDetails.accountName}</div>
                  )}
                  {settings?.bankDetails?.accountNumber && (
                    <div><span className="text-gray-500">Account Number:</span> {settings.bankDetails.accountNumber}</div>
                  )}
                  {settings?.bankDetails?.branch && (
                    <div><span className="text-gray-500">Branch:</span> {settings.bankDetails.branch}</div>
                  )}
                </div>

                <div className="mt-6">
                  <label className="block text-sm text-gray-300 mb-2" htmlFor="bank-receipt">
                    Upload receipt (Photo or PDF)
                  </label>
                  <input
                    id="bank-receipt"
                    type="file"
                    accept="image/*,application/pdf"
                    disabled={isProcessing}
                    onChange={(e) => {
                      const f = e.target.files?.[0] || null;
                      setBankReceiptFile(f);
                      setUploadedReceipt(null);
                    }}
                    className="block w-full text-sm text-gray-300"
                  />
                  {uploadedReceipt?.filename && (
                    <div className="mt-2 text-sm text-green-400">
                      Receipt uploaded: {uploadedReceipt.filename}
                    </div>
                  )}
                  <div className="mt-2 text-xs text-gray-500">
                    Maximum 10MB. Accepted: JPG/PNG/PDF.
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="lg:col-span-1">
            <div className="bg-nexus-dark p-6 rounded-lg sticky top-24 border border-nexus-gray">
              <h2 className="text-xl font-exo font-bold text-white mb-6 border-b border-nexus-gray pb-4">Order Summary</h2>
              <div className="space-y-4 text-nexus-light">
                <div className="flex justify-between">
                  <span className="text-gray-400">Subtotal</span>
                  <span>Rs {cartTotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Delivery</span>
                  <span>{deliveryCharge === 0 ? <span className="font-bold text-green-400">FREE</span> : `Rs ${deliveryCharge.toLocaleString()}`}</span>
                </div>
                <div className="border-t border-nexus-gray pt-4 mt-4 flex justify-between font-bold text-xl">
                  <span className="font-exo text-white">Order Total</span>
                  <span className="text-nexus-blue">Rs {grandTotal.toLocaleString()}</span>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                <GamingButton onClick={() => navigateTo('/checkout')} variant="secondary" disabled={isProcessing} className="w-full">
                  Back to Checkout
                </GamingButton>
                <GamingButton onClick={handleConfirmOrder} variant="cta" disabled={isProcessing} className="w-full">
                  {isProcessing ? 'Processing...' : 'Place Order'}
                </GamingButton>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PaymentPage;
