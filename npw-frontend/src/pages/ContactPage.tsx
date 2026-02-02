import React, { useEffect, useMemo, useState } from 'react';
import GamingButton from '../components/GamingButton';
import { websiteSettingsService, type PublicFaq, type PublicWebsiteSettings } from '../services/websiteSettingsService';

const InfoItem: React.FC<{ icon: React.ReactNode; title: string; children: React.ReactNode }> = ({ icon, title, children }) => (
    <div className="flex items-start gap-4">
        <div className="text-nexus-blue shrink-0 w-8 h-8 mt-1">{icon}</div>
        <div>
            <h4 className="font-bold text-nexus-blue text-lg">{title}</h4>
            <div className="text-gray-300">{children}</div>
        </div>
    </div>
);

const FAQItem: React.FC<{ question: string; answer: string }> = ({ question, answer }) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div className="border-b border-nexus-blue/20 last:border-b-0">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex justify-between items-center text-left py-4 focus:outline-none"
                aria-expanded={isOpen}
            >
                <span className="font-bold text-lg text-nexus-light hover:text-nexus-blue transition-colors">{question}</span>
                <svg className={`w-6 h-6 text-nexus-blue transform transition-transform duration-300 shrink-0 ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
            </button>
            <div className={`overflow-hidden transition-all duration-500 ease-in-out ${isOpen ? 'max-h-96' : 'max-h-0'}`}>
                <p className="text-gray-400 pb-4 pr-6">{answer}</p>
            </div>
        </div>
    );
};


const ContactPage: React.FC = () => {
    const [submitted, setSubmitted] = useState(false);
    const [formData, setFormData] = useState({ name: '', email: '', message: '' });
    const [publicSettings, setPublicSettings] = useState<PublicWebsiteSettings | null>(null);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const res = await websiteSettingsService.getPublic();
                if (cancelled) return;
                setPublicSettings(res?.settings || null);
            } catch {
                // Ignore and use fallbacks
            }
        })();
        return () => { cancelled = true; };
    }, []);

    const fallbackContactInfo = useMemo(() => ({
        emails: ['contact@nexusgaming.com'],
        phoneNumbers: ['(555) 123-4567'],
        openingHours: [{ days: 'Mon - Sat', hours: '10am - 8pm' }],
        locations: [{ label: 'Main', address: '123 Cyber Street, Neon City, 90210', mapUrl: '' }],
    }), []);

    const contactInfo = publicSettings?.contactInfo || fallbackContactInfo;
    const mapImageUrl = (contactInfo.locations && contactInfo.locations.length > 0 && contactInfo.locations[0].mapUrl)
        ? contactInfo.locations[0].mapUrl
        : 'https://picsum.photos/seed/map/600/400';

    const fallbackFaqs = useMemo<PublicFaq[]>(() => ([
        {
            id: 'fallback-1',
            question: 'How long does a custom build take?',
            answer: "Our standard custom builds are typically assembled, tested, and ready for shipment within 7-10 business days. For highly complex builds or during peak seasons, it may take up to 14 business days. We'll keep you updated every step of the way!",
            visible: true,
            sortOrder: 0,
        },
        {
            id: 'fallback-2',
            question: 'What kind of warranty do you offer?',
            answer: "All our custom-built PCs come with a 2-year warranty on parts and labor. Individual components may also carry a longer manufacturer's warranty. We also offer lifetime technical support for every system we sell.",
            visible: true,
            sortOrder: 1,
        },
        {
            id: 'fallback-3',
            question: 'Can I upgrade my PC in the future?',
            answer: "Absolutely! We build our systems with future upgrades in mind, ensuring easy access to components and using non-proprietary parts. Our support team is also happy to provide guidance when you're ready to upgrade.",
            visible: true,
            sortOrder: 2,
        },
        {
            id: 'fallback-4',
            question: 'Do you ship internationally?',
            answer: 'Currently, we only ship within North America. We are working on expanding our shipping options to other regions in the near future. Stay tuned for updates!',
            visible: true,
            sortOrder: 3,
        },
    ]), []);

    const faqs = (publicSettings?.faqs && publicSettings.faqs.length > 0)
        ? [...publicSettings.faqs].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
        : fallbackFaqs;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // In a real app, you'd send this data to a server
        console.log('Form submitted:', formData);
        setSubmitted(true);
    };

    return (
        <section id="contact" className="py-20 bg-nexus-gray">
            <div className="container mx-auto px-6">
                <div className="text-center">
                    <h1 className="text-4xl font-exo font-bold mb-2">Get In Touch</h1>
                    <p className="text-nexus-light mb-12 max-w-3xl mx-auto">
                        Have questions about a build, an order, or just want to talk tech? We're here to help.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
                    {/* Contact Form */}
                    <div className="bg-nexus-dark p-8 rounded-lg shadow-lg border border-nexus-blue/30">
                        {submitted ? (
                            <div className="text-center p-8 h-full flex flex-col justify-center items-center">
                                <h3 className="text-2xl font-exo text-nexus-blue mb-4">Thank You!</h3>
                                <p className="text-nexus-light">Your message has been sent. We'll get back to you as soon as possible.</p>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit}>
                                <div className="mb-4">
                                    <label htmlFor="name" className="block text-nexus-blue font-bold mb-2">Full Name</label>
                                    <input type="text" id="name" name="name" required value={formData.name} onChange={handleChange} className="w-full bg-nexus-gray border border-nexus-purple/50 rounded py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-nexus-blue" />
                                </div>
                                <div className="mb-4">
                                    <label htmlFor="email" className="block text-nexus-blue font-bold mb-2">Email Address</label>
                                    <input type="email" id="email" name="email" required value={formData.email} onChange={handleChange} className="w-full bg-nexus-gray border border-nexus-purple/50 rounded py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-nexus-blue" />
                                </div>
                                <div className="mb-6">
                                    <label htmlFor="message" className="block text-nexus-blue font-bold mb-2">Message</label>
                                    <textarea id="message" name="message" rows={5} required value={formData.message} onChange={handleChange} className="w-full bg-nexus-gray border border-nexus-purple/50 rounded py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-nexus-blue"></textarea>
                                </div>
                                <div className="text-center">
                                    <GamingButton type="submit" variant="cta">
                                        Send Message
                                    </GamingButton>
                                </div>
                            </form>
                        )}
                    </div>

                    {/* Contact Info */}
                    <div className="text-nexus-light bg-nexus-dark p-8 rounded-lg space-y-8">
                         <h3 className="text-3xl font-exo font-bold text-white mb-2">Contact Information</h3>
                         
                         <InfoItem 
                            icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>}
                            title="Address"
                         >
                            <div className="space-y-1">
                                {(contactInfo.locations || []).map((l) => (
                                    <p key={`${l.label}-${l.address}`}>
                                        {l.label ? `${l.label}: ` : ''}{l.address}
                                    </p>
                                ))}
                            </div>
                         </InfoItem>

                         <InfoItem 
                            icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>}
                            title="Email"
                         >
                            <div className="space-y-1">
                                {(contactInfo.emails || []).map((email) => (
                                    <a
                                        key={email}
                                        href={`mailto:${email}`}
                                        className="hover:text-nexus-blue transition-colors block"
                                    >
                                        {email}
                                    </a>
                                ))}
                            </div>
                         </InfoItem>

                         <InfoItem 
                            icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>}
                            title="Phone"
                         >
                                     <div className="space-y-1">
                                          {(contactInfo.phoneNumbers || []).map((phone) => (
                                                <p key={phone}>{phone}</p>
                                          ))}
                                     </div>
                         </InfoItem>
                         
                         <InfoItem 
                            icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                            title="Hours"
                         >
                                     <div className="space-y-1">
                                          {(contactInfo.openingHours || []).map((h) => (
                                                <p key={`${h.days}-${h.hours}`}>{h.days}: {h.hours}</p>
                                          ))}
                                     </div>
                         </InfoItem>
                         
                         <div className="pt-4 border-t border-nexus-gray">
                            <div className="block rounded-lg overflow-hidden group">
                                <img src={mapImageUrl} alt="Map" className="w-full h-auto object-cover transform group-hover:scale-105 transition-transform duration-300" />
                            </div>
                         </div>
                    </div>
                </div>

                {/* FAQ Section */}
                <div className="mt-20">
                    <div className="text-center">
                        <h2 className="text-4xl font-exo font-bold mb-2">Frequently Asked Questions</h2>
                        <p className="text-nexus-light mb-12 max-w-3xl mx-auto">
                            Find quick answers to common questions below.
                        </p>
                    </div>
                    <div className="max-w-4xl mx-auto bg-nexus-dark p-4 sm:p-8 rounded-lg shadow-lg border border-nexus-blue/30">
                        {faqs.map((f) => (
                            <FAQItem key={f.id} question={f.question} answer={f.answer} />
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default ContactPage;