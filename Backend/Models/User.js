import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    fullName: {
        type: String,
        trim: true
    },
    location: {
        type: String,
        trim: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    notificationSettings: {
        isSubscribed: { type: Boolean, default: true },
        preferences: {
            issPass: {
                enabled: { type: Boolean, default: true },
                minElevation: { type: Number, default: 30 }
            },
            aurora: {
                enabled: { type: Boolean, default: true },
                minKpIndex: { type: Number, default: 5 }
            },
            meteorShower: {
                enabled: { type: Boolean, default: true }
            }
        },
        location: {
            latitude: { type: Number, default: null },
            longitude: { type: Number, default: null },
            city: { type: String, default: '' }
        }
    },
    tutorialCompleted: {
        type: Boolean,
        default: false
    },
    xp: {
        type: Number,
        default: 0
    },
    quizHistory: [{
        topic: String,
        difficulty: String,
        score: Number,
        correctAnswers: Number,
        totalQuestions: Number,
        date: { type: Date, default: Date.now }
    }]
});

// Hash password before saving
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

// Method to compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model('User', userSchema);