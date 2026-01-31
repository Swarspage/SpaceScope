import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { MdPerson, MdEmail, MdLocationOn, MdCalendarToday, MdEdit, MdLogout, MdSave, MdCancel, MdCameraAlt, MdFavorite } from 'react-icons/md';
import { FaUserAstronaut } from 'react-icons/fa';


const ProfilePage = () => {
    const { user, logout, updateUser } = useAuth();
    const navigate = useNavigate();
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        fullName: user?.fullName || '',
        location: user?.location || '',
        bio: "Space enthusiast and explorer.", // Mock bio if not in DB
    });

    const [userPosts, setUserPosts] = useState([]);
    const [loadingPosts, setLoadingPosts] = useState(true);

    useEffect(() => {
        const fetchUserPosts = async () => {
            if (!user?.username) return;
            try {
                const res = await api.get('/posts');
                // Filter for current user's posts
                const myPosts = res.data.filter(p => p.user === user.username);
                setUserPosts(myPosts);
            } catch (err) {
                console.error("Failed to fetch user posts", err);
            } finally {
                setLoadingPosts(false);
            }
        };

        fetchUserPosts();
    }, [user?.username]);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            const response = await api.put(`/auth/profile/${user.id}`, formData);
            updateUser(response.data.user);
            setIsEditing(false);
        } catch (error) {
            console.error('Update failed:', error);
        }
    };

    // --- Delete Account Logic ---
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDeleteAccount = async () => {
        setIsDeleting(true);
        try {
            await api.delete(`/auth/profile/${user.id}`);
            logout();
            navigate('/login');
        } catch (error) {
            console.error('Delete error:', error);
            setIsDeleting(false);
            setShowDeleteModal(false);
        }
    };

    return (
        <div className="flex h-screen bg-[#050714] text-slate-300 font-sans overflow-hidden selection:bg-[#00d9ff]/30">
            {/* TargetCursor removed (global) */}
            <Sidebar activeTab="Community" /> {/* Highlighting Community as Profile is usually near user actions */}

            <main className="flex-1 overflow-auto relative">
                {/* Ambient Background Glows */}
                <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-[120px] pointer-events-none" />
                <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] bg-[#00d9ff]/5 rounded-full blur-[100px] pointer-events-none" />

                <div className="max-w-5xl mx-auto p-8 lg:p-12 relative z-10">

                    {/* Header */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
                        <div>
                            <h1 className="text-4xl font-black text-white tracking-tight mb-2">My Profile</h1>
                            <p className="text-slate-400">Manage your account settings and preferences.</p>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="cursor-target flex items-center gap-2 px-5 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 rounded-xl transition-all hover:scale-105 font-bold text-sm"
                        >
                            <MdLogout className="text-lg" /> Sign Out
                        </button>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                        {/* Left Column: User Card */}
                        <div className="lg:col-span-1">
                            <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-3xl p-6 flex flex-col items-center text-center shadow-xl relative overflow-hidden group">
                                <div className="absolute inset-0 bg-gradient-to-b from-[#00d9ff]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                <div className="cursor-target relative mb-6 group/avatar cursor-pointer">
                                    <div className="w-32 h-32 rounded-full p-1 bg-gradient-to-tr from-[#00d9ff] to-purple-500 relative z-10">
                                        <div className="w-full h-full rounded-full bg-[#0a0e17] flex items-center justify-center overflow-hidden relative">
                                            {user?.username ? (
                                                <span className="text-5xl font-black text-white">
                                                    {user.username.charAt(0).toUpperCase()}
                                                </span>
                                            ) : (
                                                <FaUserAstronaut className="text-5xl text-slate-500" />
                                            )}
                                        </div>
                                    </div>
                                    <div className="absolute bottom-0 right-0 z-20 bg-[#00d9ff] text-black p-2 rounded-full border-4 border-[#0a0e17] opacity-0 group-hover/avatar:opacity-100 transition-all translate-y-2 group-hover/avatar:translate-y-0">
                                        <MdCameraAlt />
                                    </div>
                                </div>

                                <h2 className="text-2xl font-bold text-white mb-1">
                                    {user?.fullName || user?.username || "Space Explorer"}
                                </h2>
                                <p className="text-[#00d9ff] font-medium text-sm mb-4">@{user?.username || "explorer"}</p>

                                <div className="flex gap-2 mb-6">
                                    <span className="px-3 py-1 rounded-full bg-[#00d9ff]/10 text-[#00d9ff] border border-[#00d9ff]/20 text-[10px] font-bold uppercase tracking-wider">
                                        Pro Member
                                    </span>
                                    <span className="px-3 py-1 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20 text-[10px] font-bold uppercase tracking-wider">
                                        Lvl 5
                                    </span>
                                </div>

                                <div className="w-full pt-6 border-t border-white/5 grid grid-cols-3 gap-2">
                                    <div className="text-center">
                                        <div className="text-white font-bold text-lg">12</div>
                                        <div className="text-[10px] text-slate-500 uppercase font-bold">Missions</div>
                                    </div>
                                    <div className="text-center border-l border-white/5 border-r">
                                        <div className="text-white font-bold text-lg">850</div>
                                        <div className="text-[10px] text-slate-500 uppercase font-bold">XP</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-white font-bold text-lg">4</div>
                                        <div className="text-[10px] text-slate-500 uppercase font-bold">Badges</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Column: Details & Edit */}
                        <div className="lg:col-span-2">
                            <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-xl h-full relative overflow-hidden">

                                {!isEditing ? (
                                    <div className="space-y-8 animate-fade-in">
                                        <div className="flex justify-between items-center mb-2">
                                            <h3 className="text-xl font-bold text-white">Personal Information</h3>
                                            <button
                                                onClick={() => setIsEditing(true)}
                                                className="cursor-target flex items-center gap-2 text-[#00d9ff] hover:text-white transition-colors text-sm font-bold"
                                            >
                                                <MdEdit /> Edit Details
                                            </button>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="p-4 bg-white/5 rounded-2xl border border-white/5 hover:border-white/10 transition-colors">
                                                <div className="flex items-center gap-3 mb-2 text-slate-400">
                                                    <MdEmail className="text-lg" />
                                                    <span className="text-xs font-bold uppercase tracking-wider">Email Address</span>
                                                </div>
                                                <div className="text-white font-medium pl-8">{user?.email}</div>
                                            </div>

                                            <div className="p-4 bg-white/5 rounded-2xl border border-white/5 hover:border-white/10 transition-colors">
                                                <div className="flex items-center gap-3 mb-2 text-slate-400">
                                                    <MdPerson className="text-lg" />
                                                    <span className="text-xs font-bold uppercase tracking-wider">Username</span>
                                                </div>
                                                <div className="text-white font-medium pl-8">@{user?.username}</div>
                                            </div>

                                            <div className="p-4 bg-white/5 rounded-2xl border border-white/5 hover:border-white/10 transition-colors">
                                                <div className="flex items-center gap-3 mb-2 text-slate-400">
                                                    <MdLocationOn className="text-lg" />
                                                    <span className="text-xs font-bold uppercase tracking-wider">Location</span>
                                                </div>
                                                <div className="text-white font-medium pl-8">{user?.location || 'Earth'}</div>
                                            </div>

                                            <div className="p-4 bg-white/5 rounded-2xl border border-white/5 hover:border-white/10 transition-colors">
                                                <div className="flex items-center gap-3 mb-2 text-slate-400">
                                                    <MdCalendarToday className="text-lg" />
                                                    <span className="text-xs font-bold uppercase tracking-wider">Joined On</span>
                                                </div>
                                                <div className="text-white font-medium pl-8">
                                                    {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'Unknown'}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="pt-8 border-t border-white/5">
                                            <h3 className="text-xl font-bold text-white mb-4">Bio</h3>
                                            <p className="text-slate-400 leading-relaxed max-w-2xl">
                                                {formData.bio}
                                            </p>
                                        </div>

                                        {/* --- DANGER ZONE --- */}
                                        <div className="mt-12 pt-8 border-t border-red-500/20">
                                            <h3 className="text-red-500 font-bold uppercase tracking-wider text-sm mb-4">Danger Zone</h3>
                                            <div className="flex items-center justify-between p-4 bg-red-500/5 border border-red-500/10 rounded-xl">
                                                <div>
                                                    <h4 className="text-white font-bold text-sm">Delete Account</h4>
                                                    <p className="text-slate-400 text-xs mt-1">Permanently remove your account and all data.</p>
                                                </div>
                                                <button
                                                    onClick={() => setShowDeleteModal(true)}
                                                    className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-xs font-bold rounded-lg transition-colors"
                                                >
                                                    Delete Account
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <form onSubmit={handleUpdate} className="space-y-6 animate-fade-in">
                                        <div className="flex justify-between items-center mb-6">
                                            <h3 className="text-xl font-bold text-white">Edit Profile</h3>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Full Name</label>
                                                <div className="relative group">
                                                    <MdPerson className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-[#00d9ff] transition-colors" />
                                                    <input
                                                        type="text"
                                                        value={formData.fullName}
                                                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                                        className="w-full bg-[#0a0e17] border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:border-[#00d9ff] focus:ring-1 focus:ring-[#00d9ff] outline-none transition-all"
                                                        placeholder="Enter your full name"
                                                    />
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Location</label>
                                                <div className="relative group">
                                                    <MdLocationOn className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-[#00d9ff] transition-colors" />
                                                    <input
                                                        type="text"
                                                        value={formData.location}
                                                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                                        className="w-full bg-[#0a0e17] border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:border-[#00d9ff] focus:ring-1 focus:ring-[#00d9ff] outline-none transition-all"
                                                        placeholder="City, Country"
                                                    />
                                                </div>
                                            </div>

                                            <div className="col-span-1 md:col-span-2 space-y-2">
                                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Bio</label>
                                                <textarea
                                                    value={formData.bio}
                                                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                                    className="w-full bg-[#0a0e17] border border-white/10 rounded-xl py-3 px-4 text-white focus:border-[#00d9ff] focus:ring-1 focus:ring-[#00d9ff] outline-none transition-all min-h-[100px] resize-none"
                                                    placeholder="Tell us about yourself..."
                                                />
                                            </div>
                                        </div>

                                        <div className="flex gap-4 pt-6 mt-6 border-t border-white/5">
                                            <button
                                                type="button"
                                                onClick={() => setIsEditing(false)}
                                                className="cursor-target px-6 py-3 rounded-xl border border-white/10 text-white font-bold hover:bg-white/5 transition-colors flex items-center gap-2"
                                            >
                                                <MdCancel /> Cancel
                                            </button>
                                            <button
                                                type="submit"
                                                className="cursor-target px-8 py-3 rounded-xl bg-gradient-to-r from-[#00d9ff] to-blue-600 text-white font-bold shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 hover:scale-[1.02] transition-all flex items-center gap-2"
                                            >
                                                <MdSave /> Save Changes
                                            </button>
                                        </div>
                                    </form>
                                )}

                            </div>
                        </div>
                    </div>

                    {/* --- NEW SECTION: YOUR POSTS --- */}
                    <div className="mt-12 animate-fade-in-up">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 rounded-lg bg-[#00d9ff]/10 text-[#00d9ff]">
                                <MdCameraAlt size={24} />
                            </div>
                            <h2 className="text-2xl font-bold text-white">Your Activity</h2>
                            <span className="bg-white/10 text-slate-400 px-2 py-0.5 rounded text-xs font-mono">{userPosts.length} POSTS</span>
                        </div>

                        {loadingPosts ? (
                            <div className="flex justify-center py-20 text-slate-500 italic">Accessing archive...</div>
                        ) : userPosts.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {userPosts.map(post => (
                                    <div
                                        key={post._id}
                                        className="cursor-target bg-black/40 backdrop-blur-md border border-white/5 rounded-2xl overflow-hidden group hover:border-[#00d9ff]/30 hover:shadow-[0_0_20px_rgba(0,217,255,0.15)] transition-all duration-300"
                                    >
                                        <div className="h-48 overflow-hidden relative">
                                            <img
                                                src={post.imageUrl}
                                                alt="Post"
                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-between p-4">
                                                <div className="flex items-center gap-1 text-white text-xs font-bold">
                                                    <MdFavorite className="text-pink-500" /> {post.likes.length}
                                                </div>
                                                <div className="text-[10px] text-slate-300 font-mono">
                                                    {new Date(post.createdAt).toLocaleDateString()}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="p-4">
                                            <p className="text-slate-300 text-sm line-clamp-2 mb-3">
                                                {post.caption || "No caption provided."}
                                            </p>
                                            <div className="flex items-center justify-between text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                                                <span className="flex items-center gap-1 text-[#00d9ff]">
                                                    Shared to Community
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="bg-black/20 border border-white/5 rounded-2xl p-12 text-center">
                                <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-500">
                                    <MdCameraAlt size={32} />
                                </div>
                                <h3 className="text-lg font-bold text-white mb-2">No posts yet</h3>
                                <p className="text-slate-400 text-sm mb-6 max-w-sm mx-auto">
                                    Share your cosmic discoveries with the community to see them appear here.
                                </p>
                                <button
                                    onClick={() => navigate('/community')}
                                    className="cursor-target px-6 py-2 bg-[#00d9ff]/10 hover:bg-[#00d9ff]/20 text-[#00d9ff] border border-[#00d9ff]/30 rounded-lg font-bold text-sm transition-colors"
                                >
                                    Share a Post
                                </button>
                            </div>
                        )}
                    </div>

                </div>
            </main>

            {/* --- DELETE CONFIRMATION MODAL --- */}
            {showDeleteModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
                    <div className="bg-[#1a0f0f] border border-red-500/30 rounded-2xl p-6 max-w-md w-full shadow-[0_0_50px_rgba(239,68,68,0.2)]">
                        <div className="flex items-center gap-3 text-red-500 mb-4">
                            <MdCancel className="text-3xl" />
                            <h3 className="text-xl font-bold">Delete Account?</h3>
                        </div>
                        <p className="text-slate-300 mb-6 leading-relaxed">
                            Are you absolutely sure? This action cannot be undone. All your progress, badges, and community posts will be permanently lost.
                        </p>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setShowDeleteModal(false)}
                                className="px-4 py-2 rounded-lg bg-white/5 text-white hover:bg-white/10 transition-colors font-medium text-sm"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDeleteAccount}
                                disabled={isDeleting}
                                className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors font-bold text-sm flex items-center gap-2"
                            >
                                {isDeleting ? "Deleting..." : "Confirm Delete"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProfilePage;