const express = require('express');
const router = express.Router();
const { createPrescription, listPrescriptions, validatePrescription, dispensePrescription, updatePrescription } = require('../controllers/prescriptionController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
  .post(protect, createPrescription)
  .get(protect, listPrescriptions);

router.route('/:id/validate')
  .put(protect, validatePrescription);

router.route('/:id/dispense')
  .put(protect, dispensePrescription);

router.route('/:id')
  .put(protect, updatePrescription);

module.exports = router;
