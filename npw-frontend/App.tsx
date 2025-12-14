
import React, { useState, useEffect } from 'react';
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
import WishlistPage from './pages/WishlistPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import AdminPage from './pages/AdminPage';
import GamingButton from './components/GamingButton';

const App: React.FC = () => {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [route, setRoute] = useState('#/');
  const [isScrollButtonVisible, setIsScrollButtonVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 300) {
        setIsScrollButtonVisible(true);
      } else {
        setIsScrollButtonVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);

    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  const navigateTo = (path: string) => {
    setRoute(path);
    window.scrollTo(0, 0); // Scroll to top on page change
  };

  const handleViewDetails = (product: Product) => {
    setSelectedProduct(product);
  };

  const handleCloseModal = () => {
    setSelectedProduct(null);
  };

  const renderPage = () => {
    switch (route) {
      case '#/products':
        return <ProductsPage onViewDetails={handleViewDetails} />;
      case '#/custom-build':
        return <CustomBuildPage />;
      case '#/about':
        return <AboutPage />;
      case '#/contact':
        return <ContactPage />;
      case '#/wishlist':
        return <WishlistPage onViewDetails={handleViewDetails} navigateTo={navigateTo} />;
      case '#/cart':
        return <CartPage navigateTo={navigateTo} />;
      case '#/login':
        return <LoginPage navigateTo={navigateTo} />;
      case '#/signup':
        return <SignupPage navigateTo={navigateTo} />;
      case '#/admin':
        return <AdminPage navigateTo={navigateTo} />;
      case '#/':
      default:
        return <HomePage onViewDetails={handleViewDetails} navigateTo={navigateTo} />;
    }
  };

  return (
    <AuthProvider>
      <ProductProvider>
        <WishlistProvider>
          <CartProvider>
            <div className="min-h-screen flex flex-col">
              <Header currentRoute={route} navigateTo={navigateTo} />
              <main className="flex-grow">
                {renderPage()}
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
