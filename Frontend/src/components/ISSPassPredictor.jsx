import React, { useState, useEffect } from 'react';
import { MdSearch, MdMyLocation, MdAccessTime, MdVisibility, MdArrowUpward, MdSouthEast, MdNorthWest, MdKeyboardArrowDown, MdKeyboardArrowUp } from 'react-icons/md';
import * as satellite from 'satellite.js';
import axios from 'axios';

const ISSPassPredictor = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [location, setLocation] = useState(null); // { lat, lon, name }
    const [predictions, setPredictions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [tleData, setTleData] = useState(null);
    const [isExpanded, setIsExpanded] = useState(false); // Default collapsed to unblock map

    // Fetch TLE Data on Mount
    useEffect(() => {
        const fetchTLE = async () => {
            try {
                // Fetching from CelesTrak (CORS might be an issue, fallback to a proxy or other source if needed)
                // Using a CORS proxy or backend is better, but trying direct first or standard ISS API if available.
                // Alternatively use: https://api.wheretheiss.at/v1/satellites/25544/tles (often easier for JSON)
                const res = await axios.get('https://api.wheretheiss.at/v1/satellites/25544/tles');
                if (res.data) {
                    setTleData({
                        line1: res.data.line1,
                        line2: res.data.line2
                    });
                }
            } catch (err) {
                console.error("Failed to fetch TLE:", err);
                setError("Could not load orbital data.");
            }
        };
        fetchTLE();
    }, []);

    const handleSearch = async () => {
        if (!searchQuery.trim()) return;
        setLoading(true);
        setError(null);
        if (!isExpanded) setIsExpanded(true); // Auto-expand if searching (though input is hidden if collapsed, so this is moot unless triggered externally)

        try {
            const res = await axios.get(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}`);
            if (res.data && res.data.length > 0) {
                const best = res.data[0];
                setLocation({
                    lat: parseFloat(best.lat),
                    lon: parseFloat(best.lon),
                    name: best.display_name.split(',')[0]
                });
            } else {
                setError("Location not found.");
            }
        } catch (err) {
            setError("Search failed.");
        } finally {
            setLoading(false);
        }
    };

    const handleMyLocation = () => {
        if (!navigator.geolocation) {
            setError("Geolocation is not supported by your browser.");
            return;
        }
        setLoading(true);
        if (!isExpanded) setIsExpanded(true);

        navigator.geolocation.getCurrentPosition(
            (position) => {
                setLocation({
                    lat: position.coords.latitude,
                    lon: position.coords.longitude,
                    name: "My Location"
                });
                setLoading(false);
            },
            (err) => {
                setError("Unable to retrieve your location.");
                setLoading(false);
            }
        );
    };

    // Calculate Passes when Location or TLE changes
    useEffect(() => {
        if (!location || !tleData) return;

        const calculatePasses = () => {
            const satrec = satellite.twoline2satrec(tleData.line1, tleData.line2);
            const passes = [];
            const stepSeconds = 60; // Check every minute
            const durationDays = 2; // Look ahead 2 days
            const now = new Date();
            let currentTime = new Date(now);
            const endTime = new Date(now.getTime() + durationDays * 24 * 60 * 60 * 1000);

            let isPassActive = false;
            let currentPass = null;

            while (currentTime < endTime) {
                const positionAndVelocity = satellite.propagate(satrec, currentTime);
                const gmst = satellite.gstime(currentTime);
                const positionEcf = satellite.eciToEcf(positionAndVelocity.position, gmst);
                const observerGd = {
                    latitude: satellite.degreesToRadians(location.lat),
                    longitude: satellite.degreesToRadians(location.lon),
                    height: 0
                };
                const lookAngles = satellite.ecfToLookAngles(observerGd, positionEcf);
                const elevation = satellite.radiansToDegrees(lookAngles.elevation);

                if (elevation > 10) { // Visible pass threshold
                    if (!isPassActive) {
                        // Pass Started
                        isPassActive = true;
                        currentPass = {
                            start: new Date(currentTime),
                            maxElevation: elevation,
                            end: null
                        };
                    } else {
                        // Continue Pass
                        if (elevation > currentPass.maxElevation) {
                            currentPass.maxElevation = elevation;
                        }
                    }
                } else {
                    if (isPassActive) {
                        // Pass Ended
                        isPassActive = false;
                        currentPass.end = new Date(currentTime);
                        currentPass.duration = (currentPass.end - currentPass.start) / 1000 / 60; // minutes
                        passes.push(currentPass);
                        currentPass = null;

                        // Limit to 5 passes
                        if (passes.length >= 5) break;
                    }
                }

                currentTime = new Date(currentTime.getTime() + stepSeconds * 1000);
            }
            setPredictions(passes);
        };

        calculatePasses();
    }, [location, tleData]);

    return (
        <div className={`bg-[#0a0e17]/95 backdrop-blur-xl rounded-xl border border-white/10 shadow-2xl w-full max-w-md transition-all duration-300 ${isExpanded ? 'p-6' : 'p-4'}`}>
            <div
                className="flex items-center justify-between cursor-pointer"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <h3 className="text-lg md:text-xl font-bold text-white flex items-center gap-2">
                    <MdAccessTime className="text-[#00d9ff]" />
                    Next ISS Passes
                </h3>
                <button className="text-slate-400 hover:text-white transition-colors">
                    {isExpanded ? <MdKeyboardArrowUp size={24} /> : <MdKeyboardArrowDown size={24} />}
                </button>
            </div>

            {isExpanded && (
                <div className="mt-4 animate-fade-in">
                    {/* Search Input */}
                    <div className="flex gap-2 mb-4">
                        <div className="relative flex-1">
                            <input
                                type="text"
                                placeholder="Enter City..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                className="w-full bg-black/40 border border-white/20 rounded-lg px-4 py-2 pl-9 text-sm text-white focus:outline-none focus:border-[#00d9ff] placeholder:text-slate-500"
                            />
                            <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        </div>
                        <button
                            onClick={handleSearch}
                            disabled={loading}
                            className="bg-[#00d9ff]/10 text-[#00d9ff] px-3 rounded-lg hover:bg-[#00d9ff]/20 border border-[#00d9ff]/30 transition-colors"
                        >
                            <MdSearch size={20} />
                        </button>
                        <button
                            onClick={handleMyLocation}
                            disabled={loading}
                            className="bg-white/5 text-slate-300 px-3 rounded-lg hover:bg-white/10 border border-white/10 transition-colors"
                        >
                            <MdMyLocation size={20} />
                        </button>
                    </div>

                    {/* Error Message */}
                    {error && <div className="text-red-400 text-xs mb-3 bg-red-500/10 p-2 rounded border border-red-500/20">{error}</div>}

                    {/* Location Display */}
                    {location && (
                        <div className="text-xs text-[#00d9ff] mb-4 font-mono uppercase tracking-wider">
                            Predicting for: <span className="text-white">{location.name}</span>
                        </div>
                    )}

                    {/* Predictions List */}
                    <div className="space-y-3 max-h-56 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                        {predictions.length > 0 ? (
                            predictions.map((pass, idx) => (
                                <div key={idx} className="bg-white/5 border border-white/5 rounded-lg p-3 flex justify-between items-center group hover:bg-white/10 transition-colors">
                                    <div>
                                        <div className="text-white font-bold text-sm">
                                            {pass.start.toLocaleDateString()}
                                        </div>
                                        <div className="text-2xl font-light text-[#00d9ff]">
                                            {pass.start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    </div>
                                    <div className="text-right space-y-1">
                                        <div className="text-xs text-slate-400 flex items-center justify-end gap-1">
                                            <MdAccessTime size={12} />
                                            {pass.duration.toFixed(1)} min
                                        </div>
                                        <div className="text-xs text-slate-400 flex items-center justify-end gap-1">
                                            <MdArrowUpward size={12} />
                                            {pass.maxElevation.toFixed(0)}° Max El
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-6 text-slate-500 text-sm italic">
                                {loading && !location ? "Getting location..." :
                                    loading ? "Calculating orbits..." :
                                        location ? "No visible passes in next 48h." : "Search location to see passes."}
                            </div>
                        )}
                    </div>

                    <div className="mt-4 pt-3 border-t border-white/5 text-[10px] text-slate-600 text-center">
                        Predictions based on live TLE data. Weather conditions not factored.
                    </div>
                </div>
            )}
        </div>
    );
};

export default ISSPassPredictor;
