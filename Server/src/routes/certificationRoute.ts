import express from 'express';
import {
  getMyCertifications,
  createCertification,
  deleteCertification,
} from '../controller/certificationController';
import { verifyToken, requireRole } from '../middleware/auth';

const router = express.Router();

router.get('/', verifyToken, requireRole(['STUDENT']), getMyCertifications);
router.post('/', verifyToken, requireRole(['STUDENT']), createCertification);
router.delete('/:id', verifyToken, requireRole(['STUDENT']), deleteCertification);

export default router;
