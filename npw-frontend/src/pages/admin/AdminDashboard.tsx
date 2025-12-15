import React from 'react';
import GamingButton from '../../components/GamingButton';
import { useAuth } from '../../contexts/AuthContext';
import AccessDenied from '../../components/AccessDenied';

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
    <section className="py-16 min-h-screen">
      <div className="container mx-auto px-6">
        <h1 className="text-3xl font-exo font-bold text-white mb-6">Admin Dashboard</h1>
        <p className="text-gray-400 mb-8">Quick links to administrative tools and overviews.</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-nexus-dark rounded-lg p-6 border border-nexus-purple/20 shadow-sm">
            <h2 className="text-xl font-bold text-white mb-3">Products</h2>
            <p className="text-gray-400 mb-4">Manage product catalog: create, edit, and delete product listings.</p>
            <GamingButton onClick={() => navigateTo('/admin/products')} variant="primary">Open Product CRUD</GamingButton>
          </div>

          <div className="bg-nexus-dark rounded-lg p-6 border border-nexus-purple/20 shadow-sm">
            <h2 className="text-xl font-bold text-white mb-3">Users</h2>
            <p className="text-gray-400 mb-4">View, create, or disable user accounts.</p>
            <GamingButton onClick={() => navigateTo('/admin/users')} variant="secondary">Open Users CRUD</GamingButton>
          </div>

          <div className="bg-nexus-dark rounded-lg p-6 border border-nexus-purple/20 shadow-sm">
            <h2 className="text-xl font-bold text-white mb-3">Orders</h2>
            <p className="text-gray-400 mb-4">Review and manage orders and fulfillments.</p>
            <GamingButton onClick={() => navigateTo('/admin/orders')} variant="secondary">Open Orders CRUD</GamingButton>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AdminDashboard;
