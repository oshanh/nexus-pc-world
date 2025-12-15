import React from 'react';
import GamingButton from '../../components/GamingButton';
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
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path d="M4 3a1 1 0 00-1 1v3h14V4a1 1 0 00-1-1H4z"/><path fillRule="evenodd" d="M3 8v6a2 2 0 002 2h10a2 2 0 002-2V8H3zm4 2h6v2H7v-2z" clipRule="evenodd"/></svg>
                Manage Products
              </GamingButton>
            </div>

            <div className="bg-nexus-dark rounded-lg p-6 border border-nexus-purple/20 shadow-sm">
              <h2 className="text-xl font-bold text-white mb-3">Users</h2>
              <p className="text-gray-400 mb-4">View, create, or disable user accounts.<pre><br></br></pre></p>
              <GamingButton onClick={() => navigateTo('/admin/users')} variant="primary">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path d="M10 2a4 4 0 100 8 4 4 0 000-8z"/><path d="M2 18a8 8 0 1116 0H2z"/></svg>
                Manage Users
              </GamingButton>
            </div>

            <div className="bg-nexus-dark rounded-lg p-6 border border-nexus-purple/20 shadow-sm">
              <h2 className="text-xl font-bold text-white mb-3">Orders</h2>
              <p className="text-gray-400 mb-4">Review and manage orders and fulfillments.</p>
              <GamingButton onClick={() => navigateTo('/admin/orders')} variant="primary">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path d="M6 2a1 1 0 00-1 1v2h10V3a1 1 0 00-1-1H6z"/><path d="M3 8v6a2 2 0 002 2h10a2 2 0 002-2V8H3zm3 2h8v2H6v-2z"/></svg>
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
