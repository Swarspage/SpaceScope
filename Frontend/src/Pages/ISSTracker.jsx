
import React, { useEffect, useRef, useState, useMemo } from "react";
import Globe from "react-globe.gl";
import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";

/**
 * ISSTracker.jsx
 * - Single-file page combining a react-globe.gl globe + a leaflet map
 * - Centralized polling of ISS position; both views update from the same source
 * - Singularity tokens applied inline + Tailwind utility classes
 */

/* ---------- Theme tokens (Singularity) ---------- */
const THEME = {
    primary: "#00d9ff",
    bgDeep: "transparent",
    panel: "#0a0e17",
    card: "#0f1322",
    textHeading: "#ffffff",
    textBody: "#94a3b8",
    border: "rgba(255,255,255,0.08)",
    glowCSS: "0 0 18px rgba(0,217,255,0.18)",
    gradient: "linear-gradient(90deg, #00d9ff 0%, #b900ff 100%)",
};

/* ---------- Cyan ISS icon for the map (GROUND TRACK) ---------- */
const issIcon = L.divIcon({
    className: 'custom-iss-marker',
    html: `
        <svg width="48" height="48" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
            <g filter="url(#glow)">
                <path d="M12 24h-8v-2h8v2zm32 0h-8v-2h8v2zM24 12v-8h2v8h-2zm0 32v-8h2v8h-2zm-4-20h8v8h-8v-8z" 
                      fill="#00d9ff" stroke="#00d9ff" stroke-width="1"/>
                <circle cx="24" cy="24" r="3" fill="#ffffff" />
            </g>
            <defs>
                <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                    <feMerge>
                        <feMergeNode in="coloredBlur"/>
                        <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                </filter>
            </defs>
        </svg>
    `,
    iconSize: [48, 48],
    iconAnchor: [24, 24],
    popupAnchor: [0, -24],
});

/* ---------- Helper: format timestamp ---------- */
function formatTimestamp(ts) {
    try {
        return new Date(ts * 1000).toLocaleString();
    } catch {
        return "-";
    }
}

/* ---------- Main Component ---------- */
export default function ISSTracker() {
    const [iss, setIss] = useState(null); // { lat, lng, timestamp }
    const [pollMs, setPollMs] = useState(5000);

    // refs for globe and map to control camera/center
    const globeRef = useRef(null);
    const mapRef = useRef(null);
    const globeContainerRef = useRef(null);

    // 1. Poll ISS position centrally
    useEffect(() => {
        let mounted = true;

        async function fetchISS() {
            try {
                const res = await fetch("http://api.open-notify.org/iss-now.json");
                if (!res.ok) throw new Error("Network error " + res.status);
                const data = await res.json();
                const lat = parseFloat(data.iss_position.latitude);
                const lng = parseFloat(data.iss_position.longitude);
                const timestamp = data.timestamp;
                if (!mounted) return;
                setIss({ lat, lng, timestamp });
            } catch (err) {
                console.error("ISS fetch error:", err);
            }
        }

        fetchISS();
        const id = setInterval(fetchISS, pollMs);

        return () => {
            mounted = false;
            clearInterval(id);
        };
    }, [pollMs]);

    // 2. When ISS updates, move globe camera and map center to follow
    useEffect(() => {
        if (!iss) return;

        // Globe follow logic
        try {
            if (globeRef.current) {
                globeRef.current.pointOfView({ lat: iss.lat, lng: iss.lng, altitude: 1.8 }, 1000);
            }
        } catch (e) { /* ignore */ }

        // Map follow logic - always keep ISS centered
        try {
            if (mapRef.current) {
                // Smoothly pan to keep ISS centered in the container
                mapRef.current.panTo([iss.lat, iss.lng], {
                    animate: true,
                    duration: 1.5, // Smooth transition
                    easeLinearity: 0.25
                });
            }
        } catch (e) { /* ignore */ }
    }, [iss]);

    // markers data for globe: single point (subtle indicator on ORBITAL VIEW)
    const globeMarkers = useMemo(() => {
        if (!iss) return [];
        return [
            {
                lat: iss.lat,
                lng: iss.lng,
                size: 1.5,
                color: "#ffffff", // White dot for orbital view
                label: `ISS`,
            },
        ];
    }, [iss]);

    return (
        <div
            className="min-h-screen w-full p-4 sm:p-6"
            style={{ background: THEME.bgDeep, color: THEME.textBody, fontFamily: "Inter, system-ui, sans-serif" }}
        >
            <div className="max-w-screen-2xl mx-auto grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6">

                {/* Main Visual Area */}
                <main
                    className="rounded-2xl p-4 sm:p-6 flex flex-col gap-6 bg-black/30 backdrop-blur-md"
                    style={{
                        border: `1px solid ${THEME.border}`,
                        boxShadow: THEME.glowCSS,
                        minHeight: "80vh",
                    }}
                >
                    {/* Header */}
                    <div className="flex items-start justify-between gap-3">
                        <div>
                            <h1 className="text-white text-2xl sm:text-3xl font-bold tracking-tight" style={{ fontFamily: "Space Grotesk, sans-serif" }}>
                                ISS Tracker
                            </h1>
                            <p className="text-sm text-[#b8c5d6] mt-1">Live orbital telemetry & visualization</p>
                        </div>

                        {/* Polling Controls */}
                        <div className="flex items-center gap-3 bg-[#0a0e17] p-1.5 rounded-lg border border-white/10">
                            <span className="text-xs font-semibold text-[#b8c5d6] px-2 uppercase">Poll</span>
                            {[2000, 5000, 15000].map((ms) => (
                                <button
                                    key={ms}
                                    onClick={() => setPollMs(ms)}
                                    className={`px-3 py-1 rounded-md text-xs transition-all ${pollMs === ms ? 'text-black font-bold' : 'text-gray-400 hover:text-white'}`}
                                    style={{
                                        background: pollMs === ms ? THEME.primary : "transparent",
                                    }}
                                >
                                    {ms / 1000}s
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Split View: Globe & Map */}
                    <div className="flex-1 grid grid-cols-1 xl:grid-cols-2 gap-6 min-h-0">

                        {/* 1. Globe Container */}
                        <div
                            ref={globeContainerRef}
                            className="relative rounded-xl overflow-hidden border border-white/10 flex items-center justify-center bg-black"
                            style={{ minHeight: "400px" }}
                        >
                            <Globe
                                ref={globeRef}
                                width={globeContainerRef.current?.clientWidth}
                                height={globeContainerRef.current?.clientHeight}
                                // Updated to Blue Marble for "Colored" look
                                globeImageUrl="//unpkg.com/three-globe/example/img/earth-blue-marble.jpg"
                                bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
                                backgroundImageUrl="//unpkg.com/three-globe/example/img/night-sky.png"
                                showAtmosphere={true}
                                atmosphereColor={THEME.primary} // Cyan atmosphere
                                atmosphereAltitude={0.15}
                                pointsData={globeMarkers}
                                pointLat={(d) => d.lat}
                                pointLng={(d) => d.lng}
                                pointColor={(d) => d.color}
                                pointRadius={(d) => d.size}
                                pointAltitude={0.1}
                                pointLabel={(d) => d.label}
                                animateIn={true}
                                onGlobeReady={() => {
                                    if (globeRef.current && iss) {
                                        globeRef.current.pointOfView({ lat: iss.lat, lng: iss.lng, altitude: 1.8 }, 1000);
                                    }
                                }}
                            />
                            {/* Overlay Label */}
                            <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-md px-3 py-1 rounded border border-white/10 text-xs text-cyan-400 font-mono">
                                ORBITAL VIEW
                            </div>
                        </div>

                        {/* 2. Map Container */}
                        <div
                            className="relative rounded-xl overflow-hidden border border-white/10 flex flex-col"
                            style={{
                                minHeight: "400px",
                                background: "rgba(0,0,0,0.3)"
                            }}
                        >
                            <MapContainer
                                center={iss ? [iss.lat, iss.lng] : [0, 0]}
                                zoom={3}
                                style={{ height: "100%", width: "100%", outline: "none", background: "transparent" }}
                                scrollWheelZoom={true}
                                whenCreated={(mapInstance) => { mapRef.current = mapInstance; }}
                            >
                                <TileLayer
                                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                                    url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" // Darker, cleaner map tiles
                                />
                                {iss && (
                                    <Marker position={[iss.lat, iss.lng]} icon={issIcon}>
                                        <Popup className="custom-popup">
                                            <div className="text-center">
                                                <strong className="block text-gray-800">ISS Location</strong>
                                                <span className="text-xs text-gray-500">Lat: {iss.lat.toFixed(2)}, Lng: {iss.lng.toFixed(2)}</span>
                                            </div>
                                        </Popup>
                                    </Marker>
                                )}
                            </MapContainer>

                            {/* Sci-fi Overlay for Map */}
                            <div className="absolute inset-0 pointer-events-none" style={{
                                background: "linear-gradient(to bottom, transparent 95%, rgba(0, 217, 255, 0.1) 100%)",
                                boxShadow: "inset 0 0 20px rgba(0,0,0,0.5)"
                            }} />
                            <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-md px-3 py-1 rounded border border-white/10 text-xs text-cyan-400 font-mono pointer-events-none z-[1000]">
                                GROUND TRACK
                            </div>
                        </div>
                    </div>
                </main>

                {/* Sidebar */}
                <aside
                    className="rounded-2xl p-5 flex flex-col gap-6 h-full bg-black/30 backdrop-blur-md"
                    style={{
                        border: `1px solid ${THEME.border}`,
                    }}
                >
                    {/* Telemetry Section */}
                    <div>
                        <h3 className="text-xs font-bold text-[#b8c5d6] uppercase tracking-widest mb-4 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
                            Live Telemetry
                        </h3>

                        <div className="grid gap-4">
                            {/* Lat/Lng Card */}
                            <div className="p-4 rounded-xl space-y-3 bg-black/30 backdrop-blur-md" style={{ border: `1px solid ${THEME.border}` }}>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <div className="text-[10px] uppercase text-gray-500 mb-1">Latitude</div>
                                        <div className="font-mono text-xl text-white tracking-wider">{iss ? iss.lat.toFixed(4) : "—"}</div>
                                    </div>
                                    <div>
                                        <div className="text-[10px] uppercase text-gray-500 mb-1">Longitude</div>
                                        <div className="font-mono text-xl text-white tracking-wider">{iss ? iss.lng.toFixed(4) : "—"}</div>
                                    </div>
                                </div>
                                <div className="h-px w-full bg-white/5 my-2"></div>
                                <div className="flex justify-between items-end">
                                    <div>
                                        <div className="text-[10px] uppercase text-gray-500">Last Packet</div>
                                        <div className="text-sm text-cyan-400">{iss ? formatTimestamp(iss.timestamp) : "Connecting..."}</div>
                                    </div>
                                </div>
                            </div>

                            {/* Status Card */}
                            <div className="p-4 rounded-xl flex items-center justify-between bg-black/30 backdrop-blur-md" style={{ border: `1px solid ${THEME.border}` }}>
                                <div>
                                    <div className="text-[10px] uppercase text-gray-500">Signal Status</div>
                                    <div className="text-sm font-bold text-[#00ff88] flex items-center gap-1.5 mt-0.5">
                                        <span className="block w-1.5 h-1.5 rounded-full bg-[#00ff88]"></span>
                                        RECEIVING
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-[10px] uppercase text-gray-500">Poll Rate</div>
                                    <div className="font-mono text-sm text-white">{pollMs / 1000}s</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="mt-2">
                        <h3 className="text-xs font-bold text-[#b8c5d6] uppercase tracking-widest mb-3">Controls</h3>
                        <div className="flex flex-col gap-3">
                            <button
                                onClick={() => {
                                    if (!iss) return;
                                    navigator.clipboard?.writeText(`${iss.lat}, ${iss.lng}`);
                                    alert("Coordinates copied!");
                                }}
                                className="w-full py-3 rounded-lg text-sm font-medium text-black transition-transform active:scale-95"
                                style={{ background: THEME.primary }}
                            >
                                Copy Coordinates
                            </button>
                            <button
                                onClick={() => window.open("https://spotthestation.nasa.gov/", "_blank")}
                                className="w-full py-3 rounded-lg text-sm font-medium text-white hover:bg-white/5 transition-colors"
                                style={{ border: `1px solid ${THEME.border}` }}
                            >
                                NASA Mission Page
                            </button>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="mt-auto pt-6 border-t border-white/5 text-[10px] text-gray-600">
                        <p>Singularity ISS Tracker v2.0</p>
                        <p className="mt-1">Rendering: WebGL + Leaflet</p>
                    </div>
                </aside>
            </div>
        </div>
    );
}