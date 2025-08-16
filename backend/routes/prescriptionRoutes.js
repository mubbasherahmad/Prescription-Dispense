const express = require('express');
const router = express.Router();
const { createPrescription, listPrescriptions } = require('../controllers/prescriptionController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
  .post(protect, createPrescription)
  .get(protect, listPrescriptions);

module.exports = router;
