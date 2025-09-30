const asyncHandler = require('express-async-handler');
const Prescription = require('../models/Prescription');
const { createNotification } = require('./notificationController');

// @desc    Create a new prescription
// @route   POST /api/prescriptions
// @access  Private
const createPrescription = asyncHandler(async (req, res) => {
  console.log('Create prescription request received');
  console.log('Request body:', req.body);
  
  const { patientName, patientAge, medications, notes } = req.body;

  if (!patientName || patientAge === undefined || !Array.isArray(medications) || medications.length === 0) {
    console.log('Missing required fields:', { patientName, patientAge, medications: Array.isArray(medications), medicationsLength: medications?.length });
    return res.status(400).json({ message: 'Please provide all required fields' });
  }

  console.log('Creating prescription with data:', { patientName, patientAge, medications, notes });

  const prescription = new Prescription({
    user: req.user._id,
    patientName,
    patientAge,
    medications,
    notes,
  });

  console.log('Saving prescription...');
  const createdPrescription = await prescription.save();
  console.log('Prescription created successfully:', createdPrescription._id);

  // Create notification for new prescription
  await createNotification(
    req.user._id,
    'New Prescription Created',
    `New prescription created for ${createdPrescription.patientName}`,
    'prescription',
    createdPrescription._id
  );

  console.log('Notification created for new prescription');
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

  if (prescription.status === 'cancelled') {
    return res.status(400).json({ message: 'Cannot validate cancelled prescription' });
  }

  // Simple validation - just check if not expired and not cancelled
  prescription.status = 'validated';
  prescription.validatedAt = new Date();
  await prescription.save();

  // Create notification for validation
  await createNotification(
    req.user._id,
    'Prescription Validated',
    `Prescription for ${prescription.patientName} has been validated and is ready for dispensing`,
    'prescription',
    prescription._id
  );

  console.log('Notification created for prescription validation');
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

  // Create notification for dispensing
  await createNotification(
    req.user._id,
    'Prescription Dispensed',
    `Prescription for ${prescription.patientName} has been dispensed successfully`,
    'prescription',
    prescription._id
  );

  console.log('Notification created for prescription dispensing');
  return res.json(prescription);
});

// @desc    Update a prescription
// @route   PUT /api/prescriptions/:id
// @access  Private
const updatePrescription = asyncHandler(async (req, res) => {
  console.log('Update request received for prescription:', req.params.id);
  console.log('Request body:', req.body);
  
  const prescription = await Prescription.findById(req.params.id);
  
  if (!prescription) {
    console.log('Prescription not found');
    return res.status(404).json({ message: 'Prescription not found' });
  }

  console.log('Found prescription:', prescription);

  // Check if prescription can be edited (cannot edit dispensed or cancelled prescriptions)
  if (prescription.status === 'dispensed') {
    console.log('Cannot edit dispensed prescription');
    return res.status(400).json({ message: 'Cannot edit a dispensed prescription' });
  }

  if (prescription.status === 'cancelled') {
    console.log('Cannot edit cancelled prescription');
    return res.status(400).json({ message: 'Cannot edit a cancelled prescription' });
  }

  // Update allowed fields
  const { expiryDate, medications, notes } = req.body;

  console.log('Updating fields:', { expiryDate, medications, notes });

  if (expiryDate) {
    prescription.expiryDate = new Date(expiryDate);
  }

  if (medications && Array.isArray(medications) && medications.length > 0) {
    prescription.medications = medications;
  }

  if (notes !== undefined) {
    prescription.notes = notes;
  }

  console.log('Saving prescription...');
  const updatedPrescription = await prescription.save();
  console.log('Prescription saved successfully');

  // Create notification for prescription update
  await createNotification(
    req.user._id,
    'Prescription Updated',
    `Prescription for ${prescription.patientName} has been updated`,
    'prescription',
    prescription._id
  );

  console.log('Notification created for prescription update');
  return res.json(updatedPrescription);
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

  // Create notification for cancellation
  await createNotification(
    req.user._id,
    'Prescription Cancelled',
    `Prescription for ${prescription.patientName} has been cancelled`,
    'prescription',
    prescription._id
  );

  console.log('Notification created for prescription cancellation');
  return res.json(prescription);
});

module.exports = {
  createPrescription,
  listPrescriptions,
  validatePrescription,
  dispensePrescription,
  updatePrescription,
  cancelPrescription,
};