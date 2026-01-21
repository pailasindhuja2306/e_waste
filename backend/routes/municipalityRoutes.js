import express from 'express';
import { scanQR, addCredit, getStats, getPricing } from '../controllers/municipalityController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication and municipality role
router.use(authenticate);
router.use(authorize('municipality', 'admin'));

router.post('/scan-qr', scanQR);
router.post('/add-credit', addCredit);
router.get('/stats', getStats);
router.get('/pricing', getPricing);

export default router;
