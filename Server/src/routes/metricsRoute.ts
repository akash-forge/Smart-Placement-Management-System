import { getMetrics } from "../controller/metricsController";
import express from "express";
import { verifyToken, requireRole } from '../middleware/auth';

const router = express.Router();

// Shown on the shared dashboard every role lands on — any authenticated
// user can see these aggregate counts (previously Admin/Staff only, which
// meant Company/Student always got a silent 403 here and the cards showed
// 0 for everything, indistinguishable from "the system is actually empty").
router.get('/', verifyToken, getMetrics);

export default router;
