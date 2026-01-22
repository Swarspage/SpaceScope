import React, { useEffect, useRef, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Globe from "react-globe.gl";
import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import { MdChevronLeft, MdSatelliteAlt, MdPublic, MdWifi } from "react-icons/md";
import { WiStars } from "react-icons/wi";

/* ---------- Theme tokens (Singularity) ---------- */
const THEME = {
    primary: "#00d9ff",
    glowCSS: "0 0 18px rgba(0,217,255,0.18)",
};

/* ---------- Cyan ISS icon for the map ---------- */
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

function formatTimestamp(ts) {
    try {
        return new Date(ts * 1000).toLocaleString();
    } catch {
        return "-";
    }
}

export default function ISSTracker() {
    const navigate = useNavigate();
    const [iss, setIss] = useState(null);
    const [pollMs, setPollMs] = useState(5000);

    const globeRef = useRef(null);
    const mapRef = useRef(null);
    const globeContainerRef = useRef(null);

    // 1. Poll ISS position
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

    // 2. Update Cameras
    useEffect(() => {
        if (!iss) return;
        try {
            if (globeRef.current) {
                globeRef.current.pointOfView({ lat: iss.lat, lng: iss.lng, altitude: 1.8 }, 1000);
            }
        } catch (e) { }

        try {
            if (mapRef.current) {
                mapRef.current.panTo([iss.lat, iss.lng], {
                    animate: true,
                    duration: 1.5,
                    easeLinearity: 0.25
                });
            }
        } catch (e) { }
    }, [iss]);

    const globeMarkers = useMemo(() => {
        if (!iss) return [];
        return [{
            lat: iss.lat,
            lng: iss.lng,
            size: 1.5,
            color: "#ffffff",
            label: `ISS`,
        }];
    }, [iss]);

    return (
        <div className="flex flex-col h-screen bg-[#050714] text-slate-300 font-sans overflow-hidden relative">

            {/* Background Atmosphere */}
            <div className="fixed top-[-20%] right-[-10%] w-[800px] h-[800px] bg-cyan-500/5 rounded-full blur-[120px] pointer-events-none z-0" />
            <div className="fixed bottom-[-20%] left-[-10%] w-[600px] h-[600px] bg-purple-500/5 rounded-full blur-[100px] pointer-events-none z-0" />

            {/* Header */}
            <header className="h-20 flex items-center justify-between px-8 border-b border-white/5 bg-black/20 backdrop-blur-md sticky top-0 z-50">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 hover:border-[#00d9ff]/30 text-slate-400 hover:text-[#00d9ff] transition-all"
                    >
                        <MdChevronLeft className="text-2xl" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-white tracking-wide flex items-center gap-2">
                            <MdSatelliteAlt className="text-[#00d9ff] text-3xl" />
                            ISS <span className="text-slate-500">TRACKER</span>
                        </h1>
                        <p className="text-xs text-[#00d9ff] font-mono tracking-widest uppercase">
                            Orbital Telemetry // Live Feed
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3 bg-black/40 border border-white/10 rounded-lg p-1.5">
                    <span className="text-[10px] font-bold text-slate-500 px-2 uppercase">Poll Rate</span>
                    {[2000, 5000, 15000].map((ms) => (
                        <button
                            key={ms}
                            onClick={() => setPollMs(ms)}
                            className={`px-3 py-1 rounded text-[10px] font-bold transition-all ${pollMs === ms
                                ? 'bg-[#00d9ff]/20 text-[#00d9ff] border border-[#00d9ff]/30 shadow-[0_0_10px_rgba(0,217,255,0.2)]'
                                : 'text-slate-400 hover:text-white'
                                }`}
                        >
                            {ms / 1000}s
                        </button>
                    ))}
                </div>
            </header>

            {/* Main Content: Split View */}
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 relative z-10">

                {/* Left: Globe (3D) */}
                <div className="relative border-r border-white/5 bg-black/40" ref={globeContainerRef}>
                    <Globe
                        ref={globeRef}
                        width={globeContainerRef.current?.clientWidth}
                        height={globeContainerRef.current?.clientHeight}
                        globeImageUrl="//unpkg.com/three-globe/example/img/earth-blue-marble.jpg"
                        bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
                        backgroundImageUrl="//unpkg.com/three-globe/example/img/night-sky.png"
                        showAtmosphere={true}
                        atmosphereColor={THEME.primary}
                        atmosphereAltitude={0.15}
                        pointsData={globeMarkers}
                        pointLat={(d) => d.lat}
                        pointLng={(d) => d.lng}
                        pointColor={(d) => d.color}
                        pointRadius={(d) => d.size}
                        pointAltitude={0.1}
                        pointLabel={(d) => d.label}
                        animateIn={true}
                    />
                    <div className="absolute top-6 left-6 pointer-events-none">
                        <div className="bg-black/60 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded text-xs font-mono text-[#00d9ff] flex items-center gap-2">
                            <span className="w-1.5 h-1.5 bg-[#00d9ff] rounded-full animate-pulse"></span>
                            ORBITAL VIEW
                        </div>
                    </div>
                </div>

                {/* Right: Map (2D) */}
                <div className="relative bg-[#0a0e17]">
                    <MapContainer
                        center={iss ? [iss.lat, iss.lng] : [0, 0]}
                        zoom={3}
                        style={{ height: "100%", width: "100%", background: "transparent" }}
                        scrollWheelZoom={true}
                        zoomControl={false}
                        whenCreated={(mapInstance) => { mapRef.current = mapInstance; }}
                    >
                        <TileLayer
                            attribution='&copy; OpenStreetMap'
                            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                        />
                        {iss && (
                            <Marker position={[iss.lat, iss.lng]} icon={issIcon}>
                                <Popup className="custom-popup">
                                    <div className="text-center">
                                        <strong className="block text-gray-800">ISS Location</strong>
                                    </div>
                                </Popup>
                            </Marker>
                        )}
                    </MapContainer>

                    <div className="absolute top-6 right-6 pointer-events-none z-[1000]">
                        <div className="bg-black/60 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded text-xs font-mono text-[#00d9ff] flex items-center gap-2">
                            <MdPublic />
                            GROUND TRACK
                        </div>
                    </div>

                    {/* Floating HUD Telemetry (Bottom Overlay) */}
                    <div className="absolute bottom-12 left-6 right-6 p-6 bg-black/60 backdrop-blur-xl border border-white/10 rounded-2xl flex items-center justify-between z-[1000] shadow-2xl">
                        <div className="flex items-center gap-8">
                            <div>
                                <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">Coordinates</div>
                                <div className="flex gap-4 font-mono text-xl text-white">
                                    <span>LAT <span className="text-[#00d9ff]">{iss ? iss.lat.toFixed(4) : "---"}</span></span>
                                    <span>LNG <span className="text-[#00d9ff]">{iss ? iss.lng.toFixed(4) : "---"}</span></span>
                                </div>
                            </div>
                            <div className="h-8 w-px bg-white/10"></div>
                            <div>
                                <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">Status</div>
                                <div className="flex items-center gap-2 text-green-400 font-bold text-sm tracking-wide">
                                    <MdWifi className="text-lg animate-pulse" />
                                    SIGNAL LOCKED
                                </div>
                            </div>
                        </div>

                        <div className="text-right">
                            <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">Last Packet</div>
                            <div className="font-mono text-sm text-white">{iss ? formatTimestamp(iss.timestamp) : "Connecting..."}</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}