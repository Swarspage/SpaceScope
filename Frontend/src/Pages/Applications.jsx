/**
 * Applications.jsx
 * SpaceScope Applications & Analysis Page
 * * README:
 * 1. Dependencies: Ensure `react-leaflet`, `leaflet`, `lucide-react` are installed.
 * npm install react-leaflet leaflet lucide-react
 * 2. Assets: 
 * - Place tile images in: /public/tiles/{area_id}/ndvi-{year}.png
 * - Place thumbnails in: /public/thumbs/
 * 3. Data:
 * - Ensure `src/data/applications.json` exists with the schema described.
 * - If missing, the component uses the internal FALLBACK_DATA.
 * 4. Design System: Uses Tailwind CSS with custom hex codes matching SpaceScope tokens.
 */

import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { MapContainer, TileLayer, ImageOverlay, useMap, useMapEvents, Pane, Polygon, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import {
    Layers, Calendar, ChevronRight, ChevronLeft, AlertTriangle,
    Satellite, Info, Download, Play, Pause, Map as MapIcon,
    Search, X, ExternalLink, Globe, Crosshair, TrendingUp, Save,
    ArrowLeftRight, Cloud, Thermometer
} from 'lucide-react';

// Import Leaflet CSS (required for map to render)
import 'leaflet/dist/leaflet.css';

// --- THEME TOKENS & UTILS ---
const COLORS = {
    primary: '#00d9ff',
    accent: '#00ff88',
    bgDark: '#050714',
    bgPanel: '#0a0e17',
    textHead: '#ffffff',
    textBody: '#94a3b8',
    statusErr: '#ff3366',
    statusWarn: '#ffaa00',
    statusOk: '#00ff88'
};

const STYLES = {
    glass: "backdrop-blur-xl bg-[#0a0e17]/80 border border-white/10 shadow-xl",
    card: "rounded-xl p-4 md:p-6 transition-all duration-200",
    btnPrimary: "bg-[#00d9ff] text-black hover:bg-[#00b8d4] font-bold rounded-lg px-4 py-2 transition-all shadow-[0_0_15px_rgba(0,217,255,0.3)]",
    btnSecondary: "bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-lg px-4 py-2 transition-all",
    btnIcon: "p-2 rounded-lg hover:bg-white/10 text-[#94a3b8] hover:text-white transition-colors",
    input: "bg-[#0f1322] border border-white/10 rounded-lg px-3 py-2 text-white focus:border-[#00d9ff] outline-none transition-all w-full"
};

// --- DATA CONTRACT FALLBACK ---
const FALLBACK_DATA = {
    generated_at: new Date().toISOString(),
    vitals: {
        global_avg_temp_delta: "+1.2°C",
        co2_ppm: 421,
        arctic_ice_pct_change_per_decade: -12.6,
        sea_level_mm_per_year: 3.4
    },
    time_series: {
        "area_1": {
            id: "area_1",
            name: "Amazon Rainforest Sector 7",
            bbox: [[-9.5, -65.5], [-9.0, -65.0]],
            years: [2018, 2019, 2020, 2021, 2022, 2023, 2024],
            assets: {
                "2024": { ndvi: "https://placehold.co/600x400/003300/FFFFFF/png?text=NDVI+2024", nc: "https://placehold.co/600x400/224422/FFFFFF/png?text=Natural+2024" },
                "2023": { ndvi: "https://placehold.co/600x400/003300/FFFFFF/png?text=NDVI+2023", nc: "https://placehold.co/600x400/224422/FFFFFF/png?text=Natural+2023" },
                // ... fill other years in real app
            }
        }
    },
    events: [
        { id: "evt_1", type: "fire", title: "Amazon Wildfire Detection", date: "2024-02-15", severity: "high", bbox: [[-9.2, -65.3], [-9.1, -65.2]], description: "Thermal anomaly detected with 95% confidence.", preview: "/thumbs/fire.jpg" },
        { id: "evt_2", type: "flood", title: "Indus River Overflow", date: "2024-01-20", severity: "medium", bbox: [[25.0, 68.0], [25.5, 68.5]], description: "Water extent increased by 20% vs baseline.", preview: "/thumbs/flood.jpg" }
    ],
    satellites: [
        { id: "sat_1", name: "Sentinel-2A", agency: "ESA", launch: 2015, mission: "Land Monitoring", status: "Active" },
        { id: "sat_2", name: "Landsat 8", agency: "NASA", launch: 2013, mission: "Earth Observation", status: "Active" }
    ],
    scenes: [
        { id: "scn_1", satellite: "sat_1", date: "2024-02-14", bbox: [[-9.5, -65.5], [-9.0, -65.0]], cloud_cover: 12, processing_level: "L2A", sources: { thumbnail: "https://placehold.co/300x200" }, bands: ["B2", "B3", "B4", "B8"], notes: "Clear view of deforestation vector." }
    ],
    stories: [
        { id: "story_1", title: "Recovering the Rainforest", location: "Brazil", area_id: "area_1", year: 2024, excerpt: "How data helped reclaim 10,000 hectares.", metrics: "1M trees planted", image: "https://placehold.co/400x300/112211/FFF" },
        { id: "story_2", title: "Urban Heat Islands", location: "Tokyo", area_id: "area_2", year: 2023, excerpt: "Mapping temperature spikes in megacities.", metrics: "2°C cooling target", image: "https://placehold.co/400x300/331111/FFF" }
    ],
    catalog: { sample_queries: "curl -X GET https://api.spacescope.io/v1/scenes?bbox=..." }
};

// --- HELPER FUNCTIONS ---
const getDistanceKm = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radius of earth in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return (R * c).toFixed(1);
};

// --- SUBCOMPONENTS ---

/**
 * 2. MapSplit (NDVI Comparison)
 * Handles the logic for the split screen slider using a custom Pane and clip-path.
 */
const SplitMapLayer = ({ leftImage, rightImage, bounds, splitPercent }) => {
    const map = useMap();

    // Create a custom pane for the top layer (Left/NDVI) to control clipping
    useEffect(() => {
        if (!map.getPane('leftPane')) {
            const pane = map.createPane('leftPane');
            pane.style.zIndex = 450; // Above standard overlay pane
        }
    }, [map]);

    // Update clip-path dynamically
    useEffect(() => {
        const pane = map.getPane('leftPane');
        if (pane) {
            // Show only the left 'splitPercent' of the top layer
            pane.style.clipPath = `inset(0 ${100 - splitPercent}% 0 0)`;
        }
    }, [splitPercent, map]);

    if (!bounds || !leftImage || !rightImage) return null;

    return (
        <>
            {/* Bottom Layer (Natural Color) - Standard Overlay Pane */}
            <ImageOverlay url={rightImage} bounds={bounds} opacity={1} />

            {/* Top Layer (NDVI) - Custom Pane with Clip Path */}
            <Pane name="leftPane">
                <ImageOverlay url={leftImage} bounds={bounds} opacity={1} />
            </Pane>
        </>
    );
};

// Controls the map view when external components request a flyTo
const MapController = ({ viewTarget }) => {
    const map = useMap();
    useEffect(() => {
        if (viewTarget) {
            if (viewTarget.bbox) {
                map.flyToBounds(viewTarget.bbox, { padding: [50, 50], duration: 1.5 });
            } else if (viewTarget.center) {
                map.flyTo(viewTarget.center, viewTarget.zoom || 12, { duration: 1.5 });
            }
        }
    }, [viewTarget, map]);
    return null;
};

// --- MAIN COMPONENT ---

export default function Applications() {
    // State: Data
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // State: Map & Selection
    const [mapCenter, setMapCenter] = useState([20, 0]); // Global default
    const [splitPercent, setSplitPercent] = useState(50);
    const [activeAreaId, setActiveAreaId] = useState("area_1");
    const [activeYear, setActiveYear] = useState(2024);
    const [viewTarget, setViewTarget] = useState(null); // { bbox: [[],[]] } or { center: [], zoom: 8 }
    const [activeLayer, setActiveLayer] = useState("ndvi"); // 'ndvi', 'thermal', etc.

    // State: UI Panels
    const [activeEvent, setActiveEvent] = useState(null);
    const [inspectScene, setInspectScene] = useState(null);
    const [showFleetModal, setShowFleetModal] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [activeSatellite, setActiveSatellite] = useState(null);

    // State: User Profile (LocalStorage)
    const [savedLocations, setSavedLocations] = useState([]);
    const [toasts, setToasts] = useState([]);

    // Refs
    const playIntervalRef = useRef(null);

    // --- INITIALIZATION ---

    useEffect(() => {
        // 1. Load Data (Simulated Fetch)
        // TODO: Swap this logic for a real fetch('/data/applications.json') in production
        const loadData = async () => {
            try {
                // Simulating async delay
                await new Promise(r => setTimeout(r, 600));

                // In a real app: const res = await fetch('/data/applications.json'); const json = await res.json();
                // Here we use fallback for demo robustness
                setData(FALLBACK_DATA);

                // Load user profile
                const saved = localStorage.getItem('spacescope_saved_locations');
                if (saved) setSavedLocations(JSON.parse(saved));

                // Locate user (Best effort)
                navigator.geolocation.getCurrentPosition(
                    (pos) => setViewTarget({ center: [pos.coords.latitude, pos.coords.longitude], zoom: 6 }),
                    (err) => console.log("Geolocation denied, using global view")
                );
            } catch (err) {
                setError("Failed to load application manifest.");
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    // --- HANDLERS ---

    // Toast System
    const addToast = (msg, type = 'info') => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, msg, type }]);
        setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000);
    };

    // Time Scrubber Animation
    useEffect(() => {
        if (isPlaying && data?.time_series?.[activeAreaId]) {
            const years = data.time_series[activeAreaId].years;
            playIntervalRef.current = setInterval(() => {
                setActiveYear(prev => {
                    const idx = years.indexOf(prev);
                    const nextIdx = (idx + 1) % years.length;
                    return years[nextIdx];
                });
            }, 1500); // Change year every 1.5s
        } else {
            clearInterval(playIntervalRef.current);
        }
        return () => clearInterval(playIntervalRef.current);
    }, [isPlaying, activeAreaId, data]);

    // Save Location
    const handleSaveLocation = () => {
        const name = prompt("Name this location:");
        if (name) {
            const newLoc = { id: Date.now(), name, center: mapCenter, zoom: 10 }; // Simplified center logic
            const updated = [...savedLocations, newLoc];
            setSavedLocations(updated);
            localStorage.setItem('spacescope_saved_locations', JSON.stringify(updated));
            addToast(`Location "${name}" saved!`, 'success');
        }
    };

    // --- RENDER HELPERS ---

    if (loading) return <div className="min-h-screen bg-[#050714] text-white flex items-center justify-center animate-pulse">Initializing SpaceScope Systems...</div>;
    if (error || !data) return (
        <div className="min-h-screen bg-[#050714] flex items-center justify-center p-4">
            <div className={`${STYLES.glass} ${STYLES.card} max-w-md text-center border-[#ff3366]`}>
                <AlertTriangle className="mx-auto text-[#ff3366] mb-4" size={48} />
                <h2 className="text-xl font-bold text-white mb-2">System Error</h2>
                <p className="text-[#94a3b8] mb-4">{error || "Data manifest invalid."}</p>
                <div className="text-xs font-mono bg-black/50 p-2 rounded text-left">
                    Check src/data/applications.json structure.
                </div>
            </div>
        </div>
    );

    const activeSeries = data.time_series[activeAreaId];
    const activeAssets = activeSeries?.assets[activeYear];

    return (
        <div className="bg-[#050714] text-[#94a3b8] font-sans min-h-screen relative overflow-x-hidden selection:bg-[#00d9ff] selection:text-black">

            {/* MAIN LAYOUT GRID */}
            <div className="grid grid-cols-1 lg:grid-cols-12 min-h-screen">

                {/* LEFT PANEL: Controls & Dashboard (3 cols) */}
                <div className="lg:col-span-3 bg-[#0a0e17] border-r border-white/5 flex flex-col h-screen overflow-y-auto custom-scrollbar">

                    {/* 1. Hero Snapshot */}
                    <div className="p-6 border-b border-white/5 bg-[#0f1322]">
                        <h1 className="font-display font-bold text-2xl text-white mb-1">Live Applications</h1>
                        <p className="text-xs text-[#b8c5d6] mb-4">
                            Analyzing {data.scenes.length} active scenes • Updated {new Date(data.generated_at).toLocaleTimeString()}
                        </p>
                        <button
                            onClick={() => document.getElementById('map-view').scrollIntoView({ behavior: 'smooth' })}
                            className={`w-full ${STYLES.btnPrimary} flex justify-center items-center gap-2`}
                        >
                            <MapIcon size={16} /> Open Live Map
                        </button>
                    </div>

                    {/* 4. Layer Selector & Legend */}
                    <div className="p-6 border-b border-white/5 space-y-6">
                        <div>
                            <h3 className="text-white font-bold text-sm uppercase tracking-wider mb-3 flex items-center gap-2">
                                <Layers size={14} className="text-[#00d9ff]" /> Data Layers
                            </h3>
                            <div className="grid grid-cols-2 gap-2">
                                {['NDVI', 'Natural', 'Thermal', 'Moisture'].map(layer => (
                                    <button
                                        key={layer}
                                        onClick={() => setActiveLayer(layer.toLowerCase())}
                                        className={`text-xs p-2 rounded border transition-all ${activeLayer === layer.toLowerCase()
                                            ? 'bg-[#00d9ff]/10 border-[#00d9ff] text-white'
                                            : 'bg-transparent border-white/10 hover:border-white/30'
                                            }`}
                                    >
                                        {layer}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* NDVI Legend */}
                        {activeLayer === 'ndvi' && (
                            <div className="bg-[#0f1322] p-3 rounded-lg border border-white/5">
                                <div className="flex justify-between text-xs mb-2">
                                    <span className="text-[#ff3366]">Barren</span>
                                    <span className="text-[#ffaa00]">Mod.</span>
                                    <span className="text-[#00ff88]">Dense</span>
                                </div>
                                <div className="h-2 w-full rounded-full bg-gradient-to-r from-[#ff3366] via-[#ffaa00] to-[#00ff88] mb-1"></div>
                                <div className="flex justify-between text-[10px] font-mono opacity-70">
                                    <span>-1.0</span>
                                    <span>0.0</span>
                                    <span>1.0</span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* 8. Climate Dashboard */}
                    <div className="p-6 border-b border-white/5">
                        <h3 className="text-white font-bold text-sm uppercase tracking-wider mb-4 flex items-center gap-2">
                            <TrendingUp size={14} className="text-[#00ff88]" /> Planetary Vitals
                        </h3>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="bg-[#0f1322] p-3 rounded-lg border border-white/5">
                                <div className="text-[10px] uppercase text-[#64748b] mb-1">Avg Temp Δ</div>
                                <div className="text-lg font-mono text-[#ff3366]">{data.vitals.global_avg_temp_delta}</div>
                            </div>
                            <div className="bg-[#0f1322] p-3 rounded-lg border border-white/5">
                                <div className="text-[10px] uppercase text-[#64748b] mb-1">CO2 (ppm)</div>
                                <div className="text-lg font-mono text-[#ffaa00]">{data.vitals.co2_ppm}</div>
                            </div>
                            <div className="bg-[#0f1322] p-3 rounded-lg border border-white/5">
                                <div className="text-[10px] uppercase text-[#64748b] mb-1">Arctic Ice</div>
                                <div className="text-lg font-mono text-[#00d9ff]">{data.vitals.arctic_ice_pct_change_per_decade}%</div>
                            </div>
                            <div className="bg-[#0f1322] p-3 rounded-lg border border-white/5">
                                <div className="text-[10px] uppercase text-[#64748b] mb-1">Sea Level</div>
                                <div className="text-lg font-mono text-[#00d9ff]">+{data.vitals.sea_level_mm_per_year}mm</div>
                            </div>
                        </div>
                    </div>

                    {/* 11. Saved Locations (Profile) */}
                    <div className="p-6 flex-grow">
                        <h3 className="text-white font-bold text-sm uppercase tracking-wider mb-3 flex items-center gap-2">
                            <Save size={14} className="text-[#b8c5d6]" /> Saved Views
                        </h3>
                        {savedLocations.length === 0 ? (
                            <p className="text-xs text-[#64748b] italic">No saved locations yet.</p>
                        ) : (
                            <ul className="space-y-2">
                                {savedLocations.map(loc => (
                                    <li key={loc.id} className="flex justify-between items-center bg-[#0f1322] p-2 rounded text-xs border border-white/5 hover:border-[#00d9ff] cursor-pointer group"
                                        onClick={() => setViewTarget({ center: loc.center, zoom: loc.zoom })}>
                                        <span>{loc.name}</span>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                const upd = savedLocations.filter(l => l.id !== loc.id);
                                                setSavedLocations(upd);
                                                localStorage.setItem('spacescope_saved_locations', JSON.stringify(upd));
                                            }}
                                            className="opacity-0 group-hover:opacity-100 text-[#ff3366]"><X size={12} /></button>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>

                {/* CENTER PANEL: Map & Scrubber (6 cols) */}
                <div className="lg:col-span-6 relative bg-[#050714] h-[50vh] lg:h-screen flex flex-col" id="map-view">
                    {/* Map Container */}
                    <MapContainer
                        center={mapCenter}
                        zoom={4}
                        className="flex-grow w-full z-0 bg-[#050714]"
                        zoomControl={false}
                    >
                        <MapController viewTarget={viewTarget} />

                        {/* Basemap */}
                        <TileLayer
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            attribution='&copy; OpenStreetMap'
                            className="filter grayscale contrast-125 brightness-75 invert"
                        />

                        {/* 2. MapSplit Implementation */}
                        {activeAssets ? (
                            <SplitMapLayer
                                leftImage={activeAssets.ndvi || activeAssets.nc} // Logic: Left is NDVI (or fallback)
                                rightImage={activeAssets.nc} // Logic: Right is Natural Color
                                bounds={activeSeries.bbox}
                                splitPercent={splitPercent}
                            />
                        ) : null}

                        {/* Event Markers */}
                        {data.events.map(evt => {
                            const center = [(evt.bbox[0][0] + evt.bbox[1][0]) / 2, (evt.bbox[0][1] + evt.bbox[1][1]) / 2];
                            return (
                                <React.Fragment key={evt.id}>
                                    <Marker
                                        position={center}
                                        icon={L.divIcon({
                                            className: 'bg-transparent',
                                            html: `<div class="w-4 h-4 rounded-full bg-[#ff3366] border-2 border-white shadow-[0_0_15px_#ff3366] animate-pulse"></div>`
                                        })}
                                        eventHandlers={{
                                            click: () => { setActiveEvent(evt); setViewTarget({ bbox: evt.bbox }); }
                                        }}
                                    />
                                    {activeEvent?.id === evt.id && (
                                        <Polygon positions={[
                                            [evt.bbox[0][0], evt.bbox[0][1]], // minLat, minLng
                                            [evt.bbox[0][0], evt.bbox[1][1]], // minLat, maxLng
                                            [evt.bbox[1][0], evt.bbox[1][1]], // maxLat, maxLng
                                            [evt.bbox[1][0], evt.bbox[0][1]]  // maxLat, minLng
                                        ]} pathOptions={{ color: '#ff3366', fillOpacity: 0.1, dashArray: '5, 5' }} />
                                    )}
                                </React.Fragment>
                            );
                        })}
                    </MapContainer>

                    {/* Divider Handle (Overlay on top of Map) */}
                    {activeAssets && (
                        <div
                            className="absolute top-0 bottom-0 pointer-events-none z-[400]"
                            style={{ left: `${splitPercent}%` }}
                        >
                            <div className="h-full w-0.5 bg-[#00ff88] shadow-[0_0_10px_#00ff88]"></div>
                            <div
                                className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 pointer-events-auto cursor-col-resize w-8 h-12 bg-black/80 border border-[#00ff88] rounded-lg flex items-center justify-center text-[#00ff88]"
                                onMouseDown={(e) => {
                                    const handleMove = (ev) => {
                                        const rect = e.target.parentElement.parentElement.parentElement.getBoundingClientRect();
                                        const x = ev.clientX - rect.left;
                                        const percent = Math.min(100, Math.max(0, (x / rect.width) * 100));
                                        setSplitPercent(percent);
                                    };
                                    const handleUp = () => {
                                        window.removeEventListener('mousemove', handleMove);
                                        window.removeEventListener('mouseup', handleUp);
                                    };
                                    window.addEventListener('mousemove', handleMove);
                                    window.addEventListener('mouseup', handleUp);
                                }}
                                tabIndex={0}
                                onKeyDown={(e) => {
                                    if (e.key === 'ArrowLeft') setSplitPercent(Math.max(0, splitPercent - 2));
                                    if (e.key === 'ArrowRight') setSplitPercent(Math.min(100, splitPercent + 2));
                                }}
                                aria-label="Comparison Divider"
                            >
                                <ArrowLeftRight size={16} />
                            </div>
                            {/* Overlay Labels */}
                            <div className="absolute top-4 right-4 bg-black/60 text-white text-xs px-2 py-1 rounded">Natural Color</div>
                            <div className="absolute top-4 left-[-80px] bg-black/60 text-[#00ff88] text-xs px-2 py-1 rounded">NDVI Analysis</div>
                        </div>
                    )}

                    {/* 3. TimeScrubber (Bottom Overlay) */}
                    {activeSeries && (
                        <div className="absolute bottom-6 left-6 right-6 z-[500] flex justify-center">
                            <div className={`${STYLES.glass} rounded-2xl p-4 w-full max-w-2xl`}>
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={() => setIsPlaying(!isPlaying)}
                                            className="w-8 h-8 rounded-full bg-[#00d9ff] text-black flex items-center justify-center hover:scale-110 transition-transform"
                                        >
                                            {isPlaying ? <Pause size={14} /> : <Play size={14} className="ml-0.5" />}
                                        </button>
                                        <span className="text-white font-mono font-bold">{activeYear}</span>
                                    </div>
                                    <span className="text-xs uppercase tracking-widest">{activeSeries.name}</span>
                                </div>
                                {/* Scrubber Track */}
                                <div className="relative h-8 flex items-center select-none">
                                    <div className="absolute top-1/2 left-0 right-0 h-1 bg-white/10 rounded"></div>
                                    <div className="w-full flex justify-between z-10 px-1">
                                        {activeSeries.years.map(year => (
                                            <button
                                                key={year}
                                                onClick={() => setActiveYear(year)}
                                                className={`relative group flex flex-col items-center focus:outline-none`}
                                            >
                                                <div className={`w-3 h-3 rounded-full border-2 transition-all ${year === activeYear ? 'bg-[#00d9ff] border-[#00d9ff] scale-125' : 'bg-[#0a0e17] border-white/30 group-hover:border-white'}`}></div>
                                                <span className={`text-[10px] mt-1 font-mono transition-colors ${year === activeYear ? 'text-[#00d9ff]' : 'text-[#64748b]'}`}>{year}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Mobile Expand Hint */}
                    <div className="lg:hidden absolute top-4 right-4 z-[400]">
                        <button onClick={() => alert("Mobile: Scroll down for details")} className={STYLES.btnIcon}>
                            <Info />
                        </button>
                    </div>
                </div>

                {/* RIGHT PANEL: Feed & Details (3 cols) */}
                <div className="lg:col-span-3 bg-[#0a0e17] border-l border-white/5 h-auto lg:h-screen overflow-y-auto custom-scrollbar">

                    {/* 7. Scene Inspector (Contextual) */}
                    {(inspectScene || (activeAssets && !activeEvent)) && (
                        <div className="p-6 border-b border-white/5 bg-[#0f1322]">
                            <div className="flex justify-between items-start mb-4">
                                <h3 className="text-white font-bold flex items-center gap-2">
                                    <Satellite size={16} className="text-[#00d9ff]" /> Inspector
                                </h3>
                                <button onClick={() => setInspectScene(null)} className="text-[#64748b] hover:text-white"><X size={16} /></button>
                            </div>

                            {/* Metadata Content */}
                            <div className="space-y-3 text-sm">
                                <div className="aspect-video bg-black rounded-lg overflow-hidden relative group">
                                    <img
                                        src={inspectScene?.sources.thumbnail || activeAssets?.ndvi || "https://placehold.co/300x200"}
                                        alt="Preview"
                                        className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                                    />
                                    <div className="absolute bottom-2 right-2 bg-black/60 text-white text-[10px] px-2 rounded">
                                        {activeYear}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-2 text-xs">
                                    <div className="p-2 bg-white/5 rounded">
                                        <span className="block text-[#64748b] mb-1">Processing</span>
                                        <span className="text-white font-mono">L2A Correction</span>
                                    </div>
                                    <div className="p-2 bg-white/5 rounded">
                                        <span className="block text-[#64748b] mb-1">Cloud Cover</span>
                                        <span className="text-[#00ff88] font-mono flex items-center gap-1"><Cloud size={10} /> 12%</span>
                                    </div>
                                </div>

                                <div className="pt-2 flex gap-2">
                                    <button className={`flex-1 ${STYLES.btnSecondary} text-xs flex justify-center gap-2 items-center`}>
                                        <Download size={12} /> Asset
                                    </button>
                                    <button onClick={handleSaveLocation} className={`flex-1 ${STYLES.btnSecondary} text-xs flex justify-center gap-2 items-center`}>
                                        <Save size={12} /> View
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* 5. Event Feed */}
                    <div className="p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-white font-bold text-sm uppercase tracking-wider flex items-center gap-2">
                                <AlertTriangle size={14} className="text-[#ffaa00]" /> Active Alerts
                            </h3>
                            <span className="text-xs bg-white/10 px-2 py-0.5 rounded text-[#94a3b8]">{data.events.length}</span>
                        </div>

                        <div className="space-y-3">
                            {data.events.map(evt => {
                                const dist = getDistanceKm(mapCenter[0], mapCenter[1], evt.bbox[0][0], evt.bbox[0][1]);
                                return (
                                    <div
                                        key={evt.id}
                                        onClick={() => { setActiveEvent(evt); setViewTarget({ bbox: evt.bbox }); }}
                                        className={`p-3 rounded-lg border cursor-pointer transition-all ${activeEvent?.id === evt.id
                                            ? 'bg-[#00d9ff]/10 border-[#00d9ff]'
                                            : 'bg-white/5 border-transparent hover:border-white/20'
                                            }`}
                                    >
                                        <div className="flex justify-between items-start mb-1">
                                            <span className={`text-[10px] font-bold uppercase tracking-wider px-1.5 rounded ${evt.severity === 'high' ? 'bg-[#ff3366]/20 text-[#ff3366]' : 'bg-[#ffaa00]/20 text-[#ffaa00]'
                                                }`}>{evt.type}</span>
                                            <span className="text-[10px] text-[#64748b]">{dist} km away</span>
                                        </div>
                                        <h4 className="text-white font-bold text-sm mb-1">{evt.title}</h4>
                                        <p className="text-xs text-[#94a3b8] line-clamp-2">{evt.description}</p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* 6. Fleet / Catalog Panel (Compact) */}
                    <div className="p-6 border-t border-white/5">
                        <h3 className="text-white font-bold text-sm uppercase tracking-wider mb-3">Satellite Fleet</h3>
                        <div className="space-y-2">
                            {data.satellites.map(sat => (
                                <div key={sat.id} className="flex items-center justify-between text-xs p-2 rounded hover:bg-white/5 group">
                                    <div>
                                        <span className="text-white font-bold block">{sat.name}</span>
                                        <span className="text-[#64748b]">{sat.agency} • {sat.launch}</span>
                                    </div>
                                    <button
                                        onClick={() => { setActiveSatellite(sat); setShowFleetModal(true); }}
                                        className="opacity-0 group-hover:opacity-100 text-[#00d9ff] hover:underline"
                                    >
                                        Scenes
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>
            </div>

            {/* 9. Stories Section (Below Fold content if strictly single page, but can be integrated as modal or bottom section) */}
            <section className="bg-[#050714] border-t border-white/5 py-12 px-6 lg:px-12">
                <h2 className="font-display text-2xl text-white mb-8">Stories from Earth</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {data.stories.map(story => (
                        <div key={story.id} className={`${STYLES.card} bg-[#0a0e17] border border-white/5 hover:border-[#00d9ff]/50 group`}>
                            <div className="h-40 mb-4 overflow-hidden rounded-lg">
                                <img src={story.image} alt={story.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                            </div>
                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    <h3 className="text-white font-bold text-lg">{story.title}</h3>
                                    <p className="text-[#00d9ff] text-xs">{story.location}</p>
                                </div>
                            </div>
                            <p className="text-[#94a3b8] text-sm mb-4">{story.excerpt}</p>
                            <div className="flex items-center justify-between pt-4 border-t border-white/5">
                                <span className="text-[#00ff88] text-xs font-mono">{story.metrics}</span>
                                <button
                                    onClick={() => {
                                        setActiveAreaId(story.area_id);
                                        setActiveYear(story.year);
                                        // Find bounds for area logic would go here
                                        document.getElementById('map-view').scrollIntoView({ behavior: 'smooth' });
                                    }}
                                    className="text-white text-xs hover:text-[#00d9ff] flex items-center gap-1"
                                >
                                    See on Map <ChevronRight size={12} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* 10. Data Access & Learning */}
            <section className="bg-[#0a0e17] border-t border-white/5 py-12 px-6 lg:px-12 grid md:grid-cols-2 gap-12">
                <div>
                    <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
                        <Download size={18} className="text-[#00d9ff]" /> Developer Access
                    </h3>
                    <p className="text-[#94a3b8] text-sm mb-4">Access raw GeoTIFFs and metadata via our REST API.</p>
                    <div className="bg-[#050714] p-4 rounded-lg border border-white/10 font-mono text-xs text-[#b8c5d6] relative group">
                        {data.catalog.sample_queries}
                        <button
                            onClick={() => { navigator.clipboard.writeText(data.catalog.sample_queries); addToast("Copied!", "success"); }}
                            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 bg-white/10 p-1 rounded hover:bg-white/20 text-white"
                        >
                            Copy
                        </button>
                    </div>
                </div>
                <div>
                    <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
                        <Info size={18} className="text-[#00ff88]" /> Learning Hub
                    </h3>
                    <div className="space-y-3">
                        <div className="flex items-start gap-3">
                            <div className="bg-[#00ff88]/10 p-2 rounded text-[#00ff88]"><Globe size={16} /></div>
                            <div>
                                <h4 className="text-white font-bold text-sm">Understanding NDVI</h4>
                                <p className="text-[#94a3b8] text-xs">How Normalized Difference Vegetation Index measures plant health from space.</p>
                                <button className="text-[#00d9ff] text-xs hover:underline mt-1">Read Primer</button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 12. Utilities: Toast Container */}
            <div className="fixed bottom-6 right-6 z-[2000] space-y-2 pointer-events-none">
                {toasts.map(t => (
                    <div key={t.id} className={`pointer-events-auto px-4 py-3 rounded-lg shadow-lg text-sm font-bold animate-slide-up flex items-center gap-2 ${t.type === 'success' ? 'bg-[#00ff88] text-black' : 'bg-[#00d9ff] text-black'
                        }`}>
                        {t.type === 'success' ? <Save size={14} /> : <Info size={14} />}
                        {t.msg}
                    </div>
                ))}
            </div>

            {/* MODAL: Satellite Scenes */}
            {showFleetModal && activeSatellite && (
                <div className="fixed inset-0 z-[1000] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className={`${STYLES.glass} rounded-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col`}>
                        <div className="p-6 border-b border-white/10 flex justify-between items-center">
                            <div>
                                <h2 className="text-xl font-bold text-white">{activeSatellite.name} Archive</h2>
                                <p className="text-sm text-[#94a3b8]">{activeSatellite.mission} • {activeSatellite.status}</p>
                            </div>
                            <button onClick={() => setShowFleetModal(false)} className={STYLES.btnIcon}><X size={20} /></button>
                        </div>
                        <div className="p-6 overflow-y-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="text-[#64748b] border-b border-white/10">
                                    <tr>
                                        <th className="pb-2">Date</th>
                                        <th className="pb-2">Cloud Cover</th>
                                        <th className="pb-2">Bands</th>
                                        <th className="pb-2 text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {data.scenes.filter(s => s.satellite === activeSatellite.id).map(scene => (
                                        <tr key={scene.id} className="hover:bg-white/5">
                                            <td className="py-3 text-white font-mono">{scene.date}</td>
                                            <td className="py-3 text-[#b8c5d6]">{scene.cloud_cover}%</td>
                                            <td className="py-3 text-[#64748b]">{scene.bands.join(', ')}</td>
                                            <td className="py-3 text-right">
                                                <button
                                                    onClick={() => { setInspectScene(scene); setShowFleetModal(false); }}
                                                    className="text-[#00d9ff] hover:underline"
                                                >
                                                    Inspect
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {data.scenes.filter(s => s.satellite === activeSatellite.id).length === 0 && (
                                <div className="text-center py-8 text-[#64748b] italic">No public scenes available for this demo.</div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #0a0e17; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #2e364f; border-radius: 3px; }
        @keyframes slide-up { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        .animate-slide-up { animation: slide-up 0.3s ease-out forwards; }
        /* Map dark mode override */
        .leaflet-container { background: #050714; }
        .leaflet-tile { filter: brightness(0.7) contrast(1.2) grayscale(0.8) invert(1) hue-rotate(180deg); }
      `}</style>
        </div>
    );
}