const { body, validationResult } = require('express-validator');

/**
 * Middleware that checks for validation errors and returns 400 if any exist.
 * Place after express-validator chain in routes.
 */
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            message: 'Validation failed',
            errors: errors.array().map(e => ({ field: e.path, message: e.msg }))
        });
    }
    next();
};

// ─── Auth Validators ────────────────────────────────────────────────

const validateRegister = [
    body('name')
        .trim()
        .notEmpty().withMessage('Name is required')
        .isLength({ min: 2, max: 50 }).withMessage('Name must be 2-50 characters'),
    body('email')
        .trim()
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Invalid email format')
        .normalizeEmail(),
    body('password')
        .notEmpty().withMessage('Password is required')
        .isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    handleValidationErrors
];

const validateLogin = [
    body('email')
        .trim()
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Invalid email format')
        .normalizeEmail(),
    body('password')
        .notEmpty().withMessage('Password is required'),
    handleValidationErrors
];

const validateForgotPassword = [
    body('email')
        .trim()
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Invalid email format')
        .normalizeEmail(),
    handleValidationErrors
];

const validateResetPassword = [
    body('token')
        .notEmpty().withMessage('Token is required'),
    body('password')
        .notEmpty().withMessage('Password is required')
        .isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    handleValidationErrors
];

const validateVerifyEmail = [
    body('token')
        .notEmpty().withMessage('Verification token is required'),
    handleValidationErrors
];

const validateResendVerification = [
    body('email')
        .trim()
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Invalid email format')
        .normalizeEmail(),
    handleValidationErrors
];

// ─── Order Validators ───────────────────────────────────────────────

const validateCreateOrder = [
    body('items')
        .isArray({ min: 1 }).withMessage('Order must contain at least one item'),
    body('items.*.product')
        .notEmpty().withMessage('Product ID is required for each item'),
    body('items.*.quantity')
        .isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
    body('total')
        .isFloat({ min: 0 }).withMessage('Total must be a positive number'),
    body('shippingAddress')
        .notEmpty().withMessage('Shipping address is required'),
    body('paymentMethod')
        .notEmpty().withMessage('Payment method is required')
        .isIn(['cod', 'online', 'payu', 'cash_on_delivery']).withMessage('Invalid payment method'),
    handleValidationErrors
];

const validateUpdateOrderStatus = [
    body('status')
        .notEmpty().withMessage('Status is required')
        .isIn(['pending', 'processing', 'shipped', 'delivered', 'cancelled'])
        .withMessage('Invalid status'),
    handleValidationErrors
];

// ─── Product Validators ─────────────────────────────────────────────

const validateCreateProduct = [
    body('title')
        .trim()
        .notEmpty().withMessage('Product title is required')
        .isLength({ min: 2, max: 200 }).withMessage('Title must be 2-200 characters'),
    body('price')
        .isFloat({ min: 0 }).withMessage('Price must be a positive number'),
    body('category')
        .trim()
        .notEmpty().withMessage('Category is required'),
    body('stock')
        .optional()
        .isInt({ min: 0 }).withMessage('Stock must be a non-negative integer'),
    body('description')
        .optional()
        .trim()
        .isLength({ max: 5000 }).withMessage('Description must be under 5000 characters'),
    handleValidationErrors
];

const validateUpdateProduct = [
    body('title')
        .optional()
        .trim()
        .isLength({ min: 2, max: 200 }).withMessage('Title must be 2-200 characters'),
    body('price')
        .optional()
        .isFloat({ min: 0 }).withMessage('Price must be a positive number'),
    body('stock')
        .optional()
        .isInt({ min: 0 }).withMessage('Stock must be a non-negative integer'),
    body('description')
        .optional()
        .trim()
        .isLength({ max: 5000 }).withMessage('Description must be under 5000 characters'),
    handleValidationErrors
];

// ─── User Validators ────────────────────────────────────────────────

const validateUpdateProfile = [
    body('name')
        .optional()
        .trim()
        .isLength({ min: 2, max: 50 }).withMessage('Name must be 2-50 characters'),
    body('email')
        .optional()
        .trim()
        .isEmail().withMessage('Invalid email format')
        .normalizeEmail(),
    body('phone')
        .optional()
        .trim()
        .isLength({ max: 20 }).withMessage('Phone number too long'),
    handleValidationErrors
];

const validateChangePassword = [
    body('currentPassword')
        .notEmpty().withMessage('Current password is required'),
    body('newPassword')
        .notEmpty().withMessage('New password is required')
        .isLength({ min: 6 }).withMessage('New password must be at least 6 characters'),
    handleValidationErrors
];

const validateAddAddress = [
    body('fullName')
        .trim()
        .notEmpty().withMessage('Full name is required'),
    body('address')
        .trim()
        .notEmpty().withMessage('Address is required'),
    body('city')
        .trim()
        .notEmpty().withMessage('City is required'),
    body('state')
        .trim()
        .notEmpty().withMessage('State is required'),
    body('zipCode')
        .trim()
        .notEmpty().withMessage('Zip code is required'),
    body('country')
        .trim()
        .notEmpty().withMessage('Country is required'),
    body('type')
        .optional()
        .isIn(['home', 'work', 'other']).withMessage('Address type must be home, work, or other'),
    body('phone')
        .optional()
        .trim()
        .isLength({ max: 20 }).withMessage('Phone number too long'),
    handleValidationErrors
];

module.exports = {
    // Auth
    validateRegister,
    validateLogin,
    validateForgotPassword,
    validateResetPassword,
    validateVerifyEmail,
    validateResendVerification,
    // Order
    validateCreateOrder,
    validateUpdateOrderStatus,
    // Product
    validateCreateProduct,
    validateUpdateProduct,
    // User
    validateUpdateProfile,
    validateChangePassword,
    validateAddAddress
};
