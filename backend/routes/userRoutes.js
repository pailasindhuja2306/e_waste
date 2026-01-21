import express from 'express';
import { getWallet, getTransactions, getEwaste, getQRCode, getDashboard } from '../controllers/userController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication and user role
router.use(authenticate);
router.use(authorize('user'));

router.get('/dashboard', getDashboard);
router.get('/wallet', getWallet);
router.get('/transactions', getTransactions);
router.get('/ewaste', getEwaste);
router.get('/qr', getQRCode);

export default router;
