import React from 'react';
import { useWishlist } from '../contexts/WishlistContext';
import ProductCard from '../components/ProductCard';
import GamingButton from '../components/GamingButton';
import type { Product } from '../types';

interface WishlistPageProps {
    onViewDetails: (product: Product) => void;
    navigateTo: (path: string) => void;
}

const EmptyWishlist: React.FC<{ navigateTo: (path: string) => void; }> = ({ navigateTo }) => (
    <div className="text-center bg-nexus-dark/50 p-12 rounded-lg border border-nexus-gray">
        <svg className="mx-auto h-24 w-24 text-gray-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
        </svg>
        <h2 className="mt-6 text-2xl font-exo text-nexus-light mb-2">Your Wishlist is Empty</h2>
        <p className="text-gray-400 mb-8">Find gear you love and save it for later by clicking the heart icon.</p>
        <GamingButton onClick={() => navigateTo('/products')} variant="cta">
            Browse Products
        </GamingButton>
    </div>
);

const WishlistPage: React.FC<WishlistPageProps> = ({ onViewDetails, navigateTo }) => {
  const { wishlistItems } = useWishlist();

  if (wishlistItems.length === 0) {
    return (
        <section className="py-20 min-h-[80vh] flex items-center justify-center">
            <div className="container mx-auto px-6">
                <EmptyWishlist navigateTo={navigateTo} />
            </div>
        </section>
    );
  }

  return (
    <section className="py-20 min-h-screen">
      <div className="container mx-auto px-6">
        <div className="text-center">
            <h1 className="text-4xl font-exo font-bold mb-2">My Wishlist</h1>
            <p className="text-nexus-light mb-12 max-w-3xl mx-auto">
                Your saved items. Ready to build your legend?
            </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {wishlistItems.map(product => (
                <ProductCard key={product.id} product={product} onViewDetails={onViewDetails} context="wishlist" />
            ))}
        </div>
      </div>
    </section>
  );
};

export default WishlistPage;
