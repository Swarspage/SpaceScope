import React, { useState } from 'react';
import { useAuth } from '../../Context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { MdPerson, MdEmail, MdLocationOn, MdCalendarToday, MdEdit, MdLogout } from 'react-icons/md';

const ProfilePage = () => {
    const { user, logout, updateUser } = useAuth();
    const navigate = useNavigate();
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        fullName: user?.fullName || '',
        location: user?.location || ''
    });

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`http://localhost:5000/api/auth/profile/${user.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const data = await response.json();
            if (response.ok) {
                updateUser(data.user);
                setIsEditing(false);
            }
        } catch (error) {
            console.error('Update failed:', error);
        }
    };

    return (
        <div className="flex h-screen bg-transparent text-white">
            <Sidebar activeTab="Profile" />

            <main className="flex-1 overflow-auto p-8">
                <div className="max-w-4xl mx-auto">
                    {/* Header */}
                    <div className="flex justify-between items-center mb-8">
                        <h1 className="text-4xl font-bold text-white">Profile</h1>
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors"
                        >
                            <MdLogout /> Logout
                        </button>
                    </div>

                    {/* Profile Card */}
                    <div className="bg-black/30 backdrop-blur-xl border border-white/5 rounded-2xl p-8">
                        {/* Avatar Section */}
                        <div className="flex items-center gap-6 mb-8">
                            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#00d9ff] to-purple-500 flex items-center justify-center text-4xl font-bold">
                                {user?.username?.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-white">{user?.fullName || user?.username}</h2>
                                <p className="text-slate-400">@{user?.username}</p>
                            </div>
                        </div>

                        {/* Info Grid */}
                        {!isEditing ? (
                            <>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                    <div className="flex items-center gap-3 p-4 bg-black/30 backdrop-blur-md rounded-lg">
                                        <MdEmail className="text-2xl text-[#00d9ff]" />
                                        <div>
                                            <p className="text-xs text-slate-500">Email</p>
                                            <p className="text-white font-medium">{user?.email}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 p-4 bg-black/30 backdrop-blur-md rounded-lg">
                                        <MdPerson className="text-2xl text-[#00d9ff]" />
                                        <div>
                                            <p className="text-xs text-slate-500">Username</p>
                                            <p className="text-white font-medium">{user?.username}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 p-4 bg-black/30 backdrop-blur-md rounded-lg">
                                        <MdLocationOn className="text-2xl text-[#00d9ff]" />
                                        <div>
                                            <p className="text-xs text-slate-500">Location</p>
                                            <p className="text-white font-medium">{user?.location || 'Not set'}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 p-4 bg-black/30 backdrop-blur-md rounded-lg">
                                        <MdCalendarToday className="text-2xl text-[#00d9ff]" />
                                        <div>
                                            <p className="text-xs text-slate-500">Joined</p>
                                            <p className="text-white font-medium">
                                                {new Date(user?.createdAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-[#00d9ff] hover:bg-white text-black font-bold rounded-lg transition-colors"
                                >
                                    <MdEdit /> Edit Profile
                                </button>
                            </>
                        ) : (
                            <form onSubmit={handleUpdate} className="space-y-4">
                                <div>
                                    <label className="text-sm text-slate-400 mb-2 block">Full Name</label>
                                    <input
                                        type="text"
                                        value={formData.fullName}
                                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                        className="w-full bg-black/30 backdrop-blur-md border border-white/10 rounded-lg px-4 py-3 text-white focus:border-[#00d9ff] focus:outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="text-sm text-slate-400 mb-2 block">Location</label>
                                    <input
                                        type="text"
                                        value={formData.location}
                                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                        className="w-full bg-black/30 backdrop-blur-md border border-white/10 rounded-lg px-4 py-3 text-white focus:border-[#00d9ff] focus:outline-none"
                                    />
                                </div>

                                <div className="flex gap-3">
                                    <button
                                        type="submit"
                                        className="flex-1 px-6 py-3 bg-[#00d9ff] hover:bg-white text-black font-bold rounded-lg transition-colors"
                                    >
                                        Save Changes
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setIsEditing(false)}
                                        className="flex-1 px-6 py-3 bg-white/5 hover:bg-white/10 text-white font-bold rounded-lg transition-colors"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default ProfilePage;