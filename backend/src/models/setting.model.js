const mongoose = require('mongoose');

const settingSchema = new mongoose.Schema({
  storeName: {
    type: String,
    default: 'My E-Commerce Store'
  },
  storeEmail: {
    type: String,
    default: 'store@example.com'
  },
  storePhone: {
    type: String,
    default: '+1 123 456 7890'
  },
  storeAddress: {
    type: String,
    default: '123 Main St, City, Country'
  },
  currency: {
    type: String,
    default: 'INR',
    enum: ['INR', 'USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD']
  },
  taxRate: {
    type: Number,
    default: 5,
    min: 0,
    max: 100
  },
  shippingFee: {
    type: Number,
    default: 10,
    min: 0
  },
  freeShippingThreshold: {
    type: Number,
    default: 100,
    min: 0
  },
  features: {
    reviews: {
      type: Boolean,
      default: true
    },
    wishlist: {
      type: Boolean,
      default: true
    },
    recommendations: {
      type: Boolean,
      default: true
    },
    newsletter: {
      type: Boolean,
      default: true
    }
  },
  appearance: {
    theme: {
      type: String,
      default: 'light',
      enum: ['light', 'dark', 'auto']
    },
    primaryColor: {
      type: String,
      default: '#3498db'
    },
    secondaryColor: {
      type: String,
      default: '#2ecc71'
    },
    logo: {
      type: String,
      default: '/images/logo.png'
    }
  },
  socialLinks: {
    facebook: {
      type: String,
      default: ''
    },
    twitter: {
      type: String,
      default: ''
    },
    instagram: {
      type: String,
      default: ''
    },
    youtube: {
      type: String,
      default: ''
    },
    pinterest: {
      type: String,
      default: ''
    }
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Setting', settingSchema);