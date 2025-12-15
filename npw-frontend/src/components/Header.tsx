
import React, { useState } from 'react';
import { NAV_LINKS } from '../constants';
import { useCart } from '../contexts/CartContext';
import { useWishlist } from '../contexts/WishlistContext';
import { useAuth } from '../contexts/AuthContext';
import GamingButton from './GamingButton';

interface HeaderProps {
  currentRoute: string;
  navigateTo: (path: string) => void;
}

const CartIconWithBadge: React.FC = () => {
    const { cartCount } = useCart();
    return (
        <div className="relative">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-nexus-purple text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
                    {cartCount}
                </span>
            )}
        </div>
    )
}

const WishlistIconWithBadge: React.FC = () => {
    const { wishlistCount } = useWishlist();
    return (
        <div className="relative">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            {wishlistCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-nexus-purple text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
                    {wishlistCount}
                </span>
            )}
        </div>
    )
}

const Header: React.FC<HeaderProps> = ({ currentRoute, navigateTo }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, isAuthenticated, logout, isAdmin, adminMode } = useAuth();
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const handleNavClick = (e: React.MouseEvent, href: string) => {
    e.preventDefault();
    navigateTo(href);
    setIsOpen(false);
  };

  const handleLogout = () => {
    logout();
    navigateTo('/');
    setIsProfileOpen(false);
    setIsOpen(false);
  }

  return (
    <header className="bg-nexus-gray/80 backdrop-blur-sm sticky top-0 z-50 shadow-lg shadow-nexus-blue/10 flex flex-col">
      <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
        <a href="/" onClick={(e) => handleNavClick(e, '/')} className="text-2xl md:text-3xl font-exo font-bold text-white tracking-widest">
          NEXUS PC World
        </a>
        <div className="hidden md:flex items-center flex-grow justify-end gap-6">
            <div className="flex items-center space-x-8">
                {NAV_LINKS.filter(link => !link.icon).map((link) => (
                    <a
                      key={link.name}
                      href={link.href}
                      onClick={(e) => handleNavClick(e, link.href)}
                      className={`transition-colors duration-300 font-semibold ${
                        currentRoute === link.href ? 'text-nexus-blue' : 'text-nexus-light hover:text-nexus-blue'
                      }`}
                    >
                      {link.name}
                    </a>
                ))}
            </div>
            <div className="flex items-center space-x-6">
                 {NAV_LINKS.filter(link => link.icon && !isAdmin).map((link) => (
                    <a
                      key={link.name}
                      href={link.href}
                      onClick={(e) => handleNavClick(e, link.href)}
                      className={`transition-colors duration-300 font-semibold flex items-center gap-2 ${
                        currentRoute === link.href ? 'text-nexus-blue' : 'text-nexus-light hover:text-nexus-blue'
                      }`}
                    >
                      {link.icon === 'cart' ? <CartIconWithBadge /> : <WishlistIconWithBadge />}
                    </a>
                  ))}
                  
                  {isAuthenticated && user ? (
                      <div className="relative">
                          <button 
                            onClick={() => setIsProfileOpen(!isProfileOpen)}
                            className="flex items-center gap-2 text-nexus-blue font-bold hover:text-white transition-colors"
                          >
                              <div className="w-8 h-8 rounded-full bg-nexus-blue/20 flex items-center justify-center border border-nexus-blue">
                                  {user.name.charAt(0).toUpperCase()}
                              </div>
                              <span className="hidden lg:inline">{user.name}</span>
                          </button>
                          {isProfileOpen && (
                              <div className="absolute right-0 mt-2 w-48 bg-nexus-gray border border-nexus-purple/30 rounded-md shadow-xl py-2">
                                  <div className="px-4 py-2 text-sm text-gray-400 border-b border-nexus-dark mb-2">
                                      {user.email}
                                  </div>
                                  <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-red-400 hover:bg-nexus-dark hover:text-red-300 transition-colors">
                                      Logout
                                  </button>
                              </div>
                          )}
                      </div>
                  ) : (
                      <GamingButton 
                        onClick={() => navigateTo('/login')} 
                        size="sm" 
                        variant="primary"
                        className="ml-2"
                      >
                          Login
                      </GamingButton>
                  )}
            </div>
        </div>
        <div className="md:hidden flex items-center gap-4">
            {!isAdmin && (
              <>
                <a href="/wishlist" onClick={(e) => handleNavClick(e, '/wishlist')} className={`text-white ${currentRoute === '/wishlist' ? 'text-nexus-blue' : 'text-nexus-light'}`} aria-label="View wishlist">
                  <WishlistIconWithBadge/>
                </a>
                <a href="/cart" onClick={(e) => handleNavClick(e, '/cart')} className={`text-white ${currentRoute === '/cart' ? 'text-nexus-blue' : 'text-nexus-light'}`} aria-label="View shopping cart">
                  <CartIconWithBadge/>
                </a>
              </>
            )}
            <GamingButton onClick={() => setIsOpen(!isOpen)} iconOnly={true} size="sm" variant="secondary" aria-label="Open menu">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={isOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16m-7 6h7"}></path>
                </svg>
            </GamingButton>
        </div>
      </nav>
      {isOpen && (
        <div className="md:hidden bg-nexus-gray pb-4">
          {NAV_LINKS.map((link) => {
            if (link.icon) return null; // Don't show icon links in dropdown
            return (
              <a
                key={link.name}
                href={link.href}
                onClick={(e) => handleNavClick(e, link.href)}
                className={`block text-center py-2 px-4 transition-colors duration-300 ${
                  currentRoute === link.href ? 'bg-nexus-blue text-nexus-dark' : 'text-nexus-light hover:bg-nexus-blue hover:text-nexus-dark'
                }`}
              >
                {link.name}
              </a>
            )
          })}
          <div className="border-t border-nexus-dark mt-2 pt-2">
              {isAuthenticated && user ? (
                  <>
                    <div className="text-center py-2 text-nexus-blue font-bold">Hello, {user.name}</div>
                    <button 
                        onClick={handleLogout}
                        className="block w-full text-center py-2 px-4 text-red-400 hover:bg-nexus-dark"
                    >
                        Logout
                    </button>
                  </>
              ) : (
                  <div className="p-4 flex justify-center">
                    <GamingButton onClick={() => { navigateTo('/login'); setIsOpen(false); }} size="sm" variant="primary" className="w-full">
                        Login
                    </GamingButton>
                  </div>
              )}
          </div>
        </div>
      )}
      
      {isAdmin && adminMode && (
          <div className="w-full bg-green-600/30 backdrop-blur-md py-2 transition-all duration-300 shadow-[0_0_20px_rgba(22,163,74,0.2)] flex justify-center items-center gap-4 relative z-40 border-b border-green-500/20">
              <div className="flex items-center gap-2 text-white font-exo font-bold text-xs uppercase tracking-widest animate-pulse">
                 <span className="w-2 h-2 bg-white rounded-full"></span>
                 System Admin Active
              </div>
              <button 
                  onClick={() => navigateTo('/admin')}
                  className="bg-white text-green-700 hover:bg-gray-100 hover:scale-105 transition-all duration-200 px-3 py-1 rounded-sm font-bold text-xs uppercase tracking-wider shadow-sm"
              >
                  Access Command Center
              </button>
          </div>
      )}
    </header>
  );
};

export default Header;
