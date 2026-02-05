import cron from 'node-cron';
import { checkAndSendISSNotifications } from './notificationService.js';

export const startScheduler = () => {
    console.log('🚀 Starting notification scheduler...');

    // Check ISS passes every 30 minutes
    cron.schedule('*/30 * * * *', async () => {
        console.log('⏰ Running ISS pass check...');
        await checkAndSendISSNotifications();
    });

    // Run once immediately on startup for testing (with small delay to ensure DB connected)
    setTimeout(() => {
        console.log('Running initial ISS check...');
        checkAndSendISSNotifications();
    }, 5000);

    console.log('✅ Scheduler started - checking ISS passes every 30 minutes');
};
