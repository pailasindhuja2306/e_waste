import mongoose from 'mongoose';

const ewasteSchema = new mongoose.Schema({
    category: {
        type: String,
        required: [true, 'E-waste category is required'],
        enum: [
            'Mobile Phones',
            'Laptops',
            'Computers',
            'Tablets',
            'Televisions',
            'Refrigerators',
            'Washing Machines',
            'Air Conditioners',
            'Batteries',
            'Chargers',
            'Cables',
            'Printers',
            'Monitors',
            'Keyboards',
            'Mouse',
            'Other Electronics'
        ]
    },
    quantity: {
        type: Number,
        required: [true, 'Quantity is required'],
        min: [0.01, 'Quantity must be greater than 0']
    },
    unit: {
        type: String,
        enum: ['kg', 'piece', 'unit'],
        default: 'piece'
    },
    valuePerUnit: {
        type: Number,
        required: true,
        min: 0
    },
    totalValue: {
        type: Number,
        required: true,
        min: 0
    },
    submittedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    verifiedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    transactionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Transaction',
        required: true
    },
    status: {
        type: String,
        enum: ['verified', 'pending', 'rejected'],
        default: 'verified'
    },
    condition: {
        type: String,
        enum: ['working', 'non-working', 'partially-working'],
        default: 'non-working'
    },
    notes: {
        type: String,
        trim: true,
        maxlength: [500, 'Notes cannot exceed 500 characters']
    },
    images: [{
        type: String
    }]
}, {
    timestamps: true
});

// Indexes
ewasteSchema.index({ submittedBy: 1, createdAt: -1 });
ewasteSchema.index({ verifiedBy: 1, createdAt: -1 });
ewasteSchema.index({ category: 1, createdAt: -1 });
ewasteSchema.index({ status: 1 });

// Calculate total value before saving
ewasteSchema.pre('save', function (next) {
    if (this.isModified('quantity') || this.isModified('valuePerUnit')) {
        this.totalValue = Math.round(this.quantity * this.valuePerUnit * 100) / 100;
    }
    next();
});

const EWaste = mongoose.model('EWaste', ewasteSchema);

export default EWaste;
