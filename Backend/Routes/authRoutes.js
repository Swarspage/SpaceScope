import express from 'express';
import { register, login, getProfile, updateProfile, updateTutorialStatus, getLeaderboard, submitQuizResult } from '../Controllers/authController.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/profile/:userId', getProfile);
router.put('/profile/:userId', updateProfile);
router.put('/profile/:userId/tutorial', updateTutorialStatus);
router.get('/leaderboard', getLeaderboard);
router.post('/quiz-result', submitQuizResult);

export default router;