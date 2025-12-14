import React from 'react';
import Hero from '../components/Hero';
import FeaturedProducts from '../components/FeaturedProducts';
import PromotionCarousel from '../components/PromotionCarousel';
import type { Product } from '../types';

interface HomePageProps {
    onViewDetails: (product: Product) => void;
    navigateTo: (path: string) => void;
}

const HomePage: React.FC<HomePageProps> = ({ onViewDetails, navigateTo }) => {
    return (
        <>
            <Hero navigateTo={navigateTo} />
            <PromotionCarousel />
            <FeaturedProducts onViewDetails={onViewDetails} navigateTo={navigateTo} />
        </>
    );
};

export default HomePage;
