import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Globe from "react-globe.gl";
import "leaflet/dist/leaflet.css";
import axios from 'axios';
import { X, Calendar as CalendarIcon, Info, Moon } from 'lucide-react';
import { MapContainer, TileLayer, CircleMarker } from "react-leaflet";
import Sidebar from '../components/Sidebar';
import Tutorial from '../components/Tutorial';
import meteorEvents from '../data/meteorData.json';
import { useAuth } from '../context/AuthContext';
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
    WiMoonNew,
    WiMoonWaxingCrescent3,
    WiMoonFirstQuarter,
    WiMoonWaxingGibbous3,
    WiMoonFull,
    WiMoonWaningGibbous3,
    WiMoonThirdQuarter,
    WiMoonWaningCrescent3,
} from 'react-icons/wi';
import { BsFillLightningChargeFill } from 'react-icons/bs';
import { FaUserAstronaut } from 'react-icons/fa';
import {
    getISSLocation,
    getISSPass,
    getAuroraData,
    getSolarFlares,
    default as api
} from '../services/api';
import SpaceDebrisGlobe from '../components/SpaceDebrisGlobe';
import TempAnomalyChart from '../components/TempAnomalyChart';
import HeaderGreeting from '../components/HeaderGreeting';
import DashboardHeader from '../components/DashboardHeader';


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
    const { user, loading: authLoading, updateUser } = useAuth();

    // Tutorial State
    const [showTutorial, setShowTutorial] = useState(false);
    const [tutorialStep, setTutorialStep] = useState(0);

    // State management
    const [issData, setIssData] = useState(null);
    const [issPassData, setIssPassData] = useState(null);
    const [auroraData, setAuroraData] = useState(null);
    const [solarData, setSolarData] = useState(null);
    const [spacexData, setSpacexData] = useState([]); // New state for SpaceX
    const [userLocation, setUserLocation] = useState({ lat: 45.23, lon: -122.45 });

    // Moon Phase State
    const [moonData, setMoonData] = useState(null);
    const [moonImage, setMoonImage] = useState(null);
    const [showMoonModal, setShowMoonModal] = useState(false);

    // Notification State
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [showNotifications, setShowNotifications] = useState(false);

    const [activeTab, setActiveTab] = useState('Dashboard');
    const [quote, setQuote] = useState({ text: "The universe is under no obligation to make sense to you.", author: "Neil deGrasse Tyson" });

    // Space Quotes Collection
    const quotes = [
        { text: "The universe is under no obligation to make sense to you.", author: "Neil deGrasse Tyson" },
        { text: "Look up at the stars and not down at your feet.", author: "Stephen Hawking" },
        { text: "Across the sea of space, the stars are other suns.", author: "Carl Sagan" },
        { text: "To confine our attention to terrestrial matters would be to limit the human spirit.", author: "Stephen Hawking" },
        { text: "Space is for everybody. It's not just for a few people in science or math, or for a select group of astronauts. That's our new frontier out there, and it's everybody's business to know about space.", author: "Christa McAuliffe" },
        { text: "We are all in the gutter, but some of us are looking at the stars.", author: "Oscar Wilde" },
    ];

    useEffect(() => {
        // Set random quote
        setQuote(quotes[Math.floor(Math.random() * quotes.length)]);
    }, []);

    // Check for tutorial
    useEffect(() => {
        if (!authLoading && user) {
            if (user.tutorialCompleted === false || user.tutorialCompleted === undefined) {
                // Short delay to ensure UI is ready
                const timer = setTimeout(() => setShowTutorial(true), 1000);
                return () => clearTimeout(timer);
            }
        }
    }, [user, authLoading]);

    const handleTutorialComplete = async () => {
        setShowTutorial(false);
        if (user) {
            try {
                // Update backend
                await api.put(`/auth/profile/${user.id}/tutorial`, { tutorialCompleted: true });

                // Update local context
                updateUser({ ...user, tutorialCompleted: true });
            } catch (error) {
                console.error("Failed to update tutorial status", error);
            }
        }
    };

    const handleTutorialSkip = async () => {
        await handleTutorialComplete();
    };


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
                const response = await api.post('/spacex/launches/query', {
                    query: { upcoming: true },
                    options: {
                        limit: 3,
                        sort: { date_utc: 'asc' },
                        select: ['name', 'date_utc', 'details', 'links', 'flight_number', 'rocket']
                    }
                });
                const data = response.data;
                if (data.docs) {
                    setSpacexData(data.docs);
                }
            } catch (error) {
                console.error('Error fetching SpaceX data:', error);
            }
        };
        fetchSpaceXData();
    }, []);
    // 6. Generate Translations & Fetch Backend Notifications
    useEffect(() => {
        const fetchNotifications = async () => {
            let backendNotifs = [];
            // A. Fetch Backend Notifications
            if (user && user.id) {
                try {
                    const res = await api.get(`/notifications/${user.id}`);
                    backendNotifs = res.data.notifications || [];
                } catch (err) {
                    console.error("Failed to fetch notifications", err);
                }
            }

            // B. Generate Local System Notifications
            const newNotifs = [];
            const addNotif = (id, type, title, message, link = '') => {
                newNotifs.push({ _id: id, type, title, message, link, createdAt: new Date().toISOString(), isRead: false });
            };

            // Aurora Alert
            const kp = parseFloat(getCurrentKp());
            if (kp >= 4) addNotif('aurora-alert-high', 'alert', 'Aurora Activity High', `Kp Index is ${kp}. Auroras may be visible!`, '/aurora');

            // Meteor Showers
            const today = new Date();
            const activeShower = meteorEvents.find(e => {
                const d = new Date(e.peak_date_utc);
                return d.getMonth() === today.getMonth() && Math.abs(d.getDate() - today.getDate()) <= 1;
            });
            if (activeShower) addNotif(`meteor-${activeShower.id}`, 'event', `${activeShower.name} Peak`, `The ${activeShower.name} shower peaks tonight!`, '/meteors');

            // SpaceX Launches
            if (spacexData && spacexData.length > 0) {
                const nextLaunch = spacexData[0];
                const diffHours = (new Date(nextLaunch.date_utc) - today) / (1000 * 60 * 60);
                if (diffHours > 0 && diffHours < 24) addNotif(`spacex-${nextLaunch.id}`, 'system', 'Launch Imminent', `${nextLaunch.name} launches in ${Math.round(diffHours)} hours.`, '/missions');
            }

            // C. Merge & Filter Read Status
            const readIds = JSON.parse(localStorage.getItem('spacescope_read_notifications') || '[]');

            // Process Local: Check localStorage
            const localProcessed = newNotifs.map(n => ({ ...n, isRead: readIds.includes(n._id) }));

            // Process Backend: They come with isRead from DB, but let's double check if we want any client-side override (usually not needed if API is source of truth)
            // We just use backendNotifs as is.

            const allNotifs = [...backendNotifs, ...localProcessed];

            // Sort by newest
            allNotifs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

            setNotifications(allNotifs);
            setUnreadCount(allNotifs.filter(n => !n.isRead).length);
        };

        fetchNotifications();
        // Poll every 30s for new backend notifications
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, [auroraData, spacexData, moonData, user]);

    const handleNotificationClick = async (notif) => {
        // 1. Mark as Read
        if (!notif.isRead) {
            // Check if it's a backend notification (Mongodb ID is 24 hex chars)
            const isBackend = /^[0-9a-fA-F]{24}$/.test(notif._id);

            if (isBackend) {
                // Call API
                try {
                    await api.put(`/notifications/${notif._id}/read`);
                    // Update State Locally
                    setNotifications(prev => prev.map(n => n._id === notif._id ? { ...n, isRead: true } : n));
                    setUnreadCount(prev => Math.max(0, prev - 1));
                } catch (err) {
                    console.error("Failed to mark read", err);
                }
            } else {
                // Local Notification -> LocalStorage
                const readIds = JSON.parse(localStorage.getItem('spacescope_read_notifications') || '[]');
                if (!readIds.includes(notif._id)) {
                    const updatedIds = [...readIds, notif._id];
                    localStorage.setItem('spacescope_read_notifications', JSON.stringify(updatedIds));
                    setNotifications(prev => prev.map(n => n._id === notif._id ? { ...n, isRead: true } : n));
                    setUnreadCount(prev => Math.max(0, prev - 1));
                }
            }
        }

        // 2. Navigate
        if (notif.link) {
            navigate(notif.link);
            setShowNotifications(false);
        }
    };

    const handleMarkAllRead = async () => {
        // Mark Backend Read
        if (user && user.id) {
            try {
                await api.put(`/notifications/${user.id}/read-all`);
            } catch (err) { console.error("Failed to mark all API read", err); }
        }

        // Mark Local Read
        const localIds = notifications.filter(n => !/^[0-9a-fA-F]{24}$/.test(n._id)).map(n => n._id);
        const readIds = JSON.parse(localStorage.getItem('spacescope_read_notifications') || '[]');
        const uniqueIds = [...new Set([...readIds, ...localIds])];
        localStorage.setItem('spacescope_read_notifications', JSON.stringify(uniqueIds));

        // Update UI
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        setUnreadCount(0);
    };

    // --- Moon Phase Logic ---

    // 1. Geolocation
    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setUserLocation({
                        lat: position.coords.latitude,
                        lon: position.coords.longitude
                    });
                },
                (error) => {
                    console.error("Geolocation denied or error:", error);
                }
            );
        }
    }, []);

    // 2. Fetch Moon Data (Visual Crossing)
    useEffect(() => {
        const fetchMoonData = async () => {
            try {
                const apiKey = import.meta.env.VITE_VISUAL_CROSSING_KEY;
                if (!apiKey) return;

                const { lat, lon } = userLocation;
                const url = `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${lat},${lon}/next7days?key=${apiKey}&include=days&elements=datetime,moonphase,moonphasename`;

                const res = await axios.get(url);
                if (res.data && res.data.days) {
                    setMoonData(res.data.days);
                }
            } catch (err) {
                console.error("Moon Data Error:", err);
            }
        };

        fetchMoonData();
    }, [userLocation]);

    // 3. Fetch Moon Image (Unsplash) - Cached
    useEffect(() => {
        if (!moonData || moonData.length === 0) return;

        const fetchMoonImage = async () => {
            // Use derived name if API one is missing
            const currentPhaseVal = moonData[0].moonphase;
            const derived = getMoonPhaseDetails(currentPhaseVal);
            const todayPhase = moonData[0].moonphasename || derived.name;
            const cacheKey = `moon_image_${new Date().toISOString().split('T')[0]}_${todayPhase.replace(/\s/g, '')}`;
            const cached = localStorage.getItem(cacheKey);

            if (cached) {
                setMoonImage(JSON.parse(cached));
                return;
            }

            try {
                const accessKey = import.meta.env.VITE_UNSPLASH_ACCESS_KEY;
                if (!accessKey) return;

                const res = await axios.get(`https://api.unsplash.com/search/photos?query=${encodeURIComponent(todayPhase)} moon&client_id=${accessKey}&per_page=1&orientation=landscape`);

                if (res.data.results && res.data.results.length > 0) {
                    const imgData = {
                        url: res.data.results[0].urls.regular,
                        credit: res.data.results[0].user.name
                    };
                    setMoonImage(imgData);
                    localStorage.setItem(cacheKey, JSON.stringify(imgData));
                }
            } catch (err) {
                console.error("Unsplash Error:", err);
            }
        };

        fetchMoonImage();
    }, [moonData]);



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

    // Helper: Calculate Phase Name and Icon locally if API fails or for better icons
    const getMoonPhaseDetails = (value) => {
        // defined as 0..1
        if (value === 0 || value === 1) return { name: 'New Moon', icon: <WiMoonNew className="text-3xl text-slate-500" /> };
        if (value < 0.25) return { name: 'Waxing Crescent', icon: <WiMoonWaxingCrescent3 className="text-3xl text-slate-400" /> };
        if (value === 0.25) return { name: 'First Quarter', icon: <WiMoonFirstQuarter className="text-3xl text-[#00d9ff]" /> };
        if (value < 0.5) return { name: 'Waxing Gibbous', icon: <WiMoonWaxingGibbous3 className="text-3xl text-[#00d9ff]" /> };
        if (value === 0.5) return { name: 'Full Moon', icon: <WiMoonFull className="text-3xl text-[#00d9ff] drop-shadow-[0_0_10px_rgba(0,217,255,0.5)]" /> };
        if (value < 0.75) return { name: 'Waning Gibbous', icon: <WiMoonWaningGibbous3 className="text-3xl text-[#00d9ff]" /> };
        if (value === 0.75) return { name: 'Last Quarter', icon: <WiMoonThirdQuarter className="text-3xl text-[#00d9ff]" /> };
        return { name: 'Waning Crescent', icon: <WiMoonWaningCrescent3 className="text-3xl text-slate-400" /> };
    };



    return (
        <div className="flex h-screen bg-transparent text-slate-300 font-sans overflow-hidden">
            {/* TargetCursor removed (global) */}

            {/* === LEFT SIDEBAR === */}
            <Sidebar activeTab="Dashboard" forceOpen={showTutorial && tutorialStep > 0} />

            {/* === MAIN CONTENT AREA === */}
            <div className="flex-1 flex flex-col min-w-0 bg-transparent relative">
                {/* Ambient Background Glows */}
                <div className="absolute top-[-20%] left-[20%] w-[500px] h-[500px] bg-[#00d9ff]/5 rounded-full blur-[100px] pointer-events-none" />

                {/* Top Header */}
                <header className="h-20 flex items-center justify-between px-6 border-b border-white/5 bg-black/20 backdrop-blur-md sticky top-0 z-10 transition-all duration-300">
                    <HeaderGreeting user={user} />

                    <div className="flex items-center gap-4 ml-4">
                        <div className="relative">
                            <button
                                onClick={() => setShowNotifications(!showNotifications)}
                                className="relative text-slate-400 hover:text-white transition-colors p-1"
                            >
                                <MdNotifications className="text-xl" />
                                {unreadCount > 0 && (
                                    <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-[#080b14] flex items-center justify-center"></span>
                                )}
                            </button>

                            {/* Notification Panel (YouTube Style) */}
                            {showNotifications && (
                                <div className="absolute top-full right-0 mt-3 w-80 sm:w-96 bg-[#0f1322] border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50 animate-fade-in-up">
                                    <div className="p-3 border-b border-white/5 flex justify-between items-center bg-[#0a0e17]">
                                        <h3 className="text-sm font-bold text-white">Notifications</h3>
                                        <button
                                            onClick={handleMarkAllRead}
                                            className="text-[10px] text-[#00d9ff] hover:text-white transition-colors font-medium"
                                        >
                                            Mark all as read
                                        </button>
                                    </div>
                                    <div className="max-h-[400px] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700">
                                        {notifications.length > 0 ? (
                                            notifications.map((notif) => (
                                                <div
                                                    key={notif._id}
                                                    onClick={() => handleNotificationClick(notif)}
                                                    className={`p-4 border-b border-white/5 cursor-pointer transition-colors relative group
                                                        ${notif.isRead ? 'bg-transparent hover:bg-white/5' : 'bg-[#00d9ff]/5 hover:bg-[#00d9ff]/10'}
                                                    `}
                                                >
                                                    {!notif.isRead && (
                                                        <span className="absolute top-4 right-4 w-2 h-2 rounded-full bg-[#00d9ff]" title="Unread"></span>
                                                    )}
                                                    <div className="flex gap-3">
                                                        <div className={`mt-1 min-w-[32px] h-8 rounded-full flex items-center justify-center
                                                            ${notif.type === 'alert' ? 'bg-red-500/20 text-red-400' :
                                                                notif.type === 'event' ? 'bg-purple-500/20 text-purple-400' :
                                                                    notif.type === 'achievement' ? 'bg-yellow-500/20 text-yellow-400' :
                                                                        'bg-slate-700/50 text-slate-400'}
                                                        `}>
                                                            {notif.type === 'alert' ? <BsFillLightningChargeFill size={14} /> :
                                                                notif.type === 'event' ? <WiStars size={16} /> :
                                                                    <MdNotifications size={16} />}
                                                        </div>
                                                        <div>
                                                            <div className="text-xs text-white font-bold leading-tight mb-1 pr-4">{notif.title}</div>
                                                            <div className="text-[11px] text-slate-400 leading-snug mb-1">{notif.message}</div>
                                                            <div className="text-[10px] text-slate-600 font-mono">
                                                                {new Date(notif.createdAt).toLocaleDateString()} • {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="p-8 text-center text-slate-500 text-xs italic">
                                                No notifications yet.
                                                <br />
                                                Time to explore the universe!
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
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
                        {/* Title Section (Quote & Stats) */}
                        <div className="flex flex-col xl:flex-row justify-between items-end gap-6 border-b border-white/5 pb-6">
                            <div className="flex-1 w-full xl:w-auto">
                                <div className="text-slate-400 text-sm italic border-l-2 border-[#00d9ff] pl-4 py-2 bg-white/5 rounded-r-lg border-y border-y-transparent">
                                    "{quote.text}" <span className="text-[#00d9ff] text-xs not-italic ml-2 opacity-80">— {quote.author}</span>
                                </div>
                            </div>

                            <div className="flex gap-3 sm:gap-4 w-full xl:w-auto overflow-x-auto pb-2 xl:pb-0">
                                <div className="flex-shrink-0 px-5 py-3 rounded-xl border border-white/10 bg-black/30 backdrop-blur-md">
                                    <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">Active Missions</div>
                                    <div className="text-xl sm:text-2xl font-bold text-white font-mono">{spacexData.length > 0 ? spacexData.length + 5 : '12'}</div>
                                </div>
                                <div className="flex-shrink-0 px-5 py-3 rounded-xl border border-white/10 bg-[#0f1322]">
                                    <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">Next ISS Pass</div>
                                    <div className="text-xl sm:text-2xl font-bold text-[#00d9ff] font-mono">{getNextPassTime()}</div>
                                </div>
                                <div className="flex-shrink-0 px-5 py-3 rounded-xl border border-purple-500/30 bg-purple-500/10">
                                    <div className="text-[10px] text-purple-300 uppercase font-bold mb-1 flex items-center gap-1">
                                        <BsFillLightningChargeFill /> Aurora Alert
                                    </div>
                                    <div className="text-xl sm:text-2xl font-bold text-white font-mono">Kp {getCurrentKp()}</div>
                                </div>
                            </div>
                        </div>

                        {/* Top Grid: Aurora & ISS */}
                        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
                            {/* ... Aurora Card ... */}
                            <div className="cursor-target xl:col-span-7 h-[400px] bg-black/30 backdrop-blur-xl border border-white/5 rounded-2xl relative overflow-hidden group flex flex-col hover:border-[#00d9ff]/30 transition-all duration-300">
                                <div className="absolute inset-0 z-0">
                                    <MapContainer
                                        center={[60, 0]}
                                        zoom={2}
                                        minZoom={2}
                                        style={{ height: "100%", width: "100%", background: "transparent" }}
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
                                        <button onClick={() => navigate('/aurora')} className="cursor-target px-4 py-2 bg-[#00d9ff] hover:bg-cyan-400 text-black font-bold text-sm rounded-lg transition-all shadow-[0_0_15px_rgba(0,225,255,0.3)] hover:shadow-[0_0_25px_rgba(0,225,255,0.5)]">
                                            View Details →
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* ... ISS Card ... */}
                            <div className="cursor-target xl:col-span-5 h-[400px] bg-black/30 backdrop-blur-xl border border-white/5 rounded-2xl p-6 flex flex-col hover:border-[#00d9ff]/30 transition-all duration-300">
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
                                    <div className="bg-black/30 backdrop-blur-md p-3 rounded-xl border border-white/5">
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
                            {/* Moon Phases Widget (Replaces Solar Activity) */}
                            <div
                                onClick={() => setShowMoonModal(true)}
                                className="cursor-target lg:col-span-5 bg-black/30 backdrop-blur-xl border border-white/5 rounded-2xl p-0 relative overflow-hidden group hover:border-[#00d9ff]/30 transition-all cursor-pointer h-[300px]"
                            >
                                {/* Background Image */}
                                {moonImage ? (
                                    <div className="absolute inset-0 z-0">
                                        <img src={moonImage.url} alt="Moon Phase" className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-700" />
                                        <div className="absolute inset-0 bg-gradient-to-t from-[#050810] via-[#050810]/50 to-transparent" />
                                    </div>
                                ) : (
                                    <div className="absolute inset-0 bg-[#0f1322] z-0" />
                                )}

                                <div className="relative z-10 p-6 h-full flex flex-col justify-between">
                                    <div className="flex justify-between items-start">
                                        <div className="bg-black/40 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-lg flex items-center gap-2">
                                            <Moon size={16} className="text-[#00d9ff]" />
                                            <span className="text-white text-sm font-bold">Moon Phase</span>
                                        </div>
                                        <span className="px-2 py-1 rounded bg-[#00d9ff]/10 border border-[#00d9ff]/20 text-[#00d9ff] text-[10px] font-bold uppercase">
                                            Today
                                        </span>
                                    </div>

                                    <div>
                                        {moonData && moonData.length > 0 ? (
                                            <>
                                                <h3 className="text-3xl font-black text-white mb-1">
                                                    {moonData[0].moonphasename || getMoonPhaseDetails(moonData[0].moonphase).name}
                                                </h3>
                                                <div className="flex items-center gap-4 text-slate-300 text-sm">
                                                    <span>illumination: {Math.round(moonData[0].moonphase * 100)}%</span>
                                                    <span className="w-1 h-1 rounded-full bg-slate-500" />
                                                    <span className="text-[#00d9ff] font-bold flex items-center gap-1">
                                                        View Calendar <MdChevronRight />
                                                    </span>
                                                </div>
                                            </>
                                        ) : (
                                            <div className="text-slate-400 animate-pulse">Loading lunar data...</div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Meteor Calendar */}
                            <div className="cursor-target lg:col-span-7 bg-black/30 backdrop-blur-xl border border-white/5 rounded-2xl p-6">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                        <WiStars className="text-purple-400 text-2xl" /> Meteor Calendar
                                    </h3>
                                    {/* Navigate to the new full page */}
                                    <button
                                        onClick={() => navigate('/meteors')}
                                        className="text-xs text-[#00d9ff] hover:text-white transition-colors uppercase tracking-wider font-bold"
                                    >
                                        View All Sequence
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    {/* Dynamic Mapping of first 2 events */}
                                    {meteorEvents.slice(0, 2).map((event) => (
                                        <div
                                            key={event.id}
                                            className="bg-black/30 backdrop-blur-md border border-white/5 rounded-xl p-4 flex justify-between items-center group hover:border-[#00d9ff]/30 hover:shadow-[0_0_15px_rgba(0,217,255,0.1)] transition-all duration-300 cursor-pointer"
                                            onClick={() => navigate('/meteors')}
                                        >
                                            <div className="flex items-center gap-4">
                                                {/* Date Box */}
                                                <div className="w-12 h-12 rounded-lg bg-[#1a2036] border border-white/5 text-purple-400 flex flex-col items-center justify-center">
                                                    <span className="text-[10px] text-slate-500 font-mono uppercase">Peak</span>
                                                    <span className="text-sm font-bold text-white">
                                                        {new Date(event.peak_date_utc).getDate()}
                                                    </span>
                                                </div>

                                                <div>
                                                    <h4 className="text-white font-bold text-lg group-hover:text-[#00d9ff] transition-colors">
                                                        {event.name}
                                                    </h4>
                                                    <div className="text-slate-400 text-xs font-medium mb-1">
                                                        {new Date(event.peak_date_utc).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} • {new Date(event.peak_date_utc).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })} UTC
                                                    </div>
                                                    <div className="flex gap-3 text-[10px] text-slate-500 font-mono">
                                                        <span className="flex items-center gap-1">
                                                            <MdPublic /> {event.geographic_visibility.best_region.split(' ')[0]} Vis.
                                                        </span>
                                                        <span className="flex items-center gap-1 text-[#00d9ff]">
                                                            <WiStars /> ZHR {event.zhr}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex flex-col items-end gap-2">
                                                <span className={`px-2 py-1 text-[10px] font-bold rounded border ${event.visibility_score > 70
                                                    ? 'bg-green-500/10 text-green-400 border-green-500/20'
                                                    : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                                                    }`}>
                                                    {event.visibility_score > 70 ? 'OPTIMAL' : 'MODERATE'}
                                                </span>
                                                <button className="w-8 h-8 rounded-full bg-[#1a2036] text-slate-400 hover:text-white flex items-center justify-center hover:bg-[#00d9ff] hover:text-black transition-all">
                                                    <MdNotifications />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* New Section: Debris & Temperature */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Orbital Debris Globe */}
                            <div className="cursor-target h-[500px] bg-black/30 backdrop-blur-xl border border-white/5 rounded-2xl p-6 flex flex-col">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                        <MdSatelliteAlt className="text-red-500" />
                                        Orbital Debris Tracker
                                    </h3>
                                    <div className="text-[10px] uppercase font-bold text-slate-500 border border-white/10 px-2 py-1 rounded">
                                        Real-time Data
                                    </div>
                                </div>
                                <div className="flex-1 rounded-xl overflow-hidden relative border border-white/5">
                                    <SpaceDebrisGlobe realLimit={1000} syntheticLimit={200} />
                                </div>
                            </div>

                            {/* Global Temperature Chart */}
                            <div className="cursor-target h-[500px] bg-black/30 backdrop-blur-xl border border-white/5 rounded-2xl p-6 flex flex-col">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                        <WiDaySunny className="text-orange-500 text-2xl" />
                                        Global Temperature Anomaly
                                    </h3>
                                    <div className="text-[10px] uppercase font-bold text-slate-500 border border-white/10 px-2 py-1 rounded">
                                        1880 - Present
                                    </div>
                                </div>
                                <div className="flex-1 w-full h-full relative">
                                    <TempAnomalyChart downsampleFactor={2} />
                                </div>
                            </div>
                        </div>

                        {/* Bottom: Active Missions (SpaceX API Integration) */}
                        <div className="bg-black/30 backdrop-blur-xl border border-white/5 rounded-2xl p-6">
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
                                    spacexData.map((launch, idx) => (
                                        <div
                                            key={launch.id || idx}
                                            className="cursor-target bg-black/30 backdrop-blur-md border border-white/5 rounded-xl p-4 hover:border-blue-500/30 transition-all duration-300 group"
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
            </div >
            {showTutorial && (
                <Tutorial
                    user={user}
                    onComplete={handleTutorialComplete}
                    onSkip={handleTutorialSkip}
                    onStepChange={setTutorialStep}
                />
            )}

            {/* Moon Phase Modal */}
            {
                showMoonModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                        <div className="bg-[#0a0e17] border border-white/10 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto relative shadow-2xl">
                            <button
                                onClick={() => setShowMoonModal(false)}
                                className="absolute top-4 right-4 text-slate-400 hover:text-white z-10 p-2 bg-black/50 rounded-full"
                            >
                                <X size={24} />
                            </button>

                            <div className="p-8">
                                <div className="flex items-center gap-3 mb-8">
                                    <Moon className="text-[#00d9ff]" size={32} />
                                    <h2 className="text-2xl font-bold text-white">7-Day Moon Forecast</h2>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                    {/* Left: Today's Detail */}
                                    <div className="md:col-span-1 flex flex-col items-center text-center p-6 bg-white/5 rounded-xl border border-white/5">
                                        <h3 className="text-[#00d9ff] font-bold uppercase text-sm mb-4">Current Phase</h3>
                                        <div className="w-48 h-48 rounded-full border-4 border-[#00d9ff]/20 overflow-hidden mb-6 shadow-[0_0_50px_rgba(0,217,255,0.2)] relative">
                                            {moonImage ? (
                                                <img src={moonImage.url} alt="Moon" className="w-full h-full object-cover scale-125" />
                                            ) : (
                                                <div className="w-full h-full bg-slate-800" />
                                            )}
                                        </div>
                                        <h2 className="text-2xl font-bold text-white mb-2">
                                            {moonData?.[0]?.moonphasename || getMoonPhaseDetails(moonData?.[0]?.moonphase).name || "Loading..."}
                                        </h2>
                                        <p className="text-slate-400 text-sm">
                                            Illumination: <span className="text-white">{Math.round((moonData?.[0]?.moonphase || 0) * 100)}%</span>
                                        </p>
                                        <div className="mt-6 w-full text-xs text-slate-500 border-t border-white/5 pt-4">
                                            Data provided by Visual Crossing
                                            <br />
                                            Image by {moonImage?.credit || "Unsplash"}
                                        </div>
                                    </div>

                                    {/* Right: Calendar Grid */}
                                    <div className="md:col-span-2">
                                        <h3 className="text-slate-400 font-bold uppercase text-sm mb-4 flex items-center gap-2">
                                            <CalendarIcon size={14} /> Upcoming Phases
                                        </h3>
                                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                            {moonData && moonData.slice(1, 7).map((day, idx) => {
                                                const details = getMoonPhaseDetails(day.moonphase);
                                                return (
                                                    <div key={idx} className="bg-black/40 border border-white/5 rounded-lg p-4 flex flex-col items-center text-center hover:border-[#00d9ff]/30 transition-colors">
                                                        <div className="text-slate-500 text-xs font-mono mb-2">
                                                            {new Date(day.datetime).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                                                        </div>
                                                        <div className="my-2">
                                                            {details.icon}
                                                        </div>
                                                        <div className="text-white font-bold text-sm leading-tight">
                                                            {day.moonphasename || details.name}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }
        </div >
    );
};

export default Dashboard;