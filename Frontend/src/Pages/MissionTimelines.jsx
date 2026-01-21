
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
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
            try {
                // Calling the backend aggregate endpoint
                const res = await fetch('http://localhost:5000/api/aggregate/launches');
                const data = await res.json();

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

                    {/* === SLIDE-OVER DETAILS PANEL === */}
                    <div className={`
                        absolute top-0 right-0 h-full w-[450px] bg-black/60 backdrop-blur-xl border-l border-white/10 shadow-2xl z-30
                        transform transition-transform duration-300 ease-in-out
                        ${selectedMission ? 'translate-x-0' : 'translate-x-full'}
                    `}>
                        {selectedMission && (
                            <div className="flex flex-col h-full">
                                {/* Header */}
                                <div className="h-16 flex items-center justify-between px-6 border-b border-white/5 bg-transparent">
                                    <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                                        Classified Briefing
                                    </span>
                                    <button
                                        onClick={() => setSelectedMission(null)}
                                        className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                                    >
                                        <MdClose className="text-xl" />
                                    </button>
                                </div>

                                {/* Content */}
                                <div className="flex-1 overflow-y-auto p-6">
                                    {/* Big Image/Icon */}
                                    <div className="flex justify-center mb-8 relative">
                                        <div className={`absolute inset-0 blur-[60px] opacity-20 rounded-full ${selectedMission.provider === 'SPACEX' ? 'bg-blue-500' : selectedMission.provider === 'NASA' ? 'bg-red-500' : 'bg-orange-500'}`}></div>
                                        <div className="w-48 h-48 relative z-10 drop-shadow-2xl">
                                            {selectedMission.image ? (
                                                <img src={selectedMission.image} alt="Mission" className="w-full h-full object-contain" />
                                            ) : (
                                                <div className="w-full h-full bg-[#1a2036] rounded-full flex items-center justify-center border-4 border-[#0f1322]">
                                                    {getProviderStyle(selectedMission.provider).icon}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="text-center mb-6">
                                        <h2 className="text-3xl font-black text-white leading-tight mb-2">{selectedMission.name}</h2>
                                        <div className="flex items-center justify-center gap-2">
                                            <span className={`text-sm font-bold ${getProviderStyle(selectedMission.provider).color}`}>
                                                {selectedMission.provider}
                                            </span>
                                            <span className="text-slate-600">•</span>
                                            <StatusBadge status={selectedMission.status} />
                                        </div>
                                    </div>

                                    {/* Data Grid */}
                                    <div className="grid grid-cols-2 gap-3 mb-6">
                                        <div className="bg-black/30 backdrop-blur-md p-3 rounded-lg border border-white/5">
                                            <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">Launch Date</div>
                                            <div className="text-sm text-white font-mono">
                                                {selectedMission.date?.toLocaleString() || "TBD"}
                                            </div>
                                        </div>
                                        <div className="bg-black/30 backdrop-blur-md p-3 rounded-lg border border-white/5">
                                            <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">Location</div>
                                            <div className="text-sm text-white truncate" title={selectedMission.location}>
                                                {selectedMission.location || "Classified"}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-black/30 backdrop-blur-md border border-white/5 rounded-xl p-5 relative overflow-hidden">
                                        <div className="absolute top-0 left-0 w-1 h-full bg-[#00d9ff]"></div>
                                        <h4 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
                                            <MdOutlineInfo className="text-[#00d9ff]" /> Mission Details
                                        </h4>
                                        <p className="text-sm text-slate-400 leading-relaxed font-light">
                                            {selectedMission.description}
                                        </p>
                                    </div>

                                    {/* Raw Data Peek (Technical aesthetic) */}
                                    <div className="mt-6 opacity-30 hover:opacity-100 transition-opacity">
                                        <h5 className="text-[10px] text-slate-500 uppercase font-bold mb-1">Raw Telemetry ID</h5>
                                        <div className="font-mono text-[10px] text-[#00d9ff] break-all">
                                            {selectedMission.id}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </div>
    );
};

export default MissionTimelines;