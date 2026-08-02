// FILE: frontend/src/services/contribution.service.ts

import api from './api';

export const contributionService = {
  // Any user
  getActiveRequests: () =>
    api.get('/contributions/requests/active').then((r) => r.data),

  submitPayment: (request_id: string, payment_reference: string, amount?: number) =>
    api.post('/contributions/submit', { request_id, payment_reference, amount }).then((r) => r.data),

  getMyContributions: () =>
    api.get('/contributions/my').then((r) => r.data),

  // Admin
  createRequest: (formData: FormData) =>
    api.post('/contributions/admin/requests', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then((r) => r.data),

  closeRequest: (requestId: string) =>
    api.put(`/contributions/admin/requests/${requestId}/close`).then((r) => r.data),

  getAllContributions: (status?: string, requestId?: string) => {
    const params = new URLSearchParams();
    if (status) params.set('status', status);
    if (requestId) params.set('request_id', requestId);
    const qs = params.toString();
    return api.get(`/contributions/admin/all${qs ? `?${qs}` : ''}`).then((r) => r.data);
  },

  verifyContribution: (contributionId: string, action: 'verify' | 'reject') =>
    api.put(`/contributions/admin/${contributionId}/verify`, { action }).then((r) => r.data),

  getStats: () =>
    api.get('/contributions/admin/stats').then((r) => r.data),
};