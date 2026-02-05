import User from '../Models/User.js';
import NotificationLog from '../Models/NotificationLog.js';
import { sendISSPassEmail } from './emailService.js';
import { calculateISSPasses } from '../utils/issPassCalculator.js';

export const checkAndSendISSNotifications = async () => {
    console.log('🔍 Checking ISS passes...');

    try {
        // Get all users with ISS notifications enabled
        const users = await User.find({
            'notificationSettings.isSubscribed': true,
            'notificationSettings.preferences.issPass.enabled': true,
            'notificationSettings.location.latitude': { $ne: null }
        });

        console.log(`Found ${users.length} users to check`);

        for (const user of users) {
            try {
                const { latitude, longitude } = user.notificationSettings.location;
                const minElevation = user.notificationSettings.preferences.issPass?.minElevation || 30;

                // Get upcoming ISS passes
                const passes = await calculateISSPasses(latitude, longitude);

                // Filter passes that meet criteria
                const validPasses = passes.filter(pass =>
                    pass.maxElevation >= minElevation &&
                    pass.hoursUntil > 1 && // At least 1 hour notice
                    pass.hoursUntil < 6    // Not more than 6 hours away
                );

                for (const pass of validPasses) {
                    // Create unique event ID
                    const eventId = `iss-${pass.startTime.toISOString().split('T')[0]}-${pass.startTime.getHours()}${pass.startTime.getMinutes()}`;

                    // Check if already notified
                    const existingLog = await NotificationLog.findOne({
                        userId: user._id,
                        eventId: eventId
                    });

                    if (existingLog) {
                        console.log(`Already notified user ${user.username} for ${eventId}`);
                        continue;
                    }

                    // Send email
                    console.log(`Sending ISS notification to ${user.username}`);
                    const emailResult = await sendISSPassEmail(user, pass);

                    // Log notification
                    await NotificationLog.create({
                        userId: user._id,
                        eventType: 'iss_pass',
                        eventId: eventId,
                        emailDetails: {
                            messageId: emailResult.id,
                            subject: `ISS visible in ${pass.hoursUntil} hours!`,
                            sentAt: new Date(),
                            status: 'sent'
                        },
                        eventData: pass
                    });

                    console.log(`✅ Sent ISS notification to ${user.username}`);
                }
            } catch (error) {
                console.error(`Error processing user ${user.username}:`, error);
            }
        }

        console.log('✅ ISS notification check complete');
    } catch (error) {
        console.error('ISS notification error:', error);
    }
};
