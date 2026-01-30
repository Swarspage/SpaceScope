import mongoose from 'mongoose';
import Notification from '../Backend/Models/Notification.js';
import User from '../Backend/Models/User.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../Backend/.env') });

const createTestNotification = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
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

        // Create an 'event' one too
        await Notification.create({
            recipient: user._id,
            title: "Meteor Shower Alert",
            message: "The Perseids are peaking tonight! Look up!",
            type: "event",
            link: "/meteors"
        });

        console.log("Event notification created successfully!");

    } catch (error) {
        console.error("Error:", error);
    } finally {
        await mongoose.disconnect();
    }
};

createTestNotification();
