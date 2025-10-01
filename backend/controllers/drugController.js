const Drug = require('../models/Drug');
const { extractQuantityFromDosage } = require('../utils/drugInventory');

// @desc    Create a new drug
// @route   POST /api/drugs
// @access  Private/Admin
const createDrug = async (req, res) => {
    try {
        const { medicineName, medicineId, groupName, stock } = req.body;

        // Check if drug with same medicineId already exists
        const drugExists = await Drug.findOne({ medicineId });
        if (drugExists) {
            return res.status(400).json({ message: 'Drug with this Medicine ID already exists' });
        }

        const drug = await Drug.create({
            medicineName,
            medicineId,
            groupName,
            stock: parseInt(stock),
            createdBy: req.user.id
        });

        res.status(201).json(drug);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all drugs
// @route   GET /api/drugs
// @access  Private/Admin
const getDrugs = async (req, res) => {
    try {
        // Return only essential fields for non-admin users
        const drugs = await Drug.find({})
            .select('medicineName medicineId groupName stock')
            .sort({ createdAt: -1 });
        res.json(drugs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get drug by ID
// @route   GET /api/drugs/:id
// @access  Private/Admin
const getDrugById = async (req, res) => {
    try {
        const drug = await Drug.findById(req.params.id)
            .select('medicineName medicineId groupName stock createdAt');

        if (drug) {
            res.json(drug);
        } else {
            res.status(404).json({ message: 'Drug not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update drug
// @route   PUT /api/drugs/:id
// @access  Private/Admin
const updateDrug = async (req, res) => {
    try {
        const drug = await Drug.findById(req.params.id);

        if (drug) {
            drug.medicineName = req.body.medicineName || drug.medicineName;
            drug.medicineId = req.body.medicineId || drug.medicineId;
            drug.groupName = req.body.groupName || drug.groupName;
            drug.stock = req.body.stock !== undefined ? parseInt(req.body.stock) : drug.stock;

            const updatedDrug = await drug.save();
            res.json(updatedDrug);
        } else {
            res.status(404).json({ message: 'Drug not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete drug
// @route   DELETE /api/drugs/:id
// @access  Private/Admin
const deleteDrug = async (req, res) => {
    try {
        const drug = await Drug.findById(req.params.id);

        if (drug) {
            await Drug.findByIdAndDelete(req.params.id);
            res.json({ message: 'Drug removed successfully' });
        } else {
            res.status(404).json({ message: 'Drug not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Search drugs
// @route   GET /api/drugs/search
// @access  Private/Admin
const searchDrugs = async (req, res) => {
    try {
        const { q } = req.query;
        
        const drugs = await Drug.find({
            $or: [
                { medicineName: { $regex: q, $options: 'i' } },
                { medicineId: { $regex: q, $options: 'i' } },
                { groupName: { $regex: q, $options: 'i' } }
            ]
        })
        .select('medicineName medicineId groupName stock')
        .sort({ createdAt: -1 });

        res.json(drugs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Check medication availability
// @route   POST /api/drugs/check-availability
// @access  Private
const checkMedicationAvailability = async (req, res) => {
    const { name, dosage } = req.body;

    if (!name || !dosage) {
        return res.status(400).json({ message: 'Medicine name and dosage are required' });
    }

    try {
        const quantity = extractQuantityFromDosage(dosage);
        const drug = await Drug.findOne({ 
            medicineName: { $regex: new RegExp(name.trim(), 'i') } 
        });

        if (!drug) {
            return res.json({
                available: false,
                message: 'Medicine not found in inventory',
                stock: 0,
                required: quantity
            });
        }

        if (drug.stock < quantity) {
            return res.json({
                available: false,
                message: `Insufficient stock. Available: ${drug.stock}, Required: ${quantity}`,
                stock: drug.stock,
                required: quantity
            });
        }

        return res.json({
            available: true,
            message: 'Available in inventory',
            stock: drug.stock,
            required: quantity,
            drugId: drug._id
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createDrug,
    getDrugs,
    getDrugById,
    updateDrug,
    deleteDrug,
    searchDrugs,
    checkMedicationAvailability
};

