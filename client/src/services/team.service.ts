import api from './api';

export const teamService = {
  // PUBLIC
  async getVisible() {
    const res = await api.get('/team');
    return res.data;
  },

  // MEMBER / ADMIN — Self-service
  async getMyTeamProfile() {
    const res = await api.get('/team/me');
    return res.data;
  },

  async updateMyAvatar(file: File) {
    const formData = new FormData();
    formData.append('avatar', file);
    const res = await api.put('/team/me/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },

  // ADMIN
  async getAll() {
    const res = await api.get('/team/admin/all');
    return res.data;
  },

  async create(data: Record<string, any>) {
    const res = await api.post('/team', data);
    return res.data;
  },

  async update(id: string, data: Record<string, any>) {
    const res = await api.put(`/team/${id}`, data);
    return res.data;
  },

  async toggleVisibility(id: string, is_visible: boolean) {
    const res = await api.patch(`/team/${id}/visibility`, { is_visible });
    return res.data;
  },

  async deleteMember(id: string) {
    const res = await api.delete(`/team/${id}`);
    return res.data;
  },
};

