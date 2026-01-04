
import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import ProductModal from './components/ProductModal';
import { CartProvider } from './contexts/CartContext';
import { WishlistProvider } from './contexts/WishlistContext';
import { AuthProvider } from './contexts/AuthContext';
import { ProductProvider } from './contexts/ProductContext';
import type { Product } from './types';
import HomePage from './pages/HomePage';
import ProductsPage from './pages/ProductsPage';
import CustomBuildPage from './pages/CustomBuildPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import PaymentPage from './pages/PaymentPage';
import WishlistPage from './pages/WishlistPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import AdminProducts from './pages/admin/AdminProducts';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminOrders from './pages/admin/AdminOrders';
import AdminPaymentSettingsPage from './pages/admin/AdminPaymentSettings';
import AdminWebsiteSettingsPage from './pages/admin/AdminWebsiteSettings';
import CustomerDashboard from './pages/customer/CustomerDashboard';
import GamingButton from './components/GamingButton';

const NotFound: React.FC = () => (
  <section className="py-20 min-h-screen flex items-center justify-center">
    <div className="text-center">
      <h1 className="text-4xl font-exo font-bold text-white mb-4">Page not found</h1>
      <p className="text-gray-400">The link you followed doesn’t exist.</p>
    </div>
  </section>
);

const App: React.FC = () => {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isScrollButtonVisible, setIsScrollButtonVisible] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const toggleVisibility = () => {
      setIsScrollButtonVisible(window.scrollY > 300);
    };

    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  useEffect(() => {
    // Scroll to top on route change
    window.scrollTo(0, 0);
  }, [location.pathname]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateTo = (path: string) => {
    const cleaned = path.startsWith('#') ? path.slice(1) : path;
    navigate(cleaned);
  };

  const handleViewDetails = (product: Product) => setSelectedProduct(product);
  const handleCloseModal = () => setSelectedProduct(null);

  return (
    <AuthProvider>
      <ProductProvider>
        <WishlistProvider>
          <CartProvider>
            <div className="min-h-screen flex flex-col">
              <Header currentRoute={location.pathname} navigateTo={navigateTo} />
              <main className="grow">
                <Routes>
                  <Route path="/" element={<HomePage onViewDetails={handleViewDetails} navigateTo={navigateTo} />} />
                  <Route path="/products" element={<ProductsPage onViewDetails={handleViewDetails} />} />
                  <Route path="/custom-build" element={<CustomBuildPage />} />
                  <Route path="/about" element={<AboutPage />} />
                  <Route path="/contact" element={<ContactPage />} />
                  <Route path="/wishlist" element={<WishlistPage onViewDetails={handleViewDetails} navigateTo={navigateTo} />} />
                  <Route path="/cart" element={<CartPage navigateTo={navigateTo} />} />
                  <Route path="/checkout" element={<CheckoutPage navigateTo={navigateTo} />} />
                  <Route path="/payment" element={<PaymentPage navigateTo={navigateTo} />} />
                  <Route path="/login" element={<LoginPage navigateTo={navigateTo} />} />
                  <Route path="/signup" element={<SignupPage navigateTo={navigateTo} />} />
                  <Route path="/admin" element={<AdminDashboard navigateTo={navigateTo} />} />
                  <Route path="/admin/products" element={<AdminProducts navigateTo={navigateTo} />} />
                  <Route path="/admin/users" element={<AdminUsers />} />
                  <Route path="/admin/orders" element={<AdminOrders />} />
                  <Route path="/admin/payment-settings" element={<AdminPaymentSettingsPage navigateTo={navigateTo} />} />
                  <Route path="/admin/website-settings" element={<AdminWebsiteSettingsPage navigateTo={navigateTo} />} />
                  <Route path="/account/*" element={<CustomerDashboard navigateTo={navigateTo} />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </main>
              <Footer navigateTo={navigateTo} />
              {selectedProduct && (
                <ProductModal product={selectedProduct} onClose={handleCloseModal} />
              )}

              <div className={`fixed bottom-8 right-8 z-50 transition-opacity duration-300 ${isScrollButtonVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                <GamingButton
                  onClick={scrollToTop}
                  variant="primary"
                  size="md"
                  iconOnly={true}
                  shape="circular"
                  aria-label="Scroll to top"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
                  </svg>
                </GamingButton>
              </div>

            </div>
          </CartProvider>
        </WishlistProvider>
      </ProductProvider>
    </AuthProvider>
  );
};

export default App;
