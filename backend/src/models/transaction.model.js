const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    order: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order'
    },
    transactionNumber: {
        type: String,
        unique: true
    },
    type: {
        type: String,
        enum: ['payment', 'refund', 'payout', 'adjustment'],
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    currency: {
        type: String,
        default: 'INR'
    },
    paymentGateway: {
        type: String,
        required: true,
        enum: ['razorpay', 'stripe', 'paypal', 'cod', 'wallet', 'manual']
    },
    gatewayTransactionId: {
        type: String,
        required: function () { return this.paymentGateway !== 'cod' && this.paymentGateway !== 'manual'; }
    },
    status: {
        type: String,
        enum: ['pending', 'success', 'failed', 'reversed', 'captured'],
        default: 'pending'
    },
    metadata: {
        type: Map,
        of: String
    },
    description: String,
    processedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Generate transaction number before saving
transactionSchema.pre('save', async function (next) {
    if (!this.transactionNumber) {
        const count = await mongoose.model('Transaction').countDocuments();
        this.transactionNumber = `TXN-${Date.now()}-${(count + 1).toString().padStart(4, '0')}`;
    }
    next();
});

module.exports = mongoose.model('Transaction', transactionSchema);
