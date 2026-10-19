import express from 'express';
import { applyToJob, getMyApplications, withdrawApplication } from '../controller/applicationController';
import { verifyToken, requireRole } from '../middleware/auth';

const router = express.Router();

// '/mine' is declared before '/:id' so it isn't captured as an id.
router.get('/mine', verifyToken, requireRole(['STUDENT']), getMyApplications);
router.post('/', verifyToken, requireRole(['STUDENT']), applyToJob);
router.delete('/:id', verifyToken, requireRole(['STUDENT']), withdrawApplication);

export default router;
