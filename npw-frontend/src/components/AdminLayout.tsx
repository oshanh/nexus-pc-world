import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import GamingButton from './GamingButton';
import Icon from './Icon';

const NavItem: React.FC<{ to: string; label: string; collapsed: boolean; active?: boolean; icon?: import('./Icon').IconName }> = ({ to, label, collapsed, active, icon }) => {
  const navigate = useNavigate();

  return (
    <div>
      <GamingButton
        onClick={() => navigate(to)}
        variant={active ? 'primary' : 'secondary'}
        size="sm"
        className={`w-full text-left flex items-center gap-3 px-2 overflow-hidden ${collapsed ? 'justify-center' : ''}`}
        aria-label={label}
        aria-current={active ? 'page' : undefined}
      >
        <span className={`w-6 h-6 flex items-center justify-center text-sm ${collapsed ? '' : ''}`}>
          <Icon name={icon || 'dot'} className="w-4 h-4" aria-hidden />
        </span>
        <span className={`truncate transition-all duration-200 ease-in-out motion-reduce:transition-none ${collapsed ? 'opacity-0 max-w-0' : 'opacity-100 max-w-[120px]'}`} aria-hidden={collapsed}>
          {label}
        </span>
      </GamingButton>
    </div>
  );
};

const AdminLayout: React.FC<{ title?: string; children: React.ReactNode }> = ({ title, children }) => {
  const STORAGE_KEY = 'admin:sidebarCollapsed';
  const [collapsed, setCollapsed] = useState<boolean>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw === 'true';
    } catch (err) {
      return false;
    }
  });
  const [isAnimating, setIsAnimating] = useState(false);

  // Persist collapsed state whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, collapsed ? 'true' : 'false');
    } catch (err) {
      // ignore
    }
  }, [collapsed]);

  const toggleCollapsed = () => {
    // brief scale animation
    setIsAnimating(true);
    setCollapsed(prev => !prev);
    window.setTimeout(() => setIsAnimating(false), 180);
  };
  const location = useLocation();

  return (
    <div className="min-h-screen flex bg-transparent">
      <aside
        className={`flex-shrink-0 bg-nexus-dark/90 border-r border-nexus-gray/20 p-3 transition-all duration-200 transform ${isAnimating ? 'scale-95' : 'scale-100'} ${collapsed ? 'w-20' : 'w-48'}`}
        aria-hidden={false}
      >
        <div className={`flex items-center ${collapsed ? 'justify-center' : 'justify-between'} mb-6`}>
          <div className={`text-white font-exo font-bold text-lg ${collapsed ? 'hidden' : 'block'}`}>
            <Icon name="dashboard" className="h-5 w-5 inline-block mr-2" aria-hidden />
            Command Center
          </div>
          <button
            aria-label={collapsed ? 'Open sidebar' : 'Collapse sidebar'}
            aria-expanded={!collapsed}
            onClick={toggleCollapsed}
            className="p-1 rounded-md text-gray-300 hover:bg-nexus-gray/20 transform transition-transform duration-150 active:scale-95"
          >
            {collapsed ? <Icon name="expand" className="w-5 h-5" aria-hidden /> : <Icon name="collapse" className="w-5 h-5" aria-hidden />}
          </button>
        </div>

        <nav className="space-y-2">
          <NavItem to="/admin" label="Dashboard" icon="dashboard" collapsed={collapsed} active={location.pathname === '/admin'} />
          <NavItem to="/admin/products" label="Products" icon="products" collapsed={collapsed} active={location.pathname.startsWith('/admin/products')} />
          <NavItem to="/admin/users" label="Users" icon="users" collapsed={collapsed} active={location.pathname.startsWith('/admin/users')} />
          <NavItem to="/admin/orders" label="Orders" icon="orders" collapsed={collapsed} active={location.pathname.startsWith('/admin/orders')} />
        </nav>

      </aside>

      <main className="flex-1 p-8">
        {title && <h1 className="text-2xl font-exo font-bold text-white mb-6">{title}</h1>}
        <div>{children}</div>
      </main>
    </div>
  );
};

export default AdminLayout;
