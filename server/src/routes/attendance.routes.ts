import { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware';
import { authorize } from '../middlewares/role.middleware';
import * as ctrl from '../controllers/attendance.controller';

const router = Router();

// ── Student / Member ─────────────────────
router.post('/scan', authenticate, ctrl.scanAttendance);
router.get('/my', authenticate, ctrl.getMyAttendance);
router.get('/summary', authenticate, ctrl.getMyAttendanceSummary);

// ── Admin ────────────────────────────────
router.post('/admin/generate-qr', authenticate, authorize('admin'), ctrl.generateEventQR);
router.get('/admin/event/:eventId', authenticate, authorize('admin'), ctrl.getEventAttendance);
router.get('/admin/event/:eventId/export', authenticate, authorize('admin'), ctrl.exportEventAttendanceCSV);
router.delete('/admin/:attendanceId', authenticate, authorize('admin'), ctrl.deleteAttendanceRecord);

export default router;
