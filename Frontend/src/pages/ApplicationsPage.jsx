import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Polygon, useMap, GeoJSON } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import axios from 'axios';
import { Layers, Cloud, Calendar, AlertTriangle, Loader2, ArrowLeftRight, Activity, Wind, Info, Map as MapIcon, Thermometer, ChevronLeft, Search, Satellite, Leaf } from 'lucide-react';
import { MdSmartToy } from 'react-icons/md';
import CO2Chart from '../components/CO2Chart';
import TempAnomalyChart from '../components/TempAnomalyChart';
import LightPollutionMap from '../components/LightPollutionMap';
import CloudCoverMap from '../components/CloudCoverMap';
import SpaceDebrisGlobe from '../components/SpaceDebrisGlobe';
import FeatureInfoModal from '../components/FeatureInfoModal';
import CO2CalculatorModal from '../components/CO2CalculatorModal';


import FeatureAIPopup from '../components/FeatureAIPopup';

// Images
import ndviImage from '../assets/images/app_ndviimage.png';
import co2Image from '../assets/images/app_co2image.png';
import tempImage from '../assets/images/app_temperatureimage.png';
import lightImage from '../assets/images/app_lightpollutionimage.png';
import cloudImage from '../assets/images/app_cloudcoverimage.png';
import debrisImage from '../assets/images/app_orbitaldebrisimage.png';

// --- CONFIGURATION ---
const API_KEY = import.meta.env.VITE_AGROMONITORING_API_KEY;
const POLYGON_COORDINATES = [
    [-121.1958, 37.6683],
    [-121.1779, 37.6687],
    [-121.1773, 37.6792],
    [-121.1958, 37.6792],
    [-121.1958, 37.6683]
];
// Center map roughly on the polygon
const MAP_CENTER = [37.6737, -121.1865];

// --- CONTENT DATA ---
const CHANNELS = [
    {
        id: 'ndvi',
        label: 'Vegetation (NDVI)',
        icon: Layers,
        description: 'Normalized Difference Vegetation Index (NDVI) analyzes remote sensing measurements to determine the health of vegetation. It compares the red and near-infrared light reflected by vegetation. Healthy plants absorb red light and reflect near-infrared light.',
        details: [
            'Monitor crop health and density',
            'Detect stressed vegetation early',
            'Estimate crop yield potential',
            'Optimize fertilizer application'
        ],
        satelliteHelp: "Multispectral sensors capture sunlight reflected from plants. Healthy vegetation reflects more near-infrared light, which satellites can detect to measure plant density and health.",
        didYouKnow: "Satellite data is updated every 5-10 days, allowing for near real-time monitoring of agricultural assets from space."
    },
    {
        id: 'co2',
        label: 'CO₂ Measurement',
        icon: Cloud,
        description: 'Carbon Dioxide (CO₂) monitoring helps track greenhouse gas emissions and air quality. This data is vital for understanding climate change impact and industrial compliance.',
        details: [
            'Track regional emissions',
            'Analyze air quality trends',
            'Support environmental policy'
        ],
        satelliteHelp: "Space-based spectrometers measure the absorption of sunlight by atmospheric gases. This allows for global tracking of carbon dioxide concentrations and emission sources.",
        didYouKnow: "CO2 levels have raised by over 50% since the industrial revolution, trapped heat is causing more frequent and intense weather events.",
        disabled: false
    },
    {
        id: 'temp',
        label: 'Global Temperature',
        icon: Thermometer,
        description: 'Track the change in global surface temperature relative to long-term averages. This data is critical for understanding global warming trends.',
        details: [
            'Historical temperature records',
            'Climate change evidence',
            'Global warming analysis'
        ],
        satelliteHelp: 'Satellites like NASA\'s Aqua and Terra use Infrared Sounders (AIRS) to measure heat distribution globally.',
        didYouKnow: "The last decade (2014-2023) was the warmest decade on record, with 2023 being the hottest year ever recorded since global records began in 1880.",
        disabled: false
    },
    {
        id: 'light',
        label: 'Light Pollution',
        icon: Activity,
        description: 'Light pollution maps show the artificial sky brightness. This is crucial for astronomical observations and understanding energy consumption patterns in urban areas.',
        details: [
            'Identify dark sky preserves',
            'Analyze urban energy usage',
            'Ecological impact studies'
        ],
        satelliteHelp: "High-resolution nighttime imagery captures artificial light emissions from Earth. This data helps map urbanization, energy consumption, and ecological light impacts.",
        didYouKnow: "One-third of humanity cannot see the Milky Way due to light pollution. It disrupts wildlife, impacts human health, and wastes energy.",
        disabled: false
    },
    {
        id: 'weather',
        label: 'Cloud Cover',
        icon: Wind,
        description: 'Real-time and historical cloud cover data. Essential for various agricultural assessments and validating other satellite imagery data accuracy.',
        details: [
            'Weather pattern analysis',
            'Solar energy potential',
            'Precipitation forecasting'
        ],
        satelliteHelp: "Optical and infrared sensors monitor cloud formation and movement 24/7. This provides critical data for weather forecasting and correcting other satellite imagery.",
        didYouKnow: "Why are there black stripes? These are Orbital Gaps. The Terra satellite flies in a low Earth orbit. The black areas are regions the satellite hasn't flown over yet today.",
        disabled: false
    },
    {
        id: 'debris',
        label: 'Orbital Debris',
        icon: Satellite,
        description: 'Visualizes the increasing density of man-made objects in Earth\'s orbit. This phenomenon, known as Kessler Syndrome, poses a significant risk to future space exploration.',
        details: [
            'Real-time Debris Tracking',
            'Collision Avoidance Analysis',
            'Low Earth Orbit (LEO) Congestion'
        ],
        satelliteHelp: "Radar and optical telescopes track over 27,000 pieces of space junk larger than a softball. Millions of smaller pieces are untrackable but still dangerous.",
        didYouKnow: "A screw travelling at orbital velocity (17,500 mph) hits with the force of a hand grenade. The Kessler Syndrome predicts a point where one collision cascades into many, making orbit unusable.",
        disabled: false
    }
];

// --- HELPER COMPONENTS ---

// Layer Splitter Component - Creates split view with NDVI effect on left, True Color on right
// Layer Splitter Component Removed


// Map Updater Component - Handles programmatic map moves
const MapUpdater = ({ center }) => {
    const map = useMap();
    useEffect(() => {
        if (center) {
            map.flyTo(center, 13, {
                animate: true,
                duration: 1.5
            });
        }
    }, [center, map]);
    return null;
};

const NDVIMap = () => {
    const navigate = useNavigate();
    const [activeChannel, setActiveChannel] = useState('ndvi');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [polygonId, setPolygonId] = useState(null);
    const [imagery, setImagery] = useState(null);
    const [currentTempAnomaly, setCurrentTempAnomaly] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [mapCenter, setMapCenter] = useState(MAP_CENTER);
    const [searchBoundary, setSearchBoundary] = useState(null);
    const [showInfoModal, setShowInfoModal] = useState(false);
    const [showGuideModal, setShowGuideModal] = useState(false);
    const [showCalculator, setShowCalculator] = useState(false);

    const activeChannelData = CHANNELS.find(c => c.id === activeChannel);

    // Dynamic Modal Content
    const getModalContent = () => {
        const fullContent = {
            ndvi: {
                title: "Vegetation Index (NDVI)",
                image: ndviImage,
                features: [
                    {
                        title: "What is NDVI?",
                        desc: "Normalized Difference Vegetation Index (NDVI) is a graphical indicator that analyzes remote sensing measurements to assess whether the target being observed contains live green vegetation or not.",
                        icon: <Layers className="text-lg" />
                    },
                    {
                        title: "How do Satellites Help?",
                        desc: "Satellites measure distinct wavelengths of light absorbed and reflected by green plants. Healthy vegetation absorbs red light (for photosynthesis) and reflects near-infrared light, creating a unique spectral signature.",
                        icon: <Satellite className="text-lg" />
                    },
                    {
                        title: "Why is this Important?",
                        desc: "NDVI helps farmers and ecologists monitor crop health, estimate yields, detect drought stress early, and improve fertilizer application precision.",
                        icon: <Activity className="text-lg" />
                    }
                ],
                link: "https://en.wikipedia.org/wiki/Normalized_difference_vegetation_index"
            },
            co2: {
                title: "Carbon Dioxide Monitoring",
                image: co2Image,
                features: [
                    {
                        title: "What is CO2 Monitoring?",
                        desc: "We track the concentration of Carbon Dioxide in the Earth's atmosphere, the primary greenhouse gas driving global climate change.",
                        icon: <Cloud className="text-lg" />
                    },
                    {
                        title: "How do Satellites Help?",
                        desc: "Satellites like NASA's OCO-2 use spectrometers to detect the intensity of sunlight reflected off the Earth. CO2 molecules absorb specific wavelengths, allowing sensors to calculate the gas density.",
                        icon: <Satellite className="text-lg" />
                    },
                    {
                        title: "Impact Analysis",
                        desc: "This data reveals emission hotspots, seasonal cycles of absorption by forests (the 'Earth's breath'), and long-term accumulation trends.",
                        icon: <AlertTriangle className="text-lg" />
                    }
                ],
                link: "https://climate.nasa.gov/vital-signs/carbon-dioxide/"
            },
            temp: {
                title: "Global Temperature Anomalies",
                image: tempImage,
                features: [
                    {
                        title: "What is Temperature Anomaly?",
                        desc: "It serves as a benchmark for Global Warming. It represents the difference between the observed temperature and the long-term average (1951-1980 baseline).",
                        icon: <Thermometer className="text-lg" />
                    },
                    {
                        title: "How do Satellites Help?",
                        desc: "Satellites like NASA's Aqua and Terra use Infrared Sounders (AIRS) to measure the temperature of the land, ocean, and atmosphere with high precision.",
                        icon: <Satellite className="text-lg" />
                    },
                    {
                        title: "Why is this Important?",
                        desc: "Tracking these anomalies helps scientists quantify global warming trends, predict heatwaves, and understand the Earth's changing energy budget.",
                        icon: <Activity className="text-lg" />
                    }
                ],
                link: "https://climate.nasa.gov/vital-signs/global-temperature/"
            },
            light: {
                title: "Artificial Light Pollution",
                image: lightImage,
                features: [
                    {
                        title: "What is Light Pollution?",
                        desc: "The excessive or obtrusive use of artificial light at night. It is a side effect of industrial civilization and urbanization.",
                        icon: <AlertTriangle className="text-lg" />
                    },
                    {
                        title: "How do Satellites Help?",
                        desc: "Sensors like the VIIRS aboard the Suomi NPP satellite capture high-resolution images of Earth at night, detecting city lights, gas flares, and wildfires.",
                        icon: <Satellite className="text-lg" />
                    },
                    {
                        title: "Ecological Impact",
                        desc: "Light pollution disrupts nocturnal wildlife patterns (migration, reproduction), wastes energy, and obscures our view of the universe.",
                        icon: <MapIcon className="text-lg" />
                    }
                ],
                link: "https://www.darksky.org/light-pollution/"
            },
            weather: {
                title: "Cloud Cover & Weather",
                image: cloudImage,
                features: [
                    {
                        title: "Why Track Clouds?",
                        desc: "Cloud cover data is essential for agricultural planning (solar radiation estimates) and validating optical satellite imagery (masking obstructed areas).",
                        icon: <Wind className="text-lg" />
                    },
                    {
                        title: "How do Satellites Help?",
                        desc: "Geostationary satellites like GOES and polar orbiters like Terra/Aqua use visible and infrared sensors to monitor cloud formation, type, and movement 24/7.",
                        icon: <Satellite className="text-lg" />
                    },
                    {
                        title: "Orbital Gaps",
                        desc: "You might see black stripes in the data. These are gaps between satellite orbital passes. Low Earth Orbit satellites can't image the entire globe instantly!",
                        icon: <MapIcon className="text-lg" />
                    }
                ],
                link: "https://earthobservatory.nasa.gov/global-maps/MODAL2_M_CLD_FR"
            },
            debris: {
                title: "Orbital Debris (Space Junk)",
                image: debrisImage,
                features: [
                    {
                        title: "What is Space Junk?",
                        desc: "Defunct man-made objects in space—old satellites, spent rocket stages, and fragments from disintegration, erosion, and collisions.",
                        icon: <AlertTriangle className="text-lg" />
                    },
                    {
                        title: "The Kessler Syndrome",
                        desc: "A scenario where the density of objects in LEO is high enough that collisions between objects could cause a cascade, rendering space exploration impossible.",
                        icon: <Activity className="text-lg" />
                    },
                    {
                        title: "Tracking & Safety",
                        desc: "Space surveillance networks track over 27,000 pieces of debris larger than 10cm to warn active satellites and the ISS to perform collision avoidance maneuvers.",
                        icon: <Satellite className="text-lg" />
                    }
                ],
                link: "https://www.nasa.gov/mission_pages/station/news/orbital_debris.html"
            }
            // Default fallbacks for other channels can be added here
        };
        return fullContent[activeChannel] || fullContent.ndvi; // Fallback to NDVI if others not defined yet
    };

    const modalData = getModalContent();

    // --- STEP 1: CREATE/FETCH POLYGON ---
    useEffect(() => {
        const setupPolygon = async () => {
            try {
                const listRes = await axios.get(`https://api.agromonitoring.com/agro/1.0/polygons?appid=${API_KEY}`);
                if (listRes.data && listRes.data.length > 0) {
                    setPolygonId(listRes.data[0].id);
                    return;
                }

                const payload = {
                    name: "SpaceScope Test Farm",
                    geo_json: {
                        type: "Feature",
                        properties: {},
                        geometry: {
                            type: "Polygon",
                            coordinates: [POLYGON_COORDINATES]
                        }
                    }
                };

                const createRes = await axios.post(
                    `https://api.agromonitoring.com/agro/1.0/polygons?appid=${API_KEY}`,
                    payload
                );

                if (createRes.data && createRes.data.id) {
                    setPolygonId(createRes.data.id);
                } else {
                    throw new Error("Failed to create polygon ID");
                }
            } catch (err) {
                console.error("Polygon Setup Error:", err);
                // Graceful Fallback: Don't block the UI. Just warn.
                // setError("Failed to initialize farm polygon.");
                console.warn("Switching to Optical Mode (Base Map Only)");
                setLoading(false);
            }
        };

        setupPolygon();
    }, []);

    // --- STEP 2: SEARCH IMAGERY ---
    useEffect(() => {
        if (!polygonId || activeChannel !== 'ndvi') return;

        const findImagery = async () => {
            try {
                const end = Math.floor(Date.now() / 1000);
                const start = 1609459200; // Jan 1, 2021
                const searchUrl = `https://api.agromonitoring.com/agro/1.0/image/search?start=${start}&end=${end}&polyid=${polygonId}&appid=${API_KEY}`;
                const res = await axios.get(searchUrl);

                if (!res.data || res.data.length === 0) {
                    setError("No satellite imagery found for this area.");
                    setLoading(false);
                    return;
                }

                const bestImage = res.data.sort((a, b) => a.cl - b.cl)[0];

                if (bestImage.tile) {
                    // Debug: Log the tile URLs to verify they're different
                    console.log('True Color URL:', bestImage.tile.truecolor);
                    console.log('NDVI URL:', bestImage.tile.ndvi);

                    // Construct NDVI URL with palette
                    // Check if URL already has query params
                    const ndviBase = bestImage.tile.ndvi;
                    const separator = ndviBase.includes('?') ? '&' : '?';
                    const ndviUrl = `${ndviBase}${separator}paletteid=3`;

                    console.log('NDVI with palette:', ndviUrl);

                    setImagery({
                        trueColor: bestImage.tile.truecolor,
                        ndvi: ndviUrl,
                        stats: {
                            date: new Date(bestImage.dt * 1000).toLocaleDateString(),
                            clouds: bestImage.cl,
                            satellite: bestImage.type || "Sentinel-2"
                        }
                    });
                } else {
                    throw new Error("Image found but no tile URL available.");
                }
            } catch (err) {
                console.error("Imagery Search Error:", err);
                // Graceful fallback
                // setError("Failed to retrieve satellite imagery.");
            } finally {
                setLoading(false);
            }
        };

        findImagery();
    }, [polygonId, activeChannel]);

    const handleSearch = async () => {
        if (!searchQuery.trim()) return;

        setLoading(true);
        setError(null);

        // Check if input is coordinates (lat, lon)
        const coordRegex = /^(-?\d+(\.\d+)?),\s*(-?\d+(\.\d+)?)$/;
        const match = searchQuery.match(coordRegex);

        if (match) {
            const lat = parseFloat(match[1]);
            const lon = parseFloat(match[3]);
            setMapCenter([lat, lon]);
            setLoading(false);
            return;
        }

        // Otherwise search by name using Nominatim
        try {
            const response = await axios.get(`https://nominatim.openstreetmap.org/search`, {
                params: {
                    q: searchQuery,
                    format: 'json',
                    limit: 5,
                    polygon_geojson: 1
                }
            });

            if (response.data && response.data.length > 0) {
                // Find first result with a Polygon/MultiPolygon
                const polygonResult = response.data.find(item =>
                    item.geojson && (item.geojson.type === 'Polygon' || item.geojson.type === 'MultiPolygon')
                );

                const bestResult = polygonResult || response.data[0];
                const { lat, lon, geojson } = bestResult;

                setMapCenter([parseFloat(lat), parseFloat(lon)]);

                if (bestResult === polygonResult) {
                    setSearchBoundary(geojson);
                } else {
                    setSearchBoundary(null);
                }
            } else {
                setError("Location not found.");
            }
        } catch (err) {
            console.error("Search Error:", err);
            setError("Failed to search location.");
        } finally {
            setLoading(false);
        }
    };


    const leafletPolygon = POLYGON_COORDINATES.map(idx => [idx[1], idx[0]]);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Mobile sidebar state
    const [showAIPopup, setShowAIPopup] = useState(false);

    return (
        <div className="flex flex-col md:flex-row h-screen w-full bg-[#050714] text-white p-2 md:p-4 gap-4 overflow-hidden font-inter relative">
            {/* TargetCursor removed (global) */}

            {/* === Feature AI Popup === */}
            {showAIPopup && (
                <FeatureAIPopup
                    feature={activeChannelData}
                    onClose={() => setShowAIPopup(false)}
                />
            )}

            {/* --- MOBILE HEADER & SIDEBAR TOGGLE --- */}
            <div className="md:hidden flex items-center justify-between bg-[#0a0e17] p-4 rounded-xl border border-white/10 shrink-0">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm font-bold"
                >
                    <ChevronLeft size={16} /> Back
                </button>
                <div className="font-bold text-[#00ff88] flex items-center gap-2">
                    <Activity size={18} /> {activeChannelData.label}
                </div>
                <button
                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    className="p-2 bg-[#151a25] rounded-lg border border-white/10 text-white"
                >
                    <Layers size={20} />
                </button>
            </div>


            {/* --- LEFT: CONTROL PANEL (Responsive Sidebar) --- */}
            <div className={`
                fixed inset-y-0 left-0 z-[2000] w-64 bg-[#0a0e17] transform transition-transform duration-300 ease-in-out border-r border-white/10 p-4 flex flex-col gap-4
                md:relative md:transform-none md:border-none md:p-0 md:bg-transparent md:w-64 md:flex-shrink-0
                ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
            `}>
                <div className="bg-[#0a0e17] rounded-xl border border-white/10 p-4 flex flex-col h-full shadow-xl">
                    <div className="flex items-center justify-between mb-6 md:mb-6">
                        <button
                            onClick={() => navigate(-1)}
                            className="hidden md:flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm font-bold"
                        >
                            <ChevronLeft size={16} /> Back
                        </button>
                        {/* Mobile Close Button */}
                        <button
                            onClick={() => setIsSidebarOpen(false)}
                            className="md:hidden ml-auto p-2 text-slate-400 hover:text-white"
                        >
                            <ChevronLeft size={20} />
                        </button>
                    </div>

                    <h2 className="hidden md:flex text-xl font-bold mb-6 items-center gap-2 text-[#00ff88]">
                        <Activity size={20} />
                        Control Panel
                    </h2>

                    <div className="space-y-3 overflow-y-auto flex-1">
                        {CHANNELS.map((channel) => (
                            <button
                                key={channel.id}
                                onClick={() => {
                                    !channel.disabled && setActiveChannel(channel.id);
                                    setIsSidebarOpen(false); // Close on selection (mobile)
                                }}
                                disabled={channel.disabled}
                                className={`cursor-target w-full p-4 rounded-lg border flex items-center gap-3 transition-all duration-300 text-left group relative overflow-hidden
                                    ${activeChannel === channel.id
                                        ? 'bg-[#00ff88]/10 border-[#00ff88] text-white shadow-[0_0_15px_rgba(0,255,136,0.2)]'
                                        : 'bg-[#151a25] border-white/5 text-slate-400 hover:border-white/20'
                                    }
                                    ${channel.disabled ? 'opacity-50 cursor-not-allowed grayscale' : ''}
                                `}
                            >
                                <div className={`p-2 rounded-md ${activeChannel === channel.id ? 'bg-[#00ff88] text-black' : 'bg-slate-800'}`}>
                                    <channel.icon size={18} />
                                </div>
                                <div className="flex-1">
                                    <span className="font-semibold text-sm block">{channel.label}</span>
                                    {channel.disabled && <span className="text-[10px] uppercase tracking-wider text-slate-500">Coming Soon</span>}
                                </div>
                                {activeChannel === channel.id && (
                                    <div className="absolute right-0 top-0 bottom-0 w-1 bg-[#00ff88]" />
                                )}
                            </button>
                        ))}
                    </div>

                    <div className="mt-auto pt-6 border-t border-white/10 hidden md:block">
                        <div className="text-xs text-slate-500 text-center">
                            Select a channel to visualize different satellite data layers.
                        </div>
                    </div>
                </div>
            </div>

            {/* Overlay for mobile sidebar */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/80 z-[1500] md:hidden backdrop-blur-sm"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* --- CENTER: MAIN MAP AREA --- */}
            <div className="flex-1 flex flex-col gap-4 min-w-0 overflow-y-auto md:overflow-hidden"> {/* Scroll on mobile */}

                {/* Header Block */}
                <div className="bg-[#0a0e17] rounded-xl border border-white/10 p-4 md:p-6 flex flex-col justify-center items-center text-center shadow-lg relative overflow-hidden group shrink-0">
                    <div className="absolute inset-0 bg-gradient-to-r from-[#00ff88]/5 via-transparent to-[#00d9ff]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                    <h1 className="text-xl md:text-3xl lg:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400 z-10 leading-tight">
                        Check out how space data helps us.
                    </h1>
                    <p className="text-xs md:text-base text-slate-400 mt-2 z-10 hidden md:block">
                        Explore real-time insights derived from satellite imagery.
                    </p>
                    <button
                        onClick={() => setShowGuideModal(true)}
                        className="cursor-target mt-4 px-6 py-2 bg-[#00ff88]/20 hover:bg-[#00ff88]/30 border border-[#00ff88]/50 rounded-full text-[#00ff88] text-sm font-bold uppercase tracking-widest transition-all z-10 flex items-center gap-2 hover:shadow-[0_0_20px_rgba(0,255,136,0.3)] animate-fade-in-up"
                    >
                        <Info size={16} /> How to use this page
                    </button>
                </div>

                {/* Map Container Block */}
                <div className="cursor-target w-full h-[400px] md:h-auto md:flex-1 bg-[#0a0e17] rounded-xl border border-white/10 relative overflow-hidden shadow-2xl flex flex-col shrink-0">
                    {activeChannel === 'co2' ? (
                        <CO2Chart />
                    ) : activeChannel === 'temp' ? (
                        <TempAnomalyChart onDataLoaded={setCurrentTempAnomaly} />
                    ) : activeChannel === 'light' ? (
                        <LightPollutionMap />
                    ) : activeChannel === 'weather' ? (
                        <CloudCoverMap />
                    ) : activeChannel === 'debris' ? (
                        <SpaceDebrisGlobe />
                    ) : (
                        /* Map Error State */
                        /* Map Error/Fallback State */
                        error ? (
                            <div className="flex h-full w-full items-center justify-center text-center p-6 relative">
                                <div className="absolute inset-0 z-0 opacity-50 pointer-events-none">
                                    {/* Show Base Map in background even on error if possible, but here we are replacing the map content. 
                                        Better approach: Render MapContainer ALWAYS, and overlay error. 
                                        But to keep diff small, we just show a nice "Optical Mode" message.
                                    */}
                                </div>
                                <div className="bg-black/80 backdrop-blur-md p-6 rounded-2xl border border-white/10 max-w-sm relative z-10">
                                    <AlertTriangle className="mx-auto mb-3 h-10 w-10 text-yellow-500" />
                                    <h3 className="text-lg font-bold text-white">Live Feed Offline</h3>
                                    <p className="text-sm text-slate-400 mt-2 mb-4">{error}</p>
                                    <button
                                        onClick={() => setError(null)}
                                        className="px-4 py-2 bg-[#00ff88]/20 border border-[#00ff88] rounded-lg text-[#00ff88] text-sm font-bold uppercase hover:bg-[#00ff88]/30 transition-colors"
                                    >
                                        Enable Optical Mode
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="relative w-full h-full">
                                {/* Search Bar Overlay */}
                                <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1001] w-[90%] md:w-full md:max-w-md px-0 md:px-4">
                                    <div className="flex gap-2">
                                        <div className="relative flex-1">
                                            <input
                                                type="text"
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                                placeholder="Enter city or coords..."
                                                className="w-full bg-[#0a0e17]/90 backdrop-blur-md border border-white/20 text-white rounded-lg pl-9 md:pl-10 pr-4 py-2 focus:outline-none focus:border-[#00ff88] transition-colors shadow-lg placeholder:text-slate-500 text-xs md:text-sm"
                                            />
                                            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                        </div>
                                        <button
                                            onClick={handleSearch}
                                            className="cursor-target bg-[#00ff88] text-black font-bold px-3 md:px-4 py-2 rounded-lg hover:bg-[#00ff88]/90 transition-colors shadow-lg text-xs md:text-sm whitespace-nowrap"
                                        >
                                            Search
                                        </button>
                                    </div>
                                </div>
                                {/* Map Loading State */}
                                {loading && (
                                    <div className="absolute inset-0 z-[1000] bg-[#0a0e17]/80 backdrop-blur-sm flex items-center justify-center">
                                        <div className="flex flex-col items-center gap-3 text-[#00ff88]">
                                            <Loader2 className="animate-spin h-8 w-8" />
                                            <span className="text-sm font-mono tracking-wider">ACQUIRING FEED...</span>
                                        </div>
                                    </div>
                                )}

                                <MapContainer
                                    center={MAP_CENTER}
                                    zoom={15}
                                    style={{ height: "100%", width: "100%", background: '#0a0e17' }}
                                    className="z-0"
                                    zoomControl={false} // Clean look
                                >
                                    <MapUpdater center={mapCenter} />
                                    <TileLayer
                                        url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                                        attribution='&copy; Esri'
                                    />

                                    <Polygon
                                        positions={leafletPolygon}
                                        pathOptions={{
                                            color: '#00ff88',
                                            fillOpacity: 0.1,
                                            weight: 2,
                                            dashArray: '5, 5'
                                        }}
                                    />

                                    {searchBoundary && (
                                        <GeoJSON
                                            key={JSON.stringify(searchBoundary)} // Force re-render on change
                                            data={searchBoundary}
                                            style={{
                                                color: '#00ff88',
                                                weight: 3,
                                                fillOpacity: 0.1,
                                                fillColor: '#00ff88'
                                            }}
                                        />
                                    )}

                                    {imagery && !loading && activeChannel === 'ndvi' && (
                                        <TileLayer
                                            url={imagery.ndvi}
                                            attribution="Agromonitoring"
                                        />
                                    )}
                                </MapContainer>

                                {/* Stats Overlay on Map */}
                                {!loading && imagery && activeChannel === 'ndvi' && (
                                    <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end pointer-events-none">
                                        <div className="bg-black/80 backdrop-blur-md p-2 md:p-3 rounded-lg border border-white/10 text-[10px] md:text-xs text-slate-300 pointer-events-auto flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-4">
                                            <div className="flex items-center gap-2">
                                                <Calendar size={12} className="text-[#00ff88]" />
                                                <span>{imagery.stats.date}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Cloud size={12} className="text-[#00ff88]" />
                                                <span>{imagery.stats.clouds.toFixed(1)}% Cloud</span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )
                    )}
                </div>

                {/* --- MOBILE INFO PANEL (STACKED) --- */}
                <div className="block md:hidden shrink-0">
                    <div className="bg-[#0a0e17] rounded-xl border border-white/10 p-4 shadow-xl">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-bold text-white flex items-center gap-2">
                                <activeChannelData.icon size={18} className="text-[#00ff88]" />
                                {activeChannelData.label}
                            </h2>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setShowAIPopup(true)}
                                    className="text-[#00ff88] text-xs font-bold uppercase border border-[#00ff88]/50 px-3 py-1 rounded-full flex items-center gap-1"
                                >
                                    <MdSmartToy size={14} /> Ask AI
                                </button>
                                <button
                                    onClick={() => setShowInfoModal(true)}
                                    className="text-[#00ff88] text-xs font-bold uppercase border border-[#00ff88]/50 px-3 py-1 rounded-full"
                                >
                                    Learn More
                                </button>
                            </div>
                        </div>
                        {activeChannel === 'co2' && (
                            <button
                                onClick={() => setShowCalculator(true)}
                                className="w-full mb-4 py-3 bg-gradient-to-r from-[#00ff88]/20 to-[#00d9ff]/20 hover:from-[#00ff88]/30 hover:to-[#00d9ff]/30 border border-[#00ff88]/50 rounded-xl flex items-center justify-center gap-2 text-white font-bold transition-all shadow-lg animate-pulse"
                            >
                                <Leaf className="text-[#00ff88]" size={20} />
                                <span className="uppercase tracking-wider text-xs">Simulate Solution</span>
                            </button>
                        )}
                        <p className="text-sm text-slate-400 line-clamp-3 mb-4">
                            {activeChannelData.description}
                        </p>
                        {/* Big Number Stat for Temp Mobile */}
                        {activeChannel === 'temp' && currentTempAnomaly !== null && (
                            <div className="p-3 rounded-lg bg-[#151a25] border border-white/10 text-center mb-4">
                                <h4 className="text-[10px] text-slate-400 uppercase tracking-widest font-bold mb-1">Current Deviation</h4>
                                <div className={`text-2xl font-black ${currentTempAnomaly >= 0 ? 'text-red-400' : 'text-blue-400'}`}>
                                    {currentTempAnomaly > 0 ? '+' : ''}{currentTempAnomaly}°C
                                </div>
                            </div>
                        )}
                        <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-2">Key Benefits</h3>
                        <ul className="space-y-2 mb-4">
                            {activeChannelData.details.slice(0, 2).map((detail, idx) => (
                                <li key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                                    <div className="min-w-[4px] h-[4px] rounded-full bg-[#00ff88] mt-1.5" />
                                    {detail}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

            </div>


            {/* --- RIGHT: INFO PANEL (DESKTOP) --- */}
            <div className="hidden md:flex w-80 flex-shrink-0 flex-col items-stretch">
                <div className="bg-[#0a0e17] rounded-xl border border-white/10 p-6 flex flex-col h-full shadow-xl">
                    <div className="mb-6 pb-6 border-b border-white/10">
                        <div className="w-12 h-12 rounded-lg bg-[#00ff88]/10 text-[#00ff88] flex items-center justify-center mb-4">
                            <activeChannelData.icon size={24} />
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-2">{activeChannelData.label}</h2>
                        <div className="flex items-center gap-2 text-xs text-slate-500 uppercase tracking-widest font-semibold">
                            <Info size={12} />
                            Info Panel

                        </div>
                        <button
                            onClick={() => setShowInfoModal(true)}
                            className="cursor-target relative mt-4 w-full py-3 bg-[#00ff88]/20 hover:bg-[#00ff88]/40 border-2 border-[#00ff88] rounded-full text-white text-sm font-black uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2 group shadow-[0_0_20px_rgba(0,255,136,0.4)] hover:shadow-[0_0_40px_rgba(0,255,136,0.6)] animate-pulse"
                        >
                            <Info size={18} className="group-hover:scale-110 transition-transform relative z-10" />
                            <span className="relative z-10">Learn More</span>
                        </button>

                        <button
                            onClick={() => setShowAIPopup(true)}
                            className="cursor-target relative mt-3 w-full py-3 bg-[#0a0e17] hover:bg-[#151a25] border border-[#00ff88]/50 rounded-full text-[#00ff88] text-sm font-bold uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2 group hover:shadow-[0_0_15px_rgba(0,255,136,0.2)]"
                        >
                            <MdSmartToy size={18} className="text-[#00ff88]" />
                            <span className="">Ask AI</span>
                        </button>

                        {activeChannel === 'co2' && (
                            <button
                                onClick={() => setShowCalculator(true)}
                                className="cursor-target relative mt-3 w-full py-4 bg-gradient-to-r from-[#00ff88]/10 to-[#00d9ff]/10 hover:from-[#00ff88]/20 hover:to-[#00d9ff]/20 border border-[#00ff88]/30 hover:border-[#00ff88] rounded-xl text-white font-bold transition-all duration-300 flex items-center justify-center gap-3 group shadow-lg"
                            >
                                <div className="p-2 bg-[#00ff88]/20 rounded-full text-[#00ff88] group-hover:scale-110 transition-transform">
                                    <Leaf size={20} />
                                </div>
                                <div className="text-left">
                                    <div className="text-[10px] uppercase text-[#00ff88] tracking-widest font-black">Interactive</div>
                                    <div className="text-sm leading-none">Simulate Solutions</div>
                                </div>
                            </button>
                        )}
                    </div>


                    {/* Big Number Stat for Temp */}
                    {activeChannel === 'temp' && currentTempAnomaly !== null && (
                        <div className="mb-6 p-4 rounded-xl bg-[#151a25] border border-white/10 text-center shadow-lg">
                            <h4 className="text-xs text-slate-400 uppercase tracking-widest font-semibold mb-2">Current Deviation</h4>
                            <div className={`text-4xl font-black ${currentTempAnomaly >= 0 ? 'text-red-400' : 'text-blue-400'}`}>
                                {currentTempAnomaly > 0 ? '+' : ''}{currentTempAnomaly}°C
                            </div>
                        </div>
                    )}

                    <div className="flex-1 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
                        <p className="text-slate-300 leading-relaxed mb-6">
                            {activeChannelData.description}
                        </p>

                        <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-3">Key Benefits</h3>
                        <ul className="space-y-3">
                            {activeChannelData.details.map((detail, idx) => (
                                <li key={idx} className="flex items-start gap-3 p-3 rounded-lg bg-[#151a25] border border-white/5 text-sm text-slate-300">
                                    <div className="min-w-[6px] h-[6px] rounded-full bg-[#00ff88] mt-1.5" />
                                    {detail}
                                </li>
                            ))}
                        </ul>



                        <div className="mt-6 mb-2">
                            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-3">How Satellites Help</h3>
                            <div className="p-3 rounded-lg bg-[#151a25] border border-white/5 text-sm text-slate-300 italic">
                                "{activeChannelData.satelliteHelp}"
                            </div>
                        </div>

                    </div>

                    <div className="mt-auto pt-8 p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                        <h4 className="flex items-center gap-2 text-blue-400 font-bold text-sm mb-2">
                            <MapIcon size={14} />
                            Did you know?
                        </h4>
                        <p className="text-xs text-blue-200/70 leading-relaxed">
                            {activeChannelData.didYouKnow || "Satellite data provides critical global insights."}
                        </p>
                    </div>
                </div>
            </div>


            <FeatureInfoModal
                isOpen={showInfoModal}
                onClose={() => setShowInfoModal(false)}
                title={modalData.title}
                imageSrc={modalData.image}
                features={modalData.features}
                readMoreLink={modalData.link}
            />

            {/* Guide Modal (No Image) */}
            <FeatureInfoModal
                isOpen={showGuideModal}
                onClose={() => setShowGuideModal(false)}
                title="Space Data Explorer Guide"
                features={[
                    {
                        title: "Interactive Layers",
                        desc: "Use the control panel to switch between different environmental datasets like Vegetation (NDVI), CO2, and Light Pollution.",
                        icon: <Layers className="text-lg" />
                    },
                    {
                        title: "Real-time Analysis",
                        desc: "The map visualizes data from NASA and ESA satellites. Use the Search bar to jump to specific cities or coordinates.",
                        icon: <Activity className="text-lg" />
                    },
                    {
                        title: "Deep Insights",
                        desc: "Each layer comes with detailed scientific context. Click the 'Info Panel' on the right (or bottom on mobile) to learn more about the data.",
                        icon: <Info className="text-lg" />
                    }
                ]}
            />
            {/* Calculator Modal */}
            <CO2CalculatorModal
                isOpen={showCalculator}
                onClose={() => setShowCalculator(false)}
            />
        </div >

    );
};

export default NDVIMap;
