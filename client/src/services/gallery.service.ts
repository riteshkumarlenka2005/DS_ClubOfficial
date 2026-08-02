import api from './api';

export const galleryService = {
  // PUBLIC
  async getApproved() {
    const res = await api.get('/gallery');
    return res.data;
  },

  async getSubPhotos(parentId: string) {
    const res = await api.get(`/gallery/${parentId}/photos`);
    return res.data;
  },

  // MEMBER / ADMIN
  async getAll() {
    const res = await api.get('/gallery/manage/all');
    return res.data;
  },

  async upload(data: {
    title?: string;
    image_url: string;
    description?: string;
    event_id?: string;
    parent_id?: string;
    is_cover?: boolean;
  }) {
    const res = await api.post('/gallery', data);
    return res.data;
  },

  async uploadImage(file: File) {
    const formData = new FormData();
    formData.append('image', file);
    const res = await api.post('/gallery/upload-image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },

  async deleteItem(id: string) {
    const res = await api.delete(`/gallery/${id}`);
    return res.data;
  },

  // ADMIN
  async getPending() {
    const res = await api.get('/gallery/pending');
    return res.data;
  },

  async approve(id: string) {
    const res = await api.patch(`/gallery/${id}/approve`);
    return res.data;
  },

  async bulkApprove(ids: string[]) {
    const res = await api.patch('/gallery/bulk-approve', { ids });
    return res.data;
  },

  async reject(id: string) {
    const res = await api.patch(`/gallery/${id}/reject`);
    return res.data;
  },
};
