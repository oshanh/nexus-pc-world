
import React, { useState, useEffect } from 'react';
import GamingButton from './GamingButton';

const heroMedia = [
  { type: 'video', src: '', alt: 'Close-up video of RGB fans in a gaming PC.' },
  { type: 'video', src: '', alt: 'A clean and modern gaming PC setup on a desk.' },
  { type: 'video', src: '', alt: 'A clean and modern gaming PC setup on a desk.' },
];

interface HeroProps {
  navigateTo: (path: string) => void;
}

const Hero: React.FC<HeroProps> = ({ navigateTo }) => {
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentMediaIndex(prevIndex => (prevIndex + 1) % heroMedia.length);
    }, 9000); // Change media every 9 seconds

    return () => clearInterval(intervalId); // Cleanup on component unmount
  }, []);

  return (
    <section id="home" className="relative flex items-center justify-center h-[70vh] text-center overflow-hidden">
      {/* Background Media Carousel */}
      <div className="absolute inset-0 w-full h-full z-0">
        {heroMedia.map((media, index) => (
            <div
              key={index}
              className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out ${
                index === currentMediaIndex ? 'opacity-100' : 'opacity-0'
              }`}
            >
              {media.type === 'video' ? (
                <video
                  src={media.src}
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-full object-cover"
                  aria-label={media.alt}
                />
              ) : (
                <img
                  src={media.src}
                  alt={media.alt}
                  className="w-full h-full object-cover"
                />
              )}
            </div>
        ))}
      </div>
      
      {/* Overlay for text readability */}
      <div className="absolute inset-0 bg-nexus-dark/60 z-10"></div>
      
      {/* Subtle background grid pattern */}
      <div className="absolute inset-0 opacity-10 z-10" style={{
            backgroundImage: `linear-gradient(${'#ef4444'} 1px, transparent 1px), linear-gradient(to right, ${'#ef4444'} 1px, transparent 1px)`,
            backgroundSize: '3rem 3rem'
      }}></div>

      {/* Content */}
      <div className="relative z-20 container mx-auto px-6 py-20">
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-exo font-extrabold text-white uppercase tracking-wider drop-shadow-[0_0_20px_rgba(239,68,68,0.8)]">
              Forge Your Legend
          </h1>
          <p className="mt-6 text-lg md:text-xl text-nexus-light max-w-3xl mx-auto font-medium">
              Unleash peak performance with elite gaming PCs, laptops, and accessories.
              Your ultimate gaming experience starts here.
          </p>
          <div className="mt-8">
            <GamingButton onClick={() => navigateTo('#/custom-build')} variant="primary">
                Build Your Dream Rig
            </GamingButton>
          </div>
      </div>

      {/* Carousel Indicators */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex space-x-3 z-20">
        {heroMedia.map((_, index) => (
            <div
                key={index}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    index === currentMediaIndex ? 'bg-nexus-blue scale-125' : 'bg-gray-500/70'
                }`}
            ></div>
        ))}
      </div>
    </section>
  );
};

export default Hero;
