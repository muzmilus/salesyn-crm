const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);

// Admin & Sales Manager can list users
router.get('/', authorize(['ADMIN', 'SALES_MANAGER']), userController.getUsers);
router.get('/:id', authorize(['ADMIN', 'SALES_MANAGER']), userController.getUserById);

// Admin only operations
router.post('/', authorize(['ADMIN']), userController.createUser);
router.put('/:id', authorize(['ADMIN']), userController.updateUser);
router.patch('/:id/status', authorize(['ADMIN']), userController.toggleUserStatus);

module.exports = router;
