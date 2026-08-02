import api from './api';

export const membershipService = {
  /**
   * Get the count of approved members (public)
   */
  async getApprovedCount(): Promise<{ success: boolean; data: { count: number }; message: string }> {
    const res = await api.get('/membership/count');
    return res.data;
  },

  /**
   * Submit a membership application (public or authenticated)
   */
  async apply(data: {
    full_name: string;
    email: string;
    academic_year: number;
    interests: string;
  }) {
    const res = await api.post('/membership/apply', data);
    return res.data;
  },

  /**
   * Check application status by email
   */
  async checkStatus(email: string) {
    const res = await api.get('/membership/status', { params: { email } });
    return res.data;
  },

  /**
   * Get all applications (admin)
   */
  async getAll() {
    const res = await api.get('/membership');
    return res.data;
  },

  /**
   * Update application status (admin)
   */
  async updateStatus(id: string, status: 'approved' | 'rejected') {
    const res = await api.patch(`/membership/${id}/status`, { status });
    return res.data;
  },
};
