const mongoose = require('mongoose');

const returnItemSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        min: 1
    },
    price: {
        type: Number,
        required: true
    }
});

const returnSchema = new mongoose.Schema({
    order: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    returnNumber: {
        type: String,
        unique: true
    },
    items: [returnItemSchema],
    reason: {
        type: String,
        required: true,
        enum: [
            'damaged_product',
            'wrong_item_delivered',
            'defective_not_working',
            'size_fit_issue',
            'no_longer_needed',
            'others'
        ]
    },
    reasonDetails: String,
    condition: {
        type: String,
        enum: ['new_unlatched', 'opened_in_good_condition', 'damaged_packaging', 'partially_used', 'damaged_product'],
        default: 'new_unlatched'
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'received', 'refund_processed', 'rejected'],
        default: 'pending'
    },
    refundAmount: {
        type: Number,
        required: true
    },
    refundStatus: {
        type: String,
        enum: ['not_applicable', 'pending', 'processed', 'failed'],
        default: 'pending'
    },
    images: [{
        url: String,
        public_id: String
    }],
    adminNotes: String,
    processedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    processedAt: Date
}, {
    timestamps: true
});

// Generate return number before saving
returnSchema.pre('save', async function (next) {
    if (!this.returnNumber) {
        const count = await mongoose.model('Return').countDocuments();
        this.returnNumber = `RET-${Date.now()}-${(count + 1).toString().padStart(4, '0')}`;
    }
    next();
});

module.exports = mongoose.model('Return', returnSchema);
