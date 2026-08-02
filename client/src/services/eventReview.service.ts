import api from './api';

export interface EventReview {
  id: string;
  event_id: string;
  user_id: string;
  rating: number;
  review_text: string;
  is_approved: boolean;
  created_at: string;
  updated_at: string;
  user?: {
    id: string;
    full_name: string;
    avatar_url: string | null;
    student_id: string;
  };
  event?: {
    id: string;
    title: string;
    slug: string;
  };
}

export const eventReviewService = {
  // Get all approved reviews for an event along with aggregated stats
  async getByEventId(eventId: string) {
    const res = await api.get(`/event-reviews/event/${eventId}`);
    return res.data;
  },

  // Check if current logged in user can review an event
  async checkEligibility(eventId: string) {
    const res = await api.get(`/event-reviews/eligibility/${eventId}`);
    return res.data;
  },

  // Submit a new review
  async submitReview(eventId: string, data: { rating: number; review_text: string }) {
    const res = await api.post(`/event-reviews/${eventId}`, data);
    return res.data;
  },

  // --- ADMIN ROUTES ---
  
  // Get all reviews (approved and pending)
  async getAllAdmin() {
    const res = await api.get('/event-reviews/admin/all');
    return res.data;
  },

  // Approve or reject a review
  async updateStatus(reviewId: string, is_approved: boolean) {
    const res = await api.put(`/event-reviews/admin/${reviewId}`, { is_approved });
    return res.data;
  },

  // Delete a review
  async deleteReview(reviewId: string) {
    const res = await api.delete(`/event-reviews/admin/${reviewId}`);
    return res.data;
  }
};
