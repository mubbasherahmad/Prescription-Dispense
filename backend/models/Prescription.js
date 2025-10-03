const mongoose = require('mongoose');

// Schema for individual medication items within a prescription
const MedicationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Medication name is required'],
    },
    dosage: {
      type: String,
      required: [true, 'Dosage is required'],
    },
    frequency: {
      type: String,
      required: [true, 'Frequency is required'],
    },
    duration: {
      type: String,
      required: [true, 'Duration is required'],
    },
    // Add these new fields for inventory tracking
    drugId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Drug'
    },
    stockChecked: {
      type: Boolean,
      default: false
    },
    stockAvailable: {
      type: Boolean,
      default: false
    },
    requiredQuantity: {
      type: Number,
      default: 0
    },
    availableStock: {
      type: Number,
      default: 0
    },
    inventoryError: {
      type: String
    }
  },
  { _id: false }
);

function medicationsArrayLimit(val) {
  return Array.isArray(val) && val.length > 0;
}

// Main prescription schema
const PrescriptionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    patientName: {
      type: String,
      required: [true, 'Patient name is required'],
    },
    patientAge: {
      type: Number,
      required: [true, 'Patient age is required'],
      min: [0, 'Patient age must be a positive number'],
    },
    medications: {
      type: [MedicationSchema],
      validate: {
        validator: medicationsArrayLimit,
        message: 'At least one medication is required',
      },
    },
    notes: {
      type: String,
    },
    status: {
      type: String,
      enum: ['unvalidated', 'validated', 'dispensed'],
      default: 'unvalidated'
    },
    expiryDate: {
      type: Date,
      default: function() {
        return new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days from now
      }
    },
    validatedAt: {
      type: Date
    },
    dispensedAt: {
      type: Date
    },
    cancelledAt: {
      type: Date
    },
    // Track inventory status
    allMedicationsAvailable: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true,
  }
);

// 🔥 PROTOTYPE PATTERN: Add clone method to schema
PrescriptionSchema.methods.clone = function(overrides = {}) {
  const clonedData = this.toObject();
  
  // Remove MongoDB specific fields
  delete clonedData._id;
  delete clonedData.__v;
  delete clonedData.createdAt;
  delete clonedData.updatedAt;
  delete clonedData.validatedAt;
  delete clonedData.dispensedAt;
  delete clonedData.cancelledAt;
  
  // Reset status for cloned prescription
  clonedData.status = 'unvalidated';
  clonedData.allMedicationsAvailable = false;
  
  // Apply user overrides
  const finalData = { ...clonedData, ...overrides };
  
  return new this.constructor(finalData);
};

module.exports = mongoose.model('Prescription', PrescriptionSchema);