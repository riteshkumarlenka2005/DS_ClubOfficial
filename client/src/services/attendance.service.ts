// FILE: frontend/src/services/attendance.service.ts

import api from './api';

export const attendanceService = {
  // Student / Member
  scanQR: (token: string) =>
    api.post('/attendance/scan', { token }).then((r) => r.data),

  getMyAttendance: () =>
    api.get('/attendance/my').then((r) => r.data),

  getMySummary: () =>
    api.get('/attendance/summary').then((r) => r.data),

  // Admin
  generateQR: (event_id: string, expires_in_minutes: number = 60) =>
    api.post('/attendance/admin/generate-qr', { event_id, expires_in_minutes }).then((r) => r.data),

  getEventAttendance: (eventId: string) =>
    api.get(`/attendance/admin/event/${eventId}`).then((r) => r.data),

  exportCSV: (eventId: string) =>
    api.get(`/attendance/admin/event/${eventId}/export`, { responseType: 'blob' }).then((r) => r.data),

  deleteRecord: (attendanceId: string) =>
    api.delete(`/attendance/admin/${attendanceId}`).then((r) => r.data),
};