const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);

router.get('/', authorize(['ADMIN', 'SALES_MANAGER']), reportController.getReports);

module.exports = router;
