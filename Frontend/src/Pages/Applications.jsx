import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Polygon, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import axios from 'axios';
import { Layers, Cloud, Calendar, AlertTriangle, Loader2, ArrowLeftRight, Activity, Wind, Info, Map as MapIcon, Thermometer } from 'lucide-react';
import CO2Chart from '../components/CO2Chart';
import TempAnomalyChart from '../components/TempAnomalyChart';
import LightPollutionMap from '../components/LightPollutionMap';
import CloudCoverMap from '../components/CloudCoverMap';

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
    }
];

// --- HELPER COMPONENTS ---

// Layer Splitter Component - Creates split view with NDVI effect on left, True Color on right
const SplitLayer = ({ leftTileUrl, rightTileUrl, sliderPosition }) => {
    const map = useMap();
    const [panesReady, setPanesReady] = useState(false);

    useEffect(() => {
        // Create left pane for NDVI visualization (will be clipped to show only left side)
        if (!map.getPane('leftPane')) {
            map.createPane('leftPane');
            map.getPane('leftPane').style.zIndex = 450; // Above overlays
            // Apply NDVI-like false color filter
            // This creates a vegetation index visualization effect:
            // - Enhances green channel (healthy vegetation appears bright green)
            // - Shifts red/brown areas to yellow/orange
            // - Dark areas (water) stay dark
            map.getPane('leftPane').style.filter = 'saturate(2.5) hue-rotate(-30deg) contrast(1.2) brightness(1.1)';
        }
        // Create right pane for True Color (will be clipped to show only right side)
        if (!map.getPane('rightPane')) {
            map.createPane('rightPane');
            map.getPane('rightPane').style.zIndex = 449; // Just below left pane
        }
        setPanesReady(true);
    }, [map]);

    useEffect(() => {
        const leftPane = map.getPane('leftPane');
        const rightPane = map.getPane('rightPane');

        if (leftPane) {
            // Clip left pane to show only left portion (from 0 to sliderPosition%)
            const leftClip = `inset(0 ${100 - sliderPosition}% 0 0)`;
            leftPane.style.clipPath = leftClip;
            leftPane.style.webkitClipPath = leftClip;
        }

        if (rightPane) {
            // Clip right pane to show only right portion (from sliderPosition% to 100%)
            const rightClip = `inset(0 0 0 ${sliderPosition}%)`;
            rightPane.style.clipPath = rightClip;
            rightPane.style.webkitClipPath = rightClip;
        }
    }, [sliderPosition, map, panesReady]);

    // Use the same True Color URL for both, with CSS filter applied to left pane
    // This ensures the visualization works even if NDVI API tiles fail
    const baseUrl = rightTileUrl || leftTileUrl;

    return (
        <>
            {panesReady && baseUrl && (
                <TileLayer
                    url={baseUrl}
                    attribution="Agromonitoring"
                    pane="rightPane"
                />
            )}
            {panesReady && baseUrl && (
                <TileLayer
                    url={baseUrl}
                    attribution="Agromonitoring"
                    pane="leftPane"
                />
            )}
        </>
    );
};

const NDVIMap = () => {
    const [activeChannel, setActiveChannel] = useState('ndvi');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [polygonId, setPolygonId] = useState(null);
    const [imagery, setImagery] = useState(null);
    const [sliderPosition, setSliderPosition] = useState(50);
    const [currentTempAnomaly, setCurrentTempAnomaly] = useState(null);

    const activeChannelData = CHANNELS.find(c => c.id === activeChannel);

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
                if (err.response?.status === 422) {
                    setError("API limit reached or invalid data. Using existing polygon if available.");
                } else {
                    setError("Failed to initialize farm polygon.");
                }
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
                setError("Failed to retrieve satellite imagery.");
            } finally {
                setLoading(false);
            }
        };

        findImagery();
    }, [polygonId, activeChannel]);


    const leafletPolygon = POLYGON_COORDINATES.map(idx => [idx[1], idx[0]]);

    return (
        <div className="flex h-screen w-full bg-[#050714] text-white p-4 gap-4 overflow-hidden font-inter">

            {/* --- LEFT: CONTROL PANEL --- */}
            <div className="w-64 flex-shrink-0 flex flex-col gap-4">
                <div className="bg-[#0a0e17] rounded-xl border border-white/10 p-4 flex flex-col h-full shadow-xl">
                    <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-[#00ff88]">
                        <Activity size={20} />
                        Control Panel
                    </h2>

                    <div className="space-y-3">
                        {CHANNELS.map((channel) => (
                            <button
                                key={channel.id}
                                onClick={() => !channel.disabled && setActiveChannel(channel.id)}
                                disabled={channel.disabled}
                                className={`w-full p-4 rounded-lg border flex items-center gap-3 transition-all duration-300 text-left group relative overflow-hidden
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

                    <div className="mt-auto pt-6 border-t border-white/10">
                        <div className="text-xs text-slate-500 text-center">
                            Select a channel to visualize different satellite data layers.
                        </div>
                    </div>
                </div>
            </div>

            {/* --- CENTER: MAIN MAP AREA --- */}
            <div className="flex-1 flex flex-col gap-4 min-w-0"> {/* min-w-0 ensures flex child shrinks properly */}

                {/* Header Block */}
                <div className="bg-[#0a0e17] rounded-xl border border-white/10 p-6 flex flex-col justify-center items-center text-center shadow-lg relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-r from-[#00ff88]/5 via-transparent to-[#00d9ff]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                    <h1 className="text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400 z-10">
                        Check out how space data helps us.
                    </h1>
                    <p className="text-slate-400 mt-2 z-10">
                        Explore real-time insights derived from satellite imagery.
                    </p>
                </div>

                {/* Map Container Block */}
                <div className="flex-1 bg-[#0a0e17] rounded-xl border border-white/10 relative overflow-hidden shadow-2xl flex flex-col">
                    {activeChannel === 'co2' ? (
                        <CO2Chart />
                    ) : activeChannel === 'temp' ? (
                        <TempAnomalyChart onDataLoaded={setCurrentTempAnomaly} />
                    ) : activeChannel === 'light' ? (
                        <LightPollutionMap />
                    ) : activeChannel === 'weather' ? (
                        <CloudCoverMap />
                    ) : (
                        /* Map Error State */
                        error ? (
                            <div className="flex h-full w-full items-center justify-center text-center p-6">
                                <div className="text-red-400">
                                    <AlertTriangle className="mx-auto mb-2 h-10 w-10" />
                                    <h3 className="text-lg font-bold">Data Unavailable</h3>
                                    <p className="text-sm opacity-80 max-w-xs mx-auto">{error}</p>
                                </div>
                            </div>
                        ) : (
                            <div className="relative w-full h-full">
                                {/* Map Loading State */}
                                {loading && (
                                    <div className="absolute inset-0 z-[1000] bg-[#0a0e17]/80 backdrop-blur-sm flex items-center justify-center">
                                        <div className="flex flex-col items-center gap-3 text-[#00ff88]">
                                            <Loader2 className="animate-spin h-8 w-8" />
                                            <span className="text-sm font-mono tracking-wider">ACQUIRING SATELLITE FEED...</span>
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
                                    <TileLayer
                                        url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                                        attribution='&copy; Esri'
                                    />

                                    <Polygon
                                        positions={leafletPolygon}
                                        pathOptions={{
                                            color: '#00ff88',
                                            fillOpacity: 0,
                                            weight: 2,
                                            dashArray: '5, 5'
                                        }}
                                    />

                                    {imagery && !loading && activeChannel === 'ndvi' && (
                                        <SplitLayer
                                            leftTileUrl={imagery.ndvi}
                                            rightTileUrl={imagery.trueColor}
                                            sliderPosition={sliderPosition}
                                        />
                                    )}
                                </MapContainer>

                                {/* Slider UI Overlay */}
                                {!loading && imagery && activeChannel === 'ndvi' && (
                                    <div className="absolute top-0 bottom-0 z-[999] pointer-events-none w-full h-full left-0">
                                        <div
                                            className="absolute top-0 bottom-0 pointer-events-none"
                                            style={{ left: `${sliderPosition}%` }}
                                        >
                                            {/* The Vertical Line - Neon Green Glow */}
                                            <div className="h-full w-1 bg-[#00ff88] shadow-[0_0_20px_#00ff88] relative z-20"></div>

                                            {/* The Handle - glowing circular handle */}
                                            <div
                                                className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-black/80 border-2 border-[#00ff88] rounded-full flex items-center justify-center text-[#00ff88] cursor-ew-resize pointer-events-auto shadow-[0_0_15px_#00ff88] z-30 hover:scale-110 transition-transform active:scale-95"
                                                onMouseDown={(e) => {
                                                    e.preventDefault();
                                                    const container = e.target.closest('.relative');
                                                    const handleMouseMove = (moveEvent) => {
                                                        const rect = container.getBoundingClientRect();
                                                        const x = moveEvent.clientX - rect.left;
                                                        const newPercent = Math.max(0, Math.min(100, (x / rect.width) * 100));
                                                        setSliderPosition(newPercent);
                                                    };
                                                    const handleMouseUp = () => {
                                                        window.removeEventListener('mousemove', handleMouseMove);
                                                        window.removeEventListener('mouseup', handleMouseUp);
                                                    };
                                                    window.addEventListener('mousemove', handleMouseMove);
                                                    window.addEventListener('mouseup', handleMouseUp);
                                                }}
                                            >
                                                <ArrowLeftRight size={20} className="drop-shadow-[0_0_5px_#00ff88]" />
                                            </div>
                                        </div>

                                        {/* Labels - High-tech style */}
                                        <div className="absolute top-4 right-4 bg-black/80 text-white text-xs font-bold px-4 py-2 rounded-md border border-white/20 pointer-events-auto backdrop-blur-md shadow-lg tracking-wider">
                                            True Color (RGB)
                                        </div>
                                        <div className="absolute top-4 left-4 bg-black/80 text-[#00ff88] text-xs font-bold px-4 py-2 rounded-md border border-[#00ff88]/50 pointer-events-auto backdrop-blur-md shadow-[0_0_10px_rgba(0,255,136,0.2)] tracking-wider">
                                            Vegetation Index (NDVI)
                                        </div>
                                    </div>
                                )}

                                {/* Stats Overlay on Map */}
                                {!loading && imagery && activeChannel === 'ndvi' && (
                                    <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end pointer-events-none">
                                        <div className="bg-black/80 backdrop-blur-md p-3 rounded-lg border border-white/10 text-xs text-slate-300 pointer-events-auto flex items-center gap-4">
                                            <div className="flex items-center gap-2">
                                                <Calendar size={14} className="text-[#00ff88]" />
                                                <span>{imagery.stats.date}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Cloud size={14} className="text-[#00ff88]" />
                                                <span>{imagery.stats.clouds.toFixed(1)}% Cloud Cover</span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )
                    )}
                </div>
            </div>


            {/* --- RIGHT: INFO PANEL --- */}
            <div className="w-80 flex-shrink-0 flex flex-col items-stretch">
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
        </div >

    );
};

export default NDVIMap;
