const express = require('express');
const router = express.Router();
const {
  createPrescription,
  listPrescriptions,
  validatePrescription,
  dispensePrescription,
  updatePrescription,
  deletePrescription
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
  try {
    await middleware.handle(req, res, () => {
      createPrescription(req, res, next);
    });
  } catch (error) {
    next(error);
  }
});

// List prescriptions - auth only
router.get('/', async (req, res, next) => {
  const middleware = MiddlewareFactory.createAuthChain();
  try {
    await middleware.handle(req, res, () => {
      listPrescriptions(req, res, next);
    });
  } catch (error) {
    next(error);
  }
});

// Validate prescription - auth only
router.put('/:id/validate', async (req, res, next) => {
  const middleware = MiddlewareFactory.createAuthChain();
  try {
    await middleware.handle(req, res, () => {
      validatePrescription(req, res, next);
    });
  } catch (error) {
    next(error);
  }
});

// Dispense prescription - auth only
router.put('/:id/dispense', async (req, res, next) => {
  const middleware = MiddlewareFactory.createAuthChain();
  try {
    await middleware.handle(req, res, () => {
      dispensePrescription(req, res, next);
    });
  } catch (error) {
    next(error);
  }
});

// Update prescription - auth only
router.put('/:id', async (req, res, next) => {
  const middleware = MiddlewareFactory.createAuthChain();
  try {
    await middleware.handle(req, res, () => {
      updatePrescription(req, res, next);
    });
  } catch (error) {
    next(error);
  }
});

// Delete prescription - auth only
router.delete('/:id', async (req, res, next) => {
  const middleware = MiddlewareFactory.createAuthChain();
  try {
    await middleware.handle(req, res, () => {
      deletePrescription(req, res, next);
    });
  } catch (error) {
    next(error);
  }
});

// Test route - with logging only
router.get('/:id/test', async (req, res, next) => {
  const loggingMiddleware = new (require('../patterns/middleware/LoggingMiddleware'))();
  await loggingMiddleware.handle(req, res, next);
}, (req, res) => {
  console.log('Test route hit for ID:', req.params.id);
  res.json({ message: 'Route working', id: req.params.id });
});

module.exports = router;