import React, { useState, useEffect, useMemo } from 'react';
import { MdSatelliteAlt, MdLocationOn, MdAccessTime, MdMyLocation } from 'react-icons/md';
import * as satellite from 'satellite.js';
import axios from 'axios';

const ISSBanner = ({ issData }) => {
    const [userLocation, setUserLocation] = useState(null);
    const [nextPass, setNextPass] = useState(null);
    const [loading, setLoading] = useState(true);
    const [permissionDenied, setPermissionDenied] = useState(false);

    // 1. Get User Location
    useEffect(() => {
        if (!navigator.geolocation) {
            console.warn("Geolocation not supported");
            setLoading(false);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                setUserLocation({
                    lat: position.coords.latitude,
                    lon: position.coords.longitude
                });
            },
            (err) => {
                console.error("Location access denied or failed", err);
                setPermissionDenied(true);
                setLoading(false);
            }
        );
    }, []);

    // 2. Fetch TLE and Calculate Pass
    useEffect(() => {
        if (!userLocation) return;

        const fetchTLEAndCalculate = async () => {
            try {
                // Fetch TLE (using WhereTheISS API as in ISSTracker)
                const res = await axios.get('https://api.wheretheiss.at/v1/satellites/25544/tles');
                if (res.data) {
                    const { line1, line2 } = res.data;
                    const satrec = satellite.twoline2satrec(line1, line2);

                    // Simple prediction logic (Look ahead 24h)
                    const now = new Date();
                    let currentTime = new Date(now);
                    const endTime = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours
                    // Using smaller step for better accuracy, or 60s is fine
                    const stepSeconds = 60;

                    let foundPass = null;
                    let isPassActive = false;

                    while (currentTime < endTime) {
                        const positionAndVelocity = satellite.propagate(satrec, currentTime);
                        const gmst = satellite.gstime(currentTime);

                        // Check bounds
                        if (!positionAndVelocity.position) {
                            currentTime = new Date(currentTime.getTime() + stepSeconds * 1000);
                            continue;
                        }

                        const positionEcf = satellite.eciToEcf(positionAndVelocity.position, gmst);
                        const observerGd = {
                            latitude: satellite.degreesToRadians(userLocation.lat),
                            longitude: satellite.degreesToRadians(userLocation.lon),
                            height: 0
                        };
                        const lookAngles = satellite.ecfToLookAngles(observerGd, positionEcf);
                        const elevation = satellite.radiansToDegrees(lookAngles.elevation);

                        if (elevation > 10) { // Visible pass > 10 degrees
                            if (!isPassActive) {
                                // Pass found!
                                foundPass = {
                                    start: new Date(currentTime),
                                    maxEl: elevation
                                };
                                isPassActive = true;
                                break; // Just need the *next* one for the banner
                            }
                        } else {
                            isPassActive = false;
                        }
                        currentTime = new Date(currentTime.getTime() + stepSeconds * 1000);
                    }

                    if (foundPass) {
                        setNextPass(foundPass);
                    } else {
                        // setNextPass(null); // No pass in next 24h
                    }
                }
            } catch (err) {
                console.error("Failed to predict ISS pass:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchTLEAndCalculate();
    }, [userLocation]);


    // Formatting
    const passTimeDisplay = useMemo(() => {
        if (permissionDenied) return "Loc Denied";
        if (!userLocation && loading) return "Locating...";
        if (!nextPass && loading) return "Calculating...";
        if (!nextPass) return "No Pass <24h";

        return nextPass.start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }, [nextPass, loading, permissionDenied, userLocation]);

    const passDateDisplay = useMemo(() => {
        if (!nextPass) return "";
        const now = new Date();
        const isToday = nextPass.start.getDate() === now.getDate();
        return isToday ? "Today" : "Tomorrow";
    }, [nextPass]);


    const altitude = issData?.altitude ? `${Math.round(issData.altitude)} km` : "408 km";
    const speed = issData?.velocity ? `${Math.round(issData.velocity)} km/h` : "27,600 km/h";

    return (
        <div className="relative w-full h-full overflow-hidden">
            {/* Background */}
            <div className="absolute inset-0 z-0">
                <img
                    src="https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?q=80&w=2072&auto=format&fit=crop"
                    alt="ISS Earth View"
                    className="w-full h-full object-cover opacity-60"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-[#050810] via-[#050810]/70 to-transparent" />
            </div>

            {/* Content */}
            <div className="relative z-10 h-full flex flex-col justify-center p-8 md:p-12 max-w-4xl">
                <div className="flex items-center gap-3 mb-4">
                    <span className="px-3 py-1 bg-blue-500 text-white font-bold text-xs rounded uppercase tracking-wider shadow-[0_0_15px_rgba(59,130,246,0.4)]">
                        Live Tracking
                    </span>
                    <span className="flex items-center gap-1 text-xs font-bold text-slate-300 bg-white/10 px-3 py-1 rounded border border-white/10">
                        <MdSatelliteAlt /> ISS
                    </span>
                    {userLocation && (
                        <span className="flex items-center gap-1 text-[10px] font-bold text-[#00ff88] bg-[#00ff88]/10 px-2 py-0.5 rounded border border-[#00ff88]/20 animate-pulse">
                            <MdMyLocation size={10} /> LOCATED
                        </span>
                    )}
                </div>

                <h1 className="text-4xl md:text-6xl font-black text-white leading-none mb-4 md:mb-6 uppercase tracking-tight drop-shadow-lg">
                    International <br /> Space Station
                </h1>

                <div className="flex flex-wrap items-center gap-8 mb-6">
                    <div className="flex flex-col">
                        <span className="text-xs text-slate-400 uppercase font-bold mb-1">
                            Passing Over You {passDateDisplay && <span className='text-white'>({passDateDisplay})</span>}
                        </span>
                        <div className="text-3xl font-mono font-bold text-[#00d9ff] flex items-center gap-2">
                            <MdAccessTime className="text-2xl" /> {passTimeDisplay}
                        </div>
                    </div>
                    <div className="w-px h-10 bg-white/10 hidden sm:block"></div>
                    <div className="flex flex-col">
                        <span className="text-xs text-slate-400 uppercase font-bold mb-1">Altitude</span>
                        <div className="text-2xl font-mono font-bold text-white">{altitude}</div>
                    </div>
                    <div className="w-px h-10 bg-white/10 hidden sm:block"></div>
                    <div className="flex flex-col">
                        <span className="text-xs text-slate-400 uppercase font-bold mb-1">Orbit Velocity</span>
                        <div className="text-2xl font-mono font-bold text-white">{speed}</div>
                    </div>
                </div>

                <p className="text-slate-400 max-w-lg text-sm leading-relaxed hidden sm:block">
                    monitoring Earth from 400km above. The ISS completes 15.5 orbits per day.
                </p>
            </div>
        </div>
    );
};

export default ISSBanner;
