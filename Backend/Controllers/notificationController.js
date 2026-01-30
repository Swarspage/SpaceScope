import Notification from '../Models/Notification.js';
import User from '../Models/User.js';

// Get notifications for a user
export const getNotifications = async (req, res) => {
    try {
        const { userId } = req.params;
        const notifications = await Notification.find({ recipient: userId })
            .sort({ createdAt: -1 }) // Newest first
            .limit(50); // Limit to last 50

        // Count unread
        const unreadCount = await Notification.countDocuments({ recipient: userId, isRead: false });

        res.status(200).json({ notifications, unreadCount });
    } catch (error) {
        console.error('Get notifications error:', error);
        res.status(500).json({ error: 'Failed to fetch notifications' });
    }
};

// Mark a single notification as read
export const markAsRead = async (req, res) => {
    try {
        const { id } = req.params;
        const notification = await Notification.findByIdAndUpdate(
            id,
            { isRead: true },
            { new: true }
        );
        res.status(200).json({ notification });
    } catch (error) {
        console.error('Mark as read error:', error);
        res.status(500).json({ error: 'Failed to update notification' });
    }
};

// Mark all as read for a user
export const markAllAsRead = async (req, res) => {
    try {
        const { userId } = req.params;
        await Notification.updateMany(
            { recipient: userId, isRead: false },
            { isRead: true }
        );
        res.status(200).json({ message: 'All marked as read' });
    } catch (error) {
        console.error('Mark all read error:', error);
        res.status(500).json({ error: 'Failed to update notifications' });
    }
};

// Internal helper to create system notifications (not an API endpoint usually, but can be)
export const createSystemNotification = async (userId, title, message, type = 'system', link = '') => {
    try {
        await Notification.create({
            recipient: userId,
            title,
            message,
            type,
            link
        });
        console.log(`Notification sent to ${userId}: ${title}`);
    } catch (error) {
        console.error('Failed to create notification:', error);
    }
};

// Broadcast to all users (Internal helper)
export const broadcastNotification = async (title, message, type = 'system', link = '') => {
    try {
        const users = await User.find({}, '_id');
        const notifications = users.map(user => ({
            recipient: user._id,
            title,
            message,
            type,
            link
        }));

        if (notifications.length > 0) {
            await Notification.insertMany(notifications);
            console.log(`Broadcast sent to ${notifications.length} users: ${title}`);
        }
    } catch (error) {
        console.error('Broadcast error:', error);
    }
};
