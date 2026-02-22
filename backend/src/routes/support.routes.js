const express = require('express');
const router = express.Router();
const supportController = require('../controllers/support.controller');
// Add auth middleware if needed for admin routes
// const { protect, restrictTo } = require('../middleware/auth');

router.post('/contact', supportController.sendContactMessage);

// Admin only routes could go here
// router.get('/messages', protect, restrictTo('admin'), supportController.getAllContactMessages);

module.exports = router;
