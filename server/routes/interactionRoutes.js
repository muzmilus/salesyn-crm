const express = require('express');
const router = express.Router();
const interactionController = require('../controllers/interactionController');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

router.get('/', interactionController.getInteractions);
router.post('/', interactionController.createInteraction);
router.delete('/:id', interactionController.deleteInteraction);

module.exports = router;
