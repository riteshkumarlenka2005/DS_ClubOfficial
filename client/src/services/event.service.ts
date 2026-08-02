import api from './api';

export const eventService = {
  // PUBLIC
  async getPublished() {
    const res = await api.get('/events');
    return res.data;
  },

  async getBySlug(slug: string) {
    const res = await api.get(`/events/${slug}`);
    return res.data;
  },

  // AUTHENTICATED
  async register(eventId: string) {
    const res = await api.post(`/events/${eventId}/register`);
    return res.data;
  },

  async cancelRegistration(eventId: string) {
    const res = await api.delete(`/events/${eventId}/register`);
    return res.data;
  },

  async getMyRegistrations() {
    const res = await api.get('/events/user/my-registrations');
    return res.data;
  },

  // MEMBER / ADMIN
  async getAll() {
    const res = await api.get('/events/manage/all');
    return res.data;
  },

  async create(data: {
    title: string;
    description: string;
    short_description?: string;
    event_date: string;
    end_date?: string;
    venue?: string;
    cover_image?: string;
    max_participants?: number;
  }) {
    const res = await api.post('/events', data);
    return res.data;
  },

  async uploadCoverImage(file: File) {
    const formData = new FormData();
    formData.append('cover', file);
    const res = await api.post('/events/upload-cover', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },

  async update(id: string, data: Record<string, any>) {
    const res = await api.put(`/events/${id}`, data);
    return res.data;
  },

  async getRegistrations(eventId: string) {
    const res = await api.get(`/events/${eventId}/registrations`);
    return res.data;
  },

  // ADMIN
  async publish(id: string) {
    const res = await api.patch(`/events/${id}/publish`);
    return res.data;
  },

  async unpublish(id: string) {
    const res = await api.patch(`/events/${id}/unpublish`);
    return res.data;
  },

  async cancel(id: string) {
    const res = await api.patch(`/events/${id}/cancel`);
    return res.data;
  },

  async deleteEvent(id: string) {
    const res = await api.delete(`/events/${id}`);
    return res.data;
  },
};

