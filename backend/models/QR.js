import mongoose from 'mongoose';

const qrSchema = new mongoose.Schema({
    token: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    active: {
        type: Boolean,
        default: true
    },
    lastScannedAt: {
        type: Date,
        default: null
    },
    lastScannedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    scanCount: {
        type: Number,
        default: 0
    },
    expiresAt: {
        type: Date,
        default: null // null means never expires
    }
}, {
    timestamps: true
});

// Index for faster lookups
qrSchema.index({ token: 1, active: 1 });
qrSchema.index({ userId: 1 });

// Method to verify QR code
qrSchema.methods.verify = function () {
    if (!this.active) {
        throw new Error('QR code is inactive');
    }
    if (this.expiresAt && this.expiresAt < new Date()) {
        throw new Error('QR code has expired');
    }
    return true;
};

// Method to record scan
qrSchema.methods.recordScan = function (scannedBy) {
    this.lastScannedAt = new Date();
    this.lastScannedBy = scannedBy;
    this.scanCount += 1;
    return this.save();
};

const QR = mongoose.model('QR', qrSchema);

export default QR;
