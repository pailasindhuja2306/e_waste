import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
    walletId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Wallet',
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    type: {
        type: String,
        enum: ['credit', 'debit'],
        required: true
    },
    amount: {
        type: Number,
        required: true,
        min: [0.01, 'Amount must be greater than 0'],
        set: v => Math.round(v * 100) / 100
    },
    balanceBefore: {
        type: Number,
        required: true
    },
    balanceAfter: {
        type: Number,
        required: true
    },
    performedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    performedByRole: {
        type: String,
        enum: ['user', 'municipality', 'waterplant', 'admin'],
        required: true
    },
    description: {
        type: String,
        required: true,
        trim: true,
        maxlength: [500, 'Description cannot exceed 500 characters']
    },
    category: {
        type: String,
        enum: ['ewaste_credit', 'water_service', 'admin_adjustment', 'other'],
        default: 'other'
    },
    metadata: {
        ewasteType: String,
        quantity: Number,
        serviceType: String,
        notes: String
    },
    status: {
        type: String,
        enum: ['completed', 'failed', 'reversed'],
        default: 'completed'
    },
    ipAddress: String,
    userAgent: String
}, {
    timestamps: true
});

// Indexes for faster queries
transactionSchema.index({ walletId: 1, createdAt: -1 });
transactionSchema.index({ userId: 1, createdAt: -1 });
transactionSchema.index({ performedBy: 1, createdAt: -1 });
transactionSchema.index({ type: 1, createdAt: -1 });
transactionSchema.index({ category: 1, createdAt: -1 });

// Immutable - prevent updates after creation
transactionSchema.pre('save', function (next) {
    if (!this.isNew) {
        return next(new Error('Transactions cannot be modified'));
    }
    next();
});

const Transaction = mongoose.model('Transaction', transactionSchema);

export default Transaction;
