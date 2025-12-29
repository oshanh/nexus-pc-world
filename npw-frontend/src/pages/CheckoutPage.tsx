import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { userService } from '../services/userService';
import { productService } from '../services/productService';
import Toast from '../components/Toast';
import GamingButton from '../components/GamingButton';
import AccessDenied from '../components/AccessDenied';
import BillingAddressSection from '../components/checkout/BillingAddressSection';
import ShippingAddressSection from '../components/checkout/ShippingAddressSection';
import { defaultAddress, isAddressValid, normalizeAddress, type Address } from '../components/checkout/AddressFields';

const CheckoutPage: React.FC<{ navigateTo: (path: string) => void }> = ({ navigateTo }) => {
  const { user } = useAuth();
  const { cartItems, cartTotal } = useCart();

  const isAuthenticated = Boolean(user?.id);
  const [isProcessing, setIsProcessing] = useState(false);

  const [billingAddress, setBillingAddress] = useState<Address>(() => defaultAddress());
  const [shippingAddress, setShippingAddress] = useState<Address>(() => defaultAddress());
  const [shipToDifferentAddress, setShipToDifferentAddress] = useState(false);
  const [deliveryCharge, setDeliveryCharge] = useState(0);

  const [toast, setToast] = useState<{ visible: boolean; message: string; type: 'success' | 'error' }>({
    visible: false,
    message: '',
    type: 'success',
  });

  const showToast = (type: 'success' | 'error', message: string, timeoutMs: number = 3000) => {
    setToast({ visible: true, type, message });
    globalThis.setTimeout(() => setToast(prev => ({ ...prev, visible: false })), timeoutMs);
  };

  useEffect(() => {
    if (!isAuthenticated) return;

    const loadAccount = async () => {
      try {
        const res = await userService.getAccount();
        setBillingAddress(normalizeAddress(res?.account?.billingAddress));
        setShippingAddress(normalizeAddress(res?.account?.shippingAddress));
        setShipToDifferentAddress(false);
      } catch (err) {
        console.warn('Failed to load account addresses', err);
      }
    };

    loadAccount();
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) {
      setDeliveryCharge(0);
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const res = await userService.getPaymentSettings();
        const s: any = res?.settings;
        const next = Math.max(0, Number(s?.deliveryCharge) || 0);
        if (!cancelled) setDeliveryCharge(next);
      } catch (err) {
        console.warn('Failed to load payment settings', err);
        if (!cancelled) setDeliveryCharge(0);
      }
    })();

    return () => { cancelled = true; };
  }, [isAuthenticated]);

  const grandTotal = cartTotal + deliveryCharge;

  const handleContinueToPayment = () => {
    (async () => {
      try {
        if (!isAuthenticated) return;
        if (cartItems.length === 0) {
          showToast('error', 'Your cart is empty.', 2500);
          return;
        }

        // Prevent checkout if any item is inactive/missing or doesn't have enough stock
        const qtyById = new Map<string, number>();
        for (const item of cartItems) {
          qtyById.set(item.id, (qtyById.get(item.id) || 0) + (Number(item.quantity) || 0));
        }

        const ids = Array.from(qtyById.keys());
        const results = await Promise.all(
          ids.map(async (id) => {
            try {
              const p = await productService.getById(id);
              const requested = qtyById.get(id) || 0;
              const available = Math.max(0, Number(p?.stock) || 0);
              return { id, ok: requested > 0 && requested <= available };
            } catch {
              return { id, ok: false };
            }
          })
        );

        const hasUnavailable = results.some(r => !r.ok);
        if (hasUnavailable) {
          showToast('error', 'Some items are unavailable or out of stock. Please update your cart to proceed.', 4500);
          return;
        }

        if (!isAddressValid(billingAddress)) {
          showToast('error', 'Please complete required billing address fields.', 3500);
          return;
        }

        if (shipToDifferentAddress && !isAddressValid(shippingAddress)) {
          showToast('error', 'Please complete required shipping address fields.', 3500);
          return;
        }

        setIsProcessing(true);
        try {
          localStorage.setItem(
            `nexusCheckoutDraft:${user?.id}`,
            JSON.stringify({ billingAddress, shippingAddress, shipToDifferentAddress })
          );
        } catch (err) {
          console.warn('Failed to persist checkout draft', err);
        }
        setIsProcessing(false);
        navigateTo('/payment');
      } catch (err: any) {
        console.warn('Checkout validation failed', err);
        showToast('error', err?.message || 'Checkout failed. Please try again.');
        setIsProcessing(false);
      }
    })();
  };

  if (cartItems.length === 0) {
    return (
      <section className="py-20 min-h-[80vh] flex items-center justify-center">
        <Toast message={toast.message} type={toast.type} visible={toast.visible} />
        <div className="container mx-auto px-6">
          <div className="text-center bg-nexus-dark/50 p-8 sm:p-12 rounded-lg border border-nexus-gray max-w-2xl mx-auto">
            <h2 className="text-2xl font-exo font-bold text-white mb-2">Your cart is empty</h2>
            <p className="text-gray-400 mb-8">Please go back to your cart to continue.</p>
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

  if (!isAuthenticated) {
    return (
      <section className="py-16 min-h-[80vh]">
        <div className="container mx-auto px-6">
          <AccessDenied
            title="Please log in"
            description="You need to be logged in to checkout."
            backText="Go to Login"
            onBack={() => navigateTo('/login')}
            className="min-h-[60vh]"
          />
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 min-h-[80vh]">
      <Toast message={toast.message} type={toast.type} visible={toast.visible} />

      <div className="container mx-auto px-6">
        <h1 className="text-4xl font-exo text-center font-bold mb-12">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-2 space-y-6">
            <BillingAddressSection address={billingAddress} onChange={setBillingAddress} disabled={isProcessing} />
            <ShippingAddressSection
              billingAddress={billingAddress}
              shippingAddress={shippingAddress}
              onChangeShipping={setShippingAddress}
              shipToDifferentAddress={shipToDifferentAddress}
              onToggleShipToDifferentAddress={setShipToDifferentAddress}
              disabled={isProcessing}
            />
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
                  <span>
                    {deliveryCharge === 0
                      ? <span className="font-bold text-green-400">FREE</span>
                      : `Rs ${deliveryCharge.toLocaleString()}`}
                  </span>
                </div>
                <div className="border-t border-nexus-gray pt-4 mt-4 flex justify-between font-bold text-xl">
                  <span className="font-exo text-white">Order Total</span>
                  <span className="text-nexus-blue">Rs {grandTotal.toLocaleString()}</span>
                </div>
              </div>

              <div className="mt-6 text-sm text-gray-400">
                First name, last name, street address, town/city, and postcode are required.
              </div>

              <div className="mt-6 space-y-3">
                <GamingButton
                  onClick={() => navigateTo('/cart')}
                  variant="secondary"
                  disabled={isProcessing}
                  className="w-full"
                >
                  Back to Cart
                </GamingButton>
                <GamingButton onClick={handleContinueToPayment} variant="cta" disabled={isProcessing} className="w-full">
                  {isProcessing ? 'Processing...' : 'Continue to Payment'}
                </GamingButton>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CheckoutPage;
