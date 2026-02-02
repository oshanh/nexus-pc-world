
import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import GamingButton from '../components/GamingButton';
import { authService } from '../services/authService';

interface ResetPasswordPageProps {
    navigateTo: (path: string) => void;
}

const ResetPasswordPage: React.FC<ResetPasswordPageProps> = ({ navigateTo }) => {
    const { token } = useParams<{ token: string }>();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setMessage('');

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        setIsSubmitting(true);

        try {
            const response: any = await authService.resetPassword(token || '', password);
            setMessage(response.message || 'Password has been reset successfully.');
            setTimeout(() => {
                navigateTo('/login');
            }, 3000);
        } catch (err: any) {
            console.error('Reset password error:', err);
            setError(err?.data?.message || 'Failed to reset password. The link may be invalid or expired.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <section className="py-20 min-h-screen flex items-center justify-center">
            <div className="container mx-auto px-6">
                <div className="max-w-md mx-auto bg-nexus-dark/80 backdrop-blur-md p-8 rounded-lg shadow-[0_0_20px_rgba(239,68,68,0.2)] border border-nexus-blue/30">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-exo font-bold text-white mb-2">Reset Password</h1>
                        <p className="text-nexus-light">Equip your account with a new access key.</p>
                    </div>

                    {message && (
                        <div className="bg-green-900/50 border border-green-500/50 text-green-200 px-4 py-2 rounded mb-6 text-sm text-center">
                            {message} Redirecting to login...
                        </div>
                    )}

                    {error && (
                        <div className="bg-red-900/50 border border-red-500/50 text-red-200 px-4 py-2 rounded mb-6 text-sm text-center">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="password" className="block text-sm font-bold text-nexus-blue mb-2">New Password</label>
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
                            <label htmlFor="confirmPassword" className="block text-sm font-bold text-nexus-blue mb-2">Confirm New Password</label>
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

                        <GamingButton
                            type="submit"
                            variant="primary"
                            className="w-full"
                            disabled={isSubmitting || message !== ''}
                        >
                            {isSubmitting ? 'Resetting...' : 'Reset Password'}
                        </GamingButton>
                    </form>
                </div>
            </div>
        </section>
    );
};

export default ResetPasswordPage;
