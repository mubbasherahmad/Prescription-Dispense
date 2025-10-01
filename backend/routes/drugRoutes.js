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
const MiddlewareFactory = require('../patterns/middleware/MiddlewareFactory');

// Validation rules
const drugValidationRules = {
  '/api/drugs': {
    'POST': {
      medicineName: { required: true },
      medicineId: { required: true },
      groupName: { required: true },
      stock: { required: true, type: 'number' }
    }
  }
};

// READ routes - with auth middleware
router.get('/', async (req, res, next) => {
  const middleware = MiddlewareFactory.createAuthChain();
  await middleware.handle(req, res, next);
}, getDrugs);

router.get('/search', async (req, res, next) => {
  const middleware = MiddlewareFactory.createAuthChain();
  await middleware.handle(req, res, next);
}, searchDrugs);

router.get('/:id', async (req, res, next) => {
  const middleware = MiddlewareFactory.createAuthChain();
  await middleware.handle(req, res, next);
}, getDrugById);

// Availability check - with auth
router.post('/check-availability', async (req, res, next) => {
  const middleware = MiddlewareFactory.createAuthChain();
  await middleware.handle(req, res, next);
}, checkMedicationAvailability);

// WRITE routes - admin only with validation
router.post('/', async (req, res, next) => {
  const middleware = MiddlewareFactory.createFullChain(drugValidationRules, ['admin']);
  await middleware.handle(req, res, next);
}, createDrug);

router.put('/:id', async (req, res, next) => {
  const middleware = MiddlewareFactory.createAdminChain();
  await middleware.handle(req, res, next);
}, updateDrug);

router.delete('/:id', async (req, res, next) => {
  const middleware = MiddlewareFactory.createAdminChain();
  await middleware.handle(req, res, next);
}, deleteDrug);

module.exports = router;