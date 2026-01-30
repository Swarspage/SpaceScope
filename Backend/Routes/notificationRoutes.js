import express from 'express';
import { getNotifications, markAsRead, markAllAsRead } from '../Controllers/notificationController.js';

const router = express.Router();

// Get all notifications for a user
router.get('/:userId', getNotifications);

// Mark specific notification as read
router.put('/:id/read', markAsRead);

// Mark all notifications for a user as read
router.put('/:userId/read-all', markAllAsRead);

export default router;
