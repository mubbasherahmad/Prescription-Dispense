const express = require('express');
const router = express.Router();
const {
  createNotification,
  getUserNotifications,
  markAsRead,
  deleteNotification
} = require('../controllers/notificationController');
const { protect } = require('../middleware/authMiddleware');

// Add POST route for creating notifications
router.post('/', protect, async (req, res) => {
  try {
    const { title, message, type, relatedId } = req.body;
    await createNotification(req.user._id, title, message, type, relatedId);
    res.status(201).json({ message: 'Notification created successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/', protect, getUserNotifications);
router.put('/:id/read', protect, markAsRead);
router.delete('/:id', protect, deleteNotification);

module.exports = router;