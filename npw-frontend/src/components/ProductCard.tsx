
import React, { useState } from 'react';
import type { Product } from '../types';
import { useCart } from '../contexts/CartContext';
import { useWishlist } from '../contexts/WishlistContext';
import GamingButton from './GamingButton';

interface ProductCardProps {
  product: Product;
  onViewDetails: (product: Product) => void;
  context?: 'products' | 'wishlist';
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onViewDetails, context = 'products' }) => {
  const { addToCart } = useCart();
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const [addState, setAddState] = useState<'idle' | 'adding' | 'added'>('idle');
  
  const isWishlisted = isInWishlist(product.id);

  const handleAddToCart = (e: React.MouseEvent) => {
      e.stopPropagation();
      if (addState !== 'idle') return;

      setAddState('adding');
      setTimeout(() => {
          addToCart(product);
          setAddState('added');
          setTimeout(() => {
              setAddState('idle');
          }, 1500);
      }, 500);
  };

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isWishlisted) {
        removeFromWishlist(product.id);
    } else {
        addToWishlist(product);
    }
  };

  return (
    <div 
      className="bg-nexus-dark group overflow-hidden flex flex-col border border-nexus-gray/30 transition-all duration-300 hover:border-nexus-blue/50 hover:shadow-2xl hover:shadow-nexus-blue/10 cursor-pointer"
      onClick={() => onViewDetails(product)}
    >
      
      {/* Image container */}
      <div className="relative overflow-hidden">
        <GamingButton
            onClick={handleWishlistToggle}
            iconOnly={true}
            size="sm"
            variant="secondary"
            className="!absolute !top-2 !left-2 z-10 !bg-nexus-dark/50 !shadow-none !hover:scale-110"
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
        <img 
          className="w-full h-56 object-cover transition-all duration-300 ease-in-out group-hover:scale-105 group-hover:shadow-[0_0_15px_#ef4444]" 
          src={product.imageUrls[0]} 
          alt={product.name} 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-nexus-dark via-nexus-dark/60 to-transparent"></div>
        <div className="absolute top-0 right-0 bg-nexus-dark text-white font-exo font-bold py-1 px-4 transform -skew-x-15 m-2 border border-nexus-blue/50">
            <span className="block transform skew-x-15">Rs {Number(product.price).toLocaleString()}</span>
        </div>
      </div>

      <div className="p-6 flex flex-col flex-grow">
        <p className="text-nexus-blue text-xs font-bold uppercase mb-1">{product.subCategory || product.category}</p>
        <h3 className="text-xl font-exo font-bold text-white mb-2 transition-colors duration-300 group-hover:text-nexus-blue">{product.name}</h3>
                {product.code && (
                    <p className="text-gray-400 text-xs font-mono mb-2">Code: {product.code}</p>
                )}
        <p className="text-nexus-light mb-4 text-sm flex-grow">{product.shortDescription}</p>
        
        <div className="mt-auto pt-4 border-t border-nexus-gray/50 flex items-center gap-2">
            {context === 'wishlist' ? (
                <>
                    <GamingButton
                        onClick={(e) => {
                            e.stopPropagation();
                            removeFromWishlist(product.id);
                        }}
                        variant="danger"
                        size="sm"
                        className="flex-grow"
                    >
                        Remove
                    </GamingButton>
                    <GamingButton
                        onClick={handleAddToCart}
                        variant={addState === 'added' ? 'success' : 'primary'}
                        size="sm"
                        disabled={addState !== 'idle'}
                        className="flex-grow"
                    >
                        {addState === 'idle' && 'Add to Cart'}
                        {addState === 'adding' && 'Adding...'}
                        {addState === 'added' && 'Added!'}
                    </GamingButton>
                </>
            ) : (
                <>
                    <GamingButton 
                        onClick={(e) => {
                            e.stopPropagation();
                            onViewDetails(product);
                        }}
                        variant="secondary"
                        size="sm"
                        className="flex-grow"
                    >
                        Details
                    </GamingButton>
                     <GamingButton
                        onClick={handleAddToCart}
                        variant={addState === 'added' ? 'success' : 'primary'}
                        size="sm"
                        disabled={addState !== 'idle'}
                        className="flex-grow"
                     >
                        {addState === 'idle' && 'Add to Cart'}
                        {addState === 'adding' && 'Adding...'}
                        {addState === 'added' && 'Added!'}
                     </GamingButton>
                </>
            )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
