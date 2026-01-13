import React, { useEffect, useMemo, useState } from "react";
import {
    MapContainer,
    TileLayer,
    CircleMarker,
    Tooltip,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import {
    FiRefreshCw,
    FiLayers,
    FiMaximize2,
    FiMinus,
    FiPlus,
    FiActivity,
    FiClock,
    FiMap,
    FiAlertTriangle
} from "react-icons/fi";
import { getAuroraData } from "../services/api";

/**
 * SpaceScope Utility: Color Mapping
 */
const intensityToColor = (v) => {
    if (v <= 0) return "transparent";
    // SpaceScope Thermal Gradient
    if (v <= 1) return "#00d9ff"; // Cyan (Low)
    if (v <= 3) return "#00ff88"; // Green
    if (v <= 6) return "#facc15"; // Yellow
    if (v <= 9) return "#fb923c"; // Orange
    return "#ff3366";             // Red/Pink (Extreme)
};

const intensityToRadius = (v) => {
    return Math.max(2, Math.min(25, Math.sqrt(v) * 4));
};

const estimateKpFromIntensity = (maxIntensity) => {
    const maxPossible = 14;
    const kp = Math.round((maxIntensity / maxPossible) * 9);
    return Math.max(0, Math.min(9, kp));
};

const timeAgo = (iso) => {
    if (!iso) return "Scanning...";
    try {
        const t = new Date(iso);
        const diff = Math.floor((Date.now() - t.getTime()) / 1000);
        if (diff < 60) return `${diff}s ago`;
        if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
        return `${Math.floor(diff / 3600)}h ago`;
    } catch {
        return "Unknown";
    }
};

// --- Sub-components for UI Cleanliness ---

const StatCard = ({ label, value, subtext, icon: Icon, alertLevel = "normal" }) => {
    const borderClass = alertLevel === "high" ? "border-error/50 shadow-[0_0_15px_rgba(255,51,102,0.2)]" : "border-white/5 hover:border-primary/30";
    const textClass = alertLevel === "high" ? "text-error" : "text-white";

    return (
        <div className={`bg-panel-dark/60 backdrop-blur-md border ${borderClass} rounded-xl p-5 transition-all duration-300 group`}>
            <div className="flex justify-between items-start mb-2">
                <span className="text-secondary text-xs uppercase tracking-widest font-bold">{label}</span>
                {Icon && <Icon className={`w-4 h-4 ${alertLevel === "high" ? "text-error" : "text-primary/70 group-hover:text-primary"} transition-colors`} />}
            </div>
            <div className={`font-display text-2xl font-bold ${textClass} tracking-wide`}>
                {value}
            </div>
            {subtext && <div className="text-muted text-xs font-mono mt-1">{subtext}</div>}
        </div>
    );
};

const MapControlBtn = ({ onClick, icon: Icon, label, active }) => (
    <button
        onClick={onClick}
        className={`w-10 h-10 flex items-center justify-center rounded-lg border backdrop-blur-md transition-all duration-200
      ${active
                ? "bg-primary/20 border-primary text-primary shadow-glow"
                : "bg-panel-dark/80 border-white/10 text-secondary hover:text-white hover:border-white/30"
            }`}
        title={label}
    >
        <Icon className="w-5 h-5" />
    </button>
);

const AuroraPage = () => {
    // State
    const [coords, setCoords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [dataFetching, setDataFetching] = useState(false);
    const [error, setError] = useState(null);
    const [obsTime, setObsTime] = useState(null);
    const [forecastTime, setForecastTime] = useState(null);
    const [mapInstance, setMapInstance] = useState(null);

    // UI State
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [showAurora, setShowAurora] = useState(true);
    const [showCityLights, setShowCityLights] = useState(true);
    const [autoRefresh, setAutoRefresh] = useState(true);
    const [lastUpdatedAt, setLastUpdatedAt] = useState(null);

    // Fetch Logic
    useEffect(() => {
        let mounted = true;
        let pollingId = null;

        const fetchData = async (isAuto = false) => {
            if (!isAuto) setLoading(true);
            else setDataFetching(true);

            setError(null);
            try {
                const resp = await getAuroraData();
                const data = resp.data || resp;
                if (!mounted) return;

                setObsTime(data["Observation Time"] || null);
                setForecastTime(data["Forecast Time"] || null);
                setLastUpdatedAt(new Date().toISOString());

                if (data && Array.isArray(data.coordinates)) {
                    const points = data.coordinates
                        .map((c) => {
                            if (!Array.isArray(c) || c.length < 3) return null;
                            const [lon, lat, intensity] = c;
                            return { lat: Number(lat), lon: Number(lon), intensity: Number(intensity) };
                        })
                        .filter(p => p && Number.isFinite(p.lat)); // filter nulls
                    setCoords(points);
                }
            } catch (err) {
                setError("Telemetry Uplink Failed");
            } finally {
                setLoading(false);
                setDataFetching(false);
            }
        };

        fetchData(false);

        if (autoRefresh) {
            pollingId = setInterval(() => fetchData(true), 60000);
        }

        return () => {
            mounted = false;
            if (pollingId) clearInterval(pollingId);
        };
    }, [autoRefresh]);

    // Computed
    const maxIntensity = useMemo(() => coords.reduce((mx, p) => Math.max(mx, p.intensity || 0), 0), [coords]);
    const kp = useMemo(() => estimateKpFromIntensity(maxIntensity), [maxIntensity]);
    const center = useMemo(() => (!coords.length ? [50, 0] : [coords[0].lat, coords[0].lon]), [coords]);

    // Tile Layers
    const tiles = {
        base: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
        lights: "https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}.png"
    };

    return (
        <div className={`min-h-screen bg-background-dark text-white font-sans selection:bg-primary/30 ${isFullscreen ? 'p-0' : 'p-4 lg:p-8'}`}>

            {/* --- Header Section --- */}
            {!isFullscreen && (
                <header className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <h1 className="text-h1 md:text-mega font-display tracking-tight text-white">
                                Aurora <span className="text-transparent bg-clip-text bg-btn-gradient">Forecast</span>
                            </h1>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-mono tracking-widest uppercase border ${dataFetching ? 'border-primary text-primary animate-pulse' : 'border-secondary text-secondary'}`}>
                                {dataFetching ? 'SYNCING' : 'LIVE FEED'}
                            </span>
                        </div>
                        <p className="text-secondary text-sm max-w-lg">
                            Real-time magnetospheric particle precipitation visualization sourced via NOAA deep space satellites.
                        </p>
                    </div>

                    {/* Top Controls */}
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setAutoRefresh(!autoRefresh)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold tracking-wide transition-all border
                        ${autoRefresh ? 'bg-primary/10 border-primary text-primary' : 'bg-input-bg border-white/10 text-muted hover:text-white'}
                      `}
                        >
                            <FiRefreshCw className={autoRefresh && dataFetching ? "animate-spin" : ""} />
                            {autoRefresh ? "AUTO-SYNC ON" : "MANUAL"}
                        </button>
                    </div>
                </header>
            )}

            {/* --- Extreme Alert Banner --- */}
            {kp >= 7 && (
                <div className="mb-6 w-full rounded-lg bg-alert-danger-bg border border-alert-danger-border p-4 flex items-center gap-4 animate-slideUp">
                    <FiAlertTriangle className="text-error w-6 h-6 animate-pulse" />
                    <div>
                        <h3 className="text-error font-display font-bold uppercase tracking-wider">Geomagnetic Storm Warning</h3>
                        <p className="text-xs text-white/80">Kp Index {kp} indicates potential high-latitude visibility.</p>
                    </div>
                </div>
            )}

            {/* --- Main Viewport (Map) --- */}
            <main className={`relative group rounded-2xl overflow-hidden border border-white/10 shadow-glass bg-[#050714] transition-all duration-500
              ${isFullscreen ? 'fixed inset-0 z-50 rounded-none border-none h-screen' : 'h-[60vh] w-full'}`
            }>

                {/* Map Overlay Controls (Floating) */}
                <div className="absolute top-6 right-6 z-[1000] flex flex-col gap-3">
                    <MapControlBtn
                        icon={FiPlus}
                        label="Zoom In"
                        onClick={() => mapInstance?.zoomIn()}
                    />
                    <MapControlBtn
                        icon={FiMinus}
                        label="Zoom Out"
                        onClick={() => mapInstance?.zoomOut()}
                    />
                    <div className="h-4"></div> {/* Spacer */}
                    <MapControlBtn
                        icon={FiLayers}
                        label="Toggle City Lights"
                        active={showCityLights}
                        onClick={() => setShowCityLights(!showCityLights)}
                    />
                    <MapControlBtn
                        icon={FiActivity}
                        label="Toggle Aurora Layer"
                        active={showAurora}
                        onClick={() => setShowAurora(!showAurora)}
                    />
                    <div className="h-4"></div>
                    <MapControlBtn
                        icon={FiMaximize2}
                        label="Fullscreen"
                        active={isFullscreen}
                        onClick={() => setIsFullscreen(!isFullscreen)}
                    />
                </div>

                {/* Loading State Overlay */}
                {loading && (
                    <div className="absolute inset-0 z-[1001] bg-background-dark/80 backdrop-blur-sm flex items-center justify-center">
                        <div className="flex flex-col items-center gap-4">
                            <div className="w-16 h-16 border-4 border-white/5 border-t-primary rounded-full animate-spin"></div>
                            <span className="text-primary font-mono text-xs tracking-widest animate-pulse">ESTABLISHING UPLINK...</span>
                        </div>
                    </div>
                )}

                {/* Leaflet Map */}
                <MapContainer
                    center={[60, 0]}
                    zoom={2}
                    minZoom={2}
                    className="w-full h-full bg-[#050714]"
                    zoomControl={false}
                    whenCreated={setMapInstance}
                >
                    <TileLayer
                        attribution='&copy; OpenStreetMap, CartoDB'
                        url={showCityLights ? tiles.lights : tiles.base}
                    />

                    {showAurora && coords.map((p, idx) => {
                        if (p.intensity <= 0) return null;
                        const color = intensityToColor(p.intensity);
                        // Optimization: Only render significant points if array is massive
                        return (
                            <CircleMarker
                                key={`${p.lat}-${p.lon}-${idx}`}
                                center={[p.lat, p.lon]}
                                radius={intensityToRadius(p.intensity)}
                                pathOptions={{
                                    color: color,
                                    fillColor: color,
                                    fillOpacity: 0.6,
                                    weight: 0,
                                    className: "animate-pulseGlow" // Custom CSS class for subtle throb
                                }}
                            >
                                <Tooltip direction="top" className="custom-leaflet-tooltip">
                                    <div className="bg-panel-dark border border-white/10 p-2 rounded text-xs font-mono text-white">
                                        <div className="text-primary font-bold">INTENSITY: {p.intensity.toFixed(1)}</div>
                                        <div className="text-muted">[{p.lat.toFixed(1)}, {p.lon.toFixed(1)}]</div>
                                    </div>
                                </Tooltip>
                            </CircleMarker>
                        );
                    })}
                </MapContainer>

                {/* Bottom Left: Data Timestamp Overlay */}
                <div className="absolute bottom-6 left-6 z-[1000] pointer-events-none">
                    <div className="bg-panel-dark/80 backdrop-blur border border-white/10 px-4 py-2 rounded-lg flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
                        <div className="font-mono text-xs text-white">
                            DATA AGE: <span className="text-primary">{timeAgo(lastUpdatedAt)}</span>
                        </div>
                    </div>
                </div>
            </main>

            {/* --- Data Dashboard Grid (Below Map) --- */}
            {!isFullscreen && (
                <section className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* KP Index Card */}
                    <StatCard
                        label="Planetary K-Index"
                        value={kp}
                        subtext={kp < 4 ? "Low Activity" : kp < 7 ? "Moderate Storm" : "Extreme Storm"}
                        icon={FiActivity}
                        alertLevel={kp >= 5 ? "high" : "normal"}
                    />

                    {/* Intensity Card */}
                    <StatCard
                        label="Max Intensity"
                        value={maxIntensity.toFixed(1) + " GW"}
                        subtext="Hemispheric Power"
                        icon={FiMap}
                    />

                    {/* Forecast Time */}
                    <StatCard
                        label="Forecast Window"
                        value={forecastTime ? new Date(forecastTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "--:--"}
                        subtext={new Date().toLocaleDateString()}
                        icon={FiClock}
                    />

                    {/* Action Panel */}
                    <div className="bg-panel-dark/40 border border-white/5 rounded-xl p-5 flex flex-col justify-between">
                        <span className="text-secondary text-xs uppercase tracking-widest font-bold mb-2">System Controls</span>
                        <div className="flex gap-2 mt-auto">
                            <button
                                onClick={() => {
                                    setLoading(true);
                                    setTimeout(() => setLoading(false), 800); // Simulate re-calibrating
                                }}
                                className="flex-1 bg-btn-gradient text-background-dark font-bold py-2 rounded-lg text-sm hover:shadow-glow transition-all"
                            >
                                Calibrate
                            </button>
                            <button
                                className="px-4 py-2 border border-white/10 rounded-lg text-white hover:bg-white/5 transition-colors text-sm"
                                onClick={() => window.open("https://www.swpc.noaa.gov/", "_blank")}
                            >
                                Source
                            </button>
                        </div>
                    </div>
                </section>
            )}

            {/* Error Toast */}
            {error && (
                <div className="fixed bottom-8 right-8 bg-panel-dark border border-error text-error px-6 py-4 rounded-xl shadow-lg animate-slideUp z-50 flex items-center gap-3">
                    <div className="w-2 h-2 bg-error rounded-full animate-ping"></div>
                    <span className="font-mono text-sm">{error}</span>
                </div>
            )}
        </div>
    );
};

export default AuroraPage;