import api from './api';

export const eventHighlightService = {
  // PUBLIC
  async getByEventId(eventId: string) {
    const res = await api.get(`/event-highlights/event/${eventId}`);
    return res.data;
  },

  async getBySlug(slug: string) {
    const res = await api.get(`/event-highlights/slug/${slug}`);
    return res.data;
  },

  // ADMIN
  async getAll() {
    const res = await api.get('/event-highlights/admin/all');
    return res.data;
  },

  async create(data: {
    event_id: string;
    summary: string;
    stats: { label: string; value: string }[];
    photos?: string[];
    key_takeaways?: string[];
    testimonial_text?: string;
    testimonial_author?: string;
  }) {
    const res = await api.post('/event-highlights', data);
    return res.data;
  },

  async update(id: string, data: Record<string, any>) {
    const res = await api.put(`/event-highlights/${id}`, data);
    return res.data;
  },

  async deleteHighlight(id: string) {
    const res = await api.delete(`/event-highlights/${id}`);
    return res.data;
  },
};

