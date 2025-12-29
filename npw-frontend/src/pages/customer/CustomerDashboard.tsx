import React, { useEffect, useMemo, useState } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import CustomerSidebar from '../../components/CustomerSidebar';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import { useWishlist } from '../../contexts/WishlistContext';
import { userService } from '../../services/userService';
import GamingButton from '../../components/GamingButton';
import AccessDenied from '../../components/AccessDenied';
import Toast from '../../components/Toast';

interface Order {
  id: string;
  items: any[];
  total: number;
  createdAt: string;
}

interface Address {
  firstName: string;
  lastName: string;
  phone: string;
  companyName: string;
  country: 'Sri Lanka';
  streetAddress: string;
  houseNumberAndStreetName: string;
  apartment: string;
  city: string;
  postcode: string;
  note: string;
}

const parsePrice = (price: string | number): number => {
  if (typeof price === 'number') return price;
  return Number.parseFloat(String(price).replaceAll(/[^0-9.]/g, '')) || 0;
};

const defaultAddress = (firstName: string, lastName: string): Address => ({
  firstName,
  lastName,
  phone: '',
  companyName: '',
  country: 'Sri Lanka',
  streetAddress: '',
  houseNumberAndStreetName: '',
  apartment: '',
  city: '',
  postcode: '',
  note: '',
});

const splitName = (fullName: string): { firstName: string; lastName: string } => {
  const parts = String(fullName ?? '').trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return { firstName: '', lastName: '' };
  if (parts.length === 1) return { firstName: parts[0], lastName: '' };
  return { firstName: parts[0], lastName: parts.slice(1).join(' ') };
};

const safeParseJson = <T,>(raw: string | null): T | null => {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
};

const normalizeAddress = (raw: Partial<Address> | null | undefined, fallback: Address): Address => {
  const r = raw || {};
  return {
    ...fallback,
    firstName: String(r.firstName ?? fallback.firstName),
    lastName: String(r.lastName ?? fallback.lastName),
    phone: String(r.phone ?? ''),
    companyName: String(r.companyName ?? ''),
    country: 'Sri Lanka',
    streetAddress: String(r.streetAddress ?? ''),
    houseNumberAndStreetName: String(r.houseNumberAndStreetName ?? ''),
    apartment: String(r.apartment ?? ''),
    city: String(r.city ?? ''),
    postcode: String(r.postcode ?? ''),
    note: String(r.note ?? ''),
  };
};

const AddressForm: React.FC<{
  title: string;
  address: Address;
  onChange: (next: Address) => void;
}> = ({ title, address, onChange }) => (
  <div className="bg-nexus-dark p-6 rounded border border-nexus-gray">
    <h3 className="text-xl font-bold text-white mb-4">{title}</h3>
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor={`${title}-first-name`} className="block text-sm text-gray-400 mb-1">First name *</label>
          <input
            id={`${title}-first-name`}
            value={address.firstName}
            onChange={(e) => onChange({ ...address, firstName: e.target.value })}
            className="w-full bg-nexus-gray border border-nexus-purple/30 rounded py-2 px-3 text-white"
          />
        </div>
        <div>
          <label htmlFor={`${title}-last-name`} className="block text-sm text-gray-400 mb-1">Last name *</label>
          <input
            id={`${title}-last-name`}
            value={address.lastName}
            onChange={(e) => onChange({ ...address, lastName: e.target.value })}
            className="w-full bg-nexus-gray border border-nexus-purple/30 rounded py-2 px-3 text-white"
          />
        </div>
      </div>

      <div>
        <label htmlFor={`${title}-phone`} className="block text-sm text-gray-400 mb-1">Phone (optional)</label>
        <input
          id={`${title}-phone`}
          value={address.phone}
          onChange={(e) => onChange({ ...address, phone: e.target.value })}
          className="w-full bg-nexus-gray border border-nexus-purple/30 rounded py-2 px-3 text-white"
        />
      </div>

      <div>
        <label htmlFor={`${title}-company`} className="block text-sm text-gray-400 mb-1">Company name (optional)</label>
        <input
          id={`${title}-company`}
          value={address.companyName}
          onChange={(e) => onChange({ ...address, companyName: e.target.value })}
          className="w-full bg-nexus-gray border border-nexus-purple/30 rounded py-2 px-3 text-white"
        />
      </div>

      <div>
        <label htmlFor={`${title}-country`} className="block text-sm text-gray-400 mb-1">Country / Region *</label>
        <input
          id={`${title}-country`}
          value="Sri Lanka"
          readOnly
          className="w-full bg-nexus-gray border border-nexus-purple/30 rounded py-2 px-3 text-gray-400"
        />
      </div>

      <div>
        <label htmlFor={`${title}-street`} className="block text-sm text-gray-400 mb-1">Street address *</label>
        <input
          id={`${title}-street`}
          value={address.streetAddress}
          onChange={(e) => onChange({ ...address, streetAddress: e.target.value })}
          className="w-full bg-nexus-gray border border-nexus-purple/30 rounded py-2 px-3 text-white"
          placeholder="House number and street name"
        />
      </div>

      <div>
        <label htmlFor={`${title}-house`} className="block text-sm text-gray-400 mb-1">House number and street name</label>
        <input
          id={`${title}-house`}
          value={address.houseNumberAndStreetName}
          onChange={(e) => onChange({ ...address, houseNumberAndStreetName: e.target.value })}
          className="w-full bg-nexus-gray border border-nexus-purple/30 rounded py-2 px-3 text-white"
        />
      </div>

      <div>
        <label htmlFor={`${title}-apartment`} className="block text-sm text-gray-400 mb-1">Apartment, suite, unit, etc. (optional)</label>
        <input
          id={`${title}-apartment`}
          value={address.apartment}
          onChange={(e) => onChange({ ...address, apartment: e.target.value })}
          className="w-full bg-nexus-gray border border-nexus-purple/30 rounded py-2 px-3 text-white"
        />
      </div>

      <div>
        <label htmlFor={`${title}-city`} className="block text-sm text-gray-400 mb-1">Town / City *</label>
        <input
          id={`${title}-city`}
          value={address.city}
          onChange={(e) => onChange({ ...address, city: e.target.value })}
          className="w-full bg-nexus-gray border border-nexus-purple/30 rounded py-2 px-3 text-white"
        />
      </div>

      <div>
        <label htmlFor={`${title}-postcode`} className="block text-sm text-gray-400 mb-1">Postcode / ZIP *</label>
        <input
          id={`${title}-postcode`}
          value={address.postcode}
          onChange={(e) => onChange({ ...address, postcode: e.target.value })}
          className="w-full bg-nexus-gray border border-nexus-purple/30 rounded py-2 px-3 text-white"
        />
      </div>

      <div>
        <label htmlFor={`${title}-note`} className="block text-sm text-gray-400 mb-1">Order notes (optional)</label>
        <textarea
          id={`${title}-note`}
          value={address.note}
          onChange={(e) => onChange({ ...address, note: e.target.value })}
          className="w-full bg-nexus-gray border border-nexus-purple/30 rounded py-2 px-3 text-white min-h-20"
        />
      </div>
    </div>
  </div>
);

const DashboardHome: React.FC<{
  userName?: string;
  cartCount: number;
  wishlistCount: number;
  orders: Order[];
  ordersError: string | null;
  navigateTo: (path: string) => void;
}> = ({ userName, cartCount, wishlistCount, orders, ordersError, navigateTo }) => {
  let recentOrdersContent: React.ReactNode;
  if (ordersError) {
    recentOrdersContent = <div className="text-red-400">{ordersError}</div>;
  } else if (orders.length === 0) {
    recentOrdersContent = <div className="text-gray-400">No orders found.</div>;
  } else {
    recentOrdersContent = (
      <div className="space-y-3">
        {orders.slice(0, 3).map((order) => (
          <div key={order.id} className="border border-nexus-gray/60 rounded p-3">
            <div className="flex justify-between items-center">
              <div className="font-bold text-white">Order {order.id}</div>
              <div className="text-sm text-gray-400">{new Date(order.createdAt).toLocaleString()}</div>
            </div>
            <div className="mt-2 flex justify-end font-bold text-white">Total: Rs {order.total.toLocaleString()}</div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-nexus-dark p-6 rounded border border-nexus-gray">
        <h2 className="text-2xl font-exo font-bold text-white mb-2">Welcome back{userName ? `, ${userName}` : ''}</h2>
        <p className="text-gray-400">Manage your account, orders, and delivery details.</p>
        <div className="mt-4 text-sm text-gray-400">Cart: {cartCount} | Wishlist: {wishlistCount}</div>
        <div className="mt-6 flex flex-wrap gap-3">
          <GamingButton onClick={() => navigateTo('/products')} variant="primary">Browse Products</GamingButton>
          <GamingButton onClick={() => navigateTo('/cart')} variant="secondary">Go to Cart</GamingButton>
          <GamingButton onClick={() => navigateTo('/wishlist')} variant="secondary">Go to Wishlist</GamingButton>
        </div>
      </div>

      <div className="bg-nexus-dark p-6 rounded border border-nexus-gray">
        <h3 className="text-xl font-bold text-white mb-4">Recent Orders</h3>
        {recentOrdersContent}
      </div>
    </div>
  );
};

const OrdersView: React.FC<{ orders: Order[]; ordersError: string | null }> = ({ orders, ordersError }) => {
  let content: React.ReactNode;
  if (ordersError) {
    content = <div className="p-8 bg-nexus-dark rounded-md text-center text-red-400">{ordersError}</div>;
  } else if (orders.length === 0) {
    content = <div className="p-8 bg-nexus-dark rounded-md text-center text-gray-400">No orders found.</div>;
  } else {
    content = (
      <div className="space-y-4">
        {orders.map((order) => (
          <div key={order.id} className="bg-nexus-dark p-4 rounded border border-nexus-gray">
            <div className="flex justify-between items-center mb-2">
              <div className="font-bold text-white">Order {order.id}</div>
              <div className="text-sm text-gray-400">{new Date(order.createdAt).toLocaleString()}</div>
            </div>
            <div className="text-gray-300">
              <div className="space-y-2">
                {order.items.map((it: any) => (
                  <div key={it.id} className="flex justify-between">
                    <div>{it.name} x{it.quantity}</div>
                    <div className="font-mono">Rs {(parsePrice(it.price) * it.quantity).toLocaleString()}</div>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex justify-end font-bold text-white">Total: Rs {order.total.toLocaleString()}</div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-exo font-bold text-white">Orders</h1>
      {content}
    </div>
  );
};

const AccountView: React.FC<{
  userEmail: string;
  displayName: string;
  onChangeDisplayName: (v: string) => void;
  billingAddress: Address;
  onChangeBillingAddress: (next: Address) => void;
  shippingAddress: Address;
  onChangeShippingAddress: (next: Address) => void;
  onSave: () => void;
  onContinueShopping: () => void;
}> = ({
  userEmail,
  displayName,
  onChangeDisplayName,
  billingAddress,
  onChangeBillingAddress,
  shippingAddress,
  onChangeShippingAddress,
  onSave,
  onContinueShopping,
}) => {
  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-2xl font-exo font-bold text-white">Account</h1>

      <div className="bg-nexus-dark p-6 rounded border border-nexus-gray">
        <h3 className="text-xl font-bold text-white mb-4">User Details</h3>
        <div className="space-y-4">
          <div>
            <label htmlFor="account-display-name" className="block text-sm text-gray-400 mb-1">Display Name</label>
            <input
              id="account-display-name"
              value={displayName}
              onChange={(e) => onChangeDisplayName(e.target.value)}
              className="w-full bg-nexus-gray border border-nexus-purple/30 rounded py-2 px-3 text-white"
            />
          </div>
          <div>
            <label htmlFor="account-email" className="block text-sm text-gray-400 mb-1">Email</label>
            <input
              id="account-email"
              value={userEmail}
              readOnly
              className="w-full bg-nexus-gray border border-nexus-purple/30 rounded py-2 px-3 text-gray-400"
            />
          </div>
        </div>
      </div>

      <AddressForm title="Billing Address" address={billingAddress} onChange={onChangeBillingAddress} />
      <AddressForm title="Shipping Address" address={shippingAddress} onChange={onChangeShippingAddress} />

      <div className="flex gap-4">
        <GamingButton onClick={onSave} variant="primary">Save</GamingButton>
        <GamingButton onClick={onContinueShopping} variant="secondary">Continue Shopping</GamingButton>
      </div>
    </div>
  );
};

const CustomerDashboard: React.FC<{ navigateTo: (path: string) => void }> = ({ navigateTo }) => {
  const { user, isAuthenticated, updateProfile } = useAuth();
  const { cartItems } = useCart();
  const { wishlistItems } = useWishlist();
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersError, setOrdersError] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState(user?.name || '');
  const [toast, setToast] = useState<{ visible: boolean; message: string; type: 'success' | 'error' }>({
    visible: false,
    message: '',
    type: 'success',
  });

  const billingKey = useMemo(() => `nexusBillingAddress:${user?.id ?? 'guest'}`, [user?.id]);
  const shippingKey = useMemo(() => `nexusShippingAddress:${user?.id ?? 'guest'}`, [user?.id]);
  const initialNameParts = splitName(user?.name ?? '');
  const [billingAddress, setBillingAddress] = useState<Address>(() => defaultAddress(initialNameParts.firstName, initialNameParts.lastName));
  const [shippingAddress, setShippingAddress] = useState<Address>(() => defaultAddress(initialNameParts.firstName, initialNameParts.lastName));

  useEffect(() => {
    setDisplayName(user?.name || '');
  }, [user?.name]);

  useEffect(() => {
    if (!isAuthenticated) return;

    const loadAddresses = async () => {
      const localBilling = safeParseJson<Partial<Address>>(localStorage.getItem(billingKey)) || {};
      const localShipping = safeParseJson<Partial<Address>>(localStorage.getItem(shippingKey)) || {};

      try {
        const res = await userService.getAccount();
        const account = res?.account;
        const backendBilling = (account?.billingAddress || {}) as Partial<Address>;
        const backendShipping = (account?.shippingAddress || {}) as Partial<Address>;

        const baseName = String(account?.username ?? user?.name ?? '');

        if (baseName && baseName !== (user?.name ?? '')) {
          setDisplayName(baseName);
          updateProfile(baseName);
        }

        const parts = splitName(baseName);
        const fallback = defaultAddress(parts.firstName, parts.lastName);
        const mergedBilling = normalizeAddress({ ...localBilling, ...backendBilling }, fallback);
        const mergedShipping = normalizeAddress({ ...localShipping, ...backendShipping }, fallback);

        setBillingAddress(mergedBilling);
        setShippingAddress(mergedShipping);

        try {
          localStorage.setItem(billingKey, JSON.stringify(mergedBilling));
          localStorage.setItem(shippingKey, JSON.stringify(mergedShipping));
        } catch {
          // ignore
        }
      } catch (err) {
        console.warn('Failed to load account from API, using local addresses', err);
        const parts = splitName(user?.name ?? '');
        const fallback = defaultAddress(parts.firstName, parts.lastName);
        setBillingAddress(normalizeAddress(localBilling, fallback));
        setShippingAddress(normalizeAddress(localShipping, fallback));
      }
    };

    loadAddresses();
  }, [billingKey, shippingKey, isAuthenticated, updateProfile, user?.name]);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setOrdersError(null);

        if (user?.id) {
          const res = await userService.getOrders();
          setOrders(res.orders || []);
          return;
        }
        const key = `nexusOrders:${user?.id ?? 'guest'}`;
        const raw = localStorage.getItem(key);
        const existing = raw ? JSON.parse(raw) : [];
        setOrders(existing);
      } catch (err: unknown) {
        console.error('Failed to fetch orders', err);
        setOrders([]);
        setOrdersError('Failed to load orders. Please try again.');
      }
    };
    fetchOrders();
  }, [user?.id]);

  const handleUpdateProfile = async () => {
    const previousName = user?.name ?? displayName;

    try {
      const payload = {
        username: displayName,
        billingAddress,
        shippingAddress,
      };

      const res = await userService.updateAccount(payload);
      const account = res?.account;

      const nextName = String(account?.username ?? displayName);
      updateProfile(nextName);
      setDisplayName(nextName);

      const nextBilling = normalizeAddress(account?.billingAddress, billingAddress);
      const nextShipping = normalizeAddress(account?.shippingAddress, shippingAddress);
      setBillingAddress(nextBilling);
      setShippingAddress(nextShipping);

      try {
        localStorage.setItem(billingKey, JSON.stringify(nextBilling));
        localStorage.setItem(shippingKey, JSON.stringify(nextShipping));
      } catch {
        // ignore
      }

      setToast({ visible: true, type: 'success', message: 'Account details saved.' });
      globalThis.setTimeout(() => setToast(prev => ({ ...prev, visible: false })), 2500);
    } catch (err: any) {
      console.error('Failed to update account', err.message);

      const message = String(err?.message || 'Failed to update account. Please try again.');
      const isDuplicateUsername = message.toLowerCase().includes('username already in use');
      if (isDuplicateUsername) {
        setDisplayName(previousName);
      }

      setToast({ visible: true, type: 'error', message });
      globalThis.setTimeout(() => setToast(prev => ({ ...prev, visible: false })), 3500);
    }
  };

  if (!isAuthenticated) {
    return (
      <section className="py-16 min-h-[80vh]">
        <div className="container mx-auto px-6">
          <AccessDenied
            title="Please log in"
            description="You need to be logged in to view your account."
            backText="Go to Login"
            onBack={() => navigateTo('/login')}
            className="min-h-[60vh]"
          />
        </div>
      </section>
    );
  }

  return (
    <section className="py-0 min-h-[80vh]">
      <Toast message={toast.message} type={toast.type} visible={toast.visible} />
      <div className="container mx-auto px-0 sm:px-6">
        <div className="min-h-[80vh] flex">
          <CustomerSidebar />
          <main className="flex-1 p-6 sm:p-8">
            <Routes>
              <Route
                index
                element={
                  <DashboardHome
                    userName={user?.name}
                    cartCount={cartItems.length}
                    wishlistCount={wishlistItems.length}
                    orders={orders}
                    ordersError={ordersError}
                    navigateTo={navigateTo}
                  />
                }
              />
              <Route
                path="account"
                element={
                  <AccountView
                    userEmail={user?.email ?? ''}
                    displayName={displayName}
                    onChangeDisplayName={setDisplayName}
                    billingAddress={billingAddress}
                    onChangeBillingAddress={setBillingAddress}
                    shippingAddress={shippingAddress}
                    onChangeShippingAddress={setShippingAddress}
                    onSave={handleUpdateProfile}
                    onContinueShopping={() => navigateTo('/products')}
                  />
                }
              />
              <Route path="orders" element={<OrdersView orders={orders} ordersError={ordersError} />} />
              <Route path="*" element={<Navigate to="." replace />} />
            </Routes>
          </main>
        </div>
      </div>
    </section>
  );
};

export default CustomerDashboard;
