const request = require('supertest');
const mongoose = require('mongoose');
const testUtils = require('./setup');

describe('EPIC 4: Notification System', () => {
  let app;

  beforeEach(() => {
    const express = require('express');
    app = express();
    app.use(express.json());

    // Mock notification routes
    app.post('/api/notifications', async (req, res) => {
      const Notification = require('../models/Notification');
      try {
        const notification = await Notification.create(req.body);
        res.status(201).json({ message: 'Notification created successfully', notification });
      } catch (error) {
        res.status(400).json({ message: error.message });
      }
    });

    app.get('/api/notifications', async (req, res) => {
      const Notification = require('../models/Notification');
      const notifications = await Notification.find().sort({ createdAt: -1 });
      res.json(notifications);
    });

    app.put('/api/notifications/:id/read', async (req, res) => {
      const Notification = require('../models/Notification');
      try {
        const notification = await Notification.findByIdAndUpdate(
          req.params.id,
          { isRead: true },
          { new: true }
        );
        
        if (!notification) {
          return res.status(404).json({ message: 'Notification not found' });
        }

        res.json(notification);
      } catch (error) {
        res.status(400).json({ message: error.message });
      }
    });

    app.delete('/api/notifications/:id', async (req, res) => {
      const Notification = require('../models/Notification');
      try {
        const notification = await Notification.findByIdAndDelete(req.params.id);
        
        if (!notification) {
          return res.status(404).json({ message: 'Notification not found' });
        }

        res.json({ message: 'Notification deleted' });
      } catch (error) {
        res.status(400).json({ message: error.message });
      }
    });
  });

  // Test 13: Create notification
  it('should create notification (CREATE)', async () => {
    const response = await request(app)
      .post('/api/notifications')
      .send({
        user: new mongoose.Types.ObjectId(),
        title: 'Test Notification',
        message: 'Test message',
        type: 'prescription'
      });

    expect(response.status).toBe(201);
    expect(response.body.message).toContain('created successfully');
  });

  // Test 14: Read notifications
  it('should get notifications (READ)', async () => {
    const Notification = require('../models/Notification');
    await Notification.create([
      {
        user: new mongoose.Types.ObjectId(),
        title: 'Notification 1',
        message: 'Message 1',
        type: 'system'
      },
      {
        user: new mongoose.Types.ObjectId(),
        title: 'Notification 2',
        message: 'Message 2',
        type: 'prescription'
      }
    ]);

    const response = await request(app)
      .get('/api/notifications');

    expect(response.status).toBe(200);
    expect(response.body.length).toBe(2);
  });

  // Test 15: Mark as read
  it('should mark notification as read (UPDATE)', async () => {
    const Notification = require('../models/Notification');
    const notification = await Notification.create({
      user: new mongoose.Types.ObjectId(),
      title: 'Unread Notification',
      message: 'Test message',
      type: 'system',
      isRead: false
    });

    const response = await request(app)
      .put(`/api/notifications/${notification._id}/read`);

    expect(response.status).toBe(200);
    expect(response.body.isRead).toBe(true);
  });

  // Test 16: Delete notification
  it('should delete notification (DELETE)', async () => {
    const Notification = require('../models/Notification');
    const notification = await Notification.create({
      user: new mongoose.Types.ObjectId(),
      title: 'To Delete',
      message: 'Test message',
      type: 'system'
    });

    const response = await request(app)
      .delete(`/api/notifications/${notification._id}`);

    expect(response.status).toBe(200);
    
    // Verify deletion
    const deleted = await Notification.findById(notification._id);
    expect(deleted).toBeNull();
  });
});