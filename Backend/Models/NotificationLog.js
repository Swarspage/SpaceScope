import mongoose from 'mongoose';

const notificationLogSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    eventType: { type: String, required: true }, // 'iss_pass', 'aurora', 'meteor'
    eventId: { type: String, required: true }, // unique identifier
    emailDetails: {
        messageId: String,
        subject: String,
        sentAt: { type: Date, default: Date.now },
        status: { type: String, default: 'sent' }
    },
    eventData: mongoose.Schema.Types.Mixed
});

notificationLogSchema.index({ userId: 1, eventId: 1 }, { unique: true });

export default mongoose.model('NotificationLog', notificationLogSchema);
