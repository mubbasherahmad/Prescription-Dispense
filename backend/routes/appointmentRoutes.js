const express = require('express');
const router = express.Router();
const {
  createAppointment,
  getPatientAppointments,
  updateAppointment,
  cancelAppointment
} = require('../controllers/appointmentController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, createAppointment);
router.get('/my-appointments', protect, getPatientAppointments);
router.put('/:id', protect, updateAppointment);
router.put('/:id/cancel', protect, cancelAppointment);

// Remove doctor-specific routes or keep them with appropriate messages
router.get('/doctor-appointments', protect, (req, res) => {
  res.json([]);
});

module.exports = router;