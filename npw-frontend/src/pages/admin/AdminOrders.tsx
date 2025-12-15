import React from 'react';
import GamingButton from '../../components/GamingButton';
import { useAuth } from '../../contexts/AuthContext';
import AccessDenied from '../../components/AccessDenied';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../../components/AdminLayout';

const AdminOrders: React.FC = () => {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  if (!isAdmin) {
    return (
      <AccessDenied
        title="Access Denied"
        description="You do not have permission to view this page."
        backText="Return to Home"
        onBack={() => navigate('/')}
      />
    );
  }

  return (
    <AdminLayout title="Orders Management">
      <section className="py-0">
        <div className="container mx-auto px-6">
          <p className="text-gray-400 mb-6">This page will host order lists, filters and status updates.</p>
          <div className="space-x-4">
            <GamingButton variant="primary">Export Orders</GamingButton>
            <GamingButton variant="secondary">View Pending</GamingButton>
          </div>
        </div>
      </section>
    </AdminLayout>
  );
};

export default AdminOrders;
