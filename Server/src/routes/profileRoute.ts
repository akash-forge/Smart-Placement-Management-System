import express from 'express';
import { getUserProfile } from '../controller/profileController';
import { verifyToken } from '../middleware/auth';

const router = express.Router();

router.get('/:id', verifyToken, getUserProfile);

export default router;
