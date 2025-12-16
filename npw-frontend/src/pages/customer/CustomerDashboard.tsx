import React, { useEffect, useState } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import { useWishlist } from '../../contexts/WishlistContext';
import { userService } from '../../services/userService';
import GamingButton from '../../components/GamingButton';

interface Order {
  id: string;
  items: any[];
  total: number;
  createdAt: string;
}

const CustomerDashboard: React.FC<{ navigateTo: (path: string) => void }> = ({ navigateTo }) => {
  const { user, isAuthenticated, updateProfile } = useAuth();
  const { cartItems } = useCart();
  const { wishlistItems } = useWishlist();
  const [activeTab, setActiveTab] = useState<'orders' | 'account'>('orders');
  const [orders, setOrders] = useState<Order[]>([]);
  const [displayName, setDisplayName] = useState(user?.name || '');

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        if (user?.id) {
          const res = await userService.getOrders();
          setOrders(res.orders || []);
          return;
        }
        const key = `nexusOrders:${user?.id ?? 'guest'}`;
        const raw = localStorage.getItem(key);
        const existing = raw ? JSON.parse(raw) : [];
        setOrders(existing);
      } catch (err) {
        setOrders([]);
      }
    };
    fetchOrders();
  }, [user?.id]);

  const handleUpdateProfile = () => {
    updateProfile(displayName);
    alert('Profile updated locally.');
  };

  return (
    <AdminLayout title="My Account">
      <section className="py-0">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex gap-3 bg-nexus-dark/80 p-1.5 rounded-full border border-nexus-blue/30">
              <button onClick={() => setActiveTab('orders')} className={`px-4 py-2 rounded-full ${activeTab === 'orders' ? 'bg-nexus-blue text-white' : 'text-gray-400'}`}>Orders</button>
              <button onClick={() => setActiveTab('account')} className={`px-4 py-2 rounded-full ${activeTab === 'account' ? 'bg-nexus-blue text-white' : 'text-gray-400'}`}>Account Settings</button>
            </div>
            <div className="text-sm text-gray-400">Cart: {cartItems.length} | Wishlist: {wishlistItems.length}</div>
          </div>

          {activeTab === 'orders' ? (
            <div className="space-y-4">
              {orders.length === 0 ? (
                <div className="p-8 bg-nexus-dark rounded-md text-center text-gray-400">No orders found.</div>
              ) : (
                orders.map(order => (
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
                            <div className="font-mono">Rs {(parseFloat(it.price.replace(/[^0-9.]/g, '')) * it.quantity).toLocaleString()}</div>
                          </div>
                        ))}
                      </div>
                      <div className="mt-4 flex justify-end font-bold text-white">Total: Rs {order.total.toLocaleString()}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : (
            <div className="max-w-2xl">
              <div className="bg-nexus-dark p-6 rounded border border-nexus-gray">
                <h3 className="text-xl font-bold text-white mb-4">Profile</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Display Name</label>
                    <input value={displayName} onChange={(e) => setDisplayName(e.target.value)} className="w-full bg-nexus-gray border border-nexus-purple/30 rounded py-2 px-3 text-white" />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Email</label>
                    <input value={user?.email ?? ''} readOnly className="w-full bg-nexus-gray border border-nexus-purple/30 rounded py-2 px-3 text-gray-400" />
                  </div>
                  <div className="flex gap-4">
                    <GamingButton onClick={handleUpdateProfile} variant="primary">Save</GamingButton>
                    <GamingButton onClick={() => navigateTo('/products')} variant="secondary">Continue Shopping</GamingButton>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </AdminLayout>
  );
};

export default CustomerDashboard;
