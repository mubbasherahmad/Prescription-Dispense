const request = require('supertest');
const mongoose = require('mongoose');
const testUtils = require('./setup');

describe('EPIC 3: Prescription Dispensation', () => {
  let app;

  beforeEach(() => {
    const express = require('express');
    app = express();
    app.use(express.json());

    // Mock prescription routes
    app.post('/api/prescriptions', async (req, res) => {
      const Prescription = require('../models/Prescription');
      try {
        const prescription = await Prescription.create(req.body);
        res.status(201).json(prescription);
      } catch (error) {
        res.status(400).json({ message: error.message });
      }
    });

    app.get('/api/prescriptions', async (req, res) => {
      const Prescription = require('../models/Prescription');
      const prescriptions = await Prescription.find();
      res.json(prescriptions);
    });

    // Add dispensation endpoint with proper logic
    app.put('/api/prescriptions/:id/dispense', async (req, res) => {
      const Prescription = require('../models/Prescription');
      try {
        const prescription = await Prescription.findById(req.params.id);
        
        if (!prescription) {
          return res.status(404).json({ message: 'Prescription not found' });
        }

        if (prescription.status !== 'validated') {
          return res.status(400).json({ message: 'Prescription must be validated before dispensing' });
        }

        // Check if all medications are available
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

        // Mock stock deduction
        const stockDeductionResults = prescription.medications.map(med => ({
          name: med.name,
          success: true,
          message: `Deducted ${med.requiredQuantity || 1} from ${med.name} stock`
        }));

        // Update prescription status
        prescription.status = 'dispensed';
        prescription.dispensedAt = new Date();
        await prescription.save();

        res.json({
          prescription,
          stockDeductionResults
        });
      } catch (error) {
        res.status(400).json({ message: error.message });
      }
    });
  });

  // Test 9: Create prescription for dispensing
  it('should create validated prescription (CREATE)', async () => {
    const Prescription = require('../models/Prescription');
    const prescription = await Prescription.create({
      patientName: 'Dispense Patient',
      patientAge: 25,
      user: new mongoose.Types.ObjectId(),
      medications: [{
        name: 'Test Drug',
        dosage: '10 tablets',
        frequency: 'Once daily', // ADDED
        duration: '7 days', // ADDED
        stockChecked: true,
        stockAvailable: true
      }],
      status: 'validated'
    });

    expect(prescription.status).toBe('validated');
  });

  // Test 10: Read dispensation status
  it('should check dispensation status (READ)', async () => {
    const Prescription = require('../models/Prescription');
    const prescription = await Prescription.create({
      patientName: 'Status Patient',
      patientAge: 25,
      user: new mongoose.Types.ObjectId(),
      medications: [{
        name: 'Test Drug',
        dosage: '10 tablets',
        frequency: 'Twice daily', // ADDED
        duration: '10 days', // ADDED
        stockChecked: true,
        stockAvailable: true
      }],
      status: 'validated'
    });

    const response = await request(app)
      .get('/api/prescriptions');

    const found = response.body.find(p => p._id === prescription._id.toString());
    expect(found.status).toBe('validated');
    expect(found.dispensedAt).toBeUndefined();
  });

  // Test 11: Dispense prescription
  it('should dispense prescription (UPDATE)', async () => {
    const Prescription = require('../models/Prescription');
    const prescription = await Prescription.create({
      patientName: 'To Dispense',
      patientAge: 25,
      user: new mongoose.Types.ObjectId(),
      medications: [{
        name: 'Test Drug',
        dosage: '10 tablets',
        frequency: 'Three times daily', // ADDED
        duration: '5 days', // ADDED
        stockChecked: true,
        stockAvailable: true
      }],
      status: 'validated'
    });

    const response = await request(app)
      .put(`/api/prescriptions/${prescription._id}/dispense`);

    expect(response.status).toBe(200);
    expect(response.body.prescription.status).toBe('dispensed');
    expect(response.body.prescription.dispensedAt).toBeDefined();
    expect(response.body.stockDeductionResults[0].success).toBe(true);
  });

  // Test 12: Prevent invalid dispensation
  it('should not dispense unvalidated prescription', async () => {
    const Prescription = require('../models/Prescription');
    const prescription = await Prescription.create({
      patientName: 'Invalid Dispense',
      patientAge: 25,
      user: new mongoose.Types.ObjectId(),
      medications: [{
        name: 'Test Drug',
        dosage: '10 tablets',
        frequency: 'Once daily', // ADDED
        duration: '7 days', // ADDED
        stockChecked: true,
        stockAvailable: true
      }],
      status: 'unvalidated' // Not validated
    });

    const response = await request(app)
      .put(`/api/prescriptions/${prescription._id}/dispense`);

    expect(response.status).toBe(400);
    expect(response.body.message).toContain('must be validated before dispensing');
  });
});