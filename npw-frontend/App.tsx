
import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import Header from './src/components/Header';
import Footer from './src/components/Footer';
import ProductModal from './src/components/ProductModal';
import { CartProvider } from './src/contexts/CartContext';
import { WishlistProvider } from './src/contexts/WishlistContext';
import { AuthProvider } from './src/contexts/AuthContext';
import { ProductProvider } from './src/contexts/ProductContext';
import type { Product } from './src/types';
import HomePage from './src/pages/HomePage';
import ProductsPage from './src/pages/ProductsPage';
import CustomBuildPage from './src/pages/CustomBuildPage';
import AboutPage from './src/pages/AboutPage';
import ContactPage from './src/pages/ContactPage';
import CartPage from './src/pages/CartPage';
import WishlistPage from './src/pages/WishlistPage';
import LoginPage from './src/pages/LoginPage';
import SignupPage from './src/pages/SignupPage';
import AdminPage from './src/pages/admin/AdminProducts';
import GamingButton from './src/components/GamingButton';

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
              <main className="flex-grow">
                <Routes>
                  <Route path="/" element={<HomePage onViewDetails={handleViewDetails} navigateTo={navigateTo} />} />
                  <Route path="/products" element={<ProductsPage onViewDetails={handleViewDetails} />} />
                  <Route path="/custom-build" element={<CustomBuildPage />} />
                  <Route path="/about" element={<AboutPage />} />
                  <Route path="/contact" element={<ContactPage />} />
                  <Route path="/wishlist" element={<WishlistPage onViewDetails={handleViewDetails} navigateTo={navigateTo} />} />
                  <Route path="/cart" element={<CartPage navigateTo={navigateTo} />} />
                  <Route path="/login" element={<LoginPage navigateTo={navigateTo} />} />
                  <Route path="/signup" element={<SignupPage navigateTo={navigateTo} />} />
                  <Route path="/admin" element={<AdminPage navigateTo={navigateTo} />} />
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
