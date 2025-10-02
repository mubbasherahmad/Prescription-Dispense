const request = require('supertest');
const mongoose = require('mongoose');
const testUtils = require('./setup');

describe('EPIC 5: Drug Inventory Management', () => {
  let app;

  beforeEach(() => {
    const express = require('express');
    app = express();
    app.use(express.json());

    // Mock drug routes
    app.post('/api/drugs', async (req, res) => {
      const Drug = require('../models/Drug');
      try {
        // Check if drug with same medicineId already exists
        const drugExists = await Drug.findOne({ medicineId: req.body.medicineId });
        if (drugExists) {
          return res.status(400).json({ message: 'Drug with this Medicine ID already exists' });
        }

        const drug = await Drug.create(req.body);
        res.status(201).json(drug);
      } catch (error) {
        res.status(400).json({ message: error.message });
      }
    });

    app.get('/api/drugs', async (req, res) => {
      const Drug = require('../models/Drug');
      const drugs = await Drug.find().select('medicineName medicineId groupName stock').sort({ createdAt: -1 });
      res.json(drugs);
    });

    app.put('/api/drugs/:id', async (req, res) => {
      const Drug = require('../models/Drug');
      try {
        const drug = await Drug.findByIdAndUpdate(
          req.params.id,
          req.body,
          { new: true }
        );
        
        if (!drug) {
          return res.status(404).json({ message: 'Drug not found' });
        }

        res.json(drug);
      } catch (error) {
        res.status(400).json({ message: error.message });
      }
    });

    app.delete('/api/drugs/:id', async (req, res) => {
      const Drug = require('../models/Drug');
      try {
        const drug = await Drug.findByIdAndDelete(req.params.id);
        
        if (!drug) {
          return res.status(404).json({ message: 'Drug not found' });
        }

        res.json({ message: 'Drug removed successfully' });
      } catch (error) {
        res.status(400).json({ message: error.message });
      }
    });
  });

  // Test 17: Create drug
  it('should create drug (CREATE)', async () => {
    const response = await request(app)
      .post('/api/drugs')
      .send({
        medicineName: 'Paracetamol',
        medicineId: `PARA${Date.now()}`,
        groupName: 'Analgesic',
        stock: 100,
        createdBy: new mongoose.Types.ObjectId()
      });

    expect(response.status).toBe(201);
    expect(response.body.medicineName).toBe('Paracetamol');
  });

  // Test 18: Read drugs
  it('should get drugs (READ)', async () => {
    const Drug = require('../models/Drug');
    await Drug.create([
      {
        medicineName: 'Drug 1',
        medicineId: `DRUG${Date.now()}1`,
        groupName: 'Group 1',
        stock: 50,
        createdBy: new mongoose.Types.ObjectId()
      },
      {
        medicineName: 'Drug 2',
        medicineId: `DRUG${Date.now()}2`,
        groupName: 'Group 2',
        stock: 75,
        createdBy: new mongoose.Types.ObjectId()
      }
    ]);

    const response = await request(app)
      .get('/api/drugs');

    expect(response.status).toBe(200);
    expect(response.body.length).toBe(2);
  });

  // Test 19: Update drug
  it('should update drug (UPDATE)', async () => {
    const Drug = require('../models/Drug');
    const drug = await Drug.create({
      medicineName: 'Original Drug',
      medicineId: `UPDATE${Date.now()}`,
      groupName: 'Original Group',
      stock: 50,
      createdBy: new mongoose.Types.ObjectId()
    });

    const response = await request(app)
      .put(`/api/drugs/${drug._id}`)
      .send({ medicineName: 'Updated Drug', stock: 100 });

    expect(response.status).toBe(200);
    expect(response.body.medicineName).toBe('Updated Drug');
    expect(response.body.stock).toBe(100);
  });

  // Test 20: Delete drug
  it('should delete drug (DELETE)', async () => {
    const Drug = require('../models/Drug');
    const drug = await Drug.create({
      medicineName: 'To Delete',
      medicineId: `DELETE${Date.now()}`,
      groupName: 'Test Group',
      stock: 25,
      createdBy: new mongoose.Types.ObjectId()
    });

    const response = await request(app)
      .delete(`/api/drugs/${drug._id}`);

    expect(response.status).toBe(200);
    
    // Verify deletion
    const deleted = await Drug.findById(drug._id);
    expect(deleted).toBeNull();
  });
});