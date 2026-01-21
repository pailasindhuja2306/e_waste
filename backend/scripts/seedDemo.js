import dotenv from 'dotenv';
import mongoose from 'mongoose';
import crypto from 'crypto';
import User from '../models/User.js';
import Wallet from '../models/Wallet.js';
import QR from '../models/QR.js';

// Load environment variables
dotenv.config();

const generateQRToken = (userId) => {
    const timestamp = Date.now();
    const random = crypto.randomBytes(16).toString('hex');
    const data = `${userId}-${timestamp}-${random}`;
    return crypto.createHmac('sha256', process.env.QR_SECRET || 'ewaste-qr-secret-2026-change-in-production')
        .update(data)
        .digest('hex');
};

const seedDemo = async () => {
    try {
        // Connect to database
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Cleanup existing demo users to avoid duplicates
        const demoEmails = ['muni@ewaste.gov', 'user@ewaste.gov', 'wp@ewaste.gov'];
        await User.deleteMany({ email: { $in: demoEmails } });
        console.log('🧹 Cleaned up existing demo users');

        // 1. Create Municipality Officer
        const muni = await User.create({
            name: 'Municipality Officer',
            email: 'municipality@ewaste.gov',
            phone: '+919000000001',
            password: 'Pass@12345678',
            role: 'municipality',
            status: 'active'
        });
        await Wallet.create({ userId: muni._id, balance: 0 });
        console.log('✅ Municipality Officer Created');

        // 2. Create Water Plant Officer
        const wp = await User.create({
            name: 'WP Officer',
            email: 'wp@ewaste.gov',
            phone: '+919000000002',
            password: 'Pass@12345678',
            role: 'waterplant',
            status: 'active'
        });
        await Wallet.create({ userId: wp._id, balance: 0 });
        console.log('✅ Water Plant Officer Created');

        // 3. Create Regular User (Citizen) with 20 Rs
        const user = await User.create({
            name: 'Demo Citizen',
            email: 'user@ewaste.gov',
            phone: '+919000000003',
            password: 'Pass@12345678',
            role: 'user',
            status: 'active'
        });

        // Generate QR for user
        const qrToken = generateQRToken(user._id);
        user.qrToken = qrToken;
        await user.save();

        await QR.create({
            token: qrToken,
            userId: user._id,
            active: true
        });

        // Create wallet with 20 Rs balance
        await Wallet.create({
            userId: user._id,
            balance: 20,
            totalCredits: 20
        });
        console.log('✅ Demo Citizen Created with ₹20 balance');

        console.log('');
        console.log('🚀 DEMO DATA SEEDED SUCCESSFULLY!');
        console.log('========================================');
        console.log('🏙️  Municipality: muni@ewaste.gov / Pass@12345678');
        console.log('💧 Water Plant:  wp@ewaste.gov   / Pass@12345678');
        console.log('👤 Citizen:      user@ewaste.gov / Pass@12345678 (₹20)');
        console.log('========================================');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding demo data:', error.message);
        process.exit(1);
    }
};

seedDemo();
