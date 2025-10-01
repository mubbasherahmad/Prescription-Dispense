const mongoose = require('mongoose');

const drugSchema = new mongoose.Schema({
  medicineName: {
    type: String,
    required: true,
    trim: true
  },
  medicineId: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  groupName: {
    type: String,
    required: true,
    trim: true
  },
  stock: {
    type: Number,
    required: true,
    min: 0
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Method to check if stock is available and deduct it
drugSchema.methods.deductStock = async function(quantity) {
  if (this.stock < quantity) {
    throw new Error(`Insufficient stock. Available: ${this.stock}, Required: ${quantity}`);
  }
  this.stock -= quantity;
  return await this.save();
};

// Static method to find drug by name and check stock
drugSchema.statics.findAndCheckStock = async function(medicineName, quantity) {
  const drug = await this.findOne({ 
    medicineName: { $regex: new RegExp(medicineName, 'i') } 
  });
  
  if (!drug) {
    throw new Error(`Medicine "${medicineName}" not found in inventory`);
  }
  
  if (drug.stock < quantity) {
    throw new Error(`Insufficient stock for "${medicineName}". Available: ${drug.stock}, Required: ${quantity}`);
  }
  
  return drug;
};

module.exports = mongoose.model('Drug', drugSchema);