import React, { useState, useEffect, useRef, useMemo } from 'react';
import Globe from 'react-globe.gl';
import * as satellite from 'satellite.js';
import * as THREE from 'three';
import { AlertTriangle, Rocket } from 'lucide-react';

// --- HELPER: GENERATE SYNTHETIC TLEs (Visual Fallback) ---
const generateSyntheticTLEs = (count, type) => {
    const tles = [];
    for (let i = 0; i < count; i++) {
        const incl = 50 + Math.random() * 40;
        const raan = Math.random() * 360;
        const ecc = 0.001 + Math.random() * 0.01;
        const argP = Math.random() * 360;
        const ma = Math.random() * 360;
        const mm = 14 + Math.random() * 2;

        const line1 = `1 99999U 21001A   21001.00000000  .00000000  00000-0  00000-0 0  999${i}`;
        const line2 = `2 99999 ${incl.toFixed(4).padStart(8)} ${raan.toFixed(4).padStart(8)} ${ecc.toFixed(7).replace('0.', '')} ${argP.toFixed(4).padStart(8)} ${ma.toFixed(4).padStart(8)} ${mm.toFixed(8)}    1`;

        try {
            const satrec = satellite.twoline2satrec(line1, line2);
            tles.push({
                satrec,
                name: `${type === 'active' ? 'SAT' : 'DEBRIS'}-${i}`,
                type
            });
        } catch (e) { }
    }
    return tles;
};

// --- DATA: FAMOUS SATELLITES (Priority Labels) ---
// Expanded list for better coverage
const FAMOUS_SATELLITES = [
    "ISS (ZARYA)", "HUBBLE", "TIANGONG", "NOAA 19", "GOES 16", "VANGUARD 1",
    "LANDSAT 8", "LANDSAT 9", "SUOMI NPP", "TERRA", "AQUA",
    "GALILEO", "GPS", "GLONASS", "BEIDOU",
    "STARLINK-1007", "STARLINK-3000", "ONEWEB",
    "ENTINEL-1A", "SENTINEL-2A", "ENVISAT"
];

const REAL_FALLBACKS = [
    { name: "ISS (ZARYA)", line1: "1 25544U 98067A   21016.27304883  .00000989  00000-0  26384-4 0  9997", line2: "2 25544  51.6440 208.6637 0002826 312.6331 183.1895 15.48986963264964" },
    { name: "HUBBLE", line1: "1 20580U 90037B   24027.14728373  .00001090  00000-0  34524-4 0  9995", line2: "2 20580  28.4699 261.2721 0003058 167.3197 322.2575 15.09247854619736" },
    { name: "TIANGONG", line1: "1 48274U 21035A   24028.17512140  .00036663  00000-0  21312-3 0  9995", line2: "2 48274  41.4729  85.8340 0006782 251.5284 250.7712 15.59798485152285" },
    { name: "NOAA 19", line1: "1 33591U 09005A   24028.52841686  .00000101  00000-0  85873-4 0  9996", line2: "2 33591  99.1105 132.8464 0013916 226.7571 133.2505 14.12932903774883" },
    { name: "STARLINK-1007", line1: "1 44713U 19074A   24028.32836214  .00004523  00000-0  33829-3 0  9998", line2: "2 44713  53.0543 176.6212 0001633  98.0558 262.0673 15.06412563228956" }
];


const SpaceDebrisGlobe = () => {
    const globeRef = useRef();
    const containerRef = useRef();
    const [dimensions, setDimensions] = useState({ width: 100, height: 100 });
    const [satellites, setSatellites] = useState([]);
    const [debris, setDebris] = useState([]);
    const [loading, setLoading] = useState(true);
    const [collision, setCollision] = useState(null);
    const [launching, setLaunching] = useState(false);

    // --- RESIZE OBSERVER ---
    useEffect(() => {
        if (!containerRef.current) return;
        const resizeObserver = new ResizeObserver(entries => {
            for (let entry of entries) {
                setDimensions({
                    width: entry.contentRect.width,
                    height: entry.contentRect.height
                });
            }
        });
        resizeObserver.observe(containerRef.current);
        return () => resizeObserver.disconnect();
    }, []);

    // --- INITIAL CAMERA ---
    useEffect(() => {
        if (globeRef.current) {
            globeRef.current.pointOfView({ altitude: 2.5, lat: 0, lng: 0 });
            globeRef.current.controls().autoRotate = true;
            globeRef.current.controls().autoRotateSpeed = 0.5;
        }
    }, [loading]);

    // --- 1. DATA FETCHING ---
    useEffect(() => {
        const fetchTLEs = async () => {
            try {
                const PROXY_URL = 'https://corsproxy.io/?';
                const activeUrl = 'https://celestrak.org/NORAD/elements/gp.php?GROUP=active&FORMAT=tle';
                const debrisUrl = 'https://celestrak.org/NORAD/elements/gp.php?GROUP=iridium-33-debris&FORMAT=tle';

                const fetchWithTimeout = (url, ms = 5000) => {
                    return Promise.race([
                        fetch(url),
                        new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), ms))
                    ]);
                };

                const [activeRes, debrisRes] = await Promise.allSettled([
                    fetchWithTimeout(PROXY_URL + encodeURIComponent(activeUrl)),
                    fetchWithTimeout(PROXY_URL + encodeURIComponent(debrisUrl))
                ]);

                const parseTLE = (text, type, limit = 1000) => {
                    const lines = text.split('\n');
                    const result = [];
                    for (let i = 0; i < lines.length - 2 && result.length < limit; i += 3) {
                        const name = lines[i]?.trim();
                        const line1 = lines[i + 1]?.trim();
                        const line2 = lines[i + 2]?.trim();
                        if (name && line1 && line2) {
                            try {
                                const satrec = satellite.twoline2satrec(line1, line2);
                                result.push({ satrec, name, type });
                            } catch (e) { }
                        }
                    }
                    return result;
                };

                let activeData = [];
                let debrisData = [];

                if (activeRes.status === 'fulfilled' && activeRes.value.ok) {
                    const text = await activeRes.value.text();
                    activeData = parseTLE(text, 'active', 800);
                }

                if (debrisRes.status === 'fulfilled' && debrisRes.value.ok) {
                    const text = await debrisRes.value.text();
                    debrisData = parseTLE(text, 'debris', 2000);
                }

                // --- LABELING LOGIC ---
                let featuredCount = 0;
                activeData = activeData.map(sat => {
                    const isFamous = FAMOUS_SATELLITES.some(f => sat.name.includes(f));
                    if (isFamous) featuredCount++;
                    return { ...sat, isFamous };
                });

                // Targets ~50 labels
                const TARGET_LABELS = 50;
                if (featuredCount < TARGET_LABELS && activeData.length > 0) {
                    const indices = Array.from({ length: activeData.length }, (_, i) => i);
                    const needed = TARGET_LABELS - featuredCount;

                    for (let i = 0; i < needed; i++) {
                        const randIndex = indices[Math.floor(Math.random() * indices.length)];
                        if (activeData[randIndex] && !activeData[randIndex].isFamous) {
                            activeData[randIndex].isFamous = true;
                        }
                    }
                }

                if (activeData.length < 10) {
                    console.warn("API failed, using synthetic ACTIVE data");
                    const real = REAL_FALLBACKS.map(d => ({
                        satrec: satellite.twoline2satrec(d.line1, d.line2),
                        name: d.name,
                        type: 'active',
                        isFamous: true
                    }));
                    activeData = [
                        ...real,
                        ...generateSyntheticTLEs(100, 'active')
                    ];
                }

                if (debrisData.length < 10) {
                    debrisData = generateSyntheticTLEs(400, 'debris');
                }

                setSatellites(activeData);
                setDebris(debrisData);
                setLoading(false);

            } catch (err) {
                const real = REAL_FALLBACKS.map(d => ({
                    satrec: satellite.twoline2satrec(d.line1, d.line2),
                    name: d.name,
                    type: 'active',
                    isFamous: true
                }));
                setSatellites([...real, ...generateSyntheticTLEs(100, 'active')]);
                setDebris(generateSyntheticTLEs(400, 'debris'));
                setLoading(false);
            }
        };

        fetchTLEs();
    }, []);


    // --- 2. ORBIT PROPAGATION LOOP ---
    const [objectsData, setObjectsData] = useState([]);
    const [labelData, setLabelData] = useState([]);

    useEffect(() => {
        const interval = setInterval(() => {
            const now = new Date();
            const propagate = (list) => {
                return list.map(item => {
                    try {
                        const positionAndVelocity = satellite.propagate(item.satrec, now);
                        const positionGd = satellite.eciToGeodetic(positionAndVelocity.position, satellite.gstime(now));

                        if (isNaN(positionGd.latitude) || isNaN(positionGd.longitude)) return null;

                        return {
                            lat: satellite.degreesLat(positionGd.latitude),
                            lng: satellite.degreesLong(positionGd.longitude),
                            alt: positionGd.height / 6371,
                            alt_km: positionGd.height,
                            type: item.type,
                            name: item.name,
                            isFamous: item.isFamous
                        };
                    } catch (e) { return null; }
                }).filter(x => x);
            };

            const activePos = propagate(satellites);
            const debrisPos = propagate(debris);

            setObjectsData([...activePos, ...debrisPos]);
            setLabelData(activePos.filter(d => d.isFamous));

        }, 1000);

        return () => clearInterval(interval);
    }, [satellites, debris]);


    // --- 3. CUSTOM THREE.JS OBJECTS ---
    const satGeometry = useMemo(() => new THREE.SphereGeometry(0.5, 8, 8), []);
    const activeMaterial = useMemo(() => new THREE.MeshBasicMaterial({ color: 0x00ff88, transparent: true, opacity: 0.8 }), []);
    const debrisMaterial = useMemo(() => new THREE.MeshBasicMaterial({ color: 0xff3366, transparent: true, opacity: 0.8 }), []);

    useEffect(() => {
        let frameId;
        const animate = () => {
            const time = Date.now() * 0.005; // Faster blink
            // Pulse opacity between 0.2 and 1.0 (More aggressive blink)
            const pulse = 0.2 + (Math.sin(time) * 0.4 + 0.4);
            const pulseDebris = 0.2 + (Math.sin(time + 2) * 0.4 + 0.4);
            activeMaterial.opacity = pulse;
            debrisMaterial.opacity = pulseDebris;
            frameId = requestAnimationFrame(animate);
        };
        animate();
        return () => cancelAnimationFrame(frameId);
    }, [activeMaterial, debrisMaterial]);

    const getSatObject = (d) => {
        return new THREE.Mesh(satGeometry, d.type === 'active' ? activeMaterial : debrisMaterial);
    };


    // --- 4. LAUNCH SIMULATION ---
    // State is managed at top level

    const handleSimulateLaunch = () => {
        if (launching) return;
        setLaunching(true);
        setCollision(null);

        const startLat = (Math.random() * 180) - 90;
        const startLng = (Math.random() * 360) - 180;

        let currentAlt = 0;
        const maxAlt = 0.5;
        const steps = 50;
        let step = 0;

        const launchInterval = setInterval(() => {
            step++;
            currentAlt = (step / steps) * maxAlt;

            const hit = objectsData.find(obj => {
                const latDiff = Math.abs(obj.lat - startLat);
                const lngDiff = Math.abs(obj.lng - startLng);
                const altDiff = Math.abs((obj.alt_km / 6371) - currentAlt);
                return latDiff < 5 && lngDiff < 5 && altDiff < 0.1;
            });

            if (hit) {
                setCollision(hit);
                clearInterval(launchInterval);
                setLaunching(false);
                setTimeout(() => setCollision(null), 3500);
            }

            if (step >= steps) {
                clearInterval(launchInterval);
                setLaunching(false);
            }
        }, 40);
    };

    return (
        <div ref={containerRef} className="relative w-full h-full bg-[#0a0e17] rounded-xl overflow-hidden shadow-2xl border border-white/10 group">
            {/* Global Overlay Loading */}
            <div className={`absolute inset-0 bg-[#0a0e17] z-20 flex items-center justify-center transition-opacity duration-500 ${loading ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                <div className="text-[#00ff88] font-mono animate-pulse">Initializing Orbital Tracking...</div>
            </div>

            {/* Collision Overlay */}
            {collision && (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-red-900/40 backdrop-blur-sm animate-pulse">
                    <div className="bg-black/90 border border-red-500 p-6 rounded-2xl text-center transform scale-110 shadow-[0_0_50px_rgba(255,0,0,0.5)]">
                        <AlertTriangle className="text-red-500 w-16 h-16 mx-auto mb-4" />
                        <h2 className="text-3xl font-black text-red-500 uppercase">Impact Detected</h2>
                        <p className="text-white mt-2">Collision with {collision.type === 'active' ? 'Satellite' : 'Debris'}</p>
                        <p className="text-slate-400 font-mono text-sm mt-1">{collision.name}</p>
                    </div>
                </div>
            )}

            <Globe
                ref={globeRef}
                width={dimensions.width}
                height={dimensions.height}
                globeImageUrl="//unpkg.com/three-globe/example/img/earth-night.jpg"
                bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
                backgroundImageUrl="//unpkg.com/three-globe/example/img/night-sky.png"
                atmosphereColor="#00ff88"
                atmosphereAltitude={0.15}

                customLayerData={objectsData}
                customThreeObject={getSatObject}
                customThreeObjectUpdate={(obj, d) => {
                    Object.assign(obj.position, globeRef.current.getCoords(d.lat, d.lng, d.alt));
                }}

                // HTML MARKERS FOR LABELS
                htmlElementsData={labelData}
                htmlLat="lat"
                htmlLng="lng"
                htmlAltitude={(d) => d.alt + 0.05} // Float slightly above the dot
                htmlElement={(d) => {
                    const el = document.createElement('div');
                    el.innerHTML = `
                        <div class="relative flex flex-col items-center animate-bounce-slow" style="pointer-events: none;">
                             <div class="bg-black/80 backdrop-blur-md border border-[#00ff88]/50 px-3 py-1.5 rounded-lg shadow-[0_0_15px_rgba(0,255,136,0.3)] min-w-[100px] text-center">
                                 <div class="flex items-center gap-2 justify-center mb-1">
                                     <div class="w-1.5 h-1.5 rounded-full bg-[#00ff88] animate-pulse"></div>
                                     <span class="text-[10px] font-bold text-[#00ff88] tracking-wider uppercase">Active</span>
                                 </div>
                                 <div class="text-white font-mono text-xs font-bold whitespace-nowrap">${d.name}</div>
                             </div>
                             <div class="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-[#00ff88]/50 mt-[-1px]"></div>
                        </div>
                    `;
                    return el;
                }}

                backgroundColor="rgba(0,0,0,0)"
            />

            {/* Launch Simulator Button */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 w-full flex flex-col items-center gap-2">
                {launching && <div className="text-yellow-400 font-mono text-xs animate-bounce">TRAJECTORY CALCULATING...</div>}
                <button
                    onClick={handleSimulateLaunch}
                    disabled={launching}
                    className={`
                        px-8 py-3 rounded-full font-black text-sm uppercase tracking-widest transition-all
                        border border-[#00ff88]/50 shadow-[0_0_20px_rgba(0,255,136,0.3)]
                        ${launching
                            ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                            : 'bg-[#00ff88] text-black hover:scale-105 hover:shadow-[0_0_40px_rgba(0,255,136,0.6)]'
                        }
                    `}
                >
                    <div className="flex items-center gap-2">
                        <Rocket size={18} />
                        {launching ? 'Launch in Progress' : 'Simulate Launch'}
                    </div>
                </button>
                <div className="bg-black/80 px-4 py-1 rounded-full border border-white/10 text-[10px] text-slate-500 font-mono">
                    <span className="text-[#00ff88]">●</span> Active: {satellites.length}
                    <span className="ml-3 text-[#ff3366]">●</span> Debris: {debris.length}
                </div>
            </div>
        </div>
    );
};

export default SpaceDebrisGlobe;
