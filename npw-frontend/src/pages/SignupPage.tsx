
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import GamingButton from '../components/GamingButton';

interface SignupPageProps {
    navigateTo: (path: string) => void;
}

const SignupPage: React.FC<SignupPageProps> = ({ navigateTo }) => {
    const { signup } = useAuth();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            return setError('Passwords do not match.');
        }

        if (password.length < 6) {
            return setError('Password must be at least 6 characters.');
        }

        setIsSubmitting(true);

        try {
            await signup(name, email, password);
            // Redirect to OTP verification page with email and username
            navigateTo(`/verify-otp?email=${encodeURIComponent(email)}&username=${encodeURIComponent(name)}`);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <section className="py-20 min-h-screen flex items-center justify-center">
            <div className="container mx-auto px-6">
                <div className="max-w-md mx-auto bg-nexus-dark/80 backdrop-blur-md p-8 rounded-lg shadow-[0_0_20px_rgba(239,68,68,0.2)] border border-nexus-blue/30">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-exo font-bold text-white mb-2">Join the Nexus</h1>
                        <p className="text-nexus-light">Create your profile and start your journey.</p>
                    </div>

                    {error && (
                        <div className="bg-red-900/50 border border-red-500/50 text-red-200 px-4 py-2 rounded mb-6 text-sm text-center">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="name" className="block text-sm font-bold text-nexus-blue mb-2">Gamertag / Name</label>
                            <input
                                type="text"
                                id="name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                                className="w-full bg-nexus-gray border border-nexus-purple/30 rounded py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-nexus-blue focus:border-transparent transition-all"
                                placeholder="Enter your name"
                            />
                        </div>

                        <div>
                            <label htmlFor="email" className="block text-sm font-bold text-nexus-blue mb-2">Email Address</label>
                            <input
                                type="email"
                                id="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="w-full bg-nexus-gray border border-nexus-purple/30 rounded py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-nexus-blue focus:border-transparent transition-all"
                                placeholder="agent@nexus.com"
                            />
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-bold text-nexus-blue mb-2">Password</label>
                            <input
                                type="password"
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="w-full bg-nexus-gray border border-nexus-purple/30 rounded py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-nexus-blue focus:border-transparent transition-all"
                                placeholder="••••••••"
                            />
                        </div>

                        <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-bold text-nexus-blue mb-2">Confirm Password</label>
                            <input
                                type="password"
                                id="confirmPassword"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                                className="w-full bg-nexus-gray border border-nexus-purple/30 rounded py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-nexus-blue focus:border-transparent transition-all"
                                placeholder="••••••••"
                            />
                        </div>

                        <div className="pt-2">
                            <GamingButton
                                type="submit"
                                variant="primary"
                                className="w-full"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? (
                                    <span className="flex items-center gap-2">
                                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                        Initializing...
                                    </span>
                                ) : 'Create Account'}
                            </GamingButton>
                        </div>
                    </form>

                    <div className="mt-6 text-center text-sm text-gray-400">
                        Already have an account?{' '}
                        <button onClick={() => navigateTo('/login')} className="text-nexus-blue font-bold hover:text-white transition-colors">
                            Sign In
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default SignupPage;
