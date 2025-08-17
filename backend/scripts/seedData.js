const mongoose = require('mongoose');
const Prescription = require('../models/Prescription');
const User = require('../models/User');
require('dotenv').config();

// Connect to MongoDB
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

const seedPrescriptions = async () => {
  try {
    await connectDB();

    // Find or create a test user
    let testUser = await User.findOne({ email: 'test@example.com' });
    
    if (!testUser) {
      console.log('Creating test user...');
      testUser = await User.create({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123', // This will be hashed by the User model
        role: 'user'
      });
    }

    // Clear existing prescriptions for this user
    await Prescription.deleteMany({ user: testUser._id });

    // Sample prescription data
    const prescriptions = [
      {
        user: testUser._id,
        patientName: 'John Smith',
        patientAge: 45,
        medications: [
          { name: 'Lisinopril', dosage: '10mg', frequency: 'Once daily', duration: '30 days' },
          { name: 'Metformin', dosage: '500mg', frequency: 'Twice daily', duration: '30 days' }
        ],
        status: 'pending',
        expiryDate: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000),
        notes: 'Take with food. Monitor blood pressure.'
      },
      {
        user: testUser._id,
        patientName: 'Sarah Johnson',
        patientAge: 32,
        medications: [
          { name: 'Amoxicillin', dosage: '875mg', frequency: 'Twice daily', duration: '10 days' }
        ],
        status: 'validated',
        expiryDate: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000),
        validatedAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
        notes: 'Complete full course even if feeling better.'
      },
      {
        user: testUser._id,
        patientName: 'Robert Davis',
        patientAge: 67,
        medications: [
          { name: 'Atorvastatin', dosage: '20mg', frequency: 'Once daily', duration: '90 days' },
          { name: 'Aspirin', dosage: '81mg', frequency: 'Once daily', duration: '90 days' }
        ],
        status: 'dispensed',
        expiryDate: new Date(Date.now() + 85 * 24 * 60 * 60 * 1000),
        validatedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
        dispensedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        notes: 'Take in the evening. Regular cholesterol monitoring required.'
      },
      {
        user: testUser._id,
        patientName: 'Maria Garcia',
        patientAge: 28,
        medications: [
          { name: 'Ibuprofen', dosage: '600mg', frequency: 'Three times daily', duration: '7 days' }
        ],
        status: 'cancelled',
        expiryDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
        cancelledAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        notes: 'Patient reported allergy to NSAIDs.'
      },
      {
        user: testUser._id,
        patientName: 'Michael Brown',
        patientAge: 55,
        medications: [
          { name: 'Omeprazole', dosage: '20mg', frequency: 'Once daily', duration: '14 days' }
        ],
        status: 'pending',
        expiryDate: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000),
        notes: 'Take 30 minutes before breakfast.'
      },
      {
        user: testUser._id,
        patientName: 'Lisa Wilson',
        patientAge: 41,
        medications: [
          { name: 'Levothyroxine', dosage: '75mcg', frequency: 'Once daily', duration: '90 days' }
        ],
        status: 'validated',
        expiryDate: new Date(Date.now() + 85 * 24 * 60 * 60 * 1000),
        validatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
        notes: 'Take on empty stomach, 1 hour before food.'
      }
    ];

    // Insert prescriptions
    const createdPrescriptions = await Prescription.insertMany(prescriptions);
    
    console.log(`Successfully seeded ${createdPrescriptions.length} prescriptions for user: ${testUser.email}`);
    console.log('Test user credentials:');
    console.log('Email: test@example.com');
    console.log('Password: password123');
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedPrescriptions();