const express = require('express');
const router = express.Router();
const {
    createDrug,
    getDrugs,
    getDrugById,
    updateDrug,
    deleteDrug,
    searchDrugs,
    checkMedicationAvailability
} = require('../controllers/drugController');
const { protect } = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

// READ routes - accessible to all authenticated users
router.get('/', protect, getDrugs); // Remove adminMiddleware
router.get('/search', protect, searchDrugs); // Remove adminMiddleware
router.get('/:id', protect, getDrugById); // Remove adminMiddleware

// Availability check - for prescription creation
router.post('/check-availability', protect, checkMedicationAvailability);

// WRITE routes - admin only
router.post('/', protect, adminMiddleware, createDrug);
router.put('/:id', protect, adminMiddleware, updateDrug);
router.delete('/:id', protect, adminMiddleware, deleteDrug);

module.exports = router;