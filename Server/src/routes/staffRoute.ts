import express from 'express';
import {
  getAllStaffs,
  createStaff,
  updateStaff,
  deleteStaff,
  getStaffById,
  verifyStaff,
} from '../controller/staffController';
import { verifyToken, requireRole } from '../middleware/auth';

const router = express.Router();

// Public — signup flow (creates the User + Staff record together)
router.post('/', createStaff);

router.get('/', verifyToken, getAllStaffs);
router.get('/:id', verifyToken, getStaffById);
router.patch('/:id', verifyToken, updateStaff);
// Admin-only — separate from the self-edit route above.
router.patch('/:id/verify', verifyToken, requireRole(['ADMIN']), verifyStaff);
router.delete('/:id', verifyToken, requireRole(['ADMIN']), deleteStaff);

export default router;
