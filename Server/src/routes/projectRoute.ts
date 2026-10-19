import express from 'express';
import {
  getMyProjects,
  createProject,
  deleteProject,
} from '../controller/projectController';
import { verifyToken, requireRole } from '../middleware/auth';

const router = express.Router();

router.get('/', verifyToken, requireRole(['STUDENT']), getMyProjects);
router.post('/', verifyToken, requireRole(['STUDENT']), createProject);
router.delete('/:id', verifyToken, requireRole(['STUDENT']), deleteProject);

export default router;
