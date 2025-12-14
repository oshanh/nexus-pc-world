
import React from 'react';
import GamingButton from './GamingButton';
import { useAuth } from '../contexts/AuthContext';

const SocialIcon: React.FC<{ href: string; children: React.ReactNode }> = ({ href, children }) => (
    <a href={href} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-nexus-blue transition-colors duration-300">
        {children}
    </a>
);

const FooterLink: React.FC<{ href: string; children: React.ReactNode; navigateTo: (path: string) => void; className?: string }> = ({ href, children, navigateTo, className }) => (
     <a href={href} onClick={(e) => { e.preventDefault(); navigateTo(href); }} className={`text-gray-400 hover:text-nexus-blue transition-colors duration-300 text-sm block mb-2 ${className || ''}`}>{children}</a>
);

const Footer: React.FC<{ navigateTo: (path: string) => void; }> = ({ navigateTo }) => {
    const { isAdmin, adminMode, toggleAdminMode } = useAuth();

    const handleAdminToggle = () => {
        if (isAdmin) {
            toggleAdminMode();
        } else {
            navigateTo('#/login');
        }
    };

    return (
        <footer className="bg-nexus-dark border-t-2 border-nexus-blue/30 mt-auto">
            <div className="container mx-auto px-6 py-12">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {/* Brand Section */}
                    <div className="md:col-span-2 lg:col-span-1">
                        <h3 className="text-2xl font-exo font-bold text-white mb-2">NEXUS PC World</h3>
                        <p className="text-gray-400 text-sm max-w-xs">
                            Crafting elite systems for the ultimate gaming experience. Your journey to peak performance starts here.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="font-exo font-bold text-white uppercase tracking-wider mb-4">Quick Links</h4>
                        <ul>
                            <li><FooterLink href="#/" navigateTo={navigateTo}>Home</FooterLink></li>
                            <li><FooterLink href="#/products" navigateTo={navigateTo}>Products</FooterLink></li>
                            <li><FooterLink href="#/custom-build" navigateTo={navigateTo}>Custom Builds</FooterLink></li>
                            <li><FooterLink href="#/about" navigateTo={navigateTo}>About Us</FooterLink></li>
                            {isAdmin && adminMode && (
                                <li>
                                    <FooterLink href="#/admin" navigateTo={navigateTo} className="text-red-400 hover:text-red-500 font-semibold">
                                        Admin Panel
                                    </FooterLink>
                                </li>
                            )}
                        </ul>
                    </div>

                    {/* Support */}
                    <div>
                        <h4 className="font-exo font-bold text-white uppercase tracking-wider mb-4">Support</h4>
                        <ul>
                            <li><FooterLink href="#/contact" navigateTo={navigateTo}>Contact Us</FooterLink></li>
                            <li><a href="#" className="text-gray-400 hover:text-nexus-blue transition-colors duration-300 text-sm block mb-2">FAQ</a></li>
                            <li><a href="#" className="text-gray-400 hover:text-nexus-blue transition-colors duration-300 text-sm block mb-2">Warranty Info</a></li>
                            <li><a href="#" className="text-gray-400 hover:text-nexus-blue transition-colors duration-300 text-sm block mb-2">Shipping</a></li>
                        </ul>
                    </div>

                    {/* Newsletter */}
                    <div>
                        <h4 className="font-exo font-bold text-white uppercase tracking-wider mb-4">Stay Updated</h4>
                        <p className="text-gray-400 text-sm mb-4">Get the latest on new releases, sales, and tech tips.</p>
                        <form className="flex">
                            <input
                                type="email"
                                placeholder="your.email@example.com"
                                className="bg-nexus-gray border border-nexus-purple/50 rounded-l-md py-2 px-3 text-white text-sm w-full focus:outline-none focus:ring-2 focus:ring-nexus-blue"
                            />
                            <GamingButton type="submit" variant="primary" size="sm" className="-ml-2 rounded-l-none">
                                Sub
                            </GamingButton>
                        </form>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="mt-12 pt-8 border-t border-nexus-blue/20 flex flex-col md:flex-row justify-between items-center">
                    <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8 mb-4 md:mb-0">
                        <p className="text-gray-500 text-sm">&copy; {new Date().getFullYear()} Nexus Gaming PC. All Rights Reserved.</p>
                        
                        {/* Admin Toggle */}
                        <div className="flex items-center gap-3 bg-nexus-gray/30 px-3 py-1.5 rounded-full border border-gray-700/50">
                            <span className="text-xs text-gray-500 uppercase font-bold tracking-wider">Admin Mode</span>
                            <button
                                onClick={handleAdminToggle}
                                className={`w-10 h-5 rounded-full p-0.5 transition-colors duration-300 focus:outline-none ${adminMode ? 'bg-nexus-blue' : 'bg-gray-700'}`}
                                aria-label="Toggle Admin Mode"
                                title={isAdmin ? "Toggle Admin View" : "Login as Admin"}
                            >
                                <div className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform duration-300 ${adminMode ? 'translate-x-5' : 'translate-x-0'}`} />
                            </button>
                        </div>
                    </div>

                    <div className="flex space-x-6">
                        <SocialIcon href="https://facebook.com">
                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" /></svg>
                        </SocialIcon>
                        <SocialIcon href="https://twitter.com">
                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.71v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" /></svg>
                        </SocialIcon>
                        <SocialIcon href="https://instagram.com">
                           <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.024.06 1.378.06 3.808s-.012 2.784-.06 3.808c-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 A4.902 4.902 0 016.345 2.525c.636-.247 1.363-.416 2.427-.465C9.793 2.013 10.148 2 12.315 2zM12 7a5 5 0 100 10 5 5 0 000-10zm0 8a3 3 0 110-6 3 3 0 010 6zm6.406-11.845a1.25 1.25 0 100 2.5 1.25 1.25 0 000-2.5z" clipRule="evenodd" /></svg>
                        </SocialIcon>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
