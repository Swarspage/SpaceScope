import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
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
    FiActivity,
    FiClock,
    FiMap,
    FiAlertTriangle,
    FiPlus,
    FiMinus,
    FiGlobe
} from "react-icons/fi";
import { MdChevronLeft, MdInfoOutline } from "react-icons/md";
import { getAuroraData } from "../services/api";
import FeatureInfoModal from "../components/FeatureInfoModal";
import TargetCursor from "../components/TargetCursor";
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

    const handleForceRefresh = async () => {
        if (cooldown > 0) return;
        await fetchData(false, true);
        setCooldown(600); // 10 min
    };

    const maxIntensity = useMemo(() => coords.reduce((mx, p) => Math.max(mx, p.intensity || 0), 0), [coords]);
    const kp = useMemo(() => estimateKpFromIntensity(maxIntensity), [maxIntensity]);

    return (
        <div className="flex flex-col h-screen bg-[#050714] text-slate-300 font-sans overflow-hidden relative">
            <TargetCursor
                spinDuration={5}
                hideDefaultCursor
                parallaxOn
                hoverDuration={0.95}
            />

            {/* Header */}
            <header className="h-[10vh] flex items-center justify-between px-8 border-b border-white/5 bg-black/20 backdrop-blur-md sticky top-0 focus:z-[2000] z-[2000] p-5">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="cursor-target w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 hover:border-[#00d9ff]/30 text-slate-400 hover:text-[#00d9ff] transition-all"
                    >
                        <MdChevronLeft className="text-2xl" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-white tracking-wide flex items-center gap-2">
                            <FiActivity className="text-[#00d9ff] text-2xl" />
                            AURORA <span className="text-slate-500">FORECAST</span>
                        </h1>
                        <p className="text-xs text-[#00d9ff] font-mono tracking-widest uppercase">
                            Magnetospheric Particle Map // NOAA Feed
                        </p>
                    </div>


                    <button
                        onClick={() => setShowInfoModal(true)}
                        className="cursor-target ml-6 px-6 py-3 bg-[#00ff88]/20 hover:bg-[#00ff88]/40 border-2 border-[#00ff88] rounded-full text-white text-xs font-black uppercase tracking-widest transition-all duration-300 flex items-center gap-2 shadow-[0_0_20px_rgba(0,255,136,0.4)] hover:shadow-[0_0_40px_rgba(0,255,136,0.6)] animate-pulse"
                    >
                        <MdInfoOutline className="text-lg" />
                        Learn More
                    </button>
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={() => setAutoRefresh(!autoRefresh)}
                        className={`cursor-target px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider border transition-all flex items-center gap-2 ${autoRefresh ? 'bg-[#00d9ff]/10 border-[#00d9ff]/30 text-[#00d9ff]' : 'bg-black/40 border-white/10 text-slate-400'
                            }`}
                    >
                        <FiRefreshCw className={dataFetching ? "animate-spin" : ""} />
                        {autoRefresh ? "Auto-Sync" : "Manual"}
                    </button>

                    <button
                        onClick={handleForceRefresh}
                        disabled={cooldown > 0}
                        className={`cursor-target px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider border transition-all flex items-center gap-2 ${cooldown > 0 ? 'opacity-50 cursor-not-allowed border-white/5' : 'bg-white/5 border-white/20 hover:bg-white/10'
                            }`}
                    >
                        {cooldown > 0 ? `Wait ${Math.floor(cooldown / 60)}:${(cooldown % 60).toString().padStart(2, '0')}` : "Force Refresh"}
                    </button>
                </div>
            </header >

            {/* Main Content (Fullscreen Map) */}
            <div className="flex-1 relative bg-[#050714] p-6 overflow-hidden">
                <div className="cursor-target relative w-full h-full rounded-3xl overflow-hidden border border-white/5 shadow-2xl bg-[#0a0e17]">
                    <MapContainer
                        center={[60, 0]}
                        zoom={2}
                        minZoom={2}
                        className="w-full h-full bg-transparent"
                        zoomControl={false}
                        whenCreated={setMapInstance}
                    >
                        <TileLayer
                            attribution='&copy; OpenStreetMap'
                            url={showCityLights
                                ? "https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}.png"
                                : "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                            }
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
                    </MapContainer>

                    {/* Map Controls (Top Right) */}
                    <div className="absolute top-6 right-6 z-[1000] flex flex-col gap-2">
                        <button onClick={() => mapInstance?.zoomIn()} className="cursor-target w-10 h-10 bg-black/60 backdrop-blur border border-white/10 rounded-lg flex items-center justify-center hover:bg-white/10 text-white"><FiPlus /></button>
                        <button onClick={() => mapInstance?.zoomOut()} className="cursor-target w-10 h-10 bg-black/60 backdrop-blur border border-white/10 rounded-lg flex items-center justify-center hover:bg-white/10 text-white"><FiMinus /></button>
                        <div className="h-2"></div>
                        <button onClick={() => setShowCityLights(!showCityLights)} className={`cursor-target w-10 h-10 backdrop-blur border rounded-lg flex items-center justify-center transition-all ${showCityLights ? 'bg-[#00d9ff]/20 border-[#00d9ff] text-[#00d9ff]' : 'bg-black/60 border-white/10 text-slate-400'}`}><FiLayers /></button>
                    </div>

                    {/* KPI Alert (Top Left Overlay) */}
                    {
                        kp >= 5 && (
                            <div className="absolute top-6 left-6 z-[1000] bg-red-500/10 border border-red-500/50 backdrop-blur-md px-4 py-3 rounded-xl flex items-center gap-3 animate-pulse">
                                <FiAlertTriangle className="text-red-500 text-xl" />
                                <div>
                                    <div className="text-red-400 font-bold uppercase text-xs tracking-wider">Geomagnetic Storm</div>
                                    <div className="text-white text-xs">Kp Index {kp} - High Visibility</div>
                                </div>
                            </div>
                        )
                    }

                    {/* Stats HUD (Bottom Overlay) */}
                    <div className="absolute bottom-6 left-6 right-6 z-[1000] flex flex-wrap gap-4 items-end pointer-events-none">
                        <div className="pointer-events-auto flex gap-4">
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
                    }
                ]}
                readMoreLink="https://www.swpc.noaa.gov/"
            />
        </div >
    );
};

export default AuroraPage;