const asyncHandler = require('express-async-handler');
const Prescription = require('../models/Prescription');
const { createNotification } = require('./notificationController');
const { checkMedicationAvailability, deductMedicationStock } = require('../utils/drugInventory');

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

  try {
    // Check medication availability in inventory
    const medicationsWithInventory = await checkMedicationAvailability(medications);
    
    // Check if all medications are available
    const allMedicationsAvailable = medicationsWithInventory.every(med => med.stockAvailable);
    
    const prescription = new Prescription({
      user: req.user._id,
      patientName,
      patientAge,
      medications: medicationsWithInventory,
      notes,
      allMedicationsAvailable
    });

    console.log('Saving prescription...');
    const createdPrescription = await prescription.save();
    console.log('Prescription created successfully:', createdPrescription._id);

    // Create notification for new prescription
    await createNotification(
      req.user._id,
      'New Prescription Created',
      `New prescription created for ${createdPrescription.patientName}` +
      (allMedicationsAvailable ? ' - All medications available in inventory' : ' - Some medications may not be available'),
      'prescription',
      createdPrescription._id
    );

    console.log('📢 NOTIFICATION: New Prescription Created for', createdPrescription.patientName);
    console.log('💊 Prescription ID:', createdPrescription._id);
    console.log('👤 Created by user:', req.user._id);
    console.log('📊 All medications available:', allMedicationsAvailable);

    return res.status(201).json(createdPrescription);
  } catch (error) {
    console.error('Error creating prescription:', error);
    return res.status(400).json({ message: error.message });
  }
});

// @desc    List prescriptions for logged in user (or all if admin)
// @route   GET /api/prescriptions
// @access  Private
const listPrescriptions = asyncHandler(async (req, res) => {
  // Admins can see all prescriptions, regular users only see their own
  const query = req.user.role === 'admin' ? {} : { user: req.user._id };
  const prescriptions = await Prescription.find(query);
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

  if (prescription.status === 'validated') {
    return res.status(400).json({ message: 'Prescription is already validated' });
  }

  if (prescription.status === 'dispensed') {
    return res.status(400).json({ message: 'Cannot validate a dispensed prescription' });
  }

  // Check if all medications are available before validation
  const unavailableMedications = prescription.medications.filter(med => 
    med.stockChecked && !med.stockAvailable
  );

  if (unavailableMedications.length > 0) {
    return res.status(400).json({ 
      message: 'Cannot validate prescription - some medications are not available in inventory',
      unavailableMedications: unavailableMedications.map(med => ({
        name: med.name,
        error: med.inventoryError
      }))
    });
  }

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

// @desc    Dispense a prescription and deduct stock
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

  try {
    // Check if all medications are available before dispensing
    const unavailableMedications = prescription.medications.filter(med => 
      med.stockChecked && !med.stockAvailable
    );

    if (unavailableMedications.length > 0) {
      return res.status(400).json({ 
        message: 'Cannot dispense prescription - some medications are not available in inventory',
        unavailableMedications: unavailableMedications.map(med => ({
          name: med.name,
          error: med.inventoryError
        }))
      });
    }

    // Deduct stock from inventory
    const stockDeductionResults = await deductMedicationStock(prescription.medications);
    
    // Check if all stock deductions were successful
    const failedDeductions = stockDeductionResults.filter(result => !result.success);
    
    if (failedDeductions.length > 0) {
      return res.status(400).json({
        message: 'Failed to deduct stock for some medications',
        failedDeductions
      });
    }

    // Update prescription status
    prescription.status = 'dispensed';
    prescription.dispensedAt = new Date();
    await prescription.save();

    // Create notification for dispensing
    await createNotification(
      req.user._id,
      'Prescription Dispensed',
      `Prescription for ${prescription.patientName} has been dispensed successfully. Stock deducted from inventory.`,
      'prescription',
      prescription._id
    );

    console.log('📦 NOTIFICATION: Prescription Dispensed for', prescription.patientName);
    console.log('💊 Prescription ID:', prescription._id);
    console.log('👤 Dispensed by user:', req.user._id);
    console.log('📊 Stock deduction results:', stockDeductionResults);

    return res.json({
      prescription,
      stockDeductionResults
    });
  } catch (error) {
    console.error('Error dispensing prescription:', error);
    return res.status(400).json({ message: error.message });
  }
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

  // Check if prescription can be edited (cannot edit dispensed prescriptions)
  if (prescription.status === 'dispensed') {
    console.log('Cannot edit dispensed prescription');
    return res.status(400).json({ message: 'Cannot edit a dispensed prescription' });
  }

  // Update allowed fields
  const { expiryDate, medications, notes } = req.body;

  console.log('Updating fields:', { expiryDate, medications, notes });

  if (expiryDate) {
    prescription.expiryDate = new Date(expiryDate);
  }

  if (medications && Array.isArray(medications) && medications.length > 0) {
    // Re-check medication availability when medications are updated
    const medicationsWithInventory = await checkMedicationAvailability(medications);
    const allMedicationsAvailable = medicationsWithInventory.every(med => med.stockAvailable);
    
    prescription.medications = medicationsWithInventory;
    prescription.allMedicationsAvailable = allMedicationsAvailable;
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

// @desc    Delete a prescription
// @route   DELETE /api/prescriptions/:id
// @access  Private
const deletePrescription = asyncHandler(async (req, res) => {
  const prescription = await Prescription.findById(req.params.id);

  if (!prescription) {
    return res.status(404).json({ message: 'Prescription not found' });
  }

  // Check if prescription belongs to the user
  if (prescription.user.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: 'Not authorized to delete this prescription' });
  }

  // Only allow deletion of unvalidated prescriptions
  if (prescription.status !== 'unvalidated') {
    return res.status(400).json({ message: 'Can only delete unvalidated prescriptions' });
  }

  await Prescription.findByIdAndDelete(req.params.id);

  return res.json({ message: 'Prescription deleted successfully' });
});

module.exports = {
  createPrescription,
  listPrescriptions,
  validatePrescription,
  dispensePrescription,
  updatePrescription,
  deletePrescription,
  // cancelPrescription, // Removed - only 3 statuses allowed: unvalidated, validated, dispensed
};
