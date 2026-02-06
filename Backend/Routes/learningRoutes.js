import express from 'express';
import User from '../Models/User.js';

const router = express.Router();

/**
 * GET /api/learning/progress
 * Get authenticated user's learning progress
 */
router.get('/progress', async (req, res) => {
    try {
        const { userId } = req.query; // Or from auth middleware req.user.id if available

        if (!userId) {
            return res.status(400).json({ error: "User ID required" });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        // Initialize learning_progress if it doesn't exist
        if (!user.learning_progress) {
            user.learning_progress = { modules: [], total_learning_xp: 0, badges: [] };
            await user.save();
        }

        res.json({ success: true, progress: user.learning_progress });
    } catch (error) {
        console.error("Error fetching progress:", error);
        res.status(500).json({ error: "Failed to fetch progress" });
    }
});

/**
 * POST /api/learning/complete-content
 * Mark content (video/article/quiz) as complete for a module.
 * Logic:
 * 1. Find or create module entry in user.learning_progress.
 * 2. Add content type to completed_content if new.
 * 3. Recalculate percentage (3 items = 100%).
 * 4. If 100%, mark unlocked=true for NEXT module (id+1), award XP, award Badge.
 */
router.post('/complete-content', async (req, res) => {
    try {
        const { userId, moduleId, contentType, moduleRewardXP, moduleBadge } = req.body;

        if (!userId || !moduleId || !contentType) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ error: "User not found" });

        // Ensure subdoc exists
        if (!user.learning_progress) {
            user.learning_progress = { modules: [], total_learning_xp: 0, badges: [] };
        }

        // Find or create specific module progress
        let moduleEntry = user.learning_progress.modules.find(m => m.module_id === moduleId);
        if (!moduleEntry) {
            moduleEntry = {
                module_id: moduleId,
                completed_content: [],
                completion_percentage: 0,
                xp_earned: 0,
                unlocked: true // Implicitly unlocked if they are completing content
            };
            user.learning_progress.modules.push(moduleEntry);
            // Re-fetch reference from array after push? No, just find it again or modify object ref if pushed
            moduleEntry = user.learning_progress.modules.find(m => m.module_id === moduleId);
        }

        // Add content type if not present
        if (!moduleEntry.completed_content.includes(contentType)) {
            moduleEntry.completed_content.push(contentType);
        }

        // Calculate Percentage (Assuming 3 content items per module: video, article, quiz)
        const totalItems = 3;
        const percentage = Math.round((moduleEntry.completed_content.length / totalItems) * 100);
        moduleEntry.completion_percentage = percentage;

        let newXp = 0;
        let newBadge = null;
        let nextModuleUnlocked = false;

        // Check for Module Completion (First time reaching 100%)
        if (percentage >= 100 && !moduleEntry.completed_at) {
            moduleEntry.completed_at = new Date();

            // Award XP
            const xpReward = moduleRewardXP || 0;
            moduleEntry.xp_earned = xpReward;
            user.learning_progress.total_learning_xp += xpReward;
            user.xp += xpReward; // Add to global user XP
            newXp = xpReward;

            // Award Badge
            if (moduleBadge && !user.learning_progress.badges.includes(moduleBadge)) {
                user.learning_progress.badges.push(moduleBadge);
                newBadge = moduleBadge;
            }

            // Unlock Next Module
            // Logic: Assume next module ID is current + 1
            const nextId = moduleId + 1;
            const nextModuleExists = user.learning_progress.modules.find(m => m.module_id === nextId);

            // Determine if next module is valid (max 6 modules). 
            // In a real app we might check against static data, but here we just unlock.
            if (!nextModuleExists && nextId <= 6) {
                user.learning_progress.modules.push({
                    module_id: nextId,
                    completed_content: [],
                    completion_percentage: 0,
                    xp_earned: 0,
                    unlocked: true // This is the key unlock
                });
                nextModuleUnlocked = true;
            } else if (nextModuleExists) {
                nextModuleExists.unlocked = true;
                nextModuleUnlocked = true;
            }
        }

        await user.save();

        res.json({
            success: true,
            progress: user.learning_progress,
            updates: {
                newXp,
                newBadge,
                moduleCompleted: !!moduleEntry.completed_at && percentage === 100,
                nextModuleUnlocked
            }
        });

    } catch (error) {
        console.error("Error completing content:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

export default router;
