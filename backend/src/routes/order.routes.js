const express = require('express');
const router = express.Router();
const orderController = require('../controllers/order.controller');
const authMiddleware = require('../middleware/auth.middleware');
const { validateCreateOrder, validateUpdateOrderStatus } = require('../middleware/validators');

router.post('/', authMiddleware.protect, validateCreateOrder, orderController.createOrder);
router.get('/my', authMiddleware.protect, orderController.getUserOrders);
router.get('/:id', authMiddleware.protect, orderController.getOrderById);
router.put('/:id/cancel', authMiddleware.protect, orderController.cancelOrder);
router.put('/:id/status', authMiddleware.protect, authMiddleware.restrictTo('admin'), validateUpdateOrderStatus, orderController.updateOrderStatus);

module.exports = router;