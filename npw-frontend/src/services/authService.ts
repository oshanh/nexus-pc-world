import { client } from '../api/client';

export const authService = {
  signup: async (username: string, email: string, password: string) => {
    return client.post('/auth/signup', { username, email, password });
  },
  login: async (email: string, password: string) => {
    return client.post('/auth/login', { email, password });
  },
  me: async () => {
    return client.get('/auth/me');
  },
  logout: async () => {
    return client.post('/auth/logout', {});
  },
  verifyOTP: async (email: string, otp: string) => {
    return client.post('/auth/verify-otp', { email, otp });
  },
  resendOTP: async (email: string) => {
    return client.post('/auth/resend-otp', { email });
  },
  forgotPassword: async (email: string) => {
    return client.post('/auth/forgot-password', { email });
  },
  resetPassword: async (token: string, password: string) => {
    return client.post(`/auth/reset-password/${token}`, { password });
  }
};
