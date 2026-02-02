
import React, { useState, useEffect } from 'react';
import { useProducts } from '../contexts/ProductContext';
import type { Product } from '../types';
import { useCart } from '../contexts/CartContext';
import GamingButton from './GamingButton';
import { websiteSettingsService } from '../services/websiteSettingsService';

interface FeaturedProductsProps {
  onViewDetails: (product: Product) => void;
  navigateTo: (path: string) => void;
}

const SpecIcon: React.FC<{ specName: string }> = ({ specName }) => {
    // FIX: Replaced `JSX.Element` with `React.ReactElement` to fix "Cannot find namespace 'JSX'" error.
    const iconMap: { [key: string]: React.ReactElement } = {
        CPU: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="5" width="14" height="14" rx="2"></rect><rect x="9" y="9" width="6" height="6"></rect><line x1="9" y1="1" x2="9" y2="4"></line><line x1="15" y1="1" x2="15" y2="4"></line><line x1="9" y1="20" x2="9" y2="23"></line><line x1="15" y1="20" x2="15" y2="23"></line><line x1="20" y1="9" x2="23" y2="9"></line><line x1="20" y1="14" x2="23" y2="14"></line><line x1="1" y1="9" x2="4" y2="9"></line><line x1="1" y1="14" x2="4" y2="14"></line></svg>,
        GPU: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 5h3.5a2.5 2.5 0 0 1 0 5H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2z"></path><path d="M5 14h3.5a2.5 2.5 0 0 1 0 5H5a2 2 0 0 1-2-2v-1a2 2 0 0 1 2-2z"></path><path d="M14 5h3.5a2.5 2.5 0 0 1 0 5H14a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2z"></path><path d="M14 14h3.5a2.5 2.5 0 0 1 0 5H14a2 2 0 0 1-2-2v-1a2 2 0 0 1 2-2z"></path></svg>,
        RAM: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12h20"></path><path d="M5 12v6"></path><path d="M19 12v6"></path><path d="M8 12v6"></path><path d="M16 12v6"></path><path d="M11 12v6"></path></svg>,
        Storage: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"></ellipse><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"></path><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"></path></svg>,
        Display: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="12" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="16" x2="12" y2="21"></line></svg>,
        OS: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M0 3.5v7.42h10.92V0H3.52A3.52 3.52 0 000 3.5zM0 13.08v7.42A3.52 3.52 0 003.52 24H10.92V13.08H0zM13.08 0v10.92H24V3.52A3.52 3.52 0 0020.48 0H13.08zM13.08 13.08V24h7.4A3.52 3.52 0 0024 20.48v-7.4h-10.92z"/></svg>,
        Audio: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>,
        Sensor: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m13 17-4-4 4-4"></path><path d="m9 5 4 4-4 4"></path></svg>,
    };
    const key = Object.keys(iconMap).find(k => specName.includes(k));
    return key ? iconMap[key] : iconMap['CPU']; // Default icon
};

const FeaturedProducts: React.FC<FeaturedProductsProps> = ({ onViewDetails, navigateTo }) => {
    type Category = 'Desktop' | 'Laptop';
    const [activeCategory, setActiveCategory] = useState<Category>('Desktop');
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const { products } = useProducts();
    const { addToCart } = useCart();
    const [isAdding, setIsAdding] = useState<string | null>(null);

    const [featuredIds, setFeaturedIds] = useState<{ desktopProductId: string; laptopProductId: string }>({
        desktopProductId: '',
        laptopProductId: '',
    });

    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const res = await websiteSettingsService.getPublic();
                if (cancelled) return;
                const fp = res?.settings?.featuredProducts;
                if (!fp) return;
                setFeaturedIds({
                    desktopProductId: String(fp.desktopProductId || ''),
                    laptopProductId: String(fp.laptopProductId || ''),
                });
            } catch {
                // Ignore and use fallbacks
            }
        })();
        return () => { cancelled = true; };
    }, []);

    const featuredProducts: { [key in Category]?: Product } = {
        Desktop: (featuredIds.desktopProductId
            ? products.find(p => p.id === featuredIds.desktopProductId)
            : undefined) || products.find(p => p.category === 'Desktop'),
        Laptop: (featuredIds.laptopProductId
            ? products.find(p => p.id === featuredIds.laptopProductId)
            : undefined) || products.find(p => p.category === 'Laptop'),
    };
    
    const activeProduct = featuredProducts[activeCategory];

    useEffect(() => {
        // Reset index to 0 when the active product changes
        setCurrentImageIndex(0);

        if (!activeProduct || activeProduct.imageUrls.length <= 1) {
            return; // No need for an interval if there's only one image or no product
        }

        const intervalId = setInterval(() => {
            setCurrentImageIndex(prevIndex => (prevIndex + 1) % activeProduct.imageUrls.length);
        }, 5000); // Rotate every 5 seconds

        return () => clearInterval(intervalId); // Cleanup interval on component unmount or product change
    }, [activeProduct]);

    const handleAddToCart = (e: React.MouseEvent, product: Product) => {
        e.stopPropagation();
        addToCart(product);
        setIsAdding(product.id);
        setTimeout(() => setIsAdding(null), 1000);
    };

    if (!activeProduct) {
        return null;
    }

    return (
        <section className="py-16 overflow-hidden relative">
             <div className="absolute inset-0 opacity-10 z-0" style={{
                backgroundImage: `radial-gradient(${'#ef4444'} 1px, transparent 1px)`,
                backgroundSize: '2rem 2rem'
            }}></div>
            <div className="container mx-auto px-6 relative z-10">
                <div className="text-center">
                    <h2 className="text-3xl sm:text-4xl font-exo font-bold mb-2 text-white">[ Featured Products ]</h2>
                    <p className="text-nexus-light text-lg mb-10 max-w-2xl mx-auto">
                        Top picks from our collection, curated for ultimate performance and style.
                    </p>
                </div>

                {/* Tabs */}
                <div className="flex justify-center mb-8 gap-4 md:gap-8">
                    {(['Desktop', 'Laptop'] as Category[]).map(cat => (
                        <GamingButton
                            key={cat}
                            onClick={() => setActiveCategory(cat)}
                            variant={activeCategory === cat ? 'primary' : 'secondary'}
                            size="sm"
                        >
                            {cat}s
                        </GamingButton>
                    ))}
                </div>

                {/* Showcase */}
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-center bg-nexus-gray/30 p-6 rounded-lg border border-nexus-purple/20 backdrop-blur-sm">
                    {/* Product Image */}
                    <div className="lg:col-span-3 relative p-4 h-64 md:h-80 lg:h-96">
                         {/* Image Carousel */}
                         {activeProduct.imageUrls.map((url, index) => (
                            <img
                                key={url}
                                src={url}
                                alt={`${activeProduct.name} view ${index + 1}`}
                                className={`absolute inset-4 w-[calc(100%-2rem)] h-[calc(100%-2rem)] rounded-lg object-contain transition-opacity duration-700 ease-in-out ${
                                    currentImageIndex === index ? 'opacity-100' : 'opacity-0'
                                }`}
                            />
                        ))}
                         <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-nexus-blue/50 rounded-tl-lg transition-all duration-300 group-hover:w-12 group-hover:h-12"></div>
                         <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-nexus-blue/50 rounded-tr-lg transition-all duration-300 group-hover:w-12 group-hover:h-12"></div>
                         <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-nexus-blue/50 rounded-bl-lg transition-all duration-300 group-hover:w-12 group-hover:h-12"></div>
                         <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-nexus-blue/50 rounded-br-lg transition-all duration-300 group-hover:w-12 group-hover:h-12"></div>
                         {/* Carousel Indicators */}
                        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex space-x-3 z-10">
                            {activeProduct.imageUrls.map((url, index) => (
                                <button
                                    key={url}
                                    onClick={() => setCurrentImageIndex(index)}
                                    className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                                        currentImageIndex === index ? 'bg-nexus-blue scale-125' : 'bg-gray-500/70 hover:bg-gray-400'
                                    }`}
                                    aria-label={`View image ${index + 1}`}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Product Details */}
                    <div className="lg:col-span-2 flex flex-col h-full">
                        <p className="font-exo text-nexus-blue uppercase tracking-widest font-bold">{activeProduct.category}</p>
                        <h3 className="text-2xl md:text-3xl lg:text-4xl font-exo font-bold my-2 text-white">{activeProduct.name}</h3>
                        <p className="text-nexus-light mb-4 text-base">{activeProduct.shortDescription}</p>

                        <div className="border-t border-nexus-purple/20 pt-4 mb-4 space-y-2 text-base">
                            {activeProduct.specs.slice(0, 6).map(spec => (
                                <div key={spec.name} className="flex items-center gap-3">
                                    <div className="text-nexus-blue"><SpecIcon specName={spec.name} /></div>
                                    <div className="flex justify-between w-full">
                                        <p className="font-semibold text-gray-400">{spec.name}:</p>
                                        <p className="text-white font-mono">{spec.value}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-auto flex flex-col sm:flex-row items-center justify-between gap-4">
                            <span className="text-3xl lg:text-4xl font-exo font-bold text-nexus-blue">Rs {Number(activeProduct.price).toLocaleString()}</span>
                            <div className="flex items-center gap-3">
                                <GamingButton onClick={() => onViewDetails(activeProduct)} variant="secondary" size="sm">
                                    Details
                                </GamingButton>
                                <GamingButton onClick={(e) => handleAddToCart(e, activeProduct)} variant="primary" size="sm" disabled={isAdding === activeProduct.id}>
                                    {isAdding === activeProduct.id ? 'Added!' : 'Add to Cart'}
                                </GamingButton>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div className="text-center mt-12">
                     <GamingButton onClick={() => navigateTo('/products')} variant="secondary">
                        View All Products
                    </GamingButton>
                </div>
            </div>
        </section>
    );
};

export default FeaturedProducts;
