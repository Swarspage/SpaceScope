import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Polygon, useMap, ImageOverlay } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import axios from 'axios';
import { Layers, Cloud, Calendar, AlertTriangle, Loader2, ArrowLeftRight } from 'lucide-react';

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

// --- HELPER COMPONENTS ---

// Layer Splitter Component (Custom implementation without external plugins)
const SplitLayer = ({ leftTileUrl, rightTileUrl, sliderPosition }) => {
    const map = useMap();
    const [paneReady, setPaneReady] = useState(false);

    // Create the custom pane once
    useEffect(() => {
        if (!map.getPane('leftPane')) {
            map.createPane('leftPane');
            map.getPane('leftPane').style.zIndex = 450;
        }
        setPaneReady(true);
    }, [map]);

    // Update clip path of the left pane
    useEffect(() => {
        const leftPane = map.getPane('leftPane');
        if (leftPane) {
            leftPane.style.clipPath = `inset(0 ${100 - sliderPosition}% 0 0)`;
        }
    }, [sliderPosition, map, paneReady]); // Add paneReady dependency

    return (
        <>
            {/* Right Layer (Base / True Color) - Standard Z-Index */}
            {rightTileUrl && <TileLayer url={rightTileUrl} attribution="Agromonitoring" />}

            {/* Left Layer (Overlay / NDVI) - Higher Z-Index + Clipped Pane */}
            {/* Only render if custom pane is confirmed ready to avoid 'appendChild' errors */}
            {paneReady && leftTileUrl && (
                <TileLayer
                    url={leftTileUrl}
                    attribution="Agromonitoring"
                    pane="leftPane"
                />
            )}
        </>
    );
};

const NDVIMap = ({ apiKey = API_KEY }) => {
    // State
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [polygonId, setPolygonId] = useState(null);
    const [imagery, setImagery] = useState(null); // { trueColor: url, ndvi: url, stats: {} }
    const [sliderPosition, setSliderPosition] = useState(50); // 0 to 100%

    // --- STEP 1: CREATE/FETCH POLYGON ---
    useEffect(() => {
        const setupPolygon = async () => {
            try {
                // 1. Try to fetch existing polygons first (to avoid duplicate/limit errors)
                const listRes = await axios.get(`https://api.agromonitoring.com/agro/1.0/polygons?appid=${apiKey}`);

                if (listRes.data && listRes.data.length > 0) {
                    // Use the first existing polygon
                    setPolygonId(listRes.data[0].id);
                    console.log("Using existing Polygon ID:", listRes.data[0].id);
                    return;
                }

                // 2. If no polygons exist, create a new one
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
                    `https://api.agromonitoring.com/agro/1.0/polygons?appid=${apiKey}`,
                    payload
                );

                if (createRes.data && createRes.data.id) {
                    setPolygonId(createRes.data.id);
                    console.log("Created new Polygon ID:", createRes.data.id);
                } else {
                    throw new Error("Failed to create polygon ID");
                }

            } catch (err) {
                console.error("Polygon Setup Error:", err);
                // If it's a 422, it might mean we hit a limit but didn't get a list (edge case), 
                // or the geometry is invalid. We'll show a more helpful error.
                if (err.response?.status === 422) {
                    setError("API limit reached or invalid data. Using existing polygon if available.");
                } else {
                    setError("Failed to initialize farm polygon.");
                }
                setLoading(false);
            }
        };

        setupPolygon();
    }, [apiKey]);

    // --- STEP 2: SEARCH IMAGERY ---
    useEffect(() => {
        if (!polygonId) return;

        const findImagery = async () => {
            try {
                const end = Math.floor(Date.now() / 1000);
                const start = 1609459200; // Jan 1, 2021

                // Search for images
                const searchUrl = `https://api.agromonitoring.com/agro/1.0/image/search?start=${start}&end=${end}&polyid=${polygonId}&appid=${apiKey}`;
                const res = await axios.get(searchUrl);

                if (!res.data || res.data.length === 0) {
                    setError("No satellite imagery found for this area.");
                    setLoading(false);
                    return;
                }

                // Filter: Find lowest cloud coverage
                // Sort by 'cl' (clouds) ascending
                const bestImage = res.data.sort((a, b) => a.cl - b.cl)[0];

                // Construct Tile URLs
                // API returns 'tile' object with 'truecolor' and 'ndvi' templates (usually). 
                // However, Agromonitoring sometimes returns specific full URLs or templates.
                // The documentation says it returns a URL template like:
                // .../tile/1.0/{z}/{x}/{y}/{image_id}?appid={api_key}

                if (bestImage.tile) {
                    setImagery({
                        trueColor: `${bestImage.tile.truecolor}`, // Usually already a template or URL
                        ndvi: `${bestImage.tile.ndvi}`,
                        stats: {
                            date: new Date(bestImage.dt * 1000).toLocaleDateString(),
                            clouds: bestImage.cl,
                            satellite: bestImage.type || "Sentinel-2"
                        }
                    });
                } else {
                    // Fallback to manual construction if simple search result (sometimes varies by account tier)
                    // But usually search results include the 'tile' block.
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
    }, [polygonId, apiKey]);


    // --- RENDER ---

    // Convert Polygon for Leaflet (Lat, Lon) - input is (Lon, Lat)
    const leafletPolygon = POLYGON_COORDINATES.map(idx => [idx[1], idx[0]]);

    if (error) {
        return (
            <div className="flex h-[600px] w-full items-center justify-center rounded-xl bg-[#0f1322] border border-white/10 text-center p-6">
                <div className="text-red-400">
                    <AlertTriangle className="mx-auto mb-2 h-10 w-10" />
                    <h3 className="text-lg font-bold">Data Unavailable</h3>
                    <p className="text-sm opacity-80">{error}</p>
                    <p className="text-xs mt-4 text-slate-500">Check API Key or Quota</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-screen w-full bg-[#050714] text-white">

            {/* Header */}
            <div className="p-6 border-b border-white/10 flex justify-between items-center bg-[#0a0e17]">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Layers className="text-[#00ff88]" />
                        Precision Agriculture
                    </h1>
                    <p className="text-slate-400 text-sm">NDVI vs True Color Analysis • Sentinel-2 Satellite Data</p>
                </div>

                {loading ? (
                    <div className="flex items-center gap-2 text-[#00d9ff] animate-pulse">
                        <Loader2 className="animate-spin" size={18} />
                        <span className="text-sm">Acquiring Satellite Feed...</span>
                    </div>
                ) : imagery ? (
                    <div className="flex gap-6 text-sm">
                        <div className="flex items-center gap-2">
                            <Calendar size={16} className="text-slate-500" />
                            <span className="font-mono">{imagery.stats.date}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Cloud size={16} className="text-slate-500" />
                            <span className="font-mono">{imagery.stats.clouds.toFixed(2)}% Cover</span>
                        </div>
                    </div>
                ) : null}
            </div>

            {/* Map Container */}
            <div className="relative flex-grow w-full overflow-hidden">
                <MapContainer
                    center={MAP_CENTER}
                    zoom={15}
                    style={{ height: "100%", width: "100%", background: '#0a0e17' }}
                    className="z-0"
                >
                    <TileLayer
                        url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                        attribution='&copy; Esri'
                    />

                    {/* The Farm Polygon Outline */}
                    <Polygon
                        positions={leafletPolygon}
                        pathOptions={{
                            color: '#00ff88',
                            fillOpacity: 0,
                            weight: 2,
                            dashArray: '5, 5'
                        }}
                    />

                    {/* Compare Layers */}
                    {imagery && !loading && (
                        <SplitLayer
                            leftTileUrl={imagery.ndvi}
                            rightTileUrl={imagery.trueColor}
                            sliderPosition={sliderPosition}
                        />
                    )}

                </MapContainer>

                {/* Slider UI Overlay */}
                {!loading && imagery && (
                    <div
                        className="absolute top-0 bottom-0 z-[1000] pointer-events-none"
                        style={{ left: `${sliderPosition}%` }}
                    >
                        {/* The Vertical Line */}
                        <div className="h-full w-0.5 bg-[#00ff88] shadow-[0_0_15px_#00ff88]"></div>

                        {/* The Handle */}
                        <div
                            className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-black/80 border-2 border-[#00ff88] rounded-full flex items-center justify-center text-[#00ff88] cursor-ew-resize pointer-events-auto shadow-lg hover:scale-110 transition-transform"
                            onMouseDown={(e) => {
                                e.preventDefault();
                                const handleMouseMove = (moveEvent) => {
                                    const rect = e.target.parentElement.parentElement.getBoundingClientRect();
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
                            <ArrowLeftRight size={18} />
                        </div>

                        {/* Labels */}
                        <div className="absolute top-4 right-4 bg-black/70 text-white text-xs px-3 py-1 rounded border border-white/10 pointer-events-auto">
                            True Color (RGB)
                        </div>
                        <div className="absolute top-4 left-[-120px] bg-black/70 text-[#00ff88] text-xs px-3 py-1 rounded border border-[#00ff88]/30 pointer-events-auto">
                            Vegetation Index (NDVI)
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default NDVIMap;
