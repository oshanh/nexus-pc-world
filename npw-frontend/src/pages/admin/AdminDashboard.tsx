import React from 'react';
import GamingButton from '../../components/GamingButton';
import Icon from '../../components/Icon';
import { useAuth } from '../../contexts/AuthContext';
import AccessDenied from '../../components/AccessDenied';
import AdminLayout from '../../components/AdminLayout';

const AdminDashboard: React.FC<{ navigateTo: (path: string) => void }> = ({ navigateTo }) => {
  const { isAdmin } = useAuth();

  if (!isAdmin) {
    return (
      <AccessDenied
        title="Access Denied"
        description="You do not have permission to view the admin dashboard."
        backText="Return to Home"
        onBack={() => navigateTo('/')} 
      />
    );
  }

  return (
    <AdminLayout title="Admin Dashboard">
      <section className="py-0">
        <div className="container mx-auto px-6">
          <p className="text-gray-400 mb-8">Quick links to administrative tools and overviews.</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-nexus-dark rounded-lg p-6 border border-nexus-purple/20 shadow-sm">
              <h2 className="text-xl font-bold text-white mb-3">Products</h2>
              <p className="text-gray-400 mb-4">Manage product catalog: create, edit, and delete product listings.</p>
              <GamingButton onClick={() => navigateTo('/admin/products')} variant="primary">
                  <Icon name="products" className="h-4 w-4 mr-2" aria-hidden />
                Manage Products
              </GamingButton>
            </div>

            <div className="bg-nexus-dark rounded-lg p-6 border border-nexus-purple/20 shadow-sm">
              <h2 className="text-xl font-bold text-white mb-3">Users</h2>
              <p className="text-gray-400 mb-4">View, create, or disable user accounts.<pre><br></br></pre></p>
              <GamingButton onClick={() => navigateTo('/admin/users')} variant="primary">
                  <Icon name="users" className="h-4 w-4 mr-2" aria-hidden />
                Manage Users
              </GamingButton>
            </div>

            <div className="bg-nexus-dark rounded-lg p-6 border border-nexus-purple/20 shadow-sm">
              <h2 className="text-xl font-bold text-white mb-3">Orders</h2>
              <p className="text-gray-400 mb-4">Review and manage orders and fulfillments.</p>
              <GamingButton onClick={() => navigateTo('/admin/orders')} variant="primary">
                  <Icon name="orders" className="h-4 w-4 mr-2" aria-hidden />
                Manage Orders
              </GamingButton>
            </div>
          </div>
        </div>
      </section>
    </AdminLayout>
  );
};

export default AdminDashboard;
