const express = require('express');
const router = express.Router();
const leadController = require('../controllers/leadController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);

router.get('/', leadController.getLeads);
router.get('/:id', leadController.getLeadById);
router.post('/', leadController.createLead);
router.put('/:id', leadController.updateLead);
router.delete('/:id', authorize(['ADMIN', 'SALES_MANAGER']), leadController.deleteLead);

router.patch('/:id/status', leadController.updateLeadStatus);
router.patch('/:id/assign', authorize(['ADMIN', 'SALES_MANAGER']), leadController.assignLead);
router.post('/:id/convert', leadController.convertLeadToCustomer);

module.exports = router;
