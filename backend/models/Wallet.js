import mongoose from 'mongoose';

const walletSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    balance: {
        type: Number,
        default: 0,
        min: [0, 'Balance cannot be negative'],
        set: v => Math.round(v * 100) / 100 // Round to 2 decimal places
    },
    frozen: {
        type: Boolean,
        default: false
    },
    totalCredits: {
        type: Number,
        default: 0,
        min: 0
    },
    totalDebits: {
        type: Number,
        default: 0,
        min: 0
    },
    lastTransactionAt: {
        type: Date,
        default: null
    }
}, {
    timestamps: true
});

// Index for faster queries
walletSchema.index({ userId: 1 });
walletSchema.index({ frozen: 1 });

// Virtual for transaction count
walletSchema.virtual('transactionCount', {
    ref: 'Transaction',
    localField: '_id',
    foreignField: 'walletId',
    count: true
});

// Method to check if wallet can be debited
walletSchema.methods.canDebit = function (amount) {
    if (this.frozen) {
        throw new Error('Wallet is frozen');
    }
    if (this.balance < amount) {
        throw new Error('Insufficient balance');
    }
    return true;
};

// Method to credit wallet
walletSchema.methods.credit = function (amount) {
    if (this.frozen) {
        throw new Error('Wallet is frozen');
    }
    this.balance += amount;
    this.totalCredits += amount;
    this.lastTransactionAt = new Date();
    return this.save();
};

// Method to debit wallet
walletSchema.methods.debit = function (amount) {
    this.canDebit(amount);
    this.balance -= amount;
    this.totalDebits += amount;
    this.lastTransactionAt = new Date();
    return this.save();
};

const Wallet = mongoose.model('Wallet', walletSchema);

export default Wallet;
