import api from './api';

export interface AuthUser {
  id: string;
  email: string;
  full_name: string;
  avatar_url: string | null;
  role: 'student' | 'member' | 'admin';
  bio?: string;
  department?: string;
  batch_year?: number;
  github_url?: string;
  linkedin_url?: string;
  portfolio_url?: string;
  created_at?: string;
}

export const authService = {
  async googleLogin(idToken: string) {
    const response = await api.post('/auth/google', { idToken });
    return response.data;
  },

  async getMe() {
    const response = await api.get('/auth/me');
    return response.data;
  },

  async logout() {
    const response = await api.post('/auth/logout');
    return response.data;
  },
};

