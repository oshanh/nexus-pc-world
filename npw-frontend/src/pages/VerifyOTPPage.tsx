import React, { useState, useRef, useEffect } from 'react';
import GamingButton from '../components/GamingButton';
import { authService } from '../services/authService';

interface VerifyOTPPageProps {
    navigateTo: (path: string) => void;
    email?: string;
    username?: string;
}

const VerifyOTPPage: React.FC<VerifyOTPPageProps> = ({ navigateTo, email: initialEmail, username }) => {
    const [email, setEmail] = useState(initialEmail || '');
    const [otp, setOtp] = useState('');
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isResending, setIsResending] = useState(false);
    const [resendCooldown, setResendCooldown] = useState(0);
    const otpInputRef = useRef<HTMLInputElement>(null);

    // Cooldown timer for resend
    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (resendCooldown > 0) {
            timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
        }
        return () => clearTimeout(timer);
    }, [resendCooldown]);

    // Focus on OTP input
    useEffect(() => {
        otpInputRef.current?.focus();
    }, []);

    // If no email provided, redirect to signup
    useEffect(() => {
        if (!email) {
            navigateTo('/signup');
        }
    }, [email, navigateTo]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setMessage('');

        if (otp?.length !== 6) {
            setError('Please enter a valid 6-digit OTP');
            return;
        }

        setIsSubmitting(true);

        try {
            const response = await authService.verifyOTP(email, otp);
            setMessage(response.message || 'Email verified successfully!');
            
            // Wait briefly to show success message, then redirect
            setTimeout(() => {
                navigateTo('/');
            }, 1500);
        } catch (err: any) {
            console.error('OTP verification error:', err);
            setError(err.message || 'Failed to verify OTP. Please try again.');
            setOtp('');
            otpInputRef.current?.focus();
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleResendOTP = async () => {
        if (!email) {
            setError('Email is required to resend OTP');
            return;
        }

        setIsResending(true);
        setError('');
        setMessage('');

        try {
            const response = await authService.resendOTP(email);
            setMessage('OTP sent successfully! Check your email.');
            setResendCooldown(60); // 60 second cooldown
            setOtp('');
            otpInputRef.current?.focus();
        } catch (err: any) {
            console.error('Resend OTP error:', err);
            setError(err.response?.data?.message || 'Failed to resend OTP. Please try again.');
        } finally {
            setIsResending(false);
        }
    };

    const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/\D/g, '').slice(0, 6);
        setOtp(value);
    };

    return (
        <section className="py-20 min-h-screen flex items-center justify-center">
            <div className="container mx-auto px-6">
                <div className="max-w-md mx-auto bg-nexus-dark/80 backdrop-blur-md p-8 rounded-lg shadow-[0_0_20px_rgba(239,68,68,0.2)] border border-nexus-blue/30">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-exo font-bold text-white mb-2">Verify Your Email</h1>
                        <p className="text-nexus-light text-sm">
                            Enter the 6-digit code we sent to <br />
                            <span className="text-nexus-blue font-semibold">{email}</span>
                        </p>
                    </div>

                    {error && (
                        <div className="bg-red-900/50 border border-red-500/50 text-red-200 px-4 py-3 rounded mb-6 text-sm">
                            {error}
                        </div>
                    )}

                    {message && (
                        <div className="bg-green-900/50 border border-green-500/50 text-green-200 px-4 py-3 rounded mb-6 text-sm">
                            {message}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="otp" className="block text-sm font-bold text-nexus-blue mb-3">
                                Verification Code
                            </label>
                            <input
                                ref={otpInputRef}
                                type="text"
                                id="otp"
                                value={otp}
                                onChange={handleOtpChange}
                                placeholder="000000"
                                maxLength={6}
                                className="w-full bg-nexus-gray border border-nexus-purple/30 rounded py-4 px-4 text-white text-center text-2xl tracking-widest placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-nexus-blue focus:border-transparent transition-all font-mono font-bold"
                                disabled={isSubmitting}
                            />
                            <p className="text-xs text-gray-400 mt-2">
                                Code expires in 10 minutes
                            </p>
                        </div>

                        <div className="pt-2">
                            <GamingButton
                                type="submit"
                                variant="primary"
                                className="w-full"
                                disabled={isSubmitting || otp.length !== 6}
                            >
                                {isSubmitting ? (
                                    <span className="flex items-center gap-2">
                                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Verifying...
                                    </span>
                                ) : 'Verify Email'}
                            </GamingButton>
                        </div>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-sm text-gray-400 mb-3">Didn't receive the code?</p>
                        <button
                            onClick={handleResendOTP}
                            disabled={isResending || resendCooldown > 0}
                            className={`text-nexus-blue font-semibold text-sm hover:text-white transition-colors ${
                                isResending || resendCooldown > 0 ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                        >
                            {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Code'}
                        </button>
                    </div>

                    <div className="mt-8 pt-6 border-t border-nexus-purple/20 text-center">
                        <p className="text-xs text-gray-500">
                            Wrong email?{' '}
                            <button
                                onClick={() => navigateTo('/signup')}
                                className="text-nexus-blue hover:text-white transition-colors font-semibold"
                            >
                                Sign up again
                            </button>
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default VerifyOTPPage;
