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

const checkData = async () => {
  try {
    await connectDB();

    // Find the test user
    const testUser = await User.findOne({ email: 'test@example.com' });
    console.log('Test user found:', testUser ? 'Yes' : 'No');
    
    if (testUser) {
      // Get all prescriptions for this user
      const prescriptions = await Prescription.find({ user: testUser._id });
      console.log(`\nTotal prescriptions found: ${prescriptions.length}`);
      
      // Show details of each prescription
      prescriptions.forEach((p, index) => {
        console.log(`\n${index + 1}. ${p.patientName} (${p.status})`);
        console.log(`   ID: ${p._id}`);
        console.log(`   Medications: ${p.medications.map(m => m.name).join(', ')}`);
      });
      
      // Count by status
      const statusCounts = {
        pending: prescriptions.filter(p => p.status === 'pending').length,
        validated: prescriptions.filter(p => p.status === 'validated').length,
        dispensed: prescriptions.filter(p => p.status === 'dispensed').length,
        cancelled: prescriptions.filter(p => p.status === 'cancelled').length,
        expired: prescriptions.filter(p => p.status === 'expired').length,
      };
      
      console.log('\nStatus counts:', statusCounts);
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error checking data:', error);
    process.exit(1);
  }
};

checkData();