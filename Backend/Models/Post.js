import mongoose from 'mongoose';

const postSchema = new mongoose.Schema({
    user: {
        type: String, // Store username or userId
        required: true
    },
    imageUrl: {
        type: String,
        required: true
    },
    caption: {
        type: String,
        maxlength: 500
    },
    location: {
        type: String, // City, Country or Space Coords
        default: ''
    },
    likes: {
        type: [String], // Array of User IDs who liked the post to prevent duplicates
        default: []
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Post = mongoose.model('Post', postSchema);
export default Post;
