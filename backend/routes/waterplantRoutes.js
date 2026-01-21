import express from 'express';
import { scanQR, deductAmount, getStats } from '../controllers/waterplantController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication and waterplant role
router.use(authenticate);
router.use(authorize('waterplant', 'admin'));

router.post('/scan-qr', scanQR);
router.post('/deduct', deductAmount);
router.get('/stats', getStats);

export default router;
