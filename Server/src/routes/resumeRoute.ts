import express from 'express';
import { getMyResume, uploadResume, deleteMyResume } from '../controller/resumeController';
import { verifyToken, requireRole } from '../middleware/auth';

const router = express.Router();

router.get('/', verifyToken, requireRole(['STUDENT']), getMyResume);
router.post('/', verifyToken, requireRole(['STUDENT']), uploadResume);
router.delete('/', verifyToken, requireRole(['STUDENT']), deleteMyResume);

export default router;
