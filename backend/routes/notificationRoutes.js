const express = require('express');
const router = express.Router();
const {
  createNotification,
  getUserNotifications,
  markAsRead,
  deleteNotification
} = require('../controllers/notificationController');
const MiddlewareFactory = require('../patterns/middleware/MiddlewareFactory');

// Validation rules for notifications
const notificationValidationRules = {
  '/api/notifications': {
    'POST': {
      title: { required: true },
      message: { required: true },
      type: { required: true }
    }
  }
};

// Create notification - with validation and auth
router.post('/', async (req, res, next) => {
  const middleware = MiddlewareFactory.createFullChain(notificationValidationRules, ['admin', 'user']);
  await middleware.handle(req, res, next);
}, async (req, res) => {
  try {
    const { title, message, type, relatedId } = req.body;
    await createNotification(req.user._id, title, message, type, relatedId);
    res.status(201).json({ message: 'Notification created successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get user notifications - auth only
router.get('/', async (req, res, next) => {
  const middleware = MiddlewareFactory.createAuthChain();
  await middleware.handle(req, res, next);
}, getUserNotifications);

// Mark as read - auth only
router.put('/:id/read', async (req, res, next) => {
  const middleware = MiddlewareFactory.createAuthChain();
  await middleware.handle(req, res, next);
}, markAsRead);

// Delete notification - auth only
router.delete('/:id', async (req, res, next) => {
  const middleware = MiddlewareFactory.createAuthChain();
  await middleware.handle(req, res, next);
}, deleteNotification);

module.exports = router;