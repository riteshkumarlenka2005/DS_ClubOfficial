import { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware';
import { authorize } from '../middlewares/role.middleware';
import { uploadPDF } from '../utils/upload';
import * as ctrl from '../controllers/certificate.controller';

const router = Router();

// ── Student / Member ─────────────────────
router.get('/my', authenticate, ctrl.getMyCertificates);
router.get('/download/:certId', authenticate, ctrl.downloadCertificate);

// ── Admin ────────────────────────────────
router.post('/admin/upload', authenticate, authorize('admin'), uploadPDF.single('file'), ctrl.uploadCertificate);
router.post('/admin/generate', authenticate, authorize('admin'), ctrl.generateCertificate);
router.get('/admin/all', authenticate, authorize('admin'), ctrl.getAllCertificates);
router.delete('/admin/:certId', authenticate, authorize('admin'), ctrl.deleteCertificate);

export default router;
