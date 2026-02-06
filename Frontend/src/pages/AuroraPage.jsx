import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { getAuroraData } from "../services/api";
import { useNavigate } from "react-router-dom";
import {
    MapContainer,
    TileLayer,
    CircleMarker,
    Tooltip,
    Polyline,
    Marker,
    Popup
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import {
    FiRefreshCw,
    FiLayers,
    FiActivity,
    FiClock,
    FiMap,
    FiAlertTriangle,
    FiPlus,
    FiMinus,
    FiGlobe,
    FiNavigation,
    FiTarget
} from "react-icons/fi";
import FeatureInfoModal from "../components/FeatureInfoModal";
import FeatureAIPopup from "../components/FeatureAIPopup";
import ImpactStoriesView from "../components/ImpactStoriesView"; // New Import
import { MdChevronLeft, MdInfoOutline, MdSmartToy, MdEventNote } from "react-icons/md"; // Added MdEventNote

import auroraImage from "../assets/images/app_auroraimage.png";

const intensityToColor = (v) => {
    if (v <= 0) return "transparent";
    if (v <= 1) return "#00d9ff"; // Cyan (Low)
    if (v <= 3) return "#00ff88"; // Green
    if (v <= 6) return "#facc15"; // Yellow
    if (v <= 9) return "#fb923c"; // Orange
    return "#ff3366";             // Red/Pink (Extreme)
};

const intensityToRadius = (v) => Math.max(2, Math.min(25, Math.sqrt(v) * 4));

const estimateKpFromIntensity = (maxIntensity) => {
    const maxPossible = 14;
    const kp = Math.round((maxIntensity / maxPossible) * 9);
    return Math.max(0, Math.min(9, kp));
};

const haversineDistance = (lat1, lon1, lat2, lon2) => {
    const toRad = (x) => (x * Math.PI) / 180;
    const R = 6371; // Earth radius in km
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
};

const StatCardOverlay = ({ label, value, subtext, icon: Icon, alertLevel = "normal" }) => (
    <div className={`bg-black/60 backdrop-blur-md border ${alertLevel === "high" ? "border-red-500/50" : "border-white/10"} rounded-xl p-4 min-w-[160px]`}>
        <div className="flex items-center gap-2 mb-1">
            {Icon && <Icon className={`w-3 h-3 ${alertLevel === "high" ? "text-red-500" : "text-[#00d9ff]"}`} />}
            <span className="text-[10px] uppercase font-bold text-slate-400">{label}</span>
        </div>
        <div className={`font-mono text-xl font-bold ${alertLevel === "high" ? "text-red-400" : "text-white"}`}>
            {value}
        </div>
        {subtext && <div className="text-[10px] text-slate-500 mt-1">{subtext}</div>}
    </div>
);

const AuroraPage = () => {
    const navigate = useNavigate();
    const [coords, setCoords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [dataFetching, setDataFetching] = useState(false);
    const [error, setError] = useState(null);
    const [obsTime, setObsTime] = useState(null);
    const [forecastTime, setForecastTime] = useState(null);
    const [mapInstance, setMapInstance] = useState(null);
    const [showInfoModal, setShowInfoModal] = useState(false);
    const [showAIPopup, setShowAIPopup] = useState(false);
    const [showImpactStories, setShowImpactStories] = useState(false); // New State
    const [isSettingsOpen, setIsSettingsOpen] = useState(false); // Mobile Settings Toggle

    const auroraFeatureData = {
        label: "Aurora Forecast",
        description: "The Aurora Forecast uses real-time solar wind data to predict the visibility of Northern Lights (Aurora Borealis). It serves as a warning system for geomagnetic storms.",
        details: [
            "Kp Index Monitoring",
            "Hemispheric Power Estimates",
            "Geomagnetic Storm Alerts"
        ],
        satelliteHelp: "Satellites like DSCOVR and ACE monitor simple solar wind parameters like speed, density, and magnetic field direction to predict auroral activity.",
        didYouKnow: "Auroras occur on other planets too! Jupiter and Saturn have permanent auroras caused by their powerful magnetic fields."
    };

    // Best Location State
    const [userLocation, setUserLocation] = useState(null);
    const [bestSpot, setBestSpot] = useState(null);
    const [isLocating, setIsLocating] = useState(false);

    // UI State
    const [showAurora, setShowAurora] = useState(true);
    const [showCityLights, setShowCityLights] = useState(true);
    const [autoRefresh, setAutoRefresh] = useState(true);
    const [cooldown, setCooldown] = useState(0);

    const fetchData = React.useCallback(async (isAuto = false, force = false) => {
        if (!isAuto) setLoading(true);
        else setDataFetching(true);
        setError(null);
        try {
            const resp = await getAuroraData(force);
            const data = resp.data || resp;
            setObsTime(data["Observation Time"] || null);
            setForecastTime(data["Forecast Time"] || null);

            if (data && Array.isArray(data.coordinates)) {
                const points = data.coordinates
                    .map((c) => {
                        if (!Array.isArray(c) || c.length < 3) return null;
                        const [lon, lat, intensity] = c;
                        return { lat: Number(lat), lon: Number(lon), intensity: Number(intensity) };
                    })
                    .filter(p => p && Number.isFinite(p.lat));
                setCoords(points);
            }
        } catch (err) {
            setError("Telemetry Uplink Failed");
        } finally {
            setLoading(false);
            setDataFetching(false);
        }
    }, []);

    useEffect(() => {
        let mounted = true;
        let pollingId = null;
        fetchData(false);
        if (autoRefresh) pollingId = setInterval(() => fetchData(true), 60000);
        return () => { mounted = false; if (pollingId) clearInterval(pollingId); };
    }, [autoRefresh, fetchData]);

    // Refresh Cooldown Logic
    useEffect(() => {
        if (cooldown > 0) {
            const timer = setInterval(() => setCooldown(p => Math.max(0, p - 1)), 1000);
            return () => clearInterval(timer);
        }
    }, [cooldown]);

    const handleLocateBestSpot = () => {
        if (!navigator.geolocation) {
            alert("Geolocation is not supported by your browser.");
            return;
        }

        setIsLocating(true);
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                setUserLocation({ lat: latitude, lon: longitude });

                if (coords.length > 0) {
                    // Filter for points with decent intensity
                    const visiblePoints = coords.filter(p => p.intensity > 1);
                    const candidates = visiblePoints.length > 0 ? visiblePoints : coords;

                    // Calculate distances for ALL candidates
                    const scoredCandidates = candidates.map(p => ({
                        ...p,
                        distance: haversineDistance(latitude, longitude, p.lat, p.lon)
                    })).sort((a, b) => a.distance - b.distance); // Sort by closest

                    // Check top candidates for land/reachability
                    let best = null;
                    const topCandidates = scoredCandidates.slice(0, 5); // Check top 5 closest

                    for (const candidate of topCandidates) {
                        try {
                            const res = await axios.get(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${candidate.lat}&lon=${candidate.lon}&zoom=10`);
                            if (res.data && res.data.address) {
                                // Check if it's a "place" (not just ocean)
                                const addr = res.data.address;
                                const placeName = addr.city || addr.town || addr.village || addr.hamlet || addr.county || addr.state;
                                const country = addr.country;

                                if (placeName) {
                                    best = {
                                        ...candidate,
                                        locationName: `${placeName}, ${country || ""}`,
                                        reachable: true
                                    };
                                    break; // Found a good one!
                                }
                            }
                        } catch (err) {
                            console.warn("Geocoding failed for candidate", err);
                        }
                    }

                    // Fallback to absolute closest if no land found
                    if (!best && scoredCandidates.length > 0) {
                        best = {
                            ...scoredCandidates[0],
                            locationName: "Remote / Ocean Location",
                            reachable: false
                        };
                    }

                    if (best) {
                        setBestSpot(best);
                        // Fly to fit bounds
                        if (mapInstance) {
                            const bounds = [
                                [latitude, longitude],
                                [best.lat, best.lon]
                            ];
                            mapInstance.fitBounds(bounds, { padding: [100, 100] });
                        }
                    }
                }
                setIsLocating(false);
            },
            (error) => {
                console.error("Error getting location", error);
                alert("Unable to retrieve your location.");
                setIsLocating(false);
            }
        );
    };

    const handleForceRefresh = async () => {
        if (cooldown > 0) return;
        await fetchData(false, true);
        setCooldown(600); // 10 min
    };

    const maxIntensity = useMemo(() => coords.reduce((mx, p) => Math.max(mx, p.intensity || 0), 0), [coords]);
    const kp = useMemo(() => estimateKpFromIntensity(maxIntensity), [maxIntensity]);

    return (
        <div className="flex flex-col h-screen bg-[#050714] text-slate-300 font-sans overflow-hidden relative">
            {/* TargetCursor removed (global) */}

            {/* === Feature AI Popup === */}
            {showAIPopup && (
                <FeatureAIPopup
                    feature={auroraFeatureData}
                    onClose={() => setShowAIPopup(false)}
                />
            )}

            {/* Header */}
            {/* Header */}
            <header className="h-[auto] md:h-[10vh] min-h-[80px] px-4 py-4 md:px-8 border-b border-white/5 bg-black/20 backdrop-blur-md sticky top-0 focus:z-[2000] z-[2000] flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-0">
                <div className="flex items-center justify-between w-full md:w-auto">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="cursor-target w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 hover:border-[#00d9ff]/30 text-slate-400 hover:text-[#00d9ff] transition-all flex-shrink-0"
                        >
                            <MdChevronLeft className="text-2xl" />
                        </button>
                        <div>
                            <h1 className="md:flex text-lg md:text-2xl font-bold text-white tracking-wide flex items-center gap-2">
                                <FiActivity className="text-[#00d9ff] text-xl md:text-2xl" />
                                AURORA <span className="hidden md:inline text-slate-500">FORECAST</span>
                            </h1>
                            <p className="hidden md:block text-xs text-[#00d9ff] font-mono tracking-widest uppercase">
                                Magnetospheric Particle Map // NOAA Feed
                            </p>
                        </div>
                    </div>

                    {/* Mobile Settings Toggle */}
                    <button
                        onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                        className="md:hidden p-2 text-[#00d9ff] border border-[#00d9ff]/30 rounded-lg bg-[#00d9ff]/10"
                    >
                        {isSettingsOpen ? <FiMinus size={20} /> : <FiLayers size={20} />}
                    </button>
                </div>


                {/* Desktop Controls (Standard) */}
                <div className="hidden md:flex gap-3 items-center">
                    <button
                        onClick={() => setAutoRefresh(!autoRefresh)}
                        className={`cursor-target px-3 md:px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider border transition-all flex items-center gap-2 ${autoRefresh ? 'bg-[#00d9ff]/10 border-[#00d9ff]/30 text-[#00d9ff]' : 'bg-black/40 border-white/10 text-slate-400'
                            }`}
                    >
                        <FiRefreshCw className={dataFetching ? "animate-spin" : ""} />
                        <span>{autoRefresh ? "Auto-Sync" : "Manual"}</span>
                    </button>

                    <button
                        onClick={handleLocateBestSpot}
                        disabled={isLocating}
                        className={`cursor-target px-3 md:px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider border transition-all flex items-center gap-2 ${isLocating ? 'bg-[#00d9ff]/10 border-[#00d9ff]/30 text-[#00d9ff]' : 'bg-white/5 border-white/20 hover:bg-white/10 hover:border-[#00d9ff]/50 hover:text-[#00d9ff]'}`}
                    >
                        {isLocating ? <FiRefreshCw className="animate-spin" /> : <FiNavigation />}
                        <span>{isLocating ? "Locating..." : "Find Best View"}</span>
                    </button>

                    <button
                        onClick={handleForceRefresh}
                        disabled={cooldown > 0}
                        className={`cursor-target px-3 md:px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider border transition-all flex items-center gap-2 ${cooldown > 0 ? 'opacity-50 cursor-not-allowed border-white/5' : 'bg-white/5 border-white/20 hover:bg-white/10'
                            }`}
                    >
                        <FiActivity />
                        <span>{cooldown > 0 ? `Wait ${Math.floor(cooldown / 60)}:${(cooldown % 60).toString().padStart(2, '0')}` : "Force Refresh"}</span>
                    </button>

                    <button
                        onClick={() => setShowInfoModal(true)}
                        className="cursor-target ml-4 px-6 py-3 bg-[#00ff88]/20 hover:bg-[#00ff88]/40 border-2 border-[#00ff88] rounded-full text-white text-xs font-black uppercase tracking-widest transition-all duration-300 flex items-center gap-2 shadow-[0_0_20px_rgba(0,255,136,0.4)] hover:shadow-[0_0_40px_rgba(0,255,136,0.6)] animate-pulse"
                    >
                        <MdInfoOutline className="text-lg" />
                        Learn More
                    </button>

                    <button
                        onClick={() => setShowAIPopup(true)}
                        className="cursor-target ml-1 px-6 py-3 bg-[#0a0e17] hover:bg-[#151a25] border border-[#00ff88]/50 rounded-full text-[#00ff88] text-xs font-black uppercase tracking-widest transition-all duration-300 flex items-center gap-2 hover:shadow-[0_0_15px_rgba(0,255,136,0.2)]"
                    >
                        <MdSmartToy className="text-lg" />
                        Ask AI
                    </button>

                    <button
                        onClick={() => setShowImpactStories(true)}
                        className="cursor-target ml-1 px-6 py-3 bg-[#0a0e17] hover:bg-[#151a25] border border-white/10 hover:border-[#00ff88]/50 rounded-full text-slate-300 hover:text-white text-xs font-black uppercase tracking-widest transition-all duration-300 flex items-center gap-2 hover:shadow-[0_0_15px_rgba(0,255,136,0.1)]"
                    >
                        <MdEventNote className="text-lg" />
                        Stories
                    </button>
                </div>

                {/* Mobile Collapsible Menu */}
                {isSettingsOpen && (
                    <div className="md:hidden flex flex-col gap-3 mt-2 bg-[#0a0e17] border border-white/10 p-4 rounded-xl animate-in slide-in-from-top-2">
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                onClick={() => setAutoRefresh(!autoRefresh)}
                                className={`p-3 rounded-lg text-xs font-bold uppercase border flex items-center justify-center gap-2 ${autoRefresh ? 'bg-[#00d9ff]/20 text-[#00d9ff] border-[#00d9ff]/50' : 'bg-white/5 border-white/10 text-slate-400'}`}
                            >
                                <FiRefreshCw className={dataFetching ? "animate-spin" : ""} />
                                {autoRefresh ? "Sync On" : "Sync Off"}
                            </button>

                            <button
                                onClick={() => setShowImpactStories(true)}
                                className="flex-1 p-3 rounded-lg text-xs font-bold uppercase border flex items-center justify-center gap-2 bg-[#00ff88]/10 border-[#00ff88]/30 text-[#00ff88]"
                            >
                                <MdEventNote />
                                Stories
                            </button>

                            <button
                                onClick={handleForceRefresh}
                                disabled={cooldown > 0}
                                className={`p-3 rounded-lg text-xs font-bold uppercase border flex items-center justify-center gap-2 ${cooldown > 0 ? 'bg-white/5 border-white/5 text-slate-600' : 'bg-white/5 border-white/20 text-white'}`}
                            >
                                <FiActivity />
                                {cooldown > 0 ? `${Math.floor(cooldown / 60)}:${(cooldown % 60).toString().padStart(2, '0')}` : "Refresh"}
                            </button>
                        </div>

                        <button
                            onClick={() => { handleLocateBestSpot(); setIsSettingsOpen(false); }}
                            className="w-full p-3 bg-blue-500/20 border border-blue-500/50 text-blue-400 rounded-lg text-xs font-bold uppercase flex items-center justify-center gap-2"
                        >
                            <FiNavigation />
                            Find Best Viewing Spot
                        </button>

                        <div className="flex gap-2 mt-2 pt-3 border-t border-white/10">
                            <button
                                onClick={() => { setShowAIPopup(true); setIsSettingsOpen(false); }}
                                className="flex-1 py-3 bg-[#0a0e17] border border-[#00ff88]/50 rounded-lg text-[#00ff88] text-xs font-bold uppercase flex items-center justify-center gap-2"
                            >
                                <MdSmartToy size={16} />
                                Ask AI
                            </button>
                            <button
                                onClick={() => { setShowInfoModal(true); setIsSettingsOpen(false); }}
                                className="flex-1 py-3 bg-[#00ff88]/10 border border-[#00ff88]/30 rounded-lg text-[#00ff88] text-xs font-bold uppercase flex items-center justify-center gap-2"
                            >
                                <MdInfoOutline size={16} />
                                Learn More
                            </button>
                        </div>
                    </div>
                )}

                {/* Mobile Persistent AI Button (Bottom Right Optional or Header Inline) */}
                {!isSettingsOpen && (
                    <div className="md:hidden flex gap-2">
                        <button
                            onClick={handleLocateBestSpot}
                            className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-xs font-bold text-slate-300 flex items-center justify-center gap-2"
                        >
                            <FiNavigation /> Best Spot
                        </button>
                        <button
                            onClick={() => setShowAIPopup(true)}
                            className="px-4 py-2 bg-[#0a0e17] border border-[#00ff88]/50 rounded-lg text-[#00ff88]"
                        >
                            <MdSmartToy size={20} />
                        </button>
                    </div>
                )}

            </header >

            {/* Main Content (Fullscreen Map) */}
            <div className="flex-1 relative bg-[#050714] p-4 md:p-6 overflow-hidden">
                <div className="cursor-target relative w-full h-full rounded-3xl overflow-hidden border border-white/5 shadow-2xl bg-[#0a0e17]">
                    {showImpactStories ? (
                        <div className="absolute inset-0 z-[1500]">
                            <ImpactStoriesView
                                activeChannel="aurora"
                                onBack={() => setShowImpactStories(false)}
                            />
                        </div>
                    ) : (
                        <>
                            <MapContainer
                                center={[60, 0]}
                                zoom={2}
                                minZoom={2}
                                className="w-full h-full bg-transparent"
                                zoomControl={false}
                                whenCreated={setMapInstance}
                            >
                                <TileLayer
                                    attribution='&copy; OpenStreetMap &copy; CartoDB'
                                    url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                                />
                                {showAurora && coords.map((p, idx) => {
                                    if (p.intensity <= 0) return null;
                                    return (
                                        <CircleMarker
                                            key={`${p.lat}-${p.lon}-${idx}`}
                                            center={[p.lat, p.lon]}
                                            radius={intensityToRadius(p.intensity)}
                                            pathOptions={{
                                                color: intensityToColor(p.intensity),
                                                fillColor: intensityToColor(p.intensity),
                                                fillOpacity: 0.6,
                                                weight: 0,
                                                className: "animate-pulse"
                                            }}
                                        >
                                            <Tooltip direction="top">
                                                <div className="text-xs font-mono">
                                                    Intensity: {p.intensity.toFixed(1)}
                                                </div>
                                            </Tooltip>
                                        </CircleMarker>
                                    );
                                })}

                                {/* User Location Marker */}
                                {userLocation && (
                                    <CircleMarker
                                        center={[userLocation.lat, userLocation.lon]}
                                        radius={6}
                                        pathOptions={{
                                            color: "#3b82f6", // Blue
                                            fillColor: "#3b82f6",
                                            fillOpacity: 1,
                                            weight: 2,
                                            className: "animate-pulse"
                                        }}
                                    >
                                        <Tooltip direction="top" permanent>
                                            <div className="text-xs font-bold bg-blue-500 text-white px-2 py-1 rounded">You are Here</div>
                                        </Tooltip>
                                    </CircleMarker>
                                )}

                                {/* Best Spot Marker */}
                                {bestSpot && (
                                    <CircleMarker
                                        center={[bestSpot.lat, bestSpot.lon]}
                                        radius={10}
                                        pathOptions={{
                                            color: "#ffffff",
                                            fillColor: "transparent",
                                            weight: 2,
                                            dashArray: "4, 4"
                                        }}
                                    >
                                        <CircleMarker
                                            center={[bestSpot.lat, bestSpot.lon]}
                                            radius={4}
                                            pathOptions={{
                                                color: "#ffffff",
                                                fillColor: "#ffffff",
                                                fillOpacity: 1
                                            }}
                                        />
                                    </CircleMarker>
                                )}

                                {/* Connection Line */}
                                {userLocation && bestSpot && (
                                    <Polyline
                                        positions={[
                                            [userLocation.lat, userLocation.lon],
                                            [bestSpot.lat, bestSpot.lon]
                                        ]}
                                        pathOptions={{
                                            color: "#ffffff",
                                            weight: 2,
                                            dashArray: "5, 10",
                                            opacity: 0.5
                                        }}
                                    />
                                )}
                            </MapContainer>

                            {/* Map Controls (Top Right) */}
                            <div className="absolute top-4 right-4 md:top-6 md:right-6 z-[1000] flex flex-col gap-2">
                                <button onClick={() => mapInstance?.zoomIn()} className="cursor-target w-10 h-10 bg-black/60 backdrop-blur border border-white/10 rounded-lg flex items-center justify-center hover:bg-white/10 text-white"><FiPlus /></button>
                                <button onClick={() => mapInstance?.zoomOut()} className="cursor-target w-10 h-10 bg-black/60 backdrop-blur border border-white/10 rounded-lg flex items-center justify-center hover:bg-white/10 text-white"><FiMinus /></button>
                            </div>

                            {/* KPI Alert (Top Left Overlay) */}
                            {
                                kp >= 5 && (
                                    <div className="absolute top-4 left-4 md:top-6 md:left-6 z-[1000] bg-red-500/10 border border-red-500/50 backdrop-blur-md px-4 py-3 rounded-xl flex items-center gap-3 animate-pulse">
                                        <FiAlertTriangle className="text-red-500 text-xl" />
                                        <div>
                                            <div className="text-red-400 font-bold uppercase text-xs tracking-wider">Geomagnetic Storm</div>
                                            <div className="text-white text-xs">Kp Index {kp} - High Visibility</div>
                                        </div>
                                    </div>
                                )
                            }

                            {/* Best Spot Info Card */}
                            {bestSpot && (
                                <div className="absolute top-20 left-4 md:top-24 md:left-6 z-[1000] bg-black/80 backdrop-blur-md border border-[#00d9ff]/30 p-4 rounded-xl max-w-xs animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    <div className="flex items-start gap-4">
                                        <div className="p-3 bg-[#00d9ff]/10 rounded-lg text-[#00d9ff]">
                                            <FiTarget size={24} />
                                        </div>
                                        <div>
                                            <h4 className="text-[#00d9ff] font-bold text-sm uppercase tracking-wider mb-1">Optimal Viewing</h4>
                                            <div className="text-white font-bold text-lg leading-tight mb-1">{bestSpot.locationName || "Unknown Location"}</div>
                                            <div className="text-slate-400 font-mono text-sm mb-2">{Math.round(bestSpot.distance)} km away</div>

                                            <div className="flex gap-2 mb-1">
                                                <span className="text-[10px] uppercase bg-[#00d9ff]/20 text-[#00d9ff] px-2 py-0.5 rounded border border-[#00d9ff]/30">
                                                    {bestSpot.intensity.toFixed(1)} GW Intensity
                                                </span>
                                                {!bestSpot.reachable && <span className="text-[10px] uppercase bg-red-500/20 text-red-400 px-2 py-0.5 rounded border border-red-500/30">Remote</span>}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Stats HUD (Bottom Overlay) */}
                            <div className="absolute bottom-4 md:bottom-6 left-4 right-4 md:left-6 md:right-6 z-[1000] flex flex-col justify-end pointer-events-none">
                                <div className="pointer-events-auto flex gap-4 overflow-x-auto pb-4 md:pb-0 w-full md:w-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                                    <StatCardOverlay
                                        label="Planetary K-Index"
                                        value={kp}
                                        subtext={kp < 4 ? "Low Activity" : "Storm Watch"}
                                        icon={FiActivity}
                                        alertLevel={kp >= 5 ? "high" : "normal"}
                                    />
                                    <StatCardOverlay
                                        label="Max Intensity"
                                        value={`${maxIntensity.toFixed(1)} GW`}
                                        subtext="Hemispheric Power"
                                        icon={FiMap}
                                    />
                                    <StatCardOverlay
                                        label="Forecast Time"
                                        value={forecastTime ? new Date(forecastTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "--:--"}
                                        subtext="Updated just now"
                                        icon={FiClock}
                                    />
                                </div>
                            </div>

                            {/* Loading Overlay */}
                            {
                                loading && (
                                    <div className="absolute inset-0 z-[1001] bg-[#050714]/80 backdrop-blur-sm flex items-center justify-center">
                                        <div className="flex flex-col items-center gap-4">
                                            <div className="w-12 h-12 border-2 border-[#00d9ff] border-t-transparent rounded-full animate-spin"></div>
                                            <span className="text-[#00d9ff] font-mono text-xs tracking-widest animate-pulse">ESTABLISHING UPLINK...</span>
                                        </div>
                                    </div>
                                )
                            }
                        </>
                    )}
                </div>
            </div >

            <FeatureInfoModal
                isOpen={showInfoModal}
                onClose={() => setShowInfoModal(false)}
                title="Aurora Forecast System"
                imageSrc={auroraImage}
                features={[
                    {
                        title: "How do Satellites help?",
                        desc: "Satellites like NOAA's DSCOVR orbit at the L1 Lagrangian point (1 million miles away) to measure the speed and density of solar wind before it hits Earth, initiating aurora forecasts.",
                        icon: <FiGlobe className="text-lg" />
                    },
                    {
                        title: " What is the Kp Index?",
                        desc: "The K-index quantifies disturbances in the Earth's magnetic field. Values above 5 indicate a geomagnetic storm, significantly increasing the chances of seeing auroras at lower latitudes.",
                        icon: <FiActivity className="text-lg" />
                    },
                    {
                        title: "Why is the Map Red?",
                        desc: "The 'Intensity Heatmap' uses colors to denote probability. Red areas indicate high auroral energy deposition, meaning a very high likelihood of visibility overhead.",
                        icon: <FiLayers className="text-lg" />
                    },
                    {
                        title: "When is the Best Time to Watch?",
                        desc: "Auroras are best seen around midnight in dark, clear skies. Use the 'Forecast Time' on this dashboard to check for real-time spikes in Hemispheric Power.",
                        icon: <FiClock className="text-lg" />
                    },
                    {
                        title: "How does 'Find Best View' work?",
                        desc: "We analyze the aurora heatmap relative to your GPS location to find the closest reachable landmass (city/town) with high viewing probability, ignoring open ocean.",
                        icon: <FiNavigation className="text-lg" />
                    }
                ]}
                readMoreLink="https://www.swpc.noaa.gov/"
            />
        </div >
    );
};

export default AuroraPage;