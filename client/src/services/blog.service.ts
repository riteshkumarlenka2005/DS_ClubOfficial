import api from './api';

export const blogService = {
  // PUBLIC
  async getPublished(category?: string) {
    const params = category && category !== 'All' ? `?category=${category}` : '';
    const res = await api.get(`/blogs${params}`);
    return res.data;
  },

  async getBySlug(slug: string) {
    const res = await api.get(`/blogs/${slug}`);
    return res.data;
  },

  async getCategories() {
    const res = await api.get('/blogs/meta/categories');
    return res.data;
  },

  // MEMBER / ADMIN
  async getAll() {
    const res = await api.get('/blogs/manage/all');
    return res.data;
  },

  async create(data: {
    title: string;
    content: string;
    excerpt?: string;
    cover_image?: string;
    tags?: string[];
    video_url?: string;
    category?: string;
    duration?: string;
  }) {
    const res = await api.post('/blogs', data);
    return res.data;
  },

  async uploadCoverImage(file: File) {
    const formData = new FormData();
    formData.append('cover', file);
    const res = await api.post('/blogs/upload-cover', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },

  async uploadVideo(file: File) {
    const formData = new FormData();
    formData.append('video', file);
    const res = await api.post('/blogs/upload-video', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 120000, // 2 min for large videos
    });
    return res.data;
  },

  async update(id: string, data: Record<string, any>) {
    const res = await api.put(`/blogs/${id}`, data);
    return res.data;
  },

  async deleteBlog(id: string) {
    const res = await api.delete(`/blogs/${id}`);
    return res.data;
  },

  // ADMIN
  async publish(id: string) {
    const res = await api.patch(`/blogs/${id}/publish`);
    return res.data;
  },

  async unpublish(id: string) {
    const res = await api.patch(`/blogs/${id}/unpublish`);
    return res.data;
  },
};

