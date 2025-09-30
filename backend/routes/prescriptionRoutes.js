const express = require('express');
const router = express.Router();
const { createPrescription, listPrescriptions, validatePrescription, dispensePrescription, updatePrescription, cancelPrescription } = require('../controllers/prescriptionController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
  .post(protect, createPrescription)
  .get(protect, listPrescriptions);

router.route('/:id/validate')
  .put(protect, validatePrescription);

router.route('/:id/dispense')
  .put(protect, dispensePrescription);

router.route('/:id/cancel')
  .put(protect, cancelPrescription);

router.route('/:id')
  .put(protect, updatePrescription);

// Test route to debug
router.get('/:id/test', protect, (req, res) => {
  console.log('Test route hit for ID:', req.params.id);
  res.json({ message: 'Route working', id: req.params.id });
});

module.exports = router;