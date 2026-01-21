import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import User from '../models/User.js';
import Wallet from '../models/Wallet.js';
import QR from '../models/QR.js';

/**
 * Generate JWT tokens
 */
const generateTokens = (userId) => {
    const accessToken = jwt.sign(
        { userId },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRE }
    );

    const refreshToken = jwt.sign(
        { userId },
        process.env.JWT_REFRESH_SECRET,
        { expiresIn: process.env.JWT_REFRESH_EXPIRE }
    );

    return { accessToken, refreshToken };
};

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
 * @route   POST /api/auth/register
 * @desc    Register a new user (citizen)
 * @access  Public
 */
export const register = async (req, res) => {
    try {
        const { name, email, phone, password } = req.body;

        // Validate input
        if (!name || !email || !phone || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide all required fields'
            });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ $or: [{ email }, { phone }] });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'User with this email or phone already exists'
            });
        }

        // Create user
        const user = await User.create({
            name,
            email,
            phone,
            password,
            role: 'user'
        });

        // Generate QR token
        const qrToken = generateQRToken(user._id);
        user.qrToken = qrToken;
        await user.save();

        // Create wallet
        await Wallet.create({
            userId: user._id,
            balance: 0
        });

        // Create QR code
        await QR.create({
            token: qrToken,
            userId: user._id,
            active: true
        });

        // Generate tokens
        const { accessToken, refreshToken } = generateTokens(user._id);

        // Save refresh token
        user.refreshToken = refreshToken;
        await user.save();

        res.status(201).json({
            success: true,
            message: 'Registration successful',
            data: {
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    phone: user.phone,
                    role: user.role,
                    qrToken: user.qrToken
                },
                accessToken,
                refreshToken
            }
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            success: false,
            message: 'Registration failed',
            error: error.message
        });
    }
};

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public
 */
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate input
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide email and password'
            });
        }

        // Find user with password
        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Check password
        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Check if user is active
        if (user.status !== 'active') {
            return res.status(403).json({
                success: false,
                message: `Account is ${user.status}. Please contact administrator.`
            });
        }

        // Generate tokens
        const { accessToken, refreshToken } = generateTokens(user._id);

        // Save refresh token
        user.refreshToken = refreshToken;
        await user.save();

        res.json({
            success: true,
            message: 'Login successful',
            data: {
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    phone: user.phone,
                    role: user.role,
                    qrToken: user.qrToken
                },
                accessToken,
                refreshToken
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Login failed',
            error: error.message
        });
    }
};

/**
 * @route   POST /api/auth/refresh
 * @desc    Refresh access token
 * @access  Public
 */
export const refreshToken = async (req, res) => {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            return res.status(400).json({
                success: false,
                message: 'Refresh token required'
            });
        }

        // Verify refresh token
        const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

        // Find user
        const user = await User.findById(decoded.userId).select('+refreshToken');
        if (!user || user.refreshToken !== refreshToken) {
            return res.status(401).json({
                success: false,
                message: 'Invalid refresh token'
            });
        }

        // Generate new tokens
        const tokens = generateTokens(user._id);

        // Update refresh token
        user.refreshToken = tokens.refreshToken;
        await user.save();

        res.json({
            success: true,
            message: 'Token refreshed',
            data: tokens
        });
    } catch (error) {
        res.status(401).json({
            success: false,
            message: 'Invalid or expired refresh token'
        });
    }
};

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user
 * @access  Private
 */
export const logout = async (req, res) => {
    try {
        // Clear refresh token
        req.user.refreshToken = null;
        await req.user.save();

        res.json({
            success: true,
            message: 'Logout successful'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Logout failed',
            error: error.message
        });
    }
};

/**
 * @route   GET /api/auth/me
 * @desc    Get current user
 * @access  Private
 */
export const getMe = async (req, res) => {
    try {
        // Get wallet
        const wallet = await Wallet.findOne({ userId: req.user._id });

        res.json({
            success: true,
            data: {
                user: req.user,
                wallet: wallet || null
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to get user data',
            error: error.message
        });
    }
};
