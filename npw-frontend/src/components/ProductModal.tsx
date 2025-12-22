import React, { useEffect, useState } from 'react';
import type { Product } from '../types';
import { useCart } from '../contexts/CartContext';
import { useWishlist } from '../contexts/WishlistContext';
import { useAuth } from '../contexts/AuthContext';
import GamingButton from './GamingButton';

interface ProductModalProps {
  product: Product;
  onClose: () => void;
}

const ProductModal: React.FC<ProductModalProps> = ({ product, onClose }) => {
  const [addedToCart, setAddedToCart] = useState(false);
  const [activeImage, setActiveImage] = useState(product.imageUrls[0]);
  const { addToCart } = useCart();
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const { isAdmin } = useAuth();

  const isWishlisted = isInWishlist(product.id);

  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEsc);
    document.body.style.overflow = 'hidden';

    // Reset active image when product changes
    setActiveImage(product.imageUrls[0]);

    return () => {
      window.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'auto';
    };
  }, [product, onClose]);

  const handleAddToCart = () => {
    addToCart(product);
    setAddedToCart(true);
    setTimeout(() => {
        setAddedToCart(false);
    }, 2000);
  };

  const handleWishlistToggle = () => {
    if (isWishlisted) {
        removeFromWishlist(product.id);
    } else {
        addToWishlist(product);
    }
  };

  return (
    <div 
        className="fixed inset-0 bg-nexus-dark/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        onClick={onClose}
        aria-modal="true"
        role="dialog"
    >
      <div 
        className="bg-nexus-gray w-full max-w-4xl max-h-[90vh] rounded-lg shadow-2xl shadow-nexus-purple/20 border border-nexus-purple/30 overflow-hidden flex flex-col animate-glow"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-4 border-b border-nexus-purple/20 flex-shrink-0">
            <div>
              <h2 className="text-2xl font-exo font-bold text-white">{product.name}</h2>
              <p className="text-nexus-blue text-sm font-bold uppercase">{product.subCategory || product.category}</p>
            </div>
            <GamingButton onClick={onClose} iconOnly={true} size="sm" variant="secondary" aria-label="Close modal">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </GamingButton>
        </div>
        
        <div className="p-6 flex-grow overflow-y-auto">
            <div className="flex flex-col md:flex-row gap-8">
                <div className="md:w-1/2">
                    <img src={activeImage} alt={product.name} className="w-full h-auto max-h-80 object-contain rounded-lg mb-4 border border-nexus-dark" />
                     <div className="grid grid-cols-4 gap-2">
                        {product.imageUrls.map((img, index) => (
                            <img
                                key={index}
                                src={img}
                                alt={`${product.name} thumbnail ${index + 1}`}
                                onClick={() => setActiveImage(img)}
                                className={`w-full h-20 object-cover rounded-md cursor-pointer border-2 transition-all ${
                                    activeImage === img ? 'border-nexus-blue' : 'border-transparent hover:border-nexus-blue/50'
                                }`}
                            />
                        ))}
                    </div>
                </div>
                <div className="md:w-1/2">
                    <p className="text-nexus-light mb-4">{product.description}</p>
                    <h3 className="font-exo text-lg font-bold text-nexus-blue mb-2">Key Specifications:</h3>
                    <ul className="space-y-2 text-sm">
                        {product.specs.map(spec => (
                            <li key={spec.name} className="flex justify-between border-b border-nexus-dark pb-1">
                                <span className="font-semibold text-gray-300">{spec.name}</span>
                                <span className="text-gray-400 text-right">{spec.value}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>

        <div className="p-4 bg-nexus-dark/50 border-t border-nexus-purple/20 flex justify-between items-center flex-shrink-0">
            <span className="text-3xl font-bold text-nexus-blue">Rs {Number(product.price).toLocaleString()}</span>
            <div className="flex items-center gap-2">
              {!isAdmin ? (
                <>
                <GamingButton
                  onClick={handleWishlistToggle}
                  variant="secondary"
                  iconOnly={true}
                  size="md"
                  aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
                >
                  {isWishlisted ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                       <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                    </svg>
                  ) : (
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  )}
                </GamingButton>
                <GamingButton 
                  onClick={handleAddToCart}
                  variant="primary"
                  disabled={addedToCart}
                  className={addedToCart ? '!bg-green-500 !text-white !border-green-500' : ''}
                >
                  {addedToCart ? 'Added!' : 'Add to Cart'}
                </GamingButton>
                </>
              ) : (
                <div className="text-sm text-gray-400 italic">Admin view — actions disabled</div>
              )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default ProductModal;