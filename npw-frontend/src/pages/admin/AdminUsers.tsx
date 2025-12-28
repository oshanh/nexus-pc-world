import React from 'react';
import GamingButton from '../../components/GamingButton';
import { useAuth } from '../../contexts/AuthContext';
import AccessDenied from '../../components/AccessDenied';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../../components/AdminLayout';

const AdminUsers: React.FC = () => {
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
    <AdminLayout title="Users Management">
      <section className="py-0">
          <div className="container mx-auto px-6">
            <p className="text-gray-400 mb-6">This page will host user management and search tools.</p>
          <div className="space-x-4">
            <GamingButton variant="primary">Create User</GamingButton>
            <GamingButton variant="secondary">Search Users</GamingButton>
          </div>
        </div>
      </section>
    </AdminLayout>
  );
};

export default AdminUsers;
