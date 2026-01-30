import mongoose from 'mongoose';
import Notification from './Models/Notification.js';
import User from './Models/User.js';
import dotenv from 'dotenv';

dotenv.config();

console.log("Current directory:", process.cwd());
console.log("MONGODB_URI exists:", !!process.env.MONGODB_URI);
if (!process.env.MONGODB_URI) {
    console.error("MONGODB_URI is missing from environment variables!");
    process.exit(1);
}

const createTestNotification = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected to MongoDB");

        // Find a user (any user)
        const user = await User.findOne();
        if (!user) {
            console.log("No users found.");
            return;
        }

        console.log(`Sending notification to user: ${user.username} (${user._id})`);

        await Notification.create({
            recipient: user._id,
            title: "System Test",
            message: "This is a test notification to verify the new notification system.",
            type: "system",
            link: "/dashboard"
        });

        console.log("Notification created successfully!");

        // Create an 'event' one too (simulating Aurora)
        await Notification.create({
            recipient: user._id,
            title: "Aurora Alert!",
            message: "High geomagnetic activity detected (Kp 7.0). Auroras may be visible!",
            type: "alert",
            link: "/aurora"
        });

        console.log("Event notification created successfully!");

    } catch (error) {
        console.error("Error:", error);
    } finally {
        await mongoose.disconnect();
    }
};

createTestNotification();
