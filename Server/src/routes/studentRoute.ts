import express from 'express';
import {
  getAllStudents,
  createStudent,
  updateStudent,
  deleteStudent,
  getStudentById,
  verifyStudent,
} from '../controller/studentController';
import { verifyToken, requireRole, requireVerifiedIfStaff } from '../middleware/auth';

const router = express.Router();

// Public — signup flow (creates the User + Student record together)
router.post('/', createStudent);

router.get('/', verifyToken, getAllStudents);
router.get('/:id', verifyToken, getStudentById);
router.patch('/:id', verifyToken, updateStudent);
// Admin or Staff — separate from the self-edit route above. A Staff
// account must itself be verified before it can verify/delete students.
router.patch('/:id/verify', verifyToken, requireRole(['ADMIN', 'STAFF']), requireVerifiedIfStaff, verifyStudent);
router.delete('/:id', verifyToken, requireRole(['ADMIN', 'STAFF']), requireVerifiedIfStaff, deleteStudent);

export default router;
