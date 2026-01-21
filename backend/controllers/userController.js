import Wallet from '../models/Wallet.js';
import Transaction from '../models/Transaction.js';
import EWaste from '../models/EWaste.js';
import QR from '../models/QR.js';
import QRCode from 'qrcode';

/**
 * @route   GET /api/user/wallet
 * @desc    Get user wallet details
 * @access  Private (User only)
 */
export const getWallet = async (req, res) => {
    try {
        const wallet = await Wallet.findOne({ userId: req.user._id });

        if (!wallet) {
            return res.status(404).json({
                success: false,
                message: 'Wallet not found'
            });
        }

        res.json({
            success: true,
            data: wallet
        });
    } catch (error) {
        console.error('Get wallet error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get wallet',
            error: error.message
        });
    }
};

/**
 * @route   GET /api/user/transactions
 * @desc    Get user transaction history
 * @access  Private (User only)
 */
export const getTransactions = async (req, res) => {
    try {
        const { page = 1, limit = 20, type } = req.query;

        const query = { userId: req.user._id };
        if (type) {
            query.type = type;
        }

        const transactions = await Transaction.find(query)
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

/**
 * @route   GET /api/user/ewaste
 * @desc    Get user e-waste submissions
 * @access  Private (User only)
 */
export const getEwaste = async (req, res) => {
    try {
        const { page = 1, limit = 20 } = req.query;

        const ewaste = await EWaste.find({ submittedBy: req.user._id })
            .populate('verifiedBy', 'name')
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await EWaste.countDocuments({ submittedBy: req.user._id });

        // Calculate totals
        const stats = await EWaste.aggregate([
            { $match: { submittedBy: req.user._id } },
            {
                $group: {
                    _id: null,
                    totalSubmissions: { $sum: 1 },
                    totalValue: { $sum: '$totalValue' },
                    totalQuantity: { $sum: '$quantity' }
                }
            }
        ]);

        res.json({
            success: true,
            data: {
                ewaste,
                stats: stats[0] || { totalSubmissions: 0, totalValue: 0, totalQuantity: 0 },
                pagination: {
                    total,
                    page: parseInt(page),
                    pages: Math.ceil(total / limit)
                }
            }
        });
    } catch (error) {
        console.error('Get e-waste error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get e-waste submissions',
            error: error.message
        });
    }
};

/**
 * @route   GET /api/user/qr
 * @desc    Get user QR code
 * @access  Private (User only)
 */
export const getQRCode = async (req, res) => {
    try {
        const qr = await QR.findOne({ userId: req.user._id });

        if (!qr) {
            return res.status(404).json({
                success: false,
                message: 'QR code not found'
            });
        }

        // Generate QR code image
        const qrImage = await QRCode.toDataURL(qr.token, {
            errorCorrectionLevel: 'H',
            type: 'image/png',
            width: 300,
            margin: 2
        });

        res.json({
            success: true,
            data: {
                token: qr.token,
                qrImage,
                active: qr.active,
                scanCount: qr.scanCount,
                lastScannedAt: qr.lastScannedAt
            }
        });
    } catch (error) {
        console.error('Get QR code error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get QR code',
            error: error.message
        });
    }
};

/**
 * @route   GET /api/user/dashboard
 * @desc    Get user dashboard data
 * @access  Private (User only)
 */
export const getDashboard = async (req, res) => {
    try {
        // Get wallet
        const wallet = await Wallet.findOne({ userId: req.user._id });

        // Get recent transactions
        const recentTransactions = await Transaction.find({ userId: req.user._id })
            .populate('performedBy', 'name role')
            .sort({ createdAt: -1 })
            .limit(5);

        // Get e-waste stats
        const ewasteStats = await EWaste.aggregate([
            { $match: { submittedBy: req.user._id } },
            {
                $group: {
                    _id: null,
                    totalSubmissions: { $sum: 1 },
                    totalValue: { $sum: '$totalValue' }
                }
            }
        ]);

        // Get QR code
        const qr = await QR.findOne({ userId: req.user._id });

        res.json({
            success: true,
            data: {
                wallet,
                recentTransactions,
                ewasteStats: ewasteStats[0] || { totalSubmissions: 0, totalValue: 0 },
                qr: qr ? {
                    token: qr.token,
                    scanCount: qr.scanCount,
                    lastScannedAt: qr.lastScannedAt
                } : null
            }
        });
    } catch (error) {
        console.error('Get dashboard error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get dashboard data',
            error: error.message
        });
    }
};
