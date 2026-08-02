import api from './api';

export const projectService = {
  async getPublished() {
    const res = await api.get('/projects');
    return res.data;
  },

  async getBySlug(slug: string) {
    const res = await api.get(`/projects/${slug}`);
    return res.data;
  },
};

