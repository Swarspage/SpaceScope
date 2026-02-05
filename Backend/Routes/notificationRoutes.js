import express from 'express';
import { getNotifications, markAsRead, markAllAsRead, getPreferences, updatePreferences } from '../Controllers/notificationController.js';
import { sendISSPassEmail } from '../services/emailService.js';
import User from '../Models/User.js';


const router = express.Router();

// Get all notifications for a user
router.get('/:userId', getNotifications);

// Mark specific notification as read
router.put('/:id/read', markAsRead);

// Mark all notifications for a user as read
router.put('/:userId/read-all', markAllAsRead);

// Notification Preferences
router.get('/:userId/preferences', getPreferences);
router.put('/:userId/preferences', updatePreferences);

// Test notification endpoint (modified to accept userId in body since no authMiddleware found)
router.post('/test-email', async (req, res) => {
    try {
        const { userId } = req.body;
        if (!userId) {
            return res.status(400).json({ error: 'UserId is required in body' });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Mock pass data for testing
        const testPassData = {
            riseTime: new Date(Date.now() + 3 * 60 * 60 * 1000).toLocaleString(),
            maxElevation: 67,
            duration: 6,
            direction: 'SW → NE',
            hoursUntil: 3
        };

        await sendISSPassEmail(user, testPassData);

        console.log(`Test email sent to: ${user.email}`);

        res.json({ message: 'Test email sent successfully!' });
    } catch (error) {
        console.error('Test email error:', error);
        res.status(500).json({ error: error.message });
    }
});

export default router;
