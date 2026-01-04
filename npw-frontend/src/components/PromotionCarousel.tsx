import React, { useState, useEffect } from 'react';
import { PROMOTION_IMAGES } from '../constants';
import { websiteSettingsService } from '../services/websiteSettingsService';
import { API_BASE_URL } from '../api/client';

const toAbsoluteApiUrl = (maybeRelative: string) => {
    const s = String(maybeRelative || '').trim();
    if (!s) return '';
    if (/^https?:\/\//i.test(s)) return s;
    if (s.startsWith('/')) {
        const apiOrigin = API_BASE_URL.replace(/\/?api\/?$/, '');
        return `${apiOrigin}${s}`;
    }
    return s;
};

const PromotionCarousel: React.FC = () => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [images, setImages] = useState<{ src: string; alt: string }[]>(PROMOTION_IMAGES);

    useEffect(() => {
        let cancelled = false;

        (async () => {
            try {
                const res = await websiteSettingsService.getPublic();
                const promos = res?.settings?.promotions;
                const next = Array.isArray(promos)
                    ? promos
                        .filter(p => p?.imageUrl)
                        .map(p => ({ src: toAbsoluteApiUrl(String(p.imageUrl)), alt: String(p.alt || 'Promotion') }))
                    : [];

                if (!cancelled && next.length > 0) {
                    setImages(next);
                    setCurrentIndex(0);
                }
            } catch {
                // Silent fallback to local constants.
            }
        })();

        return () => { cancelled = true; };
    }, []);

    useEffect(() => {
        if (!images.length) return;
        const interval = setInterval(() => {
            setCurrentIndex(prevIndex => (prevIndex + 1) % images.length);
        }, 3000); // Rotate every 3 seconds

        return () => clearInterval(interval);
    }, [images.length]);

    const goToSlide = (index: number) => {
        setCurrentIndex(index);
    };

    return (
        <section className="py-16">
            <div className="container mx-auto px-6">
                <div className="text-center mb-10">
                    <h2 className="text-4xl font-exo font-bold text-white">[ LATEST PROMOTIONS ]</h2>
                </div>
                <div className="relative w-full aspect-square max-w-2xl mx-auto overflow-hidden rounded-lg border-2 border-nexus-blue/30 shadow-lg shadow-nexus-blue/20">
                    {images.map((image, index) => (
                        <div
                            key={image.src}
                            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                                index === currentIndex ? 'opacity-100' : 'opacity-0'
                            }`}
                        >
                            <img
                                src={image.src}
                                alt={image.alt}
                                className="w-full h-full object-cover"
                            />
                             <div className="absolute inset-0 bg-black/30"></div>
                        </div>
                    ))}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-3 z-10">
                        {images.map((image, index) => (
                            <button
                                key={image.src}
                                onClick={() => goToSlide(index)}
                                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                                    index === currentIndex ? 'bg-nexus-blue scale-125' : 'bg-gray-500/70 hover:bg-gray-400'
                                }`}
                                aria-label={`Go to promotion slide ${index + 1}`}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default PromotionCarousel;