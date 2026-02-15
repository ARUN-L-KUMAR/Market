const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const authMiddleware = require('../middleware/auth.middleware');
const { validateUpdateProfile, validateChangePassword, validateAddAddress } = require('../middleware/validators');

// Protect all user routes
router.use(authMiddleware.protect);

// Profile routes
router.get('/profile', userController.getProfile);
router.put('/profile', validateUpdateProfile, userController.updateProfile);
router.get('/stats', userController.getUserStats);

// Address routes
router.get('/addresses', userController.getAddresses);
router.post('/addresses', validateAddAddress, userController.addAddress);
router.put('/addresses/:addressId', userController.updateAddress);
router.delete('/addresses/:addressId', userController.deleteAddress);

// Password change
router.put('/change-password', validateChangePassword, userController.changePassword);

module.exports = router;
