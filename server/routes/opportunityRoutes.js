const express = require('express');
const router = express.Router();
const opportunityController = require('../controllers/opportunityController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);

router.get('/', opportunityController.getOpportunities);
router.get('/pipeline', opportunityController.getPipeline);
router.get('/:id', opportunityController.getOpportunityById);
router.post('/', opportunityController.createOpportunity);
router.put('/:id', opportunityController.updateOpportunity);
router.patch('/:id/stage', opportunityController.updateOpportunityStage);
router.delete('/:id', authorize(['ADMIN', 'SALES_MANAGER']), opportunityController.deleteOpportunity);

module.exports = router;
