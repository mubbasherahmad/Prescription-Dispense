const Drug = require('../models/Drug');

// Extract quantity from dosage string (e.g., "10 tablets" -> 10, "5mg" -> 5)
const extractQuantityFromDosage = (dosage) => {
  if (!dosage) return 1;
  
  // Try to extract number from common patterns
  const patterns = [
    /(\d+)\s*(tablets?|pills?|capsules?|units?)/i,  // "10 tablets"
    /(\d+)\s*mg/i,                                   // "5 mg"
    /(\d+)\s*ml/i,                                   // "100 ml"
    /(\d+)/                                          // Just a number
  ];
  
  for (const pattern of patterns) {
    const match = dosage.match(pattern);
    if (match) {
      return parseInt(match[1]);
    }
  }
  
  return 1; // Default to 1 if no quantity found
};

// Check if medications are available in inventory
const checkMedicationAvailability = async (medications) => {
  const availability = [];
  
  for (const med of medications) {
    try {
      const quantity = extractQuantityFromDosage(med.dosage);
      const drug = await Drug.findOne({ 
        medicineName: { $regex: new RegExp(med.name.trim(), 'i') } 
      });
      
      if (drug) {
        availability.push({
          name: med.name,
          dosage: med.dosage,
          frequency: med.frequency,
          duration: med.duration,
          drugId: drug._id,
          stockChecked: true,
          stockAvailable: drug.stock >= quantity,
          requiredQuantity: quantity,
          availableStock: drug.stock,
          error: drug.stock >= quantity ? null : `Insufficient stock. Available: ${drug.stock}, Required: ${quantity}`
        });
      } else {
        availability.push({
          name: med.name,
          dosage: med.dosage,
          frequency: med.frequency,
          duration: med.duration,
          stockChecked: true,
          stockAvailable: false,
          requiredQuantity: quantity,
          availableStock: 0,
          error: `Medicine "${med.name}" not found in inventory`
        });
      }
    } catch (error) {
      availability.push({
        name: med.name,
        dosage: med.dosage,
        frequency: med.frequency,
        duration: med.duration,
        stockChecked: false,
        stockAvailable: false,
        requiredQuantity: extractQuantityFromDosage(med.dosage),
        availableStock: 0,
        error: error.message
      });
    }
  }
  
  return availability;
};

// Deduct stock for dispensed medications
const deductMedicationStock = async (medications) => {
  const results = [];
  
  for (const med of medications) {
    if (med.drugId && med.stockAvailable && med.requiredQuantity) {
      try {
        const drug = await Drug.findById(med.drugId);
        if (drug) {
          if (drug.stock >= med.requiredQuantity) {
            drug.stock -= med.requiredQuantity;
            await drug.save();
            results.push({
              name: med.name,
              success: true,
              message: `Deducted ${med.requiredQuantity} from ${med.name} stock`,
              remainingStock: drug.stock
            });
          } else {
            results.push({
              name: med.name,
              success: false,
              error: `Insufficient stock for ${med.name}. Available: ${drug.stock}, Required: ${med.requiredQuantity}`
            });
          }
        }
      } catch (error) {
        results.push({
          name: med.name,
          success: false,
          error: error.message
        });
      }
    } else {
      results.push({
        name: med.name,
        success: false,
        error: med.error || 'Drug not available in inventory'
      });
    }
  }
  
  return results;
};

module.exports = {
  extractQuantityFromDosage,
  checkMedicationAvailability,
  deductMedicationStock
};