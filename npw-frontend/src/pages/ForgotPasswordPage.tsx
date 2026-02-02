
import React, { useState } from 'react';
import GamingButton from '../components/GamingButton';
import { authService } from '../services/authService';

interface ForgotPasswordPageProps {
    navigateTo: (path: string) => void;
}

const ForgotPasswordPage: React.FC<ForgotPasswordPageProps> = ({ navigateTo }) => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setMessage('');
        setIsSubmitting(true);

        try {
            const response: any = await authService.forgotPassword(email);
            setMessage(response.message || 'If an account with that email exists, we have sent a password reset link.');
        } catch (err: any) {
            console.error('Forgot password error:', err);
            setError(err?.data?.message || 'Failed to request password reset. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <section className="py-20 min-h-screen flex items-center justify-center">
            <div className="container mx-auto px-6">
                <div className="max-w-md mx-auto bg-nexus-dark/80 backdrop-blur-md p-8 rounded-lg shadow-[0_0_20px_rgba(239,68,68,0.2)] border border-nexus-blue/30">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-exo font-bold text-white mb-2">Forgot Password</h1>
                        <p className="text-nexus-light">Enter your email and we'll send you a link to reset your password.</p>
                    </div>

                    {message && (
                        <div className="bg-green-900/50 border border-green-500/50 text-green-200 px-4 py-2 rounded mb-6 text-sm text-center">
                            {message}
                        </div>
                    )}

                    {error && (
                        <div className="bg-red-900/50 border border-red-500/50 text-red-200 px-4 py-2 rounded mb-6 text-sm text-center">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
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

                        <GamingButton
                            type="submit"
                            variant="primary"
                            className="w-full"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Sending...' : 'Send Reset Link'}
                        </GamingButton>
                    </form>

                    <div className="mt-6 text-center text-sm text-gray-400">
                        Remembered your password?{' '}
                        <button onClick={() => navigateTo('/login')} className="text-nexus-blue font-bold hover:text-white transition-colors">
                            Back to Sign In
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default ForgotPasswordPage;
