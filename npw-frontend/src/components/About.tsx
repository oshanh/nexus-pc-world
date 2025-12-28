import React from 'react';

const ValueCard: React.FC<{ icon: React.ReactNode; title: string; children: React.ReactNode }> = ({ icon, title, children }) => (
    <div className="bg-nexus-dark p-6 rounded-lg border border-nexus-purple/30 text-center transform hover:-translate-y-2 transition-transform duration-300 h-full">
        <div className="text-nexus-blue mx-auto mb-4 w-12 h-12 flex items-center justify-center">{icon}</div>
        <h3 className="text-xl font-exo font-bold mb-2">{title}</h3>
        <p className="text-gray-400 text-sm">{children}</p>
    </div>
);

const TeamMemberCard: React.FC<{ imageUrl: string; name: string; title: string; bio: string; }> = ({ imageUrl, name, title, bio }) => (
    <div className="bg-nexus-dark p-6 rounded-lg text-center border border-nexus-gray/50 transform hover:-translate-y-2 transition-transform duration-300">
        <img src={imageUrl} alt={name} className="w-32 h-32 rounded-full mx-auto mb-4 border-2 border-nexus-blue object-cover" />
        <h4 className="text-xl font-exo font-bold text-white">{name}</h4>
        <p className="text-nexus-blue font-semibold mb-2">{title}</p>
        <p className="text-gray-400 text-sm">{bio}</p>
    </div>
);


const About: React.FC = () => {
    return (
        <div className="py-20">
            {/* Main Section */}
            <section className="container mx-auto px-6 mb-20">
                <div className="flex flex-col md:flex-row items-center gap-12">
                    <div className="md:w-1/2">
                        <div className="p-1 rounded-lg animate-glow">
                           <img src="https://images.pexels.com/photos/777001/pexels-photo-777001.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" alt="Nexus Gaming Workspace" className="rounded-lg shadow-2xl" />
                        </div>
                    </div>
                    <div className="md:w-1/2 text-center md:text-left">
                        <h2 className="text-4xl font-exo font-bold mb-4">Who We Are</h2>
                        <p className="text-nexus-light mb-4 leading-relaxed">
                            Nexus Gaming was born from a passion for pushing the boundaries of performance. We are a team of dedicated builders, gamers, and tech enthusiasts committed to crafting high-quality, reliable, and powerful computer systems.
                        </p>
                        <p className="text-nexus-light leading-relaxed">
                            From meticulously assembled custom rigs to the latest in gaming peripherals, we provide the tools you need to conquer new worlds, top the leaderboards, and create amazing content. Your journey to gaming excellence is our mission.
                        </p>
                    </div>
                </div>
            </section>
            
            {/* Core Values Section */}
            <section className="container mx-auto px-6">
                <div className="text-center mb-12">
                    <h2 className="text-4xl font-exo font-bold">Our Core Values</h2>
                    <p className="text-nexus-light mt-2">The principles that drive us forward.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <ValueCard 
                        icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>}
                        title="Peak Performance"
                    >
                        We use only top-tier, stress-tested components to deliver uncompromising speed and power for an elite gaming experience.
                    </ValueCard>
                    <ValueCard 
                        icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                        title="Meticulous Craftsmanship"
                    >
                        Every build is assembled with precision and an artist's touch, ensuring clean cable management and optimal airflow.
                    </ValueCard>
                     <ValueCard 
                        icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>}
                        title="Gamer-Centric Support"
                    >
                        We're gamers too. Our expert support team is here to help you through every step of your journey, from purchase to play.
                    </ValueCard>
                </div>
            </section>

            {/* Meet the Team Section */}
            <section className="container mx-auto px-6 mt-20">
                <div className="text-center mb-12">
                    <h2 className="text-4xl font-exo font-bold">Meet Our Team</h2>
                    <p className="text-nexus-light mt-2">The experts behind your perfect build.</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    <TeamMemberCard
                        imageUrl="https://picsum.photos/seed/alex/200"
                        name="Alex 'Forge' Johnson"
                        title="Founder & Lead Builder"
                        bio="With over 15 years of experience, Alex ensures every machine is a masterpiece of power and precision."
                    />
                    <TeamMemberCard
                        imageUrl="https://picsum.photos/seed/maya/200"
                        name="Maya 'Volt' Chen"
                        title="Overclocking Specialist"
                        bio="Maya pushes hardware to its absolute limits, squeezing out every drop of performance for our X-Treme series."
                    />
                    <TeamMemberCard
                        imageUrl="https://picsum.photos/seed/ryan/200"
                        name="Ryan 'Aether' Patel"
                        title="Aesthetics & Design Lead"
                        bio="Ryan is the artist behind our builds, mastering the flow of light and air to create systems that look as good as they run."
                    />
                </div>
            </section>
        </div>
    );
};

export default About;