import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Globe from "react-globe.gl";
import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, CircleMarker } from "react-leaflet";
import Sidebar from '../components/Sidebar';
import { useAuth } from '../../Context/AuthContext';
import {
    MdRocketLaunch,
    MdNotifications,
    MdSettings,
    MdSearch,
    MdChevronLeft,
    MdChevronRight,
    MdSatelliteAlt,
    MdPublic,
} from 'react-icons/md';
import {
    WiDaySunny,
    WiStars,
    WiMoonWaningCrescent6,
    WiMoonFull,
} from 'react-icons/wi';
import { BsFillLightningChargeFill } from 'react-icons/bs';
import { FaUserAstronaut } from 'react-icons/fa';
import {
    getISSLocation,
    getISSPass,
    getAuroraData,
    getSolarFlares,
} from '../services/api';

// --- Helpers copied from AuroraPage.jsx for the Map ---
const intensityToColor = (v) => {
    if (v <= 0) return "transparent";
    if (v <= 1) return "#00d9ff"; // Cyan
    if (v <= 3) return "#00ff88"; // Green
    if (v <= 6) return "#facc15"; // Yellow
    if (v <= 9) return "#fb923c"; // Orange
    return "#ff3366";             // Red
};

const intensityToRadius = (v) => {
    return Math.max(2, Math.min(25, Math.sqrt(v) * 4));
};

const Dashboard = () => {
    // Router navigation
    const navigate = useNavigate();

    // Auth context for user data
    const { user, loading: authLoading } = useAuth();

    // State management
    const [issData, setIssData] = useState(null);
    const [issPassData, setIssPassData] = useState(null);
    const [auroraData, setAuroraData] = useState(null);
    const [solarData, setSolarData] = useState(null);
    const [spacexData, setSpacexData] = useState([]); // New state for SpaceX
    const [currentTime, setCurrentTime] = useState(new Date());
    const [userLocation, setUserLocation] = useState({ lat: 45.23, lon: -122.45 });
    const [activeTab, setActiveTab] = useState('Dashboard');

    // Refs for Visualizations
    const globeRef = useRef(null);
    const globeContainerRef = useRef(null);

    // --- Data Fetching Hooks ---

    // 1. Fetch ISS Location
    useEffect(() => {
        const fetchISSData = async () => {
            try {
                const response = await getISSLocation();
                setIssData(response.data);
            } catch (error) { console.error('Error fetching ISS data:', error); }
        };
        fetchISSData();
        const interval = setInterval(fetchISSData, 5000);
        return () => clearInterval(interval);
    }, []);

    // 2. Fetch ISS Pass
    useEffect(() => {
        const fetchISSPass = async () => {
            try {
                const response = await getISSPass(userLocation.lat, userLocation.lon);
                setIssPassData(response.data);
            } catch (error) { console.error('Error fetching ISS pass data:', error); }
        };
        fetchISSPass();
    }, [userLocation]);

    // 3. Fetch Aurora
    useEffect(() => {
        const fetchAuroraData = async () => {
            try {
                const response = await getAuroraData();
                setAuroraData(response.data);
            } catch (error) { console.error('Error fetching aurora data:', error); }
        };
        fetchAuroraData();
        const interval = setInterval(fetchAuroraData, 300000);
        return () => clearInterval(interval);
    }, []);

    // 4. Fetch Solar
    useEffect(() => {
        const fetchSolarData = async () => {
            try {
                const response = await getSolarFlares();
                setSolarData(response.data);
            } catch (error) { console.error('Error fetching solar data:', error); }
        };
        fetchSolarData();
        const interval = setInterval(fetchSolarData, 300000);
        return () => clearInterval(interval);
    }, []);

    // 5. Fetch SpaceX Missions (New)
    useEffect(() => {
        const fetchSpaceXData = async () => {
            try {
                // Using the backend query endpoint to get upcoming launches
                const response = await fetch('http://localhost:5000/api/spacex/launches/query', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        query: { upcoming: true },
                        options: {
                            limit: 3,
                            sort: { date_utc: 'asc' },
                            select: ['name', 'date_utc', 'details', 'links', 'flight_number', 'rocket']
                        }
                    })
                });
                const data = await response.json();
                if (data.docs) {
                    setSpacexData(data.docs);
                }
            } catch (error) {
                console.error('Error fetching SpaceX data:', error);
            }
        };
        fetchSpaceXData();
    }, []);

    // Clock
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    // --- Visualization Logic: Globe (ISS) ---
    const issLat = parseFloat(issData?.iss_position?.latitude || 0);
    const issLon = parseFloat(issData?.iss_position?.longitude || 0);

    // Update Globe Camera to follow ISS
    useEffect(() => {
        if (globeRef.current && issData) {
            globeRef.current.pointOfView({ lat: issLat, lng: issLon, altitude: 1.8 }, 1000);
        }
    }, [issLat, issLon, issData]);

    const globeMarkers = useMemo(() => {
        if (!issData) return [];
        return [{
            lat: issLat,
            lng: issLon,
            size: 1.5,
            color: "#ffffff",
            label: `ISS`,
        }];
    }, [issData, issLat, issLon]);


    // --- Visualization Logic: Map (Aurora) ---
    const auroraPoints = useMemo(() => {
        if (!auroraData || !auroraData.coordinates) return [];
        return auroraData.coordinates.map((c) => {
            if (!Array.isArray(c) || c.length < 3) return null;
            const [lon, lat, intensity] = c;
            return { lat: Number(lat), lon: Number(lon), intensity: Number(intensity) };
        }).filter(p => p && p.intensity > 0);
    }, [auroraData]);

    // --- Helpers ---
    const getCurrentKp = () => {
        if (!auroraData) return '0.0';
        if (auroraData.kp_index) return parseFloat(auroraData.kp_index).toFixed(1);
        if (Array.isArray(auroraData) && auroraData.length > 0) {
            return parseFloat(auroraData[auroraData.length - 1]?.kp_index || 0).toFixed(1);
        }
        return '2.3';
    };

    const getNextPassTime = () => {
        if (!issPassData?.response?.[0]) return '2h 15m';
        const nextPass = issPassData.response[0].risetime * 1000;
        const now = Date.now();
        const diff = nextPass - now;
        if (diff < 0) return 'Passing now';
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        return `${hours}h ${minutes}m`;
    };

    const formatUTC = () => currentTime.toUTCString().split(' ')[4];

    const getSolarFlareClass = () => {
        if (!solarData || solarData.length === 0) return 'C2.4';
        const latest = solarData[solarData.length - 1];
        const flux = parseFloat(latest?.flux || 0);
        if (flux >= 1e-4) return 'X' + (flux * 10000).toFixed(1);
        if (flux >= 1e-5) return 'M' + (flux * 100000).toFixed(1);
        return 'C' + (flux * 1000000).toFixed(1);
    };

    const formatDate = (isoString) => {
        const date = new Date(isoString);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    };



    return (
        <div className="flex h-screen bg-[#080b14] text-slate-300 font-sans overflow-hidden">

            {/* === LEFT SIDEBAR === */}
            <Sidebar activeTab="Dashboard" />

            {/* === MAIN CONTENT AREA === */}
            <div className="flex-1 flex flex-col min-w-0 bg-[#080b14] relative">
                {/* Ambient Background Glows */}
                <div className="absolute top-[-20%] left-[20%] w-[500px] h-[500px] bg-[#00d9ff]/5 rounded-full blur-[100px] pointer-events-none" />

                {/* Top Header */}
                <header className="h-16 flex items-center justify-between px-6 border-b border-white/5 bg-[#080b14]/90 backdrop-blur-md sticky top-0 z-10">
                    <div className="flex-1 max-w-xl">
                        <div className="relative group">
                            <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-[#00d9ff] transition-colors text-lg" />
                            <input
                                type="text"
                                placeholder="Search mission data, satellites, or celestial events..."
                                className="w-full bg-[#0f1322] border border-white/10 rounded-lg py-2 pl-10 pr-12 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#00d9ff]/50 focus:ring-1 focus:ring-[#00d9ff]/50 transition-all"
                            />
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 border border-slate-700 rounded px-1.5 py-0.5 text-[10px] text-slate-500 font-mono">⌘K</div>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 ml-4">
                        <button className="relative text-slate-400 hover:text-white transition-colors">
                            <MdNotifications className="text-xl" />
                            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-red-500 rounded-full border border-[#080b14]"></span>
                        </button>
                        <button
                            onClick={() => navigate('/profile')}
                            className="text-slate-400 hover:text-white transition-colors"
                            title="Settings & Profile"
                        >
                            <MdSettings className="text-xl" />
                        </button>
                        <div className="h-8 w-px bg-white/10 mx-1"></div>
                        <div
                            className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity"
                            onClick={() => navigate('/profile')}
                            title="View Profile"
                        >
                            <div className="text-right hidden md:block">
                                {authLoading ? (
                                    <>
                                        <div className="h-4 w-24 bg-slate-700 rounded animate-pulse mb-1"></div>
                                        <div className="h-3 w-16 bg-slate-800 rounded animate-pulse"></div>
                                    </>
                                ) : user ? (
                                    <>
                                        <div className="text-sm font-bold text-white leading-none mb-1">
                                            {user.fullName || user.username}
                                        </div>
                                        <div className="text-[10px] text-[#00d9ff] font-medium">
                                            @{user.username}
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="text-sm font-bold text-white leading-none mb-1">Guest</div>
                                        <div className="text-[10px] text-slate-500 font-medium">Not logged in</div>
                                    </>
                                )}
                            </div>
                            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#00d9ff] to-blue-600 p-0.5">
                                <div className="w-full h-full rounded-full bg-[#080b14] flex items-center justify-center">
                                    {user ? (
                                        <span className="text-white text-sm font-bold">
                                            {(user.fullName || user.username)?.charAt(0).toUpperCase()}
                                        </span>
                                    ) : (
                                        <FaUserAstronaut className="text-white text-sm" />
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Dashboard Scrollable Content */}
                <main className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
                    <div className="max-w-[1600px] mx-auto space-y-6">

                        {/* Title Section */}
                        <div className="flex flex-col md:flex-row justify-between items-end gap-6 pb-2 border-b border-white/5 pb-6">
                            <div>
                                <div className="flex items-center gap-3 mb-2">
                                    <span className="px-2 py-0.5 rounded bg-green-500/10 border border-green-500/20 text-green-400 text-[10px] font-bold tracking-wider uppercase">
                                        Systems Nominal
                                    </span>
                                    <span className="text-slate-400 font-mono text-xs">UTC {formatUTC()}</span>
                                </div>
                                <h2 className="text-3xl md:text-4xl font-black text-white uppercase tracking-tight leading-none">
                                    Mission Control <br /> Center
                                </h2>
                            </div>
                            <div className="flex gap-4">
                                <div className="px-6 py-3 rounded-xl border border-white/10 bg-[#0f1322]">
                                    <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">Active Missions</div>
                                    <div className="text-2xl font-bold text-white font-mono">{spacexData.length > 0 ? spacexData.length + 5 : '12'}</div>
                                </div>
                                <div className="px-6 py-3 rounded-xl border border-white/10 bg-[#0f1322]">
                                    <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">Next ISS Pass</div>
                                    <div className="text-2xl font-bold text-[#00d9ff] font-mono">{getNextPassTime()}</div>
                                </div>
                                <div className="px-6 py-3 rounded-xl border border-purple-500/30 bg-purple-500/10">
                                    <div className="text-[10px] text-purple-300 uppercase font-bold mb-1 flex items-center gap-1">
                                        <BsFillLightningChargeFill /> Aurora Alert
                                    </div>
                                    <div className="text-2xl font-bold text-white font-mono">Kp {getCurrentKp()}</div>
                                </div>
                            </div>
                        </div>

                        {/* Top Grid: Aurora & ISS */}
                        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
                            {/* ... Aurora Card ... */}
                            <div className="xl:col-span-7 h-[400px] bg-[#0f1322]/80 backdrop-blur-xl border border-white/5 rounded-2xl relative overflow-hidden group flex flex-col hover:border-[#00d9ff]/30 transition-all duration-300">
                                <div className="absolute inset-0 z-0">
                                    <MapContainer
                                        center={[60, 0]}
                                        zoom={2}
                                        minZoom={2}
                                        style={{ height: "100%", width: "100%", background: "#050714" }}
                                        zoomControl={false}
                                        scrollWheelZoom={false}
                                    >
                                        <TileLayer attribution='&copy; CartoDB' url="https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}.png" />
                                        {auroraPoints.map((p, idx) => (
                                            <CircleMarker
                                                key={`aurora-${idx}`}
                                                center={[p.lat, p.lon]}
                                                radius={intensityToRadius(p.intensity)}
                                                pathOptions={{ color: intensityToColor(p.intensity), fillColor: intensityToColor(p.intensity), fillOpacity: 0.6, weight: 0 }}
                                            />
                                        ))}
                                    </MapContainer>
                                </div>
                                <div className="relative z-10 p-6 h-full flex flex-col justify-between pointer-events-none">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h3 className="text-lg font-bold text-white">Aurora Visibility Map</h3>
                                                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                                            </div>
                                            <p className="text-slate-400 text-sm">Real-time Kp Index monitoring</p>
                                        </div>
                                        <div className="px-3 py-1 bg-black/60 border border-white/10 rounded-lg backdrop-blur text-xs font-mono">
                                            <span className="text-slate-400 mr-2">CURRENT INDEX</span>
                                            <span className="text-green-400 font-bold text-lg">{getCurrentKp()}</span>
                                        </div>
                                    </div>
                                    <div className="flex justify-end pointer-events-auto">
                                        <button onClick={() => navigate('/aurora')} className="px-4 py-2 bg-[#00d9ff] hover:bg-cyan-400 text-black font-bold text-sm rounded-lg transition-all shadow-[0_0_15px_rgba(0,225,255,0.3)] hover:shadow-[0_0_25px_rgba(0,225,255,0.5)]">
                                            View Details →
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* ... ISS Card ... */}
                            <div className="xl:col-span-5 h-[400px] bg-[#0f1322]/80 backdrop-blur-xl border border-white/5 rounded-2xl p-6 flex flex-col hover:border-[#00d9ff]/30 transition-all duration-300">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                        <MdSatelliteAlt className="text-[#00d9ff]" /> ISS Tracker
                                    </h3>
                                    <span className="text-[10px] font-mono text-[#00d9ff] bg-[#00d9ff]/10 px-2 py-1 rounded border border-[#00d9ff]/20">ORBIT 3721</span>
                                </div>
                                <div ref={globeContainerRef} className="flex-1 bg-[#050810] rounded-xl border border-white/5 relative overflow-hidden mb-4 flex items-center justify-center">
                                    <Globe
                                        ref={globeRef}
                                        width={globeContainerRef.current?.clientWidth}
                                        height={globeContainerRef.current?.clientHeight}
                                        globeImageUrl="//unpkg.com/three-globe/example/img/earth-blue-marble.jpg"
                                        bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
                                        backgroundImageUrl="//unpkg.com/three-globe/example/img/night-sky.png"
                                        showAtmosphere={true}
                                        atmosphereColor="#00d9ff"
                                        atmosphereAltitude={0.15}
                                        pointsData={globeMarkers}
                                        pointLat={(d) => d.lat}
                                        pointLng={(d) => d.lng}
                                        pointColor={(d) => d.color}
                                        pointRadius={1.5}
                                        pointAltitude={0.1}
                                        animateIn={true}
                                        onGlobeReady={() => { if (globeRef.current && issLat && issLon) { globeRef.current.pointOfView({ lat: issLat, lng: issLon, altitude: 1.8 }, 1000); } }}
                                    />
                                    <div className="absolute top-2 left-2 bg-black/50 backdrop-blur-md px-2 py-0.5 rounded border border-white/10 text-[10px] text-cyan-400 font-mono pointer-events-none">LIVE TELEMETRY</div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-[#080b14] p-3 rounded-xl border border-white/5">
                                        <div className="text-[10px] text-slate-500 uppercase font-bold">Altitude</div>
                                        <div className="text-xl text-[#00d9ff] font-mono font-bold">408 km</div>
                                    </div>
                                    <button onClick={() => navigate('/iss')} className="px-4 py-2 bg-[#00d9ff] hover:bg-cyan-400 text-black font-bold text-sm rounded-lg transition-all shadow-[0_0_15px_rgba(0,225,255,0.3)] hover:shadow-[0_0_25px_rgba(0,225,255,0.5)] flex items-center justify-center gap-2">
                                        <MdSatelliteAlt className="text-lg" /> Track ISS
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Middle Grid: Solar & Meteors */}
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                            {/* Solar Activity */}
                            <div className="lg:col-span-5 bg-[#0f1322]/80 backdrop-blur-xl border border-white/5 rounded-2xl p-6">
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="text-lg font-bold text-white flex items-center gap-2"><WiDaySunny className="text-orange-400 text-2xl" /> Solar Activity</h3>
                                    <span className="px-2 py-1 rounded bg-orange-500/10 border border-orange-500/20 text-orange-400 text-[10px] font-bold uppercase">Moderate</span>
                                </div>
                                <div className="flex justify-between mb-6">
                                    <div>
                                        <div className="text-xs text-slate-400">X-ray Flux (24h)</div>
                                        <div className="text-2xl font-bold text-white mt-1">{getSolarFlareClass()} <span className="text-sm font-normal text-slate-500">Class Flare</span></div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-xs text-slate-400">Solar Wind</div>
                                        <div className="text-2xl font-bold text-[#00d9ff] mt-1">420 <span className="text-sm font-normal text-slate-500">km/s</span></div>
                                    </div>
                                </div>
                                <div className="h-32 w-full bg-gradient-to-b from-transparent to-orange-500/5 rounded-lg border-b border-l border-white/10 relative p-2">
                                    <svg className="w-full h-full overflow-visible" preserveAspectRatio="none">
                                        <polyline fill="none" stroke="#f97316" strokeWidth="2" points="0,80 30,75 60,78 90,60 120,65 150,40 180,55 210,50 240,20 270,40 300,30 330,50" vectorEffect="non-scaling-stroke" />
                                    </svg>
                                </div>
                            </div>

                            {/* Meteor Calendar */}
                            <div className="lg:col-span-7 bg-[#0f1322]/80 backdrop-blur-xl border border-white/5 rounded-2xl p-6">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-lg font-bold text-white flex items-center gap-2"><WiStars className="text-purple-400 text-2xl" /> Meteor Calendar</h3>
                                    <button className="text-xs text-[#00d9ff] hover:text-white transition-colors">View All</button>
                                </div>
                                <div className="space-y-4">
                                    <div className="bg-[#080b14] border border-white/5 rounded-xl p-4 flex justify-between items-center group hover:border-white/10 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-lg bg-purple-900/20 text-purple-400 flex items-center justify-center"><WiStars className="text-2xl" /></div>
                                            <div>
                                                <h4 className="text-white font-bold text-lg">Geminids 2025</h4>
                                                <div className="text-[#00d9ff] text-xs font-medium mb-1">Peaks in 8 days</div>
                                                <div className="flex gap-3 text-[10px] text-slate-400">
                                                    <span className="flex items-center gap-1"><MdPublic /> 85% Visibility</span>
                                                    <span className="flex items-center gap-1"><WiMoonWaningCrescent6 /> Moon: Waning</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end gap-2">
                                            <span className="px-2 py-1 bg-green-500/10 text-green-400 text-[10px] font-bold rounded border border-green-500/20">Optimal</span>
                                            <button className="w-8 h-8 rounded-full bg-[#1a2036] text-slate-400 hover:text-white flex items-center justify-center"><MdNotifications /></button>
                                        </div>
                                    </div>
                                    <div className="bg-[#080b14] border border-white/5 rounded-xl p-4 flex justify-between items-center group hover:border-white/10 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-lg bg-blue-900/20 text-blue-400 flex items-center justify-center"><WiStars className="text-2xl" /></div>
                                            <div>
                                                <h4 className="text-white font-bold text-lg">Ursids</h4>
                                                <div className="text-slate-400 text-xs font-medium mb-1">Peaks in 16 days</div>
                                                <div className="flex gap-3 text-[10px] text-slate-400">
                                                    <span className="flex items-center gap-1"><MdPublic /> 45% Visibility</span>
                                                    <span className="flex items-center gap-1"><WiMoonFull /> Moon: Full</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end gap-2">
                                            <span className="px-2 py-1 bg-yellow-500/10 text-yellow-400 text-[10px] font-bold rounded border border-yellow-500/20">Moderate</span>
                                            <button className="w-8 h-8 rounded-full bg-[#1a2036] text-slate-400 hover:text-white flex items-center justify-center"><MdNotifications /></button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Bottom: Active Missions (SpaceX API Integration) */}
                        <div className="bg-[#0f1322]/80 backdrop-blur-xl border border-white/5 rounded-2xl p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                    <MdRocketLaunch className="text-blue-500" />
                                    Upcoming SpaceX Launches
                                </h3>
                                <div className="flex gap-2">
                                    <button className="w-8 h-8 rounded-lg bg-[#080b14] hover:bg-white/5 text-slate-400 flex items-center justify-center"><MdChevronLeft /></button>
                                    <button className="w-8 h-8 rounded-lg bg-[#080b14] hover:bg-white/5 text-slate-400 flex items-center justify-center"><MdChevronRight /></button>
                                </div>
                            </div>

                            {/* Dynamic Grid for SpaceX Data */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {spacexData.length > 0 ? (
                                    spacexData.map((launch) => (
                                        <div
                                            key={launch.flight_number}
                                            className="bg-[#080b14] border border-white/5 rounded-xl p-4 hover:border-blue-500/30 transition-all duration-300 group"
                                        >
                                            <div className="flex items-center gap-3 mb-3">
                                                {/* Patch Image or Fallback Icon */}
                                                <div className="w-10 h-10 bg-[#1a2036] rounded-lg flex items-center justify-center text-white overflow-hidden p-1">
                                                    {launch.links?.patch?.small ? (
                                                        <img
                                                            src={launch.links.patch.small}
                                                            alt="Mission Patch"
                                                            className="w-full h-full object-contain"
                                                        />
                                                    ) : (
                                                        <MdRocketLaunch className="text-xl" />
                                                    )}
                                                </div>
                                                <div>
                                                    <div className="text-white font-bold text-sm truncate max-w-[120px]" title={launch.name}>
                                                        {launch.name}
                                                    </div>
                                                    <div className="text-[10px] text-blue-400 font-bold flex items-center gap-1">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
                                                        Scheduled
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                                                <span>Pre-launch Status</span>
                                                <span className="font-mono text-blue-400">{formatDate(launch.date_utc)}</span>
                                            </div>

                                            {/* Decorative Progress Bar for "Pre-launch" */}
                                            <div className="h-1.5 w-full bg-[#1a2036] rounded-full overflow-hidden mb-3">
                                                <div className="h-full w-[65%] bg-gradient-to-r from-blue-600 to-cyan-400"></div>
                                            </div>

                                            <div className="text-[10px] text-slate-500 pt-3 border-t border-white/5 line-clamp-1">
                                                {launch.details ? launch.details : "Mission details classified or pending release."}
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    // Loading / Empty State
                                    <div className="col-span-3 py-8 text-center text-slate-500 text-sm italic">
                                        Connecting to SpaceX telemetry...
                                    </div>
                                )}
                            </div>
                        </div>

                    </div>
                </main>
            </div>
        </div>
    );
};

export default Dashboard;