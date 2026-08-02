import api from './api';

export const alumniService = {
  async getVisible() {
    const res = await api.get('/alumni');
    return res.data;
  },
};

