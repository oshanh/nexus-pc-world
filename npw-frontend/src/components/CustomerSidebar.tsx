import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import GamingButton from './GamingButton';
import Icon from './Icon';

const NavItem: React.FC<{
  to: string;
  label: string;
  icon: import('./Icon').IconName;
  active: boolean;
}> = ({ to, label, icon, active }) => {
  const navigate = useNavigate();

  return (
    <GamingButton
      onClick={() => navigate(to)}
      variant={active ? 'primary' : 'secondary'}
      size="sm"
      className="w-full text-left flex items-center gap-3 px-2"
      aria-label={label}
      aria-current={active ? 'page' : undefined}
    >
      <span className="w-6 h-6 flex items-center justify-center">
        <Icon name={icon} className="w-4 h-4" aria-hidden />
      </span>
      <span className="truncate">{label}</span>
    </GamingButton>
  );
};

const CustomerSidebar: React.FC = () => {
  const location = useLocation();

  const isDashboard = location.pathname === '/account' || location.pathname === '/account/';
  const isAccount = location.pathname.startsWith('/account/account');
  const isOrders = location.pathname.startsWith('/account/orders');

  return (
    <aside className="w-56 bg-nexus-dark/90 border-r border-nexus-gray/20 p-4">
      <div className="text-white font-exo font-bold text-lg mb-6 flex items-center gap-2">
        <Icon name="dashboard" className="h-5 w-5" aria-hidden />
        My Account
      </div>

      <nav className="space-y-2">
        <NavItem to="/account" label="Dashboard" icon="dashboard" active={isDashboard} />
        <NavItem to="/account/account" label="Account" icon="users" active={isAccount} />
        <NavItem to="/account/orders" label="Orders" icon="orders" active={isOrders} />
      </nav>
    </aside>
  );
};

export default CustomerSidebar;
