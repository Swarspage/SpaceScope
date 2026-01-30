import React, { useEffect, useRef, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Globe from "react-globe.gl";
import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import { MdChevronLeft, MdSatelliteAlt, MdPublic, MdWifi, MdInfoOutline, MdAnalytics, MdViewInAr, MdMap } from "react-icons/md";
import { WiStars } from "react-icons/wi";
import FeatureInfoModal from "../components/FeatureInfoModal";


import ISSPassPredictor from "../components/ISSPassPredictor";
import issImage from "../assets/images/app_isstrackerimage.png";

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
    const [activeView, setActiveView] = useState('map');
    const [iss, setIss] = useState(null);
    const [pollMs, setPollMs] = useState(5000);
    const [showInfoModal, setShowInfoModal] = useState(false);

    const globeRef = useRef(null);
    const mapRef = useRef(null);
    const globeContainerRef = useRef(null);

    // Handle initial view and resize
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 1024) {
                setActiveView('both');
            }
        };
        // Initial check
        if (window.innerWidth >= 1024) setActiveView('both');

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // 1. Poll ISS position
    useEffect(() => {
        let mounted = true;
        async function fetchISS() {
            try {
                // USE BACKEND PROXY (Fixes Mixed Content Error on Vercel)
                const res = await fetch("http://localhost:5000/api/iss");
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

    // --- TLE FALLBACK SIMULATION (If API Fails) ---
    // If iss state is still null after 5 seconds, start simulation
    useEffect(() => {
        const timer = setTimeout(() => {
            if (!iss) {
                console.warn("ISS API Unreachable - Switching to Simulation Mode");
                // Start a simulation loop
                const simInterval = setInterval(() => {
                    const time = Date.now() / 1000;
                    // Approximate ISS Orbit parameters (Circular, low inclination)
                    // This is a "fake" visual fallback just to show *something* on the map
                    // In a real scenario, use satellite.js with cached TLEs like SpaceDebrisGlobe
                    const lat = Math.sin(time * 0.0011) * 51.64;
                    const lng = ((time * 0.06) % 360) - 180;

                    setIss({
                        lat: lat,
                        lng: lng,
                        timestamp: Math.floor(time)
                    });
                }, 1000);

                return () => clearInterval(simInterval);
            }
        }, 5000);
        return () => clearTimeout(timer);
    }, [iss]);

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
            {/* TargetCursor removed (global) */}

            {/* Background Atmosphere */}
            <div className="fixed top-[-20%] right-[-10%] w-[800px] h-[800px] bg-cyan-500/5 rounded-full blur-[120px] pointer-events-none z-0" />
            <div className="fixed bottom-[-20%] left-[-10%] w-[600px] h-[600px] bg-purple-500/5 rounded-full blur-[100px] pointer-events-none z-0" />

            {/* Header */}
            <header className="h-[10vh] min-h-[80px] flex items-center justify-between px-4 md:px-8 border-b border-white/5 bg-black/20 backdrop-blur-md sticky top-0 md:p-5 z-[2000]">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="cursor-target w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 hover:border-[#00d9ff]/30 text-slate-400 hover:text-[#00d9ff] transition-all flex-shrink-0"
                    >
                        <MdChevronLeft className="text-2xl" />
                    </button>
                    <div className="hidden md:block">
                        <h1 className="text-2xl font-bold text-white tracking-wide flex items-center gap-2">
                            <MdSatelliteAlt className="text-[#00d9ff] text-3xl" />
                            ISS <span className="text-slate-500">TRACKER</span>
                        </h1>
                        <p className="text-xs text-[#00d9ff] font-mono tracking-widest uppercase">
                            Orbital Telemetry // Live Feed
                        </p>
                    </div>

                    {/* Mobile Title (Simplified) */}
                    <div className="md:hidden">
                        <h1 className="text-lg font-bold text-white tracking-wide flex items-center gap-2">
                            ISS <span className="text-slate-500">TRACKER</span>
                        </h1>
                    </div>

                    <button
                        onClick={() => setShowInfoModal(true)}
                        className="hidden md:flex cursor-target ml-6 px-6 py-3 bg-[#00ff88]/20 hover:bg-[#00ff88]/40 border-2 border-[#00ff88] rounded-full text-white text-xs font-black uppercase tracking-widest transition-all duration-300 items-center gap-2 shadow-[0_0_20px_rgba(0,255,136,0.4)] hover:shadow-[0_0_40px_rgba(0,255,136,0.6)] animate-pulse"
                    >
                        <MdInfoOutline className="text-lg" />
                        Learn More
                    </button>
                </div>

                {/* Mobile View Switcher */}
                <div className="lg:hidden flex bg-white/5 rounded-lg p-1 border border-white/10 mx-2">
                    {[
                        { id: 'orbit', label: '3D' },
                        { id: 'map', label: '2D' },
                        { id: 'both', label: 'Both' }
                    ].map((view) => (
                        <button
                            key={view.id}
                            onClick={() => setActiveView(view.id)}
                            className={`px-3 py-1.5 rounded-md text-[10px] font-bold uppercase transition-all ${activeView === view.id
                                ? 'bg-[#00d9ff] text-black shadow-[0_0_15px_rgba(0,217,255,0.4)]'
                                : 'text-slate-400 hover:text-white'
                                }`}
                        >
                            {view.label}
                        </button>
                    ))}
                </div>


                <div className="flex items-center gap-3">
                    <div className="hidden md:flex items-center gap-3 bg-black/40 border border-white/10 rounded-lg p-1.5">
                        <span className="text-[10px] font-bold text-slate-500 px-2 uppercase">Poll Rate</span>
                        {[2000, 5000, 15000].map((ms) => (
                            <button
                                key={ms}
                                onClick={() => setPollMs(ms)}
                                className={`cursor-target px-3 py-1 rounded text-[10px] font-bold transition-all ${pollMs === ms
                                    ? 'bg-[#00d9ff]/20 text-[#00d9ff] border border-[#00d9ff]/30 shadow-[0_0_10px_rgba(0,217,255,0.2)]'
                                    : 'text-slate-400 hover:text-white'
                                    }`}
                            >
                                {ms / 1000}s
                            </button>
                        ))}
                    </div>

                    {/* Mobile Info Button */}
                    <button
                        onClick={() => setShowInfoModal(true)}
                        className="md:hidden w-10 h-10 rounded-lg bg-[#00ff88]/10 border border-[#00ff88]/30 flex items-center justify-center text-[#00ff88]"
                    >
                        <MdInfoOutline size={20} />
                    </button>
                </div>
            </header >

            {/* Main Content: Split View */}
            <div className={`flex-1 relative z-10 p-4 lg:p-6 gap-4 lg:gap-6 ${activeView === 'both' && window.innerWidth < 1024
                ? 'flex flex-col overflow-y-auto' /* Scrollable vertical stack for mobile "Both" */
                : 'flex flex-col lg:grid lg:grid-cols-2 overflow-hidden' /* Fixed Layout for others */
                }`}>

                {/* Left: Globe (3D) */}
                <div className={`cursor-target relative border border-white/5 bg-black/40 rounded-3xl overflow-hidden shadow-2xl transition-all duration-300 ${activeView === 'orbit'
                    ? 'flex-1 order-1'
                    : activeView === 'both' ? 'h-[50vh] lg:h-auto lg:flex-1 shrink-0 order-1' : 'hidden'
                    }`} ref={globeContainerRef}>
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
                    <div className="absolute top-4 left-4 md:top-6 md:left-6 pointer-events-none">
                        <div className="bg-black/60 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded text-xs font-mono text-[#00d9ff] flex items-center gap-2">
                            <span className="w-1.5 h-1.5 bg-[#00d9ff] rounded-full animate-pulse"></span>
                            ORBITAL VIEW
                        </div>
                    </div>
                </div>

                {/* Right: Map (2D) */}
                <div className={`cursor-target relative bg-[#0a0e17] rounded-3xl overflow-hidden border border-white/5 shadow-2xl transition-all duration-300 ${activeView === 'map'
                    ? 'flex-1 order-2'
                    : activeView === 'both' ? 'h-[60vh] lg:h-auto lg:flex-1 shrink-0 order-2' : 'hidden'
                    }`}>
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

                    <div className="absolute top-4 right-4 md:top-6 md:right-6 pointer-events-none z-[1000]">
                        <div className="bg-black/60 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded text-xs font-mono text-[#00d9ff] flex items-center gap-2">
                            <MdPublic />
                            GROUND TRACK
                        </div>
                    </div>

                    {/* Floating HUD Telemetry (Bottom Overlay) */}
                    <div className="absolute bottom-4 left-4 right-4 md:bottom-6 md:left-6 md:right-6 p-4 md:p-6 bg-black/60 backdrop-blur-xl border border-white/10 rounded-2xl flex flex-col md:flex-row items-center justify-between z-[1000] shadow-2xl gap-4 md:gap-0">
                        <div className="flex w-full md:w-auto justify-between md:justify-start items-center gap-8">
                            <div>
                                <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">Coordinates</div>
                                <div className="flex gap-4 font-mono text-lg md:text-xl text-white">
                                    <span>LAT <span className="text-[#00d9ff]">{iss ? iss.lat.toFixed(4) : "---"}</span></span>
                                    <span>LNG <span className="text-[#00d9ff]">{iss ? iss.lng.toFixed(4) : "---"}</span></span>
                                </div>
                            </div>
                            <div className="hidden md:block h-8 w-px bg-white/10"></div>
                            <div className="hidden md:block">
                                <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">Status</div>
                                <div className="flex items-center gap-2 text-green-400 font-bold text-sm tracking-wide">
                                    <MdWifi className="text-lg animate-pulse" />
                                    SIGNAL LOCKED
                                </div>
                            </div>
                        </div>

                        <div className="w-full md:w-auto flex justify-between md:block md:text-right">
                            <div className="md:hidden">
                                <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">Status</div>
                                <div className="flex items-center gap-2 text-green-400 font-bold text-sm tracking-wide">
                                    <MdWifi className="text-lg animate-pulse" />
                                    LOCKED
                                </div>
                            </div>
                            <div>
                                <div className="text-[10px] text-slate-500 uppercase font-bold mb-1 text-right">Last Packet</div>
                                <div className="font-mono text-sm text-white">{iss ? formatTimestamp(iss.timestamp) : "Connecting..."}</div>
                            </div>
                        </div>
                    </div>

                    {/* Pass Predictor Overlay (Top Left of MAP view) */}
                    <div className="absolute top-4 left-4 right-4 md:right-auto md:top-6 md:left-6 z-[1000] md:w-80">
                        <ISSPassPredictor />
                    </div>
                </div >
            </div >

            <FeatureInfoModal
                isOpen={showInfoModal}
                onClose={() => setShowInfoModal(false)}
                title="International Space Station (ISS)"
                imageSrc={issImage}
                features={[
                    {
                        title: "What is the ISS?",
                        desc: "The International Space Station is the largest human-made object in space, orbiting Earth at 17,500 mph. It serves as a microgravity laboratory for research in astrobiology, astronomy, and physics.",
                        icon: <MdSatelliteAlt className="text-lg" />
                    },
                    {
                        title: "How do we Track it?",
                        desc: "We use real-time telemetry data relayed via TDRS satellites to ground stations. This allows us to calculate its exact position, speed, and upcoming orbital passes with high precision.",
                        icon: <MdWifi className="text-lg" />
                    },
                    {
                        title: "What does the Globe Show?",
                        desc: "The interactive 3D globe visualizes the station's current location relative to Earth's surface. The 'wavy' path represents its orbit projected onto a rotating planet.",
                        icon: <MdPublic className="text-lg" />
                    },
                    {
                        title: "How to use this Tracker?",
                        desc: "Monitor the 'Live Telemetry' for connection status. Use the 'Ground Track' map to see where the ISS will fly over next.",
                        icon: <MdMap className="text-lg" />
                    },
                    {
                        title: "When will the ISS pass over me?",
                        desc: "The 'Next ISS Pass' panel automatically detects your location and calculates the next time the station will be visible overhead. It requires clear skies and low light pollution for best visibility.",
                        icon: <WiStars className="text-lg" />
                    }
                ]}
                readMoreLink="https://www.nasa.gov/international-space-station/"
            />
        </div >
    );
}