import express from 'express';
import {
    createUser,
    getUsers,
    getUserById,
    updateUser,
    deleteUser,
    toggleFreezeWallet,
    adjustWallet,
    getDashboard,
    getTransactions
} from '../controllers/adminController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication and admin role
router.use(authenticate);
router.use(authorize('admin'));

// Dashboard
router.get('/dashboard', getDashboard);

// User management
router.post('/users', createUser);
router.get('/users', getUsers);
router.get('/users/:id', getUserById);
router.patch('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);

// Wallet management
router.post('/wallets/:userId/freeze', toggleFreezeWallet);
router.post('/wallets/:userId/adjust', adjustWallet);

// Transactions
router.get('/transactions', getTransactions);

export default router;
