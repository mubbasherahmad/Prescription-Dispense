const express = require('express');
const router = express.Router();
const { createPrescription, listPrescriptions, validatePrescription, dispensePrescription } = require('../controllers/prescriptionController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
  .post(protect, createPrescription)
  .get(protect, listPrescriptions);

router.route('/:id/validate')
  .put(protect, validatePrescription);

router.route('/:id/dispense')
  .put(protect, dispensePrescription);

module.exports = router;
