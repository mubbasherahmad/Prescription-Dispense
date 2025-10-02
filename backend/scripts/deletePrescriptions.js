require('dotenv').config();
const mongoose = require('mongoose');
const Prescription = require('../models/Prescription');

const deletePrescriptions = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const result = await Prescription.deleteMany({});
    console.log(`✅ Successfully deleted ${result.deletedCount} prescriptions`);

    await mongoose.connection.close();
    console.log('Database connection closed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

deletePrescriptions();
