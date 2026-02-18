const mongoose = require('mongoose');

const visitSchema = new mongoose.Schema({
    path: {
        type: String,
        required: true,
        trim: true
    },
    ip: {
        type: String,
        required: true
    },
    userAgent: {
        type: String
    },
    referrer: {
        type: String
    },
    deviceType: {
        type: String,
        enum: ['mobile', 'tablet', 'desktop', 'other'],
        default: 'desktop'
    },
    browser: {
        type: String
    },
    sessionID: {
        type: String
    }
}, {
    timestamps: true
});

// Index for efficient querying by date and path
visitSchema.index({ createdAt: 1 });
visitSchema.index({ path: 1, createdAt: 1 });

module.exports = mongoose.model('Visit', visitSchema);
