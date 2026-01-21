import mongoose from 'mongoose';
import Wallet from '../models/Wallet.js';
import Transaction from '../models/Transaction.js';
import QR from '../models/QR.js';

/**
 * @route   POST /api/waterplant/scan-qr
 * @desc    Scan user QR code and get user details
 * @access  Private (Water Plant only)
 */
export const scanQR = async (req, res) => {
    try {
        const { qrToken } = req.body;

        if (!qrToken) {
            return res.status(400).json({
                success: false,
                message: 'QR token is required'
            });
        }

        // Find QR code
        const qr = await QR.findOne({ token: qrToken }).populate('userId', 'name email phone status');

        if (!qr) {
            return res.status(404).json({
                success: false,
                message: 'Invalid QR code'
            });
        }

        // Verify QR code
        try {
            qr.verify();
        } catch (error) {
            return res.status(400).json({
                success: false,
                message: error.message
            });
        }

        // Get wallet
        const wallet = await Wallet.findOne({ userId: qr.userId._id });

        // Record scan
        await qr.recordScan(req.user._id);

        res.json({
            success: true,
            data: {
                user: qr.userId,
                wallet,
                qr: {
                    scanCount: qr.scanCount,
                    lastScannedAt: qr.lastScannedAt
                }
            }
        });
    } catch (error) {
        console.error('QR scan error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to scan QR code',
            error: error.message
        });
    }
};

/**
 * @route   POST /api/waterplant/deduct
 * @desc    Deduct amount from user wallet for water services
 * @access  Private (Water Plant only)
 */
export const deductAmount = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { qrToken, amount, serviceType, description } = req.body;

        // Validate input
        if (!qrToken || !amount || !serviceType) {
            await session.abortTransaction();
            return res.status(400).json({
                success: false,
                message: 'QR token, amount, and service type are required'
            });
        }

        if (amount <= 0) {
            await session.abortTransaction();
            return res.status(400).json({
                success: false,
                message: 'Amount must be greater than 0'
            });
        }

        // Find QR code
        const qr = await QR.findOne({ token: qrToken }).session(session);
        if (!qr) {
            await session.abortTransaction();
            return res.status(404).json({
                success: false,
                message: 'Invalid QR code'
            });
        }

        // Verify QR code
        try {
            qr.verify();
        } catch (error) {
            await session.abortTransaction();
            return res.status(400).json({
                success: false,
                message: error.message
            });
        }

        // Get wallet
        const wallet = await Wallet.findOne({ userId: qr.userId }).session(session);
        if (!wallet) {
            await session.abortTransaction();
            return res.status(404).json({
                success: false,
                message: 'Wallet not found'
            });
        }

        // Check if wallet can be debited
        try {
            wallet.canDebit(amount);
        } catch (error) {
            await session.abortTransaction();
            return res.status(400).json({
                success: false,
                message: error.message
            });
        }

        const balanceBefore = wallet.balance;

        // Deduct from wallet
        await wallet.debit(amount);

        // Create transaction
        const transaction = await Transaction.create([{
            walletId: wallet._id,
            userId: qr.userId,
            type: 'debit',
            amount,
            balanceBefore,
            balanceAfter: wallet.balance,
            performedBy: req.user._id,
            performedByRole: req.user.role,
            description: description || `Water service: ${serviceType}`,
            category: 'water_service',
            metadata: {
                serviceType
            }
        }], { session });

        await session.commitTransaction();

        res.json({
            success: true,
            message: 'Amount deducted successfully',
            data: {
                transaction: transaction[0],
                wallet: {
                    balance: wallet.balance,
                    totalDebits: wallet.totalDebits
                }
            }
        });
    } catch (error) {
        await session.abortTransaction();
        console.error('Deduct amount error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to deduct amount',
            error: error.message
        });
    } finally {
        session.endSession();
    }
};

/**
 * @route   GET /api/waterplant/stats
 * @desc    Get water plant statistics
 * @access  Private (Water Plant only)
 */
export const getStats = async (req, res) => {
    try {
        // Total transactions by this officer
        const totalTransactions = await Transaction.countDocuments({
            performedBy: req.user._id,
            type: 'debit'
        });

        // Total amount collected
        const amountStats = await Transaction.aggregate([
            {
                $match: {
                    performedBy: req.user._id,
                    type: 'debit'
                }
            },
            {
                $group: {
                    _id: null,
                    totalAmount: { $sum: '$amount' }
                }
            }
        ]);

        // Recent transactions
        const recentTransactions = await Transaction.find({
            performedBy: req.user._id,
            type: 'debit'
        })
            .populate('userId', 'name email')
            .sort({ createdAt: -1 })
            .limit(10);

        // Transactions by service type
        const byServiceType = await Transaction.aggregate([
            {
                $match: {
                    performedBy: req.user._id,
                    type: 'debit',
                    category: 'water_service'
                }
            },
            {
                $group: {
                    _id: '$metadata.serviceType',
                    count: { $sum: 1 },
                    totalAmount: { $sum: '$amount' }
                }
            },
            { $sort: { totalAmount: -1 } }
        ]);

        res.json({
            success: true,
            data: {
                totalTransactions,
                totalAmount: amountStats[0]?.totalAmount || 0,
                byServiceType,
                recentTransactions
            }
        });
    } catch (error) {
        console.error('Stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get statistics',
            error: error.message
        });
    }
};
