import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import {
    FiBell,
    FiMapPin,
    FiSave,
    FiMail,
    FiNavigation,
    FiCheck,
    FiAlertCircle,
    FiGlobe,
    FiActivity,
    FiZap,
    FiArrowLeft
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";

const NotificationSettings = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
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
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/notifications/${user.id}/preferences`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.data) setSettings(res.data);
        } catch (error) {
            console.error('Error fetching settings:', error);
            if (error.response && error.response.status === 404) {
                // optionally initialize
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

    if (loading) return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-2 border-[#00d9ff] border-t-transparent rounded-full animate-spin"></div>
                <span className="text-[#00d9ff] font-mono text-xs tracking-widest animate-pulse">LOADING SETTINGS...</span>
            </div>
        </div>
    );

    return (
        <div className="relative p-6 md:p-12 w-full max-w-5xl mx-auto mb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 md:mb-8 gap-4">
                <div className="flex items-center gap-4 md:gap-6 w-full">
                    <button
                        onClick={() => navigate(-1)}
                        className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-[#00d9ff]/10 hover:border-[#00d9ff]/50 text-slate-400 hover:text-[#00d9ff] transition-all group flex-shrink-0"
                    >
                        <FiArrowLeft className="text-lg md:text-xl group-hover:-translate-x-1 transition-transform" />
                    </button>
                    <div className="flex-1 min-w-0">
                        <h1 className="text-xl md:text-3xl font-bold text-white tracking-wide flex flex-wrap items-center gap-2 md:gap-3 truncate">
                            <FiBell className="text-[#00d9ff] flex-shrink-0" />
                            <span className="truncate">NOTIFICATION</span> <span className="text-slate-500 hidden sm:inline">SETTINGS</span>
                        </h1>
                        <p className="text-[#00d9ff] font-mono text-[10px] md:text-xs tracking-widest uppercase mt-1 md:mt-2 opacity-80 truncate">
                            Configure Alert Parameters // Global Uplink
                        </p>
                    </div>
                </div>
            </div>

            <div className="backdrop-blur-xl bg-[#0a0e17]/60 border border-white/10 rounded-3xl p-8 shadow-[0_0_50px_rgba(0,0,0,0.5)] relative overflow-hidden">
                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-[#00d9ff]/5 rounded-full blur-[100px] pointer-events-none translate-x-1/2 -translate-y-1/2" />
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#7000ff]/5 rounded-full blur-[100px] pointer-events-none -translate-x-1/2 translate-y-1/2" />

                {/* Master Toggle */}
                <div className="cursor-target mb-8 p-4 md:p-6 bg-white/5 border border-white/10 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 backdrop-blur-sm hover:bg-white/10 transition-colors group">
                    <div className="text-center sm:text-left">
                        <h3 className="text-white font-bold text-lg flex items-center justify-center sm:justify-start gap-2">
                            <FiGlobe className="text-slate-400 group-hover:text-white transition-colors" />
                            System-Wide Alerts
                        </h3>
                        <p className="text-slate-400 text-sm mt-1">Toggle all notifications on or off globally.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                        <input
                            type="checkbox"
                            checked={settings.isSubscribed}
                            onChange={(e) => setSettings({ ...settings, isSubscribed: e.target.checked })}
                            className="sr-only peer"
                        />
                        <div className="w-14 h-7 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-[#00d9ff] shadow-inner"></div>
                    </label>
                </div>

                {/* Location */}
                <div className="mb-10">
                    <h3 className="text-[#00d9ff] font-bold text-xs uppercase tracking-widest mb-4 flex items-center gap-2">
                        <FiMapPin /> Location Telemetry
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="col-span-2 md:col-span-2">
                            <div className="relative group">
                                <input
                                    type="text"
                                    placeholder="City Name"
                                    value={settings.location?.city || ''}
                                    onChange={(e) => setSettings({
                                        ...settings,
                                        location: { ...settings.location, city: e.target.value }
                                    })}
                                    className="cursor-target w-full pl-4 pr-4 py-4 bg-[#050714]/80 border border-white/10 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-[#00d9ff]/50 transition-colors shadow-inner"
                                />
                            </div>
                        </div>
                        <div className="relative group">
                            <input
                                type="number"
                                placeholder="Latitude"
                                value={settings.location?.latitude || ''}
                                onChange={(e) => setSettings({
                                    ...settings,
                                    location: { ...settings.location, latitude: parseFloat(e.target.value) }
                                })}
                                className="cursor-target w-full p-4 bg-[#050714]/80 border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#00d9ff]/50 transition-colors shadow-inner font-mono text-sm"
                            />
                            <div className="absolute right-4 top-4 text-[10px] text-slate-500 font-bold tracking-wider">LAT</div>
                        </div>
                        <div className="relative group">
                            <input
                                type="number"
                                placeholder="Longitude"
                                value={settings.location?.longitude || ''}
                                onChange={(e) => setSettings({
                                    ...settings,
                                    location: { ...settings.location, longitude: parseFloat(e.target.value) }
                                })}
                                className="cursor-target w-full p-4 bg-[#050714]/80 border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#00d9ff]/50 transition-colors shadow-inner font-mono text-sm"
                            />
                            <div className="absolute right-4 top-4 text-[10px] text-slate-500 font-bold tracking-wider">LON</div>
                        </div>
                    </div>
                    <button
                        onClick={detectLocation}
                        className="mt-3 w-full py-3 bg-[#00d9ff]/5 hover:bg-[#00d9ff]/10 border border-[#00d9ff]/20 text-[#00d9ff] font-bold text-xs uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2 hover:shadow-[0_0_20px_rgba(0,217,255,0.15)]"
                    >
                        <FiNavigation /> Auto-Calibrate Location
                    </button>
                </div>

                {/* Preferences Grid */}
                <h3 className="text-[#00d9ff] font-bold text-xs uppercase tracking-widest mb-4 flex items-center gap-2">
                    <FiZap /> Alert Triggers
                </h3>
                <div className="grid grid-cols-1 gap-4 mb-10">

                    {/* ISS Passes */}
                    <div className="cursor-target p-6 bg-white/5 border border-white/10 rounded-2xl hover:border-[#00d9ff]/30 transition-all duration-300 group">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-[#00d9ff]/10 rounded-xl text-[#00d9ff] group-hover:bg-[#00d9ff]/20 transition-colors">
                                    <FiGlobe size={20} />
                                </div>
                                <div>
                                    <h4 className="text-white font-bold text-lg">ISS Flyover</h4>
                                    <p className="text-xs text-slate-400 font-mono">Station visibility passes detection</p>
                                </div>
                            </div>
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
                                className="w-5 h-5 accent-[#00d9ff] bg-transparent border-slate-600 rounded focus:ring-0 cursor-pointer"
                            />
                        </div>

                        {settings.preferences?.issPass?.enabled && (
                            <div className="mt-4 pt-4 border-t border-white/5 animate-in slide-in-from-top-2 fade-in">
                                <div className="flex justify-between text-xs mb-2 items-center">
                                    <span className="text-slate-400 font-bold uppercase tracking-wider">Min Elevation Threshold</span>
                                    <span className="text-[#00d9ff] font-mono bg-[#00d9ff]/10 px-2 py-0.5 rounded">{settings.preferences.issPass.minElevation}°</span>
                                </div>
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
                                    className="w-full h-1.5 bg-slate-700/50 rounded-lg appearance-none cursor-pointer accent-[#00d9ff]"
                                />
                            </div>
                        )}
                    </div>

                    {/* Aurora */}
                    <div className="cursor-target p-6 bg-white/5 border border-white/10 rounded-2xl hover:border-[#00ff88]/30 transition-all duration-300 group">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-[#00ff88]/10 rounded-xl text-[#00ff88] group-hover:bg-[#00ff88]/20 transition-colors">
                                    <FiActivity size={20} />
                                </div>
                                <div>
                                    <h4 className="text-white font-bold text-lg">Aurora Borealis</h4>
                                    <p className="text-xs text-slate-400 font-mono">Geomagnetic storm alerts (Kp Index)</p>
                                </div>
                            </div>
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
                                className="w-5 h-5 accent-[#00ff88] bg-transparent border-slate-600 rounded focus:ring-0 cursor-pointer"
                            />
                        </div>

                        {settings.preferences?.aurora?.enabled && (
                            <div className="mt-4 pt-4 border-t border-white/5 animate-in slide-in-from-top-2 fade-in">
                                <div className="flex justify-between text-xs mb-2 items-center">
                                    <span className="text-slate-400 font-bold uppercase tracking-wider">Min Kp Index</span>
                                    <span className="text-[#00ff88] font-mono bg-[#00ff88]/10 px-2 py-0.5 rounded">Kp {settings.preferences.aurora.minKpIndex}</span>
                                </div>
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
                                    className="w-full h-1.5 bg-slate-700/50 rounded-lg appearance-none cursor-pointer accent-[#00ff88]"
                                />
                            </div>
                        )}
                    </div>

                    {/* Meteor Showers */}
                    <div className="cursor-target p-6 bg-white/5 border border-white/10 rounded-2xl hover:border-[#aaaaff]/30 transition-all duration-300 group">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-[#aaaaff]/10 rounded-xl text-[#aaaaff] group-hover:bg-[#aaaaff]/20 transition-colors">
                                    <FiZap size={20} />
                                </div>
                                <div>
                                    <h4 className="text-white font-bold text-lg">Meteor Showers</h4>
                                    <p className="text-xs text-slate-400 font-mono">Peak viewing timeframe reminders</p>
                                </div>
                            </div>
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
                                className="w-5 h-5 accent-[#aaaaff] bg-transparent border-slate-600 rounded focus:ring-0 cursor-pointer"
                            />
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col md:flex-row gap-4 pt-6 border-t border-white/10">
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="cursor-target flex-1 py-4 bg-[#00d9ff] hover:bg-[#00c2e6] text-[#050714] font-bold uppercase tracking-widest rounded-xl transition-all shadow-[0_0_20px_rgba(0,217,255,0.3)] hover:shadow-[0_0_30px_rgba(0,217,255,0.5)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 hover:-translate-y-0.5 active:translate-y-0"
                    >
                        {saving ? <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" /> : <FiSave className="text-lg" />}
                        {saving ? 'Saving...' : 'Save Configuration'}
                    </button>

                    <button
                        onClick={handleTestEmail}
                        disabled={testEmailStatus === 'sending'}
                        className={`cursor-target px-8 py-4 font-bold uppercase tracking-widest rounded-xl transition-all border flex items-center justify-center gap-2 hover:-translate-y-0.5 active:translate-y-0 ${testEmailStatus === 'success'
                            ? 'bg-green-500/10 border-green-500 text-green-400 shadow-[0_0_20px_rgba(34,197,94,0.2)]'
                            : testEmailStatus === 'error'
                                ? 'bg-red-500/10 border-red-500 text-red-400 shadow-[0_0_20px_rgba(239,68,68,0.2)]'
                                : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/30 text-white'
                            }`}
                    >
                        {testEmailStatus === 'sending' ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : testEmailStatus === 'success' ? <FiCheck className="text-lg" /> : testEmailStatus === 'error' ? <FiAlertCircle className="text-lg" /> : <FiMail className="text-lg" />}
                        {testEmailStatus === 'sending' ? 'Sending...' :
                            testEmailStatus === 'success' ? 'Sent!' :
                                testEmailStatus === 'error' ? 'Failed' : 'Test Email'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default NotificationSettings;
