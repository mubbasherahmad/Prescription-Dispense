const InventoryAdapter = require('./InventoryAdapter');
const { checkMedicationAvailability, deductMedicationStock } = require('../../utils/drugInventory');

// Adapter that adapts your existing drug inventory functions to the unified interface
class DrugInventoryAdapter extends InventoryAdapter {
  async checkAvailability(medications) {
    try {
      const medicationsWithInventory = await checkMedicationAvailability(medications);
      const allAvailable = medicationsWithInventory.every(med => med.stockAvailable);
      
      return {
        success: true,
        allMedicationsAvailable: allAvailable,
        medications: medicationsWithInventory,
        unavailableMedications: medicationsWithInventory.filter(med => !med.stockAvailable)
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        allMedicationsAvailable: false,
        medications: []
      };
    }
  }
  
  async deductStock(medications) {
    try {
      const results = await deductMedicationStock(medications);
      const allSuccessful = results.every(result => result.success);
      
      return {
        success: allSuccessful,
        results: results,
        failedDeductions: results.filter(result => !result.success)
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        results: []
      };
    }
  }
  
  async restoreStock(medications) {
    // This would be implemented if you need to restore stock (e.g., when prescription is cancelled)
    // For now, return a stub implementation
    return {
      success: true,
      message: 'Stock restore functionality to be implemented',
      medications: medications
    };
  }
}

module.exports = DrugInventoryAdapter;