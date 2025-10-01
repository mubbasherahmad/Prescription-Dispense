const express = require('express');
const router = express.Router();
const { 
  createPrescription, 
  listPrescriptions, 
  validatePrescription, 
  dispensePrescription, 
  updatePrescription, 
  cancelPrescription 
} = require('../controllers/prescriptionController');
const MiddlewareFactory = require('../patterns/middleware/MiddlewareFactory');

// Validation rules for prescriptions
const prescriptionValidationRules = {
  '/api/prescriptions': {
    'POST': {
      patientName: { required: true },
      patientAge: { required: true, type: 'number' },
      medications: { required: true }
    }
  }
};

// Create prescription - with validation and auth
router.post('/', async (req, res, next) => {
  const middleware = MiddlewareFactory.createFullChain(prescriptionValidationRules, ['admin', 'user']);
  await middleware.handle(req, res, next);
}, createPrescription);

// List prescriptions - auth only
router.get('/', async (req, res, next) => {
  const middleware = MiddlewareFactory.createAuthChain();
  await middleware.handle(req, res, next);
}, listPrescriptions);

// Validate prescription - auth only
router.put('/:id/validate', async (req, res, next) => {
  const middleware = MiddlewareFactory.createAuthChain();
  await middleware.handle(req, res, next);
}, validatePrescription);

// Dispense prescription - auth only
router.put('/:id/dispense', async (req, res, next) => {
  const middleware = MiddlewareFactory.createAuthChain();
  await middleware.handle(req, res, next);
}, dispensePrescription);

// Cancel prescription - auth only
router.put('/:id/cancel', async (req, res, next) => {
  const middleware = MiddlewareFactory.createAuthChain();
  await middleware.handle(req, res, next);
}, cancelPrescription);

// Update prescription - auth only
router.put('/:id', async (req, res, next) => {
  const middleware = MiddlewareFactory.createAuthChain();
  await middleware.handle(req, res, next);
}, updatePrescription);

// Test route - with logging only
router.get('/:id/test', async (req, res, next) => {
  const loggingMiddleware = new (require('../patterns/middleware/LoggingMiddleware'))();
  await loggingMiddleware.handle(req, res, next);
}, (req, res) => {
  console.log('Test route hit for ID:', req.params.id);
  res.json({ message: 'Route working', id: req.params.id });
});

module.exports = router;