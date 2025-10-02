const express = require('express');
const app = express();

app.use(express.json());

// Mock user for all requests - use a consistent ID
app.use((req, res, next) => {
  // Use a consistent test user ID that matches what we create
  req.user = { 
    _id: '000000000000000000000001', 
    id: '000000000000000000000001', 
    role: 'user' 
  };
  next();
});

// Mock prescription routes
app.post('/api/prescriptions', async (req, res) => {
  const Prescription = require('../models/Prescription');
  try {
    const prescription = await Prescription.create({
      ...req.body,
      user: req.user._id, // Use the mock user ID
      status: 'unvalidated'
    });
    res.status(201).json(prescription);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.get('/api/prescriptions', async (req, res) => {
  const Prescription = require('../models/Prescription');
  const prescriptions = await Prescription.find({ user: req.user._id }); // Use the mock user ID
  res.json(prescriptions);
});

app.put('/api/prescriptions/:id', async (req, res) => {
  const Prescription = require('../models/Prescription');
  try {
    const prescription = await Prescription.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(prescription);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.delete('/api/prescriptions/:id', async (req, res) => {
  const Prescription = require('../models/Prescription');
  await Prescription.findByIdAndDelete(req.params.id);
  res.json({ message: 'Prescription deleted' });
});

module.exports = app;