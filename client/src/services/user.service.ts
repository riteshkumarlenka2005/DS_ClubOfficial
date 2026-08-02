import api from './api';

export const userService = {
  async getProfile() {
    const res = await api.get('/users/profile');
    return res.data;
  },

  async updateProfile(data: {
    full_name?: string;
    bio?: string;
    department?: string;
    batch_year?: number;
    github_url?: string;
    linkedin_url?: string;
  }) {
    const res = await api.put('/users/profile', data);
    return res.data;
  },
};

