import User from '../Models/User.js';

// Register new user
export const register = async (req, res) => {
    try {
        const { username, email, password, fullName, location } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({
            $or: [{ email }, { username }]
        });

        if (existingUser) {
            return res.status(400).json({
                error: 'User with this email or username already exists'
            });
        }

        // Create new user
        const user = new User({
            username,
            email,
            password,
            fullName,
            location
        });

        await user.save();

        // Return user data (without password)
        res.status(201).json({
            message: 'Registration successful',
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                fullName: user.fullName,
                location: user.location,
                createdAt: user.createdAt,
                tutorialCompleted: user.tutorialCompleted
            }
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Registration failed' });
    }
};

// Login user
export const login = async (req, res) => {
    try {
        const { emailOrUsername, password } = req.body;

        // Find user by email or username
        const user = await User.findOne({
            $or: [
                { email: emailOrUsername },
                { username: emailOrUsername }
            ]
        });

        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Check password
        const isPasswordValid = await user.comparePassword(password);

        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Return user data (without password)
        res.status(200).json({
            message: 'Login successful',
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                fullName: user.fullName,
                location: user.location,
                createdAt: user.createdAt,
                tutorialCompleted: user.tutorialCompleted
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Login failed' });
    }
};

// Get user profile
export const getProfile = async (req, res) => {
    try {
        const { userId } = req.params;

        const user = await User.findById(userId).select('-password');

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.status(200).json({ user });
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({ error: 'Failed to fetch profile' });
    }
};

// Update user profile
export const updateProfile = async (req, res) => {
    try {
        const { userId } = req.params;
        const { fullName, location } = req.body;

        const user = await User.findByIdAndUpdate(
            userId,
            { fullName, location },
            { new: true, runValidators: true }
        ).select('-password');

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.status(200).json({
            message: 'Profile updated successfully',
            user
        });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ error: 'Failed to update profile' });
    }
};

// Update tutorial status
export const updateTutorialStatus = async (req, res) => {
    try {
        const { userId } = req.params;
        const { tutorialCompleted } = req.body;

        const user = await User.findByIdAndUpdate(
            userId,
            { tutorialCompleted },
            { new: true }
        ).select('-password');

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.status(200).json({
            message: 'Tutorial status updated',
            user
        });
    } catch (error) {
        console.error('Update tutorial status error:', error);
        res.status(500).json({ error: 'Failed to update tutorial status' });
    }
};

// Get leaderboard
export const getLeaderboard = async (req, res) => {
    try {
        // Fetch top 50 users sorted by XP in descending order
        const leaderboard = await User.find({})
            .select('username xp avatar quizHistory') // Select fields to display
            .sort({ xp: -1 }) // Sort by XP descending
            .limit(50); // Limit to top 50

        res.status(200).json({ leaderboard });
    } catch (error) {
        console.error('Get leaderboard error:', error);
        res.status(500).json({ error: 'Failed to fetch leaderboard' });
    }
};

// Submit quiz result
export const submitQuizResult = async (req, res) => {
    try {
        // We assume the user is authenticated and req.user or req.body contains userId if not using middleware putting user on req
        // For this setup, we'll assume userId is passed in body as per other methods or via auth middleware if it existed.
        // Looking at other methods, they don't seem to use a middleware that populates req.user, but updateProfile uses req.params.userId.
        // Let's expect userId in the body for now to be safe, or we can add it to the route params. 
        // Best practice is auth middleware, but sticking to existing pattern: strict body/params.

        // However, usually "submit result" is a POST. Let's use body for userId for now to match style if valid 
        // OR better: The user should be logged in. 
        // I will assume userId is sent in the body along with quiz data.

        const { userId, topic, difficulty, score, correctAnswers, totalQuestions } = req.body;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Update XP
        user.xp = (user.xp || 0) + score;

        // Add to history
        user.quizHistory.push({
            topic,
            difficulty,
            score,
            correctAnswers,
            totalQuestions,
            date: new Date()
        });

        await user.save();

        res.status(200).json({
            message: 'Quiz result submitted successfully',
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                fullName: user.fullName,
                xp: user.xp,
                quizHistory: user.quizHistory
            }
        });

    } catch (error) {
        console.error('Submit quiz result error:', error);
        res.status(500).json({ error: 'Failed to submit quiz result' });
    }
};

// Delete user profile
export const deleteProfile = async (req, res) => {
    try {
        const { userId } = req.params;

        const user = await User.findByIdAndDelete(userId);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.status(200).json({ message: 'User account deleted successfully' });
    } catch (error) {
        console.error('Delete profile error:', error);
        res.status(500).json({ error: 'Failed to delete account' });
    }
};
