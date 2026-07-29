const express = require('express');
const router = express.Router();
const followUpController = require('../controllers/followUpController');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

router.get('/', followUpController.getFollowUps);
router.post('/', followUpController.createFollowUp);
router.put('/:id', followUpController.updateFollowUp);
router.delete('/:id', followUpController.deleteFollowUp);

module.exports = router;
