const asyncHandler = require('express-async-handler');
const Prescription = require('../models/Prescription');

// @desc    Create a new prescription
// @route   POST /api/prescriptions
// @access  Private
const createPrescription = asyncHandler(async (req, res) => {
  const { patientName, patientAge, medications, notes } = req.body;

  if (!patientName || patientAge === undefined || !Array.isArray(medications) || medications.length === 0) {
    return res.status(400).json({ message: 'Please provide all required fields' });
  }

  const prescription = new Prescription({
    user: req.user._id,
    patientName,
    patientAge,
    medications,
    notes,
  });

  const createdPrescription = await prescription.save();
  return res.status(201).json(createdPrescription);
});

// @desc    List prescriptions for logged in user
// @route   GET /api/prescriptions
// @access  Private
const listPrescriptions = asyncHandler(async (req, res) => {
  const prescriptions = await Prescription.find({ user: req.user._id });
  return res.json(prescriptions);
});

// @desc    Validate a prescription
// @route   PUT /api/prescriptions/:id/validate
// @access  Private
const validatePrescription = asyncHandler(async (req, res) => {
  const prescription = await Prescription.findById(req.params.id);
  
  if (!prescription) {
    return res.status(404).json({ message: 'Prescription not found' });
  }

  if (prescription.status === 'expired') {
    return res.status(400).json({ message: 'Cannot validate expired prescription' });
  }

  prescription.status = 'validated';
  prescription.validatedAt = new Date();
  await prescription.save();

  return res.json(prescription);
});

// @desc    Dispense a prescription
// @route   PUT /api/prescriptions/:id/dispense
// @access  Private
const dispensePrescription = asyncHandler(async (req, res) => {
  const prescription = await Prescription.findById(req.params.id);
  
  if (!prescription) {
    return res.status(404).json({ message: 'Prescription not found' });
  }

  if (prescription.status !== 'validated') {
    return res.status(400).json({ message: 'Prescription must be validated before dispensing' });
  }

  if (prescription.status === 'cancelled') {
    return res.status(400).json({ message: 'Cannot dispense a cancelled prescription' });
  }

  prescription.status = 'dispensed';
  prescription.dispensedAt = new Date();
  await prescription.save();

  return res.json(prescription);
});

// @desc    Cancel a prescription
// @route   PUT /api/prescriptions/:id/cancel
// @access  Private
const cancelPrescription = asyncHandler(async (req, res) => {
  const prescription = await Prescription.findById(req.params.id);
  
  if (!prescription) {
    return res.status(404).json({ message: 'Prescription not found' });
  }

  // Check if prescription belongs to the user
  if (prescription.user.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: 'Not authorized to cancel this prescription' });
  }

  // Prevent canceling already dispensed prescriptions
  if (prescription.status === 'dispensed') {
    return res.status(400).json({ message: 'Cannot cancel a dispensed prescription' });
  }

  // Prevent canceling already cancelled prescriptions
  if (prescription.status === 'cancelled') {
    return res.status(400).json({ message: 'Prescription is already cancelled' });
  }

  prescription.status = 'cancelled';
  prescription.cancelledAt = new Date();
  await prescription.save();

  return res.json(prescription);
});

module.exports = {
  createPrescription,
  listPrescriptions,
  validatePrescription,
  dispensePrescription,
  cancelPrescription,
};
