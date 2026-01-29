import express from 'express';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import Post from '../Models/Post.js';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

// Cloudinary Config
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Multer Storage Setup
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'spacescope_community',
        allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
    },
});

const upload = multer({ storage: storage });

// Routes

// GET all posts (sorted by newest)
router.get('/', async (req, res) => {
    try {
        const posts = await Post.find().sort({ createdAt: -1 }).limit(50);
        res.json(posts);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch posts' });
    }
});

// POST a new image
router.post('/', upload.single('image'), async (req, res) => {
    try {
        const { user, caption, location } = req.body;

        // Uses uploaded file OR a default space placeholder if text-only
        const imageUrl = req.file
            ? req.file.path
            : 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=800&q=80';

        const newPost = new Post({
            user: user || 'Anonymous',
            imageUrl: imageUrl,
            caption: caption || '',
            location: location || ''
        });

        await newPost.save();
        res.status(201).json(newPost);
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ error: 'Failed to create post' });
    }
});

// LIKE a post
// TOGGLE LIKE
router.post('/:id/like', async (req, res) => {
    try {
        const { userId } = req.body;
        if (!userId) return res.status(400).json({ error: 'User ID required' });

        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ error: 'Post not found' });

        const index = post.likes.indexOf(userId);
        if (index === -1) {
            // Like
            post.likes.push(userId);
        } else {
            // Unlike
            post.likes.splice(index, 1);
        }

        await post.save();
        res.json(post);
    } catch (error) {
        res.status(500).json({ error: 'Failed to like post' });
    }
});

// DELETE Post
router.delete('/:id', async (req, res) => {
    try {
        const { userId } = req.body; // In a real app, use auth middleware token
        const post = await Post.findById(req.params.id);

        if (!post) return res.status(404).json({ error: 'Post not found' });

        // Simple ownership check - strictly matches the stored username/userId
        if (post.user !== userId) {
            return res.status(403).json({ error: 'Unauthorized: You can only delete your own posts' });
        }

        // Optional: Delete image from Cloudinary here if you want to save space
        // const publicId = post.imageUrl.split('/').pop().split('.')[0];
        // await cloudinary.uploader.destroy(`spacescope_community/${publicId}`);

        await Post.findByIdAndDelete(req.params.id);
        res.json({ message: 'Post deleted successfully' });
    } catch (error) {
        console.error("Delete error:", error);
        res.status(500).json({ error: 'Failed to delete post' });
    }
});

export default router;
