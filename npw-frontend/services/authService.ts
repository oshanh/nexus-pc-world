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
  }
  ,
  logout: async () => {
    return client.post('/auth/logout', {});
  }
};
