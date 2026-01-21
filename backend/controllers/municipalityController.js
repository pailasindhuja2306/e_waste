import mongoose from 'mongoose';
import Wallet from '../models/Wallet.js';
import Transaction from '../models/Transaction.js';
import EWaste from '../models/EWaste.js';
import QR from '../models/QR.js';
import User from '../models/User.js';

/**
 * E-waste pricing configuration
 */
const EWASTE_PRICING = {
    'Mobile Phones': { value: 50, unit: 'piece' },
    'Laptops': { value: 200, unit: 'piece' },
    'Computers': { value: 150, unit: 'piece' },
    'Tablets': { value: 80, unit: 'piece' },
    'Televisions': { value: 100, unit: 'piece' },
    'Refrigerators': { value: 300, unit: 'piece' },
    'Washing Machines': { value: 250, unit: 'piece' },
    'Air Conditioners': { value: 350, unit: 'piece' },
    'Batteries': { value: 10, unit: 'kg' },
    'Chargers': { value: 5, unit: 'piece' },
    'Cables': { value: 2, unit: 'kg' },
    'Printers': { value: 75, unit: 'piece' },
    'Monitors': { value: 60, unit: 'piece' },
    'Keyboards': { value: 15, unit: 'piece' },
    'Mouse': { value: 10, unit: 'piece' },
    'Other Electronics': { value: 20, unit: 'kg' }
};

/**
 * @route   POST /api/municipality/scan-qr
 * @desc    Scan user QR code and get user details
 * @access  Private (Municipality only)
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
 * @route   POST /api/municipality/add-credit
 * @desc    Add credit to user wallet based on verification
 * @access  Private (Municipality only)
 */
export const addCredit = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { qrToken, amount, notes } = req.body;

        // Validate input
        if (!qrToken || !amount) {
            await session.abortTransaction();
            return res.status(400).json({
                success: false,
                message: 'QR token and amount are required'
            });
        }

        // Validate amount (must be positive number)
        const creditAmount = parseFloat(amount);
        if (isNaN(creditAmount) || creditAmount <= 0) {
            await session.abortTransaction();
            return res.status(400).json({
                success: false,
                message: 'Amount must be a positive number'
            });
        }

        // Optional: Set maximum limit
        if (creditAmount > 1000) {
            await session.abortTransaction();
            return res.status(400).json({
                success: false,
                message: 'Amount cannot exceed ₹1000'
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

        const balanceBefore = wallet.balance;

        // Add credit to wallet
        await wallet.credit(creditAmount);

        // Create transaction
        const transaction = await Transaction.create([{
            walletId: wallet._id,
            userId: qr.userId,
            type: 'credit',
            amount: creditAmount,
            balanceBefore,
            balanceAfter: wallet.balance,
            performedBy: req.user._id,
            performedByRole: req.user.role,
            description: `E-waste verification credit: ₹${creditAmount}`,
            category: 'ewaste_credit',
            metadata: {
                notes: notes || `Verified e-waste submission - ₹${creditAmount}`
            }
        }], { session });

        // Create e-waste record
        const ewaste = await EWaste.create([{
            category: 'Verified E-Waste',
            quantity: 1,
            unit: 'verification',
            valuePerUnit: creditAmount,
            totalValue: creditAmount,
            submittedBy: qr.userId,
            verifiedBy: req.user._id,
            transactionId: transaction[0]._id,
            condition: 'verified',
            notes: notes || `Municipality verification - ₹${creditAmount} credit`
        }], { session });

        await session.commitTransaction();

        res.json({
            success: true,
            message: 'Credit added successfully',
            data: {
                transaction: transaction[0],
                ewaste: ewaste[0],
                wallet: {
                    balance: wallet.balance,
                    totalCredits: wallet.totalCredits
                }
            }
        });
    } catch (error) {
        await session.abortTransaction();
        console.error('Add credit error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to add credit',
            error: error.message
        });
    } finally {
        session.endSession();
    }
};

/**
 * @route   GET /api/municipality/stats
 * @desc    Get municipality statistics
 * @access  Private (Municipality only)
 */
export const getStats = async (req, res) => {
    try {
        // Total e-waste collected by this officer
        const totalEwaste = await EWaste.countDocuments({ verifiedBy: req.user._id });

        // Total value added
        const valueStats = await EWaste.aggregate([
            { $match: { verifiedBy: req.user._id } },
            {
                $group: {
                    _id: null,
                    totalValue: { $sum: '$totalValue' },
                    totalQuantity: { $sum: '$quantity' }
                }
            }
        ]);

        // E-waste by category
        const byCategory = await EWaste.aggregate([
            { $match: { verifiedBy: req.user._id } },
            {
                $group: {
                    _id: '$category',
                    count: { $sum: 1 },
                    totalQuantity: { $sum: '$quantity' },
                    totalValue: { $sum: '$totalValue' }
                }
            },
            { $sort: { totalValue: -1 } }
        ]);

        // Recent transactions
        const recentTransactions = await Transaction.find({
            performedBy: req.user._id,
            type: 'credit'
        })
            .populate('userId', 'name email')
            .sort({ createdAt: -1 })
            .limit(10);

        res.json({
            success: true,
            data: {
                totalEwaste,
                totalValue: valueStats[0]?.totalValue || 0,
                totalQuantity: valueStats[0]?.totalQuantity || 0,
                byCategory,
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

/**
 * @route   GET /api/municipality/pricing
 * @desc    Get e-waste pricing list
 * @access  Private (Municipality only)
 */
export const getPricing = async (req, res) => {
    try {
        const pricing = Object.entries(EWASTE_PRICING).map(([category, data]) => ({
            category,
            value: data.value,
            unit: data.unit
        }));

        res.json({
            success: true,
            data: pricing
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to get pricing',
            error: error.message
        });
    }
};
