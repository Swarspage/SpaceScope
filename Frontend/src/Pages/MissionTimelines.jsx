
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import Sidebar from '../Components/Sidebar';
import {
    MdTimeline,
    MdSearch,
    MdClose,
    MdAccessTime,
    MdLocationOn,
    MdOutlineInfo
} from 'react-icons/md';
import { SiSpacex, SiNasa } from 'react-icons/si';
import { GiIndiaGate } from 'react-icons/gi';

const MissionTimelines = () => {
    const navigate = useNavigate();

    // --- State ---
    const [masterData, setMasterData] = useState([]); // All normalized data
    const [loading, setLoading] = useState(true);
    const [selectedProvider, setSelectedProvider] = useState('ALL'); // ALL, SPACEX, ISRO, NASA
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedMission, setSelectedMission] = useState(null);
    const [activeSidebar, setActiveSidebar] = useState('Missions');

    // --- Helpers for Normalization ---
    // This converts the different API responses into one clean format for our UI
    const normalizeMission = (item, provider) => {
        let normalized = {
            id: '',
            name: '',
            date: null, // Date Object
            provider: provider,
            status: 'Unknown',
            description: '',
            image: null,
            location: '',
            raw: item // Keep raw data just in case
        };

        try {
            if (provider === 'SPACEX') {
                normalized.id = item.id;
                normalized.name = item.name;
                normalized.date = new Date(item.date_utc);
                normalized.status = item.upcoming ? 'Upcoming' : item.success ? 'Success' : 'Failed';
                normalized.description = item.details || "Classified Mission - No details available.";
                normalized.image = item.links?.patch?.small;
                normalized.location = "SpaceX Launch Facility"; // API v4 doesn't always send pad name directly without lookup
            }
            else if (provider === 'ISRO') {
                // ISRO API keys vary, handling common ones
                normalized.id = item.UUID || item.id || Math.random().toString();
                normalized.name = item.Name || item.Title || "ISRO Mission";
                normalized.date = item.LaunchDate ? new Date(item.LaunchDate) : new Date(); // Fallback
                normalized.status = "Completed"; // ISRO API often just lists past missions
                normalized.description = item.MissionStatus || "Mission executed by Indian Space Research Organisation.";
                normalized.location = "SDSC SHAR, Sriharikota";
            }
            else if (provider === 'NASA') {
                // Using Launch Library 2 Schema from server.js
                normalized.id = item.id;
                normalized.name = item.name;
                normalized.date = new Date(item.window_start || item.net);
                normalized.status = item.status?.abbrev === 'Success' ? 'Success' : 'Upcoming';
                normalized.description = item.mission?.description || "NASA Mission Operation.";
                normalized.image = item.image;
                normalized.location = item.pad?.name || "NASA Facility";
            }
        } catch (e) {
            console.warn("Error normalizing item", item);
        }

        return normalized;
    };

    // --- Fetch Data ---
    useEffect(() => {
        const fetchAggregatedData = async () => {
            setLoading(true);

            // 1. Check Cache
            const CACHE_KEY = 'mission_timeline_data_v3';
            const CACHE_duration = 60 * 60 * 1000; // 1 Hour
            const cached = localStorage.getItem(CACHE_KEY);

            if (cached) {
                try {
                    const { data, timestamp } = JSON.parse(cached);
                    const age = Date.now() - timestamp;
                    if (age < CACHE_duration) {
                        console.log("Loading missions from local cache");
                        // We need to re-instantiate Date objects because JSON strings them
                        const restored = data.map(m => ({
                            ...m,
                            date: new Date(m.date)
                        }));
                        setMasterData(restored);
                        setLoading(false);
                        return;
                    }
                } catch (e) {
                    console.warn("Cache parse error", e);
                    localStorage.removeItem(CACHE_KEY);
                }
            }

            // 2. Network Fetch (if no cache or expired)
            try {
                // Calling the backend aggregate endpoint
                const res = await api.get('/aggregate/launches');
                const data = res.data;

                let allMissions = [];

                if (data.spacex && Array.isArray(data.spacex)) {
                    allMissions = [...allMissions, ...data.spacex.map(m => normalizeMission(m, 'SPACEX'))];
                }
                if (data.isro && Array.isArray(data.isro)) {
                    allMissions = [...allMissions, ...data.isro.map(m => normalizeMission(m, 'ISRO'))];
                }
                if (data.nasa && Array.isArray(data.nasa)) {
                    allMissions = [...allMissions, ...data.nasa.map(m => normalizeMission(m, 'NASA'))];
                }

                // Sort globally by date (newest first)
                allMissions.sort((a, b) => b.date - a.date);
                setMasterData(allMissions);

                // Save to Cache (ONLY IF DATA EXISTS)
                if (allMissions.length > 0) {
                    localStorage.setItem(CACHE_KEY, JSON.stringify({
                        timestamp: Date.now(),
                        data: allMissions
                    }));
                }

            } catch (err) {
                console.error("Failed to load timeline data", err);
            } finally {
                setLoading(false);
            }
        };

        fetchAggregatedData();
    }, []);

    // --- Filter Logic ---
    const filteredMissions = useMemo(() => {
        return masterData.filter(mission => {
            // Provider Filter
            if (selectedProvider !== 'ALL' && mission.provider !== selectedProvider) return false;

            // Search Filter
            if (searchQuery) {
                return mission.name.toLowerCase().includes(searchQuery.toLowerCase());
            }

            return true;
        });
    }, [masterData, selectedProvider, searchQuery]);

    // --- Date Formatting Components ---
    const DateBox = ({ date }) => {
        if (!date || isNaN(date.getTime())) return <div className="text-slate-500">TBD</div>;

        const day = date.getDate();
        const month = date.toLocaleString('default', { month: 'short' }).toUpperCase();
        const year = date.getFullYear();
        const time = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });

        return (
            <div className="flex flex-col items-center justify-center bg-black/30 backdrop-blur-md border border-white/10 rounded-lg p-2 min-w-[80px] h-full">
                <span className="text-[10px] font-bold text-slate-500 tracking-wider">{month} {year}</span>
                <span className="text-3xl font-black text-white leading-none my-1">{day}</span>
                <div className="flex items-center gap-1 text-[10px] font-mono text-[#00d9ff] bg-[#00d9ff]/10 px-1.5 py-0.5 rounded">
                    <MdAccessTime /> {time}
                </div>
            </div>
        );
    };

    // --- Branding Helpers ---
    const getProviderStyle = (provider) => {
        switch (provider) {
            case 'SPACEX': return { color: 'text-blue-400', border: 'border-blue-500/30', bg: 'bg-blue-500/10', icon: <SiSpacex /> };
            case 'ISRO': return { color: 'text-orange-400', border: 'border-orange-500/30', bg: 'bg-orange-500/10', icon: <GiIndiaGate /> }; // Using Gate as placeholder for ISRO
            case 'NASA': return { color: 'text-red-400', border: 'border-red-500/30', bg: 'bg-red-500/10', icon: <SiNasa /> };
            default: return { color: 'text-slate-400', border: 'border-white/10', bg: 'bg-white/5', icon: <MdRocketLaunch /> };
        }
    };

    const StatusBadge = ({ status }) => {
        let styles = "bg-slate-500/10 text-slate-400 border-slate-500/20";
        if (status === 'Success' || status === 'Completed') styles = "bg-green-500/10 text-green-400 border-green-500/20";
        if (status === 'Upcoming') styles = "bg-blue-500/10 text-blue-400 border-blue-500/20";
        if (status === 'Failed') styles = "bg-red-500/10 text-red-400 border-red-500/20";

        return (
            <span className={`px-2 py-0.5 rounded border text-[10px] font-bold uppercase tracking-wider ${styles}`}>
                {status}
            </span>
        );
    };

    // --- Main JSX ---
    return (
        <div className="flex h-screen bg-transparent text-slate-300 font-sans overflow-hidden">

            {/* === SIDEBAR === */}
            <Sidebar activeTab="Missions" />

            {/* === MAIN CONTENT === */}
            <div className="flex-1 flex flex-col relative min-w-0">
                {/* Background Decor */}
                <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-[#00d9ff]/5 via-transparent to-transparent pointer-events-none" />

                {/* Header */}
                <header className="h-20 flex items-center justify-between px-8 border-b border-white/5 bg-black/20 backdrop-blur-md z-10">
                    <div>
                        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
                            <MdTimeline className="text-[#00d9ff]" /> Mission Timelines
                        </h1>
                        <p className="text-xs text-slate-500 font-mono mt-1">
                            GLOBAL LAUNCH DATABASE • AGGREGATED TELEMETRY
                        </p>
                    </div>

                    <div className="flex items-center gap-6">
                        {/* Search */}
                        <div className="relative group">
                            <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-[#00d9ff] transition-colors" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search mission name..."
                                className="bg-[#0f1322] border border-white/10 rounded-lg py-2 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-[#00d9ff]/50 transition-all w-64"
                            />
                        </div>

                        {/* Provider Tabs */}
                        <div className="flex bg-black/30 backdrop-blur-md p-1 rounded-lg border border-white/10">
                            {['ALL', 'SPACEX', 'ISRO', 'NASA'].map(provider => (
                                <button
                                    key={provider}
                                    onClick={() => setSelectedProvider(provider)}
                                    className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all duration-300 ${selectedProvider === provider
                                        ? 'bg-[#00d9ff] text-black shadow-[0_0_10px_rgba(0,217,255,0.4)]'
                                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                                        }`}
                                >
                                    {provider}
                                </button>
                            ))}
                        </div>
                    </div>
                </header>

                {/* Content Area */}
                <div className="flex-1 overflow-hidden flex relative">

                    {/* Mission List */}
                    <div className="flex-1 overflow-y-auto p-8 scrollbar-thin scrollbar-thumb-[#1a2036] scrollbar-track-transparent">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center h-full gap-4 opacity-70">
                                <div className="w-16 h-16 border-4 border-[#00d9ff] border-t-transparent rounded-full animate-spin"></div>
                                <div className="font-mono text-[#00d9ff] animate-pulse">ESTABLISHING UPLINK...</div>
                            </div>
                        ) : (
                            <div className="max-w-5xl mx-auto space-y-4">
                                {filteredMissions.length === 0 && (
                                    <div className="text-center py-20 text-slate-500">No missions found for these parameters.</div>
                                )}

                                {filteredMissions.map((mission) => {
                                    const style = getProviderStyle(mission.provider);
                                    const isSelected = selectedMission?.id === mission.id;

                                    return (
                                        <div
                                            key={mission.id}
                                            onClick={() => setSelectedMission(mission)}
                                            className={`
                                                group relative flex items-center bg-black/30 backdrop-blur-md border rounded-xl p-4 cursor-pointer transition-all duration-200
                                                hover:bg-[#151a2d] hover:border-white/20 hover:translate-x-1
                                                ${isSelected ? `border-[#00d9ff] shadow-[0_0_20px_rgba(0,217,255,0.1)]` : 'border-white/5'}
                                            `}
                                        >
                                            {/* Provider Strip */}
                                            <div className={`absolute left-0 top-4 bottom-4 w-1 rounded-r ${style.bg.replace('/10', '')} opacity-50`}></div>

                                            {/* Date Box (Highlighted) */}
                                            <div className="mr-6 flex-shrink-0">
                                                <DateBox date={mission.date} />
                                            </div>

                                            {/* Info Section */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-3 mb-1">
                                                    <span className={`flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${style.color} ${style.bg} ${style.border}`}>
                                                        {style.icon} {mission.provider}
                                                    </span>
                                                    <StatusBadge status={mission.status} />
                                                </div>
                                                <h3 className={`text-xl font-bold text-white truncate group-hover:text-[#00d9ff] transition-colors`}>
                                                    {mission.name}
                                                </h3>
                                                <div className="flex items-center gap-4 mt-2 text-xs text-slate-400 font-mono">
                                                    {mission.location && (
                                                        <span className="flex items-center gap-1 truncate">
                                                            <MdLocationOn className="text-slate-500" /> {mission.location}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Patch/Image Thumbnail (if valid) */}
                                            {mission.image && (
                                                <div className="w-16 h-16 ml-4 rounded-lg overflow-hidden border border-white/10 bg-black flex-shrink-0">
                                                    <img src={mission.image} alt="patch" className="w-full h-full object-contain" />
                                                </div>
                                            )}

                                            {/* Chevron/Action */}
                                            <div className="ml-6 text-slate-600 group-hover:text-white transition-colors">
                                                <MdOutlineInfo className="text-2xl" />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* === MISSION DETAIL MODAL (Replaces Side Panel) === */}
                    {selectedMission && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
                            <div
                                className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-[#050714] rounded-3xl border border-white/10 shadow-[0_0_50px_rgba(0,217,255,0.1)] flex flex-col md:flex-row overflow-hidden"
                                onClick={(e) => e.stopPropagation()}
                            >
                                {/* Close Button */}
                                <button
                                    onClick={() => setSelectedMission(null)}
                                    className="absolute top-4 right-4 z-50 w-10 h-10 rounded-full bg-black/50 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-all hover:rotate-90"
                                >
                                    <MdClose className="text-xl" />
                                </button>

                                {/* LEFT: Visual & Timer */}
                                <div className="w-full md:w-2/5 relative bg-black/30 flex flex-col items-center justify-center p-8 border-b md:border-b-0 md:border-r border-white/10">
                                    {/* Background Glow */}
                                    <div className={`absolute inset-0 opacity-20 blur-[80px] ${selectedMission.provider === 'SPACEX' ? 'bg-blue-600' : selectedMission.provider === 'NASA' ? 'bg-red-600' : 'bg-orange-600'}`}></div>

                                    {/* Mission Patch / Icon */}
                                    <div className="relative z-10 w-48 h-48 mb-8 drop-shadow-2xl hover:scale-105 transition-transform duration-500">
                                        {selectedMission.image ? (
                                            <img src={selectedMission.image} alt="Mission Patch" className="w-full h-full object-contain" />
                                        ) : (
                                            <div className="w-full h-full bg-[#1a2036] rounded-full flex items-center justify-center border-4 border-[#0f1322]">
                                                {getProviderStyle(selectedMission.provider).icon}
                                            </div>
                                        )}
                                    </div>

                                    {/* Countdown Timer */}
                                    <CountdownTimer targetDate={selectedMission.date} />
                                </div>

                                {/* RIGHT: Details & Telemetry */}
                                <div className="w-full md:w-3/5 p-8 bg-[#050714]/80 backdrop-blur-xl flex flex-col">

                                    {/* Header */}
                                    <div className="mb-6">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getProviderStyle(selectedMission.provider).color} ${getProviderStyle(selectedMission.provider).bg} ${getProviderStyle(selectedMission.provider).border}`}>
                                                {selectedMission.provider}
                                            </span>
                                            <StatusBadge status={selectedMission.status} />
                                        </div>
                                        <h2 className="text-4xl font-black text-white leading-none tracking-tight mb-2 uppercase">{selectedMission.name}</h2>
                                        <div className="flex items-center gap-2 text-xs font-mono text-slate-500">
                                            <span className="text-[#00d9ff]">ID:</span> {selectedMission.id}
                                        </div>
                                    </div>

                                    {/* Data Grid */}
                                    <div className="grid grid-cols-2 gap-4 mb-6">
                                        <div className="bg-white/5 border border-white/5 p-4 rounded-xl">
                                            <div className="text-[10px] text-slate-500 uppercase font-bold mb-1 flex items-center gap-1"><MdAccessTime /> Launch Window</div>
                                            <div className="text-sm text-white font-mono">
                                                {selectedMission.date?.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' }) || "TBD"}
                                            </div>
                                        </div>
                                        <div className="bg-white/5 border border-white/5 p-4 rounded-xl">
                                            <div className="text-[10px] text-slate-500 uppercase font-bold mb-1 flex items-center gap-1"><MdLocationOn /> Launch Site</div>
                                            <div className="text-sm text-white font-mono truncate" title={selectedMission.location}>
                                                {selectedMission.location || "Classified Site"}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Description */}
                                    <div className="flex-1 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-white/10">
                                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 border-b border-white/10 pb-2">Mission Briefing</h3>
                                        <p className="text-sm text-slate-300 leading-7 font-light">
                                            {selectedMission.description}
                                        </p>
                                    </div>

                                    {/* Footer Action */}
                                    <div className="mt-6 pt-4 border-t border-white/5 flex justify-end">
                                        <button className="px-6 py-2 bg-[#00d9ff]/10 hover:bg-[#00d9ff]/20 text-[#00d9ff] text-xs font-bold rounded-lg border border-[#00d9ff]/30 uppercase tracking-widest transition-all">
                                            Download Telemetry
                                        </button>
                                    </div>

                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// === COMPONENT: Countdown Timer ===
const CountdownTimer = ({ targetDate }) => {
    const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0, isPast: false });

    useEffect(() => {
        if (!targetDate) return;

        const calculate = () => {
            const now = new Date().getTime();
            const target = new Date(targetDate).getTime();
            let diff = target - now;
            const isPast = diff < 0;

            if (isPast) diff = Math.abs(diff);

            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diff % (1000 * 60)) / 1000);

            setTimeLeft({ days, hours, minutes, seconds, isPast });
        };

        calculate();
        const timer = setInterval(calculate, 1000);
        return () => clearInterval(timer);
    }, [targetDate]);

    return (
        <div className="flex flex-col items-center">
            <div className={`text-[10px] font-bold uppercase tracking-[0.2em] mb-2 ${timeLeft.isPast ? 'text-[#00ff88]' : 'text-[#00d9ff]'}`}>
                {timeLeft.isPast ? 'MISSION ELAPSED TIME (T+)' : 'T-MINUS COUNTDOWN'}
            </div>
            <div className="flex items-center gap-3 font-mono text-white">
                <div className="text-center">
                    <div className="text-2xl md:text-3xl font-bold leading-none">{String(timeLeft.days).padStart(2, '0')}</div>
                    <div className="text-[9px] text-slate-500 uppercase mt-1">Days</div>
                </div>
                <div className="text-2xl text-slate-600">:</div>
                <div className="text-center">
                    <div className="text-2xl md:text-3xl font-bold leading-none">{String(timeLeft.hours).padStart(2, '0')}</div>
                    <div className="text-[9px] text-slate-500 uppercase mt-1">Hrs</div>
                </div>
                <div className="text-2xl text-slate-600">:</div>
                <div className="text-center">
                    <div className="text-2xl md:text-3xl font-bold leading-none">{String(timeLeft.minutes).padStart(2, '0')}</div>
                    <div className="text-[9px] text-slate-500 uppercase mt-1">Mins</div>
                </div>
                <div className="text-2xl text-slate-600">:</div>
                <div className="text-center">
                    <div className="text-2xl md:text-3xl font-bold leading-none text-[#00d9ff]">{String(timeLeft.seconds).padStart(2, '0')}</div>
                    <div className="text-[9px] text-slate-500 uppercase mt-1">Secs</div>
                </div>
            </div>
        </div>
    );
};

export default MissionTimelines;