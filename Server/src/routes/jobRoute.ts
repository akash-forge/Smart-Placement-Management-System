import express from 'express';
import { deleteJob, getAllJobs, getJobById, postNewJobs, updateJob } from '../controller/jobController';
import { verifyToken, requireRole } from '../middleware/auth';

const router = express.Router();

router.get('/', verifyToken, getAllJobs);
router.get('/:id', verifyToken, getJobById);
router.post('/', verifyToken, requireRole(['COMPANY', 'STAFF', 'ADMIN']), postNewJobs);
router.patch('/:id', verifyToken, requireRole(['COMPANY', 'STAFF', 'ADMIN']), updateJob);
router.delete('/:id', verifyToken, requireRole(['COMPANY', 'STAFF', 'ADMIN']), deleteJob);

export default router;
