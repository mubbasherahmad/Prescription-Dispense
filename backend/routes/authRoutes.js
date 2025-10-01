const express = require('express');
const { registerUser, loginUser, updateUserProfile, getProfile } = require('../controllers/authController');
const MiddlewareFactory = require('../patterns/middleware/MiddlewareFactory');

const router = express.Router();

// Define validation rules
const validationRules = {
  '/api/auth/register': {
    'POST': {
      name: { required: true },
      email: { required: true, type: 'email' },
      password: { required: true }
    }
  },
  '/api/auth/login': {
    'POST': {
      email: { required: true, type: 'email' },
      password: { required: true }
    }
  }
};

// Register - only validation (no auth required)
router.post('/register', 
  async (req, res, next) => {
    const middleware = MiddlewareFactory.createValidationChain(validationRules);
    await middleware.handle(req, res, next);
  }, 
  registerUser
);

// Login - only validation (no auth required)
router.post('/login', 
  async (req, res, next) => {
    const middleware = MiddlewareFactory.createValidationChain(validationRules);
    await middleware.handle(req, res, next);
  }, 
  loginUser
);

// Profile routes - require authentication
router.get('/profile', 
  async (req, res, next) => {
    const middleware = MiddlewareFactory.createAuthChain();
    await middleware.handle(req, res, next);
  }, 
  getProfile
);

router.put('/profile', 
  async (req, res, next) => {
    const middleware = MiddlewareFactory.createAuthChain();
    await middleware.handle(req, res, next);
  }, 
  updateUserProfile
);

module.exports = router;