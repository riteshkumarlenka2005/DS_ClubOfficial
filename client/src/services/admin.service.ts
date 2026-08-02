import api from './api';

export const adminService = {
  // DASHBOARD
  async getStats() {
    const res = await api.get('/admin/stats');
    return res.data;
  },

  async getActivityLogs(limit = 100, offset = 0) {
    const res = await api.get(
      `/admin/activity-logs?limit=${limit}&offset=${offset}`
    );
    return res.data;
  },

  // USERS
  async getAllUsers() {
    const res = await api.get('/users');
    return res.data;
  },

  async updateRole(userId: string, role: string) {
    const res = await api.patch(`/users/${userId}/role`, { role });
    return res.data;
  },

  async toggleStatus(userId: string, is_active: boolean) {
    const res = await api.patch(`/users/${userId}/status`, { is_active });
    return res.data;
  },

  // PROJECTS
  async getAllProjects() {
    const res = await api.get('/admin/projects');
    return res.data;
  },

  async createProject(data: Record<string, any>) {
    const res = await api.post('/admin/projects', data);
    return res.data;
  },

  async updateProject(id: string, data: Record<string, any>) {
    const res = await api.put(`/admin/projects/${id}`, data);
    return res.data;
  },

  async uploadProjectImage(file: File) {
    const formData = new FormData();
    formData.append('image', file);
    const res = await api.post('/admin/projects/upload-image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },

  async publishProject(id: string) {
    const res = await api.patch(`/admin/projects/${id}/publish`);
    return res.data;
  },

  async unpublishProject(id: string) {
    const res = await api.patch(`/admin/projects/${id}/unpublish`);
    return res.data;
  },

  async deleteProject(id: string) {
    const res = await api.delete(`/admin/projects/${id}`);
    return res.data;
  },

  // ALUMNI
  async getAllAlumni() {
    const res = await api.get('/admin/alumni');
    return res.data;
  },

  async createAlumni(data: Record<string, any>) {
    const res = await api.post('/admin/alumni', data);
    return res.data;
  },

  async updateAlumni(id: string, data: Record<string, any>) {
    const res = await api.put(`/admin/alumni/${id}`, data);
    return res.data;
  },

  async toggleAlumniVisibility(id: string, is_visible: boolean) {
    const res = await api.patch(`/admin/alumni/${id}/visibility`, {
      is_visible,
    });
    return res.data;
  },

  async deleteAlumni(id: string) {
    const res = await api.delete(`/admin/alumni/${id}`);
    return res.data;
  },
};

