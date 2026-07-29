const express = require('express');
const router = express.Router();
const searchController = require('../controllers/searchController');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

router.get('/', searchController.searchAll);

module.exports = router;
