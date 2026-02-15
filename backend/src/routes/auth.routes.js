const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const authMiddleware = require('../middleware/auth.middleware');
const rateLimit = require('express-rate-limit');
const {
    validateRegister,
    validateLogin,
    validateForgotPassword,
    validateResetPassword,
    validateVerifyEmail,
    validateResendVerification
} = require('../middleware/validators');

// Rate limiting for auth routes to prevent brute-force attacks
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 20, // Limit each IP to 20 requests per window
    message: { message: 'Too many attempts. Please try again after 15 minutes.' },
    standardHeaders: true,
    legacyHeaders: false,
});

// Stricter limiter for password reset
const resetLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: { message: 'Too many password reset attempts. Please try again after 15 minutes.' },
    standardHeaders: true,
    legacyHeaders: false,
});

router.post('/register', authLimiter, validateRegister, authController.register);
router.post('/login', authLimiter, validateLogin, authController.login);
router.get('/me', authMiddleware.protect, authController.me);
router.post('/forgot-password', resetLimiter, validateForgotPassword, authController.forgotPassword);
router.post('/reset-password', resetLimiter, validateResetPassword, authController.resetPassword);
router.post('/verify-email', validateVerifyEmail, authController.verifyEmail);
router.post('/resend-verification', resetLimiter, validateResendVerification, authController.resendVerification);

module.exports = router;