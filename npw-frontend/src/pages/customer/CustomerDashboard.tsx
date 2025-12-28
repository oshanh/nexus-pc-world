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

interface DeliveryInfo {
  fullName: string;
  phone: string;
  address: string;
  note: string;
}

const parsePrice = (price: string | number): number => {
  if (typeof price === 'number') return price;
  return Number.parseFloat(String(price).replaceAll(/[^0-9.]/g, '')) || 0;
};

const defaultDeliveryInfo = (fullName: string): DeliveryInfo => ({
  fullName,
  phone: '',
  address: '',
  note: '',
});

const safeParseJson = <T,>(raw: string | null): T | null => {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
};

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
  deliveryInfo: DeliveryInfo;
  onChangeDeliveryInfo: (next: DeliveryInfo) => void;
  onSave: () => void;
  onContinueShopping: () => void;
}> = ({
  userEmail,
  displayName,
  onChangeDisplayName,
  deliveryInfo,
  onChangeDeliveryInfo,
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

      <div className="bg-nexus-dark p-6 rounded border border-nexus-gray">
        <h3 className="text-xl font-bold text-white mb-4">Delivery Info</h3>
        <div className="space-y-4">
          <div>
            <label htmlFor="delivery-full-name" className="block text-sm text-gray-400 mb-1">Full Name</label>
            <input
              id="delivery-full-name"
              value={deliveryInfo.fullName}
              onChange={(e) => onChangeDeliveryInfo({ ...deliveryInfo, fullName: e.target.value })}
              className="w-full bg-nexus-gray border border-nexus-purple/30 rounded py-2 px-3 text-white"
            />
          </div>
          <div>
            <label htmlFor="delivery-phone" className="block text-sm text-gray-400 mb-1">Phone Number</label>
            <input
              id="delivery-phone"
              value={deliveryInfo.phone}
              onChange={(e) => onChangeDeliveryInfo({ ...deliveryInfo, phone: e.target.value })}
              className="w-full bg-nexus-gray border border-nexus-purple/30 rounded py-2 px-3 text-white"
            />
          </div>
          <div>
            <label htmlFor="delivery-address" className="block text-sm text-gray-400 mb-1">Address</label>
            <textarea
              id="delivery-address"
              value={deliveryInfo.address}
              onChange={(e) => onChangeDeliveryInfo({ ...deliveryInfo, address: e.target.value })}
              className="w-full bg-nexus-gray border border-nexus-purple/30 rounded py-2 px-3 text-white min-h-24"
            />
          </div>
          <div>
            <label htmlFor="delivery-note" className="block text-sm text-gray-400 mb-1">Note (optional)</label>
            <textarea
              id="delivery-note"
              value={deliveryInfo.note}
              onChange={(e) => onChangeDeliveryInfo({ ...deliveryInfo, note: e.target.value })}
              className="w-full bg-nexus-gray border border-nexus-purple/30 rounded py-2 px-3 text-white min-h-20"
            />
          </div>

          <div className="flex gap-4">
            <GamingButton onClick={onSave} variant="primary">Save</GamingButton>
            <GamingButton onClick={onContinueShopping} variant="secondary">Continue Shopping</GamingButton>
          </div>
        </div>
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

  const deliveryKey = useMemo(() => `nexusDeliveryInfo:${user?.id ?? 'guest'}`, [user?.id]);
  const [deliveryInfo, setDeliveryInfo] = useState<DeliveryInfo>(() => defaultDeliveryInfo(user?.name ?? ''));

  useEffect(() => {
    setDisplayName(user?.name || '');
  }, [user?.name]);

  useEffect(() => {
    if (!isAuthenticated) return;

    const loadDeliveryInfo = async () => {
      const local = safeParseJson<Partial<DeliveryInfo>>(localStorage.getItem(deliveryKey)) || {};

      try {
        const res = await userService.getAccount();
        const account = res?.account;
        const backendDelivery = (account?.deliveryInfo || {}) as Partial<DeliveryInfo>;

        const baseName = String(account?.username ?? user?.name ?? '');

        if (baseName && baseName !== (user?.name ?? '')) {
          setDisplayName(baseName);
          updateProfile(baseName);
        }

        const merged: DeliveryInfo = {
          ...defaultDeliveryInfo(baseName),
          ...local,
          fullName: String(backendDelivery.fullName ?? local.fullName ?? baseName),
          phone: String(backendDelivery.phone ?? local.phone ?? ''),
          address: String(backendDelivery.address ?? local.address ?? ''),
          note: String(backendDelivery.note ?? local.note ?? ''),
        };

        setDeliveryInfo(merged);

        try {
          localStorage.setItem(deliveryKey, JSON.stringify(merged));
        } catch {
          // ignore
        }
      } catch (err) {
        console.warn('Failed to load account from API, using local delivery info', err);
        setDeliveryInfo({
          ...defaultDeliveryInfo(user?.name ?? ''),
          ...local,
          fullName: String(local.fullName ?? user?.name ?? ''),
        });
      }
    };

    loadDeliveryInfo();
  }, [deliveryKey, isAuthenticated, updateProfile, user?.name]);

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
        deliveryInfo: {
          fullName: deliveryInfo.fullName,
          phone: deliveryInfo.phone,
          address: deliveryInfo.address,
          note: deliveryInfo.note,
        },
      };

      const res = await userService.updateAccount(payload);
      const account = res?.account;

      const nextName = String(account?.username ?? displayName);
      updateProfile(nextName);
      setDisplayName(nextName);

      const nextDeliveryInfo: DeliveryInfo = {
        ...deliveryInfo,
        fullName: String(account?.deliveryInfo?.fullName ?? deliveryInfo.fullName),
        phone: String(account?.deliveryInfo?.phone ?? deliveryInfo.phone),
        address: String(account?.deliveryInfo?.address ?? deliveryInfo.address),
        note: String(account?.deliveryInfo?.note ?? deliveryInfo.note),
      };

      setDeliveryInfo(nextDeliveryInfo);

      try {
        localStorage.setItem(deliveryKey, JSON.stringify(nextDeliveryInfo));
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
                    deliveryInfo={deliveryInfo}
                    onChangeDeliveryInfo={setDeliveryInfo}
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
