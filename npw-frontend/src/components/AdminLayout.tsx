import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import GamingButton from './GamingButton';

const NavItem: React.FC<{ to: string; label: string; collapsed: boolean; active?: boolean }> = ({ to, label, collapsed, active }) => {
  const navigate = useNavigate();

  return (
    <div>
      <GamingButton
        onClick={() => navigate(to)}
        variant={active ? 'primary' : 'secondary'}
        size="sm"
        className={`w-full text-left flex items-center gap-3 px-2 ${collapsed ? 'justify-center' : ''}`}
        aria-current={active ? 'page' : undefined}
      >
        <span className={`w-6 h-6 flex items-center justify-center text-sm ${collapsed ? '' : ''}`}>
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><circle cx="10" cy="10" r="3" /></svg>
        </span>
        {!collapsed && <span className="truncate">{label}</span>}
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
        className={`flex-shrink-0 bg-nexus-dark/90 border-r border-nexus-gray/20 p-3 transition-all duration-200 transform ${isAnimating ? 'scale-95' : 'scale-100'} ${collapsed ? 'w-20' : 'w-64'}`}
        aria-hidden={false}
      >
        <div className={`flex items-center ${collapsed ? 'justify-center' : 'justify-between'} mb-6`}>
          <div className={`text-white font-exo font-bold text-lg ${collapsed ? 'hidden' : 'block'}`}>
            Command Center
          </div>
          <button
            aria-label={collapsed ? 'Open sidebar' : 'Collapse sidebar'}
            aria-expanded={!collapsed}
            onClick={toggleCollapsed}
            className="p-1 rounded-md text-gray-300 hover:bg-nexus-gray/20 transform transition-transform duration-150 active:scale-95"
          >
            {collapsed ? (
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 12h16"/></svg>
            ) : (
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6h12v12"/></svg>
            )}
          </button>
        </div>

        <nav className="space-y-2">
          <NavItem to="/admin" label="Dashboard" collapsed={collapsed} active={location.pathname === '/admin'} />
          <NavItem to="/admin/products" label="Products" collapsed={collapsed} active={location.pathname.startsWith('/admin/products')} />
          <NavItem to="/admin/users" label="Users" collapsed={collapsed} active={location.pathname.startsWith('/admin/users')} />
          <NavItem to="/admin/orders" label="Orders" collapsed={collapsed} active={location.pathname.startsWith('/admin/orders')} />
        </nav>

        {/* <div className={`mt-auto pt-6 ${collapsed ? 'text-center' : ''}`}>
          <small className={`text-gray-500 text-xs ${collapsed ? 'hidden' : 'block'}`}>Admin tools powered by Nexus</small>
        </div> */}
      </aside>

      <main className="flex-1 p-8">
        {title && <h1 className="text-2xl font-exo font-bold text-white mb-6">{title}</h1>}
        <div>{children}</div>
      </main>
    </div>
  );
};

export default AdminLayout;
