const mongoose = require('mongoose');

const movementSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    type: {
        type: String,
        enum: ['in', 'out'],
        required: true
    },
    quantity: {
        type: Number,
        required: true
    },
    reason: {
        type: String,
        enum: ['restock', 'sale', 'adjustment', 'return', 'cancellation', 'waste'],
        required: true
    },
    previousStock: {
        type: Number,
        required: true
    },
    currentStock: {
        type: Number,
        required: true
    },
    performedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    order: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order'
    },
    notes: String
}, {
    timestamps: true
});

module.exports = mongoose.model('Movement', movementSchema);
