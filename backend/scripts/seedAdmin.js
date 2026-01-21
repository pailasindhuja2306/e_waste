import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from '../models/User.js';

// Load environment variables
dotenv.config();

const seedAdmin = async () => {
    try {
        // Connect to database
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Check if admin already exists
        const existingAdmin = await User.findOne({ email: process.env.ADMIN_EMAIL });

        if (existingAdmin) {
            console.log('⚠️  Admin user already exists');
            console.log('Email:', existingAdmin.email);
            console.log('Role:', existingAdmin.role);
            process.exit(0);
        }

        // Create admin user
        const admin = await User.create({
            name: process.env.ADMIN_NAME || 'Super Administrator',
            email: process.env.ADMIN_EMAIL || 'admin@ewaste.gov',
            phone: process.env.ADMIN_PHONE || '+919876543210',
            password: process.env.ADMIN_PASSWORD || 'Admin@123456',
            role: 'admin',
            status: 'active'
        });

        console.log('');
        console.log('✅ ========================================');
        console.log('✅ Admin User Created Successfully!');
        console.log('✅ ========================================');
        console.log('📧 Email:', admin.email);
        console.log('🔑 Password:', process.env.ADMIN_PASSWORD || 'Admin@123456');
        console.log('👤 Name:', admin.name);
        console.log('📱 Phone:', admin.phone);
        console.log('🎭 Role:', admin.role);
        console.log('✅ ========================================');
        console.log('');
        console.log('⚠️  IMPORTANT: Change the default password after first login!');
        console.log('');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding admin:', error.message);
        process.exit(1);
    }
};

seedAdmin();
