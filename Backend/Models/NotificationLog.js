import mongoose from 'mongoose';

const notificationLogSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    eventType: {
        type: String, // 'iss_pass', 'aurora_alert', etc.
        required: true
    },
    eventId: {
        type: String, // Unique ID for the event (e.g., iss-2024-05-12-1430)
        required: true
    },
    emailDetails: {
        messageId: String,
        subject: String,
        sentAt: Date,
        status: String
    },
    eventData: {
        type: Map,
        of: mongoose.Schema.Types.Mixed
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 604800 // Automatically delete logs after 7 days (60*60*24*7)
    }
});

// Compound index to ensure uniqueness per user per event
notificationLogSchema.index({ userId: 1, eventId: 1 }, { unique: true });

const NotificationLog = mongoose.model('NotificationLog', notificationLogSchema);

export default NotificationLog;
