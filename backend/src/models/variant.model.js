const mongoose = require('mongoose');

const variantSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    type: {
        type: String,
        enum: ['Color', 'Size', 'Custom'],
        default: 'Custom'
    },
    values: [{
        label: { type: String, required: true, trim: true },
        value: { type: String, required: true, trim: true }
    }],
    status: {
        type: String,
        enum: ['Global', 'Disabled'],
        default: 'Global'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Variant', variantSchema);
