import express from 'express';
import {
  createCompany,
  deleteCompany,
  getAllCompanies,
  getCompanyById,
  updateCompany,
  verifyCompany,
} from '../controller/companyController';
import { verifyToken, requireRole } from '../middleware/auth';

const router = express.Router();

// Public — signup flow (creates the User + Company record together)
router.post('/', createCompany);

router.get('/', verifyToken, getAllCompanies);
router.get('/:id', verifyToken, getCompanyById);
router.patch('/:id', verifyToken, updateCompany);
// Admin-only — deliberately separate from the self-edit route above.
router.patch('/:id/verify', verifyToken, requireRole(['ADMIN']), verifyCompany);
router.delete('/:id', verifyToken, requireRole(['ADMIN', 'STAFF']), deleteCompany);

export default router;
