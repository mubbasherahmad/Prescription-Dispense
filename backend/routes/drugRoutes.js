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
  try {
    await middleware.handle(req, res, () => {
      getDrugs(req, res, next);
    });
  } catch (error) {
    next(error);
  }
});

router.get('/search', async (req, res, next) => {
  const middleware = MiddlewareFactory.createAuthChain();
  try {
    await middleware.handle(req, res, () => {
      searchDrugs(req, res, next);
    });
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  const middleware = MiddlewareFactory.createAuthChain();
  try {
    await middleware.handle(req, res, () => {
      getDrugById(req, res, next);
    });
  } catch (error) {
    next(error);
  }
});

// Availability check - with auth
router.post('/check-availability', async (req, res, next) => {
  const middleware = MiddlewareFactory.createAuthChain();
  try {
    await middleware.handle(req, res, () => {
      checkMedicationAvailability(req, res, next);
    });
  } catch (error) {
    next(error);
  }
});

// WRITE routes - admin only with validation
router.post('/', async (req, res, next) => {
  const middleware = MiddlewareFactory.createFullChain(drugValidationRules, ['admin']);
  try {
    await middleware.handle(req, res, () => {
      // Middleware chain completed successfully, call the controller
      createDrug(req, res, next);
    });
  } catch (error) {
    next(error);
  }
});

router.put('/:id', async (req, res, next) => {
  const middleware = MiddlewareFactory.createAdminChain();
  try {
    await middleware.handle(req, res, () => {
      updateDrug(req, res, next);
    });
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', async (req, res, next) => {
  const middleware = MiddlewareFactory.createAdminChain();
  try {
    await middleware.handle(req, res, () => {
      deleteDrug(req, res, next);
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;