// FILE: frontend/src/services/certificate.service.ts

import api from './api';

export const certificateService = {
  // Student / Member
  getMyCertificates: () =>
    api.get('/certificates/my').then((r) => r.data),

  downloadCertificate: (certId: string) =>
    api.get(`/certificates/download/${certId}`).then((r) => r.data),

  // Admin
  uploadCertificate: (formData: FormData) =>
    api.post('/certificates/admin/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then((r) => r.data),

  generateCertificate: (data: { user_id: string; event_id: string }) =>
    api.post('/certificates/admin/generate', data).then((r) => r.data),

  getAllCertificates: (eventId?: string) => {
    const params = eventId ? `?event_id=${eventId}` : '';
    return api.get(`/certificates/admin/all${params}`).then((r) => r.data);
  },

  deleteCertificate: (certId: string) =>
    api.delete(`/certificates/admin/${certId}`).then((r) => r.data),
};