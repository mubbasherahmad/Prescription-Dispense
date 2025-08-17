const express = require('express');
const router = express.Router();
const { createPrescription, listPrescriptions, validatePrescription, dispensePrescription, cancelPrescription } = require('../controllers/prescriptionController');
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

module.exports = router;
