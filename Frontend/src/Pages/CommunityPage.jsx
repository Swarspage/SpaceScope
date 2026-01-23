import React, { useState, useEffect, useRef } from 'react';
import Sidebar from '../Components/Sidebar';
import { useAuth } from '../Context/AuthContext';
import { MdAddPhotoAlternate, MdFavorite, MdFavoriteBorder, MdDelete, MdLocationOn, MdClose } from 'react-icons/md';
import { FaUserAstronaut, FaSpinner, FaRegComment, FaRetweet, FaShare } from 'react-icons/fa';
import { Camera, X, Upload, Heart, MessageCircle, Repeat, Share2, MapPin } from 'lucide-react';
import api from '../services/api';
import { formatDistanceToNow, format } from 'date-fns';

const CommunityPage = () => {
    const { user } = useAuth();
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);

    // Create Post State
    const [isCreating, setIsCreating] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [caption, setCaption] = useState('');
    const [location, setLocation] = useState('');
    const fileInputRef = useRef(null);

    // Modal State
    const [selectedPost, setSelectedPost] = useState(null);

    // Polling
    useEffect(() => {
        fetchPosts();
        const interval = setInterval(fetchPosts, 15000);
        return () => clearInterval(interval);
    }, []);

    const fetchPosts = async () => {
        try {
            const res = await api.get('/posts');
            setPosts(res.data);
            setLoading(false);
        } catch (err) {
            console.error("Failed to fetch posts", err);
            setLoading(false);
        }
    };

    // --- CREATE POST LOGIC ---
    const handleFileSelect = (e) => {
        const selected = e.target.files[0];
        if (selected) {
            if (selected.size > 5 * 1024 * 1024) {
                alert("File size must be less than 5MB");
                return;
            }
            setFile(selected);
            setPreview(URL.createObjectURL(selected));
        }
    };

    const handleCreatePost = async () => {
        if (!file) return;
        setUploading(true);

        const formData = new FormData();
        formData.append('image', file);
        formData.append('caption', caption);
        formData.append('location', location);
        formData.append('user', user?.username || 'CosmicExplorer');

        try {
            await api.post('/posts', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            // Reset
            setFile(null);
            setPreview(null);
            setCaption('');
            setLocation('');
            setIsCreating(false);
            fetchPosts();
        } catch (err) {
            console.error("Upload failed", err);
            alert("Failed to post. Please try again.");
        } finally {
            setUploading(false);
        }
    };


    // --- ACTION LOGIC ---
    const handleLike = async (post, e) => {
        e.stopPropagation(); // Prevent modal open
        if (!user) return;

        // Optimistic UI
        const isLiked = post.likes.includes(user.username);
        const newLikes = isLiked
            ? post.likes.filter(u => u !== user.username)
            : [...post.likes, user.username];

        setPosts(posts.map(p => p._id === post._id ? { ...p, likes: newLikes } : p));
        if (selectedPost && selectedPost._id === post._id) {
            setSelectedPost({ ...selectedPost, likes: newLikes });
        }

        try {
            await api.post(`/posts/${post._id}/like`, { userId: user.username });
        } catch (err) {
            console.error("Like failed", err);
            fetchPosts(); // Revert on error
        }
    };

    const handleDelete = async (postId, postUser, e) => {
        e.stopPropagation();
        if (user?.username !== postUser) return;

        if (window.confirm("Are you sure you want to delete this post?")) {
            try {
                // Optimistic remove
                setPosts(posts.filter(p => p._id !== postId));
                if (selectedPost?._id === postId) setSelectedPost(null);

                await api.delete(`/posts/${postId}`, {
                    data: { userId: user.username }
                });
            } catch (err) {
                console.error("Delete failed", err);
                alert("Failed to delete post");
                fetchPosts();
            }
        }
    };

    // --- COMPONENTS ---

    const UserAvatar = ({ username, size = "md" }) => {
        const dimensions = size === "lg" ? "w-12 h-12 text-lg" : "w-10 h-10 text-sm";
        return (
            <div className={`${dimensions} rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center font-bold text-white shadow-lg`}>
                {username?.charAt(0).toUpperCase()}
            </div>
        );
    };

    return (
        <div className="flex h-screen bg-[#050714] text-slate-300 font-sans overflow-hidden">
            <Sidebar activeTab="Community" />

            <div className="flex-1 flex flex-col min-w-0 relative">

                {/* Header */}
                <header className="h-16 flex items-center justify-between px-6 border-b border-white/5 bg-black/20 backdrop-blur-md sticky top-0 z-10">
                    <h1 className="text-xl font-bold text-white">Galactic Feed</h1>
                </header>

                <main className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-white/10">
                    <div className="max-w-xl mx-auto w-full min-h-full border-x border-white/5 bg-black/10">

                        {/* 1. COMPOSER (Tweet Box) */}
                        <div className="p-4 border-b border-white/10">
                            <div className="flex gap-4">
                                <UserAvatar username={user?.username || 'Guest'} />
                                <div className="flex-1">
                                    {!isCreating ? (
                                        <div
                                            onClick={() => setIsCreating(true)}
                                            className="w-full bg-white/5 rounded-full py-3 px-4 text-slate-500 cursor-text hover:bg-white/10 transition-colors"
                                        >
                                            What's happening in the cosmos?
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            <textarea
                                                value={caption}
                                                onChange={(e) => setCaption(e.target.value)}
                                                placeholder="What's happening in the cosmos?"
                                                className="w-full bg-transparent text-white text-lg placeholder-slate-500 outline-none resize-none min-h-[80px]"
                                                autoFocus
                                            />

                                            {preview && (
                                                <div className="relative rounded-2xl overflow-hidden max-h-64 border border-white/10">
                                                    <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                                                    <button
                                                        onClick={() => { setFile(null); setPreview(null); }}
                                                        className="absolute top-2 right-2 p-1 bg-black/50 rounded-full text-white hover:bg-black/70"
                                                    >
                                                        <X size={16} />
                                                    </button>
                                                </div>
                                            )}

                                            <div className="flex items-center justify-between pt-2 border-t border-white/10">
                                                <div className="flex gap-2 text-[#00d9ff]">
                                                    <button onClick={() => fileInputRef.current.click()} className="p-2 hover:bg-[#00d9ff]/10 rounded-full transition-colors">
                                                        <Camera size={20} />
                                                    </button>
                                                    <div className="relative group">
                                                        <button className="p-2 hover:bg-[#00d9ff]/10 rounded-full transition-colors">
                                                            <MapPin size={20} />
                                                        </button>
                                                        {/* Simple location input popover */}
                                                        <div className="absolute top-full left-0 mt-2 bg-[#0f1322] border border-white/10 p-2 rounded-lg hidden group-hover:block z-20 w-48">
                                                            <input
                                                                type="text"
                                                                value={location}
                                                                onChange={(e) => setLocation(e.target.value)}
                                                                placeholder="Add Location"
                                                                className="w-full bg-black/30 text-xs text-white p-1 rounded outline-none"
                                                            />
                                                        </div>
                                                    </div>
                                                    <input
                                                        ref={fileInputRef}
                                                        type="file"
                                                        hidden
                                                        accept="image/*"
                                                        onChange={handleFileSelect}
                                                    />
                                                </div>
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => { setIsCreating(false); setFile(null); setPreview(null); setCaption(''); }}
                                                        className="px-4 py-1.5 rounded-full text-sm font-bold text-slate-400 hover:bg-white/5"
                                                    >
                                                        Cancel
                                                    </button>
                                                    <button
                                                        onClick={handleCreatePost}
                                                        disabled={!file || uploading}
                                                        className={`px-5 py-1.5 rounded-full text-sm font-bold bg-[#00d9ff] text-black hover:bg-[#00d9ff]/90 transition-all ${(!file || uploading) ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                    >
                                                        {uploading ? 'Posting...' : 'Post'}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* 2. FEED */}
                        {loading ? (
                            <div className="p-8 flex justify-center"><FaSpinner className="animate-spin text-[#00d9ff] text-2xl" /></div>
                        ) : (
                            <div className="divide-y divide-white/10">
                                {posts.map(post => {
                                    const isLiked = post.likes.includes(user?.username);
                                    const isOwner = user?.username === post.user;

                                    return (
                                        <article
                                            key={post._id}
                                            onClick={() => setSelectedPost(post)}
                                            className="p-4 hover:bg-white/[0.02] cursor-pointer transition-colors"
                                        >
                                            <div className="flex gap-3">
                                                <UserAvatar username={post.user} />
                                                <div className="flex-1 min-w-0">
                                                    {/* Post Header */}
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-2 truncate">
                                                            <span className="font-bold text-white">{post.user}</span>
                                                            <span className="text-slate-500 text-sm">@{post.user.toLowerCase()}</span>
                                                            <span className="text-slate-500 text-sm">·</span>
                                                            <span className="text-slate-500 text-sm hover:underline">
                                                                {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true }).replace('about ', '')}
                                                            </span>
                                                        </div>
                                                        {isOwner && (
                                                            <button
                                                                onClick={(e) => handleDelete(post._id, post.user, e)}
                                                                className="text-slate-500 hover:text-red-500 p-1 rounded-full hover:bg-red-500/10 transition-colors"
                                                            >
                                                                <MdDelete />
                                                            </button>
                                                        )}
                                                    </div>

                                                    {/* Post Body */}
                                                    <p className="text-slate-200 mt-1 mb-2 whitespace-pre-wrap break-words text-[15px] line-clamp-2">
                                                        {post.caption}
                                                    </p>

                                                    {/* Post Image */}
                                                    <div className="rounded-xl overflow-hidden border border-white/10 mt-2 max-h-[400px]">
                                                        <img src={post.imageUrl} alt="Post" className="w-full h-full object-cover" />
                                                    </div>

                                                    {/* Post Footer (Actions) */}
                                                    <div className="flex justify-between mt-3 text-slate-500 max-w-xs">
                                                        <button
                                                            className="flex items-center gap-2 group hover:text-pink-500 transition-colors"
                                                            onClick={(e) => handleLike(post, e)}
                                                        >
                                                            <div className="p-2 rounded-full group-hover:bg-pink-500/10 relative">
                                                                {isLiked ? <MdFavorite className="text-pink-500 text-lg" /> : <MdFavoriteBorder className="text-lg" />}
                                                            </div>
                                                            <span className={`text-sm ${isLiked ? 'text-pink-500' : ''}`}>{post.likes.length || ''}</span>
                                                        </button>

                                                        <button className="flex items-center gap-2 group hover:text-[#00d9ff] transition-colors">
                                                            <div className="p-2 rounded-full group-hover:bg-[#00d9ff]/10">
                                                                <MessageCircle size={18} />
                                                            </div>
                                                        </button>

                                                        <button className="flex items-center gap-2 group hover:text-green-500 transition-colors">
                                                            <div className="p-2 rounded-full group-hover:bg-green-500/10">
                                                                <Repeat size={18} />
                                                            </div>
                                                        </button>

                                                        <button className="flex items-center gap-2 group hover:text-[#00d9ff] transition-colors">
                                                            <div className="p-2 rounded-full group-hover:bg-[#00d9ff]/10">
                                                                <Share2 size={18} />
                                                            </div>
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </article>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </main>

                {/* 3. DETAIL MODAL */}
                {selectedPost && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={() => setSelectedPost(null)}>
                        <div
                            className="bg-[#0f1322] border border-white/10 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto relative shadow-2xl"
                            onClick={e => e.stopPropagation()}
                        >
                            <button
                                onClick={() => setSelectedPost(null)}
                                className="sticky top-0 left-0 m-4 p-2 bg-black/50 rounded-full text-white hover:bg-white/20 transition-colors z-20"
                            >
                                <X size={20} />
                            </button>

                            <div className="p-0">
                                <img src={selectedPost.imageUrl} alt="Full view" className="w-full max-h-[60vh] object-contain bg-black" />
                            </div>

                            <div className="p-5">
                                <div className="flex gap-3 mb-4">
                                    <UserAvatar username={selectedPost.user} size="lg" />
                                    <div>
                                        <div className="font-bold text-white text-lg">{selectedPost.user}</div>
                                        <div className="text-slate-500">@{selectedPost.user.toLowerCase()}</div>
                                    </div>
                                </div>

                                <p className="text-white text-xl leading-relaxed whitespace-pre-wrap mb-4">
                                    {selectedPost.caption}
                                </p>

                                {selectedPost.location && (
                                    <div className="flex items-center gap-1 text-slate-400 mb-4 text-sm">
                                        <MapPin size={16} /> {selectedPost.location}
                                    </div>
                                )}

                                <div className="border-b border-white/10 pb-4 mb-4 text-slate-500 text-[15px] flex gap-2">
                                    <span>{format(new Date(selectedPost.createdAt), 'h:mm a')}</span>
                                    <span>·</span>
                                    <span>{format(new Date(selectedPost.createdAt), 'MMM d, yyyy')}</span>
                                </div>

                                <div className="flex items-center border-b border-white/10 pb-4 mb-4 gap-6">
                                    <div className="flex gap-1">
                                        <span className="font-bold text-white">{selectedPost.likes.length}</span>
                                        <span className="text-slate-500">Likes</span>
                                    </div>
                                </div>

                                <div className="flex justify-around text-slate-400">
                                    <button onClick={(e) => handleLike(selectedPost, e)} className="p-2 rounded-full hover:bg-pink-500/10 hover:text-pink-500 transition-colors">
                                        {selectedPost.likes.includes(user?.username) ? <MdFavorite size={24} className="text-pink-500" /> : <MdFavoriteBorder size={24} />}
                                    </button>
                                    <button className="p-2 rounded-full hover:bg-[#00d9ff]/10 hover:text-[#00d9ff] transition-colors"><MessageCircle size={24} /></button>
                                    <button className="p-2 rounded-full hover:bg-green-500/10 hover:text-green-500 transition-colors"><Repeat size={24} /></button>
                                    <button className="p-2 rounded-full hover:bg-[#00d9ff]/10 hover:text-[#00d9ff] transition-colors"><Share2 size={24} /></button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
};

export default CommunityPage;
