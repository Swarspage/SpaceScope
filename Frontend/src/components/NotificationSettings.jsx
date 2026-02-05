import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const NotificationSettings = () => {
    const { user } = useAuth();
    const [settings, setSettings] = useState({
        isSubscribed: true,
        preferences: {
            issPass: { enabled: true, minElevation: 30 },
            aurora: { enabled: true, minKpIndex: 5 },
            meteorShower: { enabled: true }
        },
        location: { latitude: null, longitude: null, city: '' }
    });

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [testEmailStatus, setTestEmailStatus] = useState('');

    useEffect(() => {
        if (user?.id) {
            fetchSettings();
        }
    }, [user]);

    const fetchSettings = async () => {
        try {
            const token = localStorage.getItem('token');
            // Ensure we have a valid endpoint construction
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/notifications/${user.id}/preferences`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.data) setSettings(res.data);
        } catch (error) {
            console.error('Error fetching settings:', error);
            // If 404, it might mean preferences don't exist yet, which is fine, we use defaults.
            if (error.response && error.response.status === 404) {
                // optionally initialize or just keep defaults
            }
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const token = localStorage.getItem('token');
            await axios.put(
                `${import.meta.env.VITE_API_URL}/api/notifications/${user.id}/preferences`,
                settings,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            alert('Settings saved successfully!');
        } catch (error) {
            alert('Error saving settings');
            console.error(error);
        } finally {
            setSaving(false);
        }
    };

    const handleTestEmail = async () => {
        setTestEmailStatus('sending');
        try {
            const token = localStorage.getItem('token');
            await axios.post(
                `${import.meta.env.VITE_API_URL}/api/notifications/test-email`,
                { userId: user.id },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setTestEmailStatus('success');
            setTimeout(() => setTestEmailStatus(''), 3000);
        } catch (error) {
            console.error(error);
            setTestEmailStatus('error');
        }
    };

    const detectLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setSettings(prev => ({
                        ...prev,
                        location: {
                            ...prev.location,
                            latitude: position.coords.latitude,
                            longitude: position.coords.longitude
                        }
                    }));
                },
                (error) => alert('Location access denied')
            );
        }
    };

    if (loading) return <div className="text-white text-center p-8">Loading...</div>;

    return (
        <div className="max-w-4xl mx-auto p-6">
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl shadow-2xl p-8 border border-cyan-500/20">
                <h2 className="text-3xl font-bold text-cyan-400 mb-6">🔔 Notification Settings</h2>

                {/* Master Toggle */}
                <div className="mb-8 p-4 bg-gray-800/50 rounded-lg">
                    <label className="flex items-center justify-between cursor-pointer">
                        <span className="text-white font-semibold">Enable All Notifications</span>
                        <input
                            type="checkbox"
                            checked={settings.isSubscribed}
                            onChange={(e) => setSettings({ ...settings, isSubscribed: e.target.checked })}
                            className="w-6 h-6"
                        />
                    </label>
                </div>

                {/* Location */}
                <div className="mb-8 p-4 bg-gray-800/50 rounded-lg">
                    <h3 className="text-xl text-cyan-300 mb-4">📍 Your Location</h3>
                    <div className="space-y-3">
                        <input
                            type="text"
                            placeholder="City (e.g., New York)"
                            value={settings.location?.city || ''}
                            onChange={(e) => setSettings({
                                ...settings,
                                location: { ...settings.location, city: e.target.value }
                            })}
                            className="w-full p-3 bg-gray-700 text-white rounded-lg border border-gray-600"
                        />
                        <div className="grid grid-cols-2 gap-3">
                            <input
                                type="number"
                                placeholder="Latitude"
                                value={settings.location?.latitude || ''}
                                onChange={(e) => setSettings({
                                    ...settings,
                                    location: { ...settings.location, latitude: parseFloat(e.target.value) }
                                })}
                                className="p-3 bg-gray-700 text-white rounded-lg border border-gray-600"
                            />
                            <input
                                type="number"
                                placeholder="Longitude"
                                value={settings.location?.longitude || ''}
                                onChange={(e) => setSettings({
                                    ...settings,
                                    location: { ...settings.location, longitude: parseFloat(e.target.value) }
                                })}
                                className="p-3 bg-gray-700 text-white rounded-lg border border-gray-600"
                            />
                        </div>
                        <button
                            onClick={detectLocation}
                            className="w-full py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg transition"
                        >
                            📍 Auto-Detect Location
                        </button>
                    </div>
                </div>

                {/* Notification Preferences */}
                <div className="space-y-4 mb-8">
                    <h3 className="text-xl text-cyan-300 mb-4">Notify me about:</h3>

                    {/* ISS Passes */}
                    <div className="p-4 bg-gray-800/50 rounded-lg">
                        <label className="flex items-center justify-between mb-3">
                            <span className="text-white font-semibold">🛰️ ISS Passes</span>
                            <input
                                type="checkbox"
                                checked={settings.preferences?.issPass?.enabled ?? true}
                                onChange={(e) => setSettings({
                                    ...settings,
                                    preferences: {
                                        ...settings.preferences,
                                        issPass: { ...settings.preferences.issPass, enabled: e.target.checked }
                                    }
                                })}
                                className="w-5 h-5"
                            />
                        </label>
                        {settings.preferences?.issPass?.enabled && (
                            <div>
                                <label className="text-gray-400 text-sm">
                                    Minimum elevation: {settings.preferences.issPass.minElevation}°
                                </label>
                                <input
                                    type="range"
                                    min="10"
                                    max="90"
                                    value={settings.preferences.issPass.minElevation}
                                    onChange={(e) => setSettings({
                                        ...settings,
                                        preferences: {
                                            ...settings.preferences,
                                            issPass: { ...settings.preferences.issPass, minElevation: parseInt(e.target.value) }
                                        }
                                    })}
                                    className="w-full"
                                />
                            </div>
                        )}
                    </div>

                    {/* Aurora */}
                    <div className="p-4 bg-gray-800/50 rounded-lg">
                        <label className="flex items-center justify-between mb-3">
                            <span className="text-white font-semibold">🌌 Aurora Alerts</span>
                            <input
                                type="checkbox"
                                checked={settings.preferences?.aurora?.enabled ?? true}
                                onChange={(e) => setSettings({
                                    ...settings,
                                    preferences: {
                                        ...settings.preferences,
                                        aurora: { ...settings.preferences.aurora, enabled: e.target.checked }
                                    }
                                })}
                                className="w-5 h-5"
                            />
                        </label>
                        {settings.preferences?.aurora?.enabled && (
                            <div>
                                <label className="text-gray-400 text-sm">
                                    Minimum Kp index: {settings.preferences.aurora.minKpIndex}
                                </label>
                                <input
                                    type="range"
                                    min="3"
                                    max="9"
                                    value={settings.preferences.aurora.minKpIndex}
                                    onChange={(e) => setSettings({
                                        ...settings,
                                        preferences: {
                                            ...settings.preferences,
                                            aurora: { ...settings.preferences.aurora, minKpIndex: parseInt(e.target.value) }
                                        }
                                    })}
                                    className="w-full"
                                />
                            </div>
                        )}
                    </div>

                    {/* Meteor Showers */}
                    <div className="p-4 bg-gray-800/50 rounded-lg">
                        <label className="flex items-center justify-between">
                            <span className="text-white font-semibold">☄️ Meteor Shower Reminders</span>
                            <input
                                type="checkbox"
                                checked={settings.preferences?.meteorShower?.enabled ?? true}
                                onChange={(e) => setSettings({
                                    ...settings,
                                    preferences: {
                                        ...settings.preferences,
                                        meteorShower: { ...settings.preferences.meteorShower, enabled: e.target.checked }
                                    }
                                })}
                                className="w-5 h-5"
                            />
                        </label>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4">
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex-1 py-3 bg-cyan-500 hover:bg-cyan-600 text-white font-bold rounded-lg transition disabled:opacity-50"
                    >
                        {saving ? 'Saving...' : '💾 Save Preferences'}
                    </button>

                    <button
                        onClick={handleTestEmail}
                        disabled={testEmailStatus === 'sending'}
                        className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg transition"
                    >
                        {testEmailStatus === 'sending' ? '📧 Sending...' :
                            testEmailStatus === 'success' ? '✅ Sent!' :
                                testEmailStatus === 'error' ? '❌ Error' : '📧 Send Test Email'}
                    </button>
                </div>

                <p className="text-gray-400 text-sm mt-6 text-center">
                    We'll send you personalized alerts based on your location and preferences
                </p>
            </div>
        </div>
    );
};

export default NotificationSettings;
