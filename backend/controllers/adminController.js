import mongoose from 'mongoose';
import crypto from 'crypto';
import User from '../models/User.js';
import Wallet from '../models/Wallet.js';
import Transaction from '../models/Transaction.js';
import EWaste from '../models/EWaste.js';
import QR from '../models/QR.js';

/**
 * Generate unique QR token
 */
const generateQRToken = (userId) => {
    const timestamp = Date.now();
    const random = crypto.randomBytes(16).toString('hex');
    const data = `${userId}-${timestamp}-${random}`;
    return crypto.createHmac('sha256', process.env.QR_SECRET)
        .update(data)
        .digest('hex');
};

/**
 * @route   POST /api/admin/users
 * @desc    Create new user (any role)
 * @access  Private (Admin only)
 */
export const createUser = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { name, email, phone, password, role } = req.body;

        // Validate input
        if (!name || !email || !phone || !password || !role) {
            await session.abortTransaction();
            return res.status(400).json({
                success: false,
                message: 'All fields are required'
            });
        }

        // Check if user exists
        const existingUser = await User.findOne({ $or: [{ email }, { phone }] });
        if (existingUser) {
            await session.abortTransaction();
            return res.status(400).json({
                success: false,
                message: 'User with this email or phone already exists'
            });
        }

        // Create user
        const user = await User.create([{
            name,
            email,
            phone,
            password,
            role,
            createdBy: req.user._id
        }], { session });

        // Create wallet for users only
        if (role === 'user') {
            const qrToken = generateQRToken(user[0]._id);
            user[0].qrToken = qrToken;
            await user[0].save({ session });

            await Wallet.create([{
                userId: user[0]._id,
                balance: 0
            }], { session });

            await QR.create([{
                token: qrToken,
                userId: user[0]._id,
                active: true
            }], { session });
        }

        await session.commitTransaction();

        res.status(201).json({
            success: true,
            message: 'User created successfully',
            data: user[0]
        });
    } catch (error) {
        await session.abortTransaction();
        console.error('Create user error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create user',
            error: error.message
        });
    } finally {
        session.endSession();
    }
};

/**
 * @route   GET /api/admin/users
 * @desc    Get all users with filters
 * @access  Private (Admin only)
 */
export const getUsers = async (req, res) => {
    try {
        const { page = 1, limit = 20, role, status, search } = req.query;

        const query = {};
        if (role) query.role = role;
        if (status) query.status = status;
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { phone: { $regex: search, $options: 'i' } }
            ];
        }

        const users = await User.find(query)
            .select('-password -refreshToken')
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await User.countDocuments(query);

        res.json({
            success: true,
            data: {
                users,
                pagination: {
                    total,
                    page: parseInt(page),
                    pages: Math.ceil(total / limit)
                }
            }
        });
    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get users',
            error: error.message
        });
    }
};

/**
 * @route   GET /api/admin/users/:id
 * @desc    Get user by ID with wallet and stats
 * @access  Private (Admin only)
 */
export const getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password -refreshToken');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Get wallet if user role
        let wallet = null;
        if (user.role === 'user') {
            wallet = await Wallet.findOne({ userId: user._id });
        }

        // Get transaction stats
        const transactionStats = await Transaction.aggregate([
            { $match: { userId: user._id } },
            {
                $group: {
                    _id: '$type',
                    count: { $sum: 1 },
                    total: { $sum: '$amount' }
                }
            }
        ]);

        res.json({
            success: true,
            data: {
                user,
                wallet,
                transactionStats
            }
        });
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get user',
            error: error.message
        });
    }
};

/**
 * @route   PATCH /api/admin/users/:id
 * @desc    Update user
 * @access  Private (Admin only)
 */
export const updateUser = async (req, res) => {
    try {
        const { name, email, phone, role, status } = req.body;

        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Update fields
        if (name) user.name = name;
        if (email) user.email = email;
        if (phone) user.phone = phone;
        if (role) user.role = role;
        if (status) user.status = status;

        await user.save();

        res.json({
            success: true,
            message: 'User updated successfully',
            data: user
        });
    } catch (error) {
        console.error('Update user error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update user',
            error: error.message
        });
    }
};

/**
 * @route   DELETE /api/admin/users/:id
 * @desc    Delete user
 * @access  Private (Admin only)
 */
export const deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Prevent deleting admin users
        if (user.role === 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Cannot delete admin users'
            });
        }

        await user.deleteOne();

        res.json({
            success: true,
            message: 'User deleted successfully'
        });
    } catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete user',
            error: error.message
        });
    }
};

/**
 * @route   POST /api/admin/wallets/:userId/freeze
 * @desc    Freeze/unfreeze wallet
 * @access  Private (Admin only)
 */
export const toggleFreezeWallet = async (req, res) => {
    try {
        const wallet = await Wallet.findOne({ userId: req.params.userId });

        if (!wallet) {
            return res.status(404).json({
                success: false,
                message: 'Wallet not found'
            });
        }

        wallet.frozen = !wallet.frozen;
        await wallet.save();

        res.json({
            success: true,
            message: `Wallet ${wallet.frozen ? 'frozen' : 'unfrozen'} successfully`,
            data: wallet
        });
    } catch (error) {
        console.error('Freeze wallet error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to freeze/unfreeze wallet',
            error: error.message
        });
    }
};

/**
 * @route   POST /api/admin/wallets/:userId/adjust
 * @desc    Manually adjust wallet balance
 * @access  Private (Admin only)
 */
export const adjustWallet = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { amount, type, description } = req.body;

        if (!amount || !type || !description) {
            await session.abortTransaction();
            return res.status(400).json({
                success: false,
                message: 'Amount, type, and description are required'
            });
        }

        const wallet = await Wallet.findOne({ userId: req.params.userId }).session(session);

        if (!wallet) {
            await session.abortTransaction();
            return res.status(404).json({
                success: false,
                message: 'Wallet not found'
            });
        }

        const balanceBefore = wallet.balance;

        if (type === 'credit') {
            await wallet.credit(amount);
        } else if (type === 'debit') {
            await wallet.debit(amount);
        } else {
            await session.abortTransaction();
            return res.status(400).json({
                success: false,
                message: 'Invalid type. Must be credit or debit'
            });
        }

        // Create transaction
        await Transaction.create([{
            walletId: wallet._id,
            userId: req.params.userId,
            type,
            amount,
            balanceBefore,
            balanceAfter: wallet.balance,
            performedBy: req.user._id,
            performedByRole: req.user.role,
            description,
            category: 'admin_adjustment'
        }], { session });

        await session.commitTransaction();

        res.json({
            success: true,
            message: 'Wallet adjusted successfully',
            data: wallet
        });
    } catch (error) {
        await session.abortTransaction();
        console.error('Adjust wallet error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to adjust wallet',
            error: error.message
        });
    } finally {
        session.endSession();
    }
};

/**
 * @route   GET /api/admin/dashboard
 * @desc    Get admin dashboard statistics
 * @access  Private (Admin only)
 */
export const getDashboard = async (req, res) => {
    try {
        // User counts by role
        const usersByRole = await User.aggregate([
            {
                $group: {
                    _id: '$role',
                    count: { $sum: 1 }
                }
            }
        ]);

        // Total wallets and balance
        const walletStats = await Wallet.aggregate([
            {
                $group: {
                    _id: null,
                    totalWallets: { $sum: 1 },
                    totalBalance: { $sum: '$balance' },
                    totalCredits: { $sum: '$totalCredits' },
                    totalDebits: { $sum: '$totalDebits' },
                    frozenWallets: {
                        $sum: { $cond: ['$frozen', 1, 0] }
                    }
                }
            }
        ]);

        // Transaction stats
        const transactionStats = await Transaction.aggregate([
            {
                $group: {
                    _id: '$type',
                    count: { $sum: 1 },
                    total: { $sum: '$amount' }
                }
            }
        ]);

        // E-waste stats
        const ewasteStats = await EWaste.aggregate([
            {
                $group: {
                    _id: null,
                    totalSubmissions: { $sum: 1 },
                    totalValue: { $sum: '$totalValue' },
                    totalQuantity: { $sum: '$quantity' }
                }
            }
        ]);

        // Recent transactions
        const recentTransactions = await Transaction.find()
            .populate('userId', 'name email')
            .populate('performedBy', 'name role')
            .sort({ createdAt: -1 })
            .limit(10);

        res.json({
            success: true,
            data: {
                usersByRole,
                walletStats: walletStats[0] || {},
                transactionStats,
                ewasteStats: ewasteStats[0] || {},
                recentTransactions
            }
        });
    } catch (error) {
        console.error('Dashboard error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get dashboard data',
            error: error.message
        });
    }
};

/**
 * @route   GET /api/admin/transactions
 * @desc    Get all transactions with filters
 * @access  Private (Admin only)
 */
export const getTransactions = async (req, res) => {
    try {
        const { page = 1, limit = 20, type, category, userId } = req.query;

        const query = {};
        if (type) query.type = type;
        if (category) query.category = category;
        if (userId) query.userId = userId;

        const transactions = await Transaction.find(query)
            .populate('userId', 'name email')
            .populate('performedBy', 'name role')
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await Transaction.countDocuments(query);

        res.json({
            success: true,
            data: {
                transactions,
                pagination: {
                    total,
                    page: parseInt(page),
                    pages: Math.ceil(total / limit)
                }
            }
        });
    } catch (error) {
        console.error('Get transactions error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get transactions',
            error: error.message
        });
    }
};
