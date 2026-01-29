import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import meteorEvents from '../data/meteorData.json';
import {
    MdChevronLeft,
    MdFilterList,
    MdPublic,
    MdInfoOutline,
    MdCalendarMonth,
    MdClose,
    MdLocationOn,
    MdVisibility,
    MdEvent,
    MdInsights,
    MdNotifications,
    MdSatelliteAlt
} from 'react-icons/md';
import { WiStars, WiMeteor } from 'react-icons/wi';
import { MapContainer, TileLayer, Marker, Popup, useMap, Circle } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import FeatureInfoModal from "../Components/FeatureInfoModal";
import meteorImage from "../assets/images/app_meteorcalendarimage.png";

// Fix Leaflet Default Icon
import iconMarker from 'leaflet/dist/images/marker-icon.png';
import iconRetina from 'leaflet/dist/images/marker-icon-2x.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
    iconUrl: iconMarker,
    iconRetinaUrl: iconRetina,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

// Custom Icons
const meteorIcon = new L.Icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/3214/3214746.png', // Fallback or star icon
    iconSize: [40, 40],
    iconAnchor: [20, 20],
    className: 'animate-pulse' // Tailwind animation
});

// Map Resizer to fix Leaflet in Modals
const MapResizer = () => {
    const map = useMap();
    useEffect(() => {
        const resize = () => map.invalidateSize();
        // Trigger resize after mounting and a small delay for transition
        resize();
        const timer = setTimeout(resize, 300);
        return () => clearTimeout(timer);
    }, [map]);
    return null;
};

// Map Component for Modal
const DetailMap = ({ event }) => {
    // Estimating coordinate based on "Best Region" for visualization
    const getCoordinates = (region) => {
        if (region.includes("Northern")) return [45, -100];
        if (region.includes("Southern")) return [-25, 135];
        return [0, 0]; // Global
    };

    const position = getCoordinates(event.geographic_visibility.best_region);
    const [userPos, setUserPos] = useState(null);

    useEffect(() => {
        navigator.geolocation.getCurrentPosition(
            (pos) => setUserPos([pos.coords.latitude, pos.coords.longitude]),
            () => console.log("Location access denied")
        );
    }, []);

    return (
        <MapContainer center={position} zoom={2} style={{ height: "100%", width: "100%", background: "#0a0e17" }}>
            <MapResizer />
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            />
            {/* Meteor Radiant Area Highlight */}
            <Circle
                center={position}
                radius={3500000}
                pathOptions={{
                    color: '#00d9ff',
                    fillColor: '#00d9ff',
                    fillOpacity: 0.1,
                    weight: 1,
                    dashArray: '5, 5'
                }}
            />
            {/* Meteor Radiant */}
            <Marker position={position} icon={meteorIcon}>
                <Popup className="custom-popup">
                    <div className="text-center">
                        <strong className="block text-purple-600">Meteor Radiant</strong>
                        <span className="text-xs text-gray-500">Best Visibility Region</span>
                    </div>
                </Popup>
            </Marker>

            {/* User Location */}
            {userPos && (
                <Marker position={userPos}>
                    <Popup>You are here</Popup>
                </Marker>
            )}
        </MapContainer>
    );
};


const MeteorCalendar = () => {
    const navigate = useNavigate();
    const [filter, setFilter] = useState('all');
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [showInfoModal, setShowInfoModal] = useState(false);

    return (
        <div className="flex h-screen bg-[#050714] text-slate-300 font-sans overflow-hidden">
            {/* === MAIN CONTENT (Full Width) === */}
            <div className="flex-1 flex flex-col w-full bg-[#050714] relative overflow-y-auto scrollbar-thin scrollbar-thumb-slate-800">

                {/* Background Atmosphere */}
                <div className="fixed top-[-20%] right-[-10%] w-[800px] h-[800px] bg-purple-600/5 rounded-full blur-[120px] pointer-events-none" />
                <div className="fixed bottom-[-20%] left-[-10%] w-[600px] h-[600px] bg-[#00d9ff]/5 rounded-full blur-[100px] pointer-events-none" />

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
                                <WiMeteor className="text-[#00d9ff] text-3xl" />
                                METEOR <span className="text-slate-500">SURVEILLANCE</span>
                            </h1>
                            <p className="text-xs text-[#00d9ff] font-mono tracking-widest uppercase">
                                Celestial Event Log // 2026-2027
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <button className="px-4 py-2 rounded-lg bg-black/40 border border-white/10 text-xs font-bold uppercase tracking-wider text-slate-400 hover:text-white hover:border-white/20 transition-all flex items-center gap-2">
                            <MdFilterList /> Filter by Visibility
                        </button>
                        <button className="px-4 py-2 rounded-lg bg-[#00d9ff]/10 border border-[#00d9ff]/30 text-[#00d9ff] text-xs font-bold uppercase tracking-wider hover:bg-[#00d9ff] hover:text-black transition-all shadow-[0_0_15px_rgba(0,217,255,0.2)]">
                            Sync to Calendar
                        </button>
                        <button
                            onClick={() => setShowInfoModal(true)}
                            className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-xs font-bold uppercase tracking-wider text-slate-400 hover:text-white hover:border-white/20 transition-all flex items-center gap-2"
                        >
                            <MdInfoOutline className="text-lg" />
                            Learn More
                        </button>
                    </div>
                </header>

                {/* Content Grid */}
                <div className="p-8 max-w-[1600px] mx-auto w-full">

                    {/* Featured / Next Event */}
                    <div className="mb-10 relative group">
                        <div className="absolute inset-0 bg-gradient-to-r from-[#00d9ff]/20 to-purple-600/20 rounded-3xl blur opacity-20 group-hover:opacity-30 transition-opacity duration-500"></div>
                        <div className="relative h-[350px] rounded-3xl overflow-hidden border border-white/10 group-hover:border-[#00d9ff]/30 transition-all duration-500">
                            {/* Background Image */}
                            <img
                                src={meteorEvents[0].image_url}
                                alt="Featured Meteor Shower"
                                className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-700"
                            />
                            <div className="absolute inset-0 bg-gradient-to-r from-[#050714] via-[#050714]/80 to-transparent"></div>

                            {/* Content */}
                            <div className="relative z-10 p-10 h-full flex flex-col justify-center max-w-2xl">
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-[#00d9ff]/10 border border-[#00d9ff]/30 text-[#00d9ff] text-[10px] font-bold uppercase tracking-widest w-fit mb-4">
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#00d9ff] animate-pulse"></span>
                                    Approaching Peak
                                </div>
                                <h2 className="text-5xl font-black text-white mb-2 tracking-tight">{meteorEvents[0].name}</h2>
                                <p className="text-lg text-slate-300 mb-6 font-light border-l-2 border-[#00d9ff] pl-4">
                                    {meteorEvents[0].description}
                                </p>

                                <div className="grid grid-cols-3 gap-6">
                                    <div>
                                        <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">Peak Date (UTC)</div>
                                        <div className="text-xl font-mono text-white">
                                            {new Date(meteorEvents[0].peak_date_utc).toLocaleDateString('en-US', { month: 'short', day: '2-digit' })}
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">ZHR Intensity</div>
                                        <div className="text-xl font-mono text-[#00d9ff] flex items-center gap-2">
                                            {meteorEvents[0].zhr} <span className="text-xs text-slate-500">m/h</span>
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">Visibility</div>
                                        <div className="text-xl font-mono text-green-400">
                                            {meteorEvents[0].visibility_score}%
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Timeline Grid */}
                    <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                        <MdCalendarMonth className="text-slate-500" />
                        Upcoming Sequence
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {meteorEvents.slice(1).map((event) => (
                            <div
                                key={event.id}
                                className="bg-black/30 backdrop-blur-md border border-white/5 rounded-2xl overflow-hidden hover:border-[#00d9ff]/30 hover:bg-black/50 transition-all duration-300 group flex flex-col h-full"
                            >
                                {/* Card Image Header */}
                                <div className="h-40 relative overflow-hidden">
                                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent z-10"></div>
                                    <img
                                        src={event.image_url}
                                        alt={event.name}
                                        className="w-full h-full object-cover opacity-70 group-hover:scale-110 transition-transform duration-700"
                                    />
                                    <div className="absolute bottom-3 left-4 z-20">
                                        <h4 className="text-2xl font-bold text-white">{event.name}</h4>
                                    </div>
                                    <div className="absolute top-3 right-3 z-20 px-2 py-1 bg-black/60 backdrop-blur rounded border border-white/10 text-[10px] font-mono text-[#00d9ff]">
                                        ZHR {event.zhr}
                                    </div>
                                </div>

                                {/* Card Body */}
                                <div className="p-5 flex-1 flex flex-col justify-between">
                                    <div>
                                        <div className="flex justify-between items-start mb-4 border-b border-white/5 pb-4">
                                            <div>
                                                <div className="text-[10px] text-slate-500 uppercase font-bold">Peak Date</div>
                                                <div className="text-xs text-slate-300 font-mono">
                                                    {new Date(event.peak_date_utc).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-[10px] text-slate-500 uppercase font-bold">Time (UTC)</div>
                                                <div className="text-xs text-[#00d9ff] font-mono font-bold">
                                                    {new Date(event.peak_date_utc).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                                                </div>
                                            </div>
                                        </div>

                                        <p className="text-sm text-slate-400 leading-relaxed mb-4 line-clamp-2">
                                            {event.description}
                                        </p>

                                        <div className="flex items-start gap-2 text-xs text-slate-500 bg-white/5 p-2 rounded-lg border border-white/5">
                                            <MdInfoOutline className="text-[#00d9ff] mt-0.5 shrink-0" />
                                            <span>{event.geographic_visibility.notes}</span>
                                        </div>
                                    </div>

                                    <div className="mt-5 flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <MdPublic className="text-slate-600" />
                                            <span className="text-[10px] text-slate-500 uppercase font-bold">
                                                {event.geographic_visibility.best_region.split(' ')[0]}
                                            </span>
                                        </div>
                                        <button
                                            onClick={() => setSelectedEvent(event)}
                                            className="text-[10px] font-bold text-[#00d9ff] hover:text-white transition-colors uppercase tracking-wider flex items-center gap-1 group-hover:translate-x-1 transition-transform"
                                        >
                                            Details <MdChevronLeft className="rotate-180" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                </div>
            </div>

            {/* === DETAIL MODAL === */}
            {selectedEvent && (
                <div className="fixed inset-0 z-[2000] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 md:p-8 animate-fade-in">
                    <div className="relative w-full h-[85vh] max-w-6xl bg-[#0a0e17] rounded-3xl border border-white/10 shadow-2xl overflow-hidden flex flex-col">

                        {/* Close Button */}
                        <button
                            onClick={() => setSelectedEvent(null)}
                            className="absolute top-6 right-6 z-[2001] w-10 h-10 bg-black/50 backdrop-blur rounded-full border border-white/10 flex items-center justify-center text-white hover:bg-white/10 transition-all"
                        >
                            <MdClose className="text-xl" />
                        </button>

                        {/* Top: Map (Flexible Height) */}
                        <div className="flex-1 min-h-0 relative border-b border-white/10 bg-[#0a0e17]">
                            <DetailMap event={selectedEvent} />
                            {/* Map Overlay Title */}
                            <div className="absolute top-6 left-6 z-[1000] bg-black/60 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10 pointer-events-none">
                                <h2 className="text-2xl font-bold text-white tracking-widest uppercase">{selectedEvent.name}</h2>
                                <div className="text-[#00d9ff] text-xs font-mono">GLOBAL VISIBILITY MAP</div>
                            </div>
                        </div>

                        {/* Bottom: Details Grid (Fixed Content Height) */}
                        <div className="shrink-0 h-auto min-h-[300px] bg-black/40 backdrop-blur-xl p-6 md:p-8 grid grid-cols-1 md:grid-cols-3 gap-8 overflow-y-auto">

                            {/* Col 1: Core Info */}
                            <div className="space-y-6">
                                <div>
                                    <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">Peak Date & Time</div>
                                    <div className="text-2xl text-white font-mono">
                                        {new Date(selectedEvent.peak_date_utc).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
                                    </div>
                                    <div className="text-[#00d9ff] font-mono text-sm">
                                        @ {new Date(selectedEvent.peak_date_utc).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })} UTC
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">ZHR (Rate)</div>
                                        <div className="text-xl text-white font-bold">{selectedEvent.zhr} <span className="text-sm text-slate-500 font-normal"> meteors/hr</span></div>
                                    </div>
                                    <div>
                                        <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">Moon Phase</div>
                                        <div className="text-xl text-white font-bold">Waning</div>
                                    </div>
                                </div>
                            </div>

                            {/* Col 2: Visibility & Description */}
                            <div className="space-y-6 border-l border-white/5 pl-8">
                                <div>
                                    <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">Visibility Score</div>
                                    <div className="flex items-center gap-3">
                                        <div className="text-4xl font-bold text-[#00ff88]">{selectedEvent.visibility_score}%</div>
                                        <div className="text-xs text-slate-400 max-w-[150px]">{selectedEvent.geographic_visibility.notes}</div>
                                    </div>
                                </div>
                                <div>
                                    <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">Region</div>
                                    <div className="flex items-center gap-2 text-white">
                                        <MdLocationOn className="text-[#00d9ff]" />
                                        {selectedEvent.geographic_visibility.best_region}
                                    </div>
                                </div>
                            </div>

                            {/* Col 3: Image */}
                            <div className="relative rounded-2xl overflow-hidden border border-white/10 group h-full max-h-[250px] min-h-0">
                                <img
                                    src={selectedEvent.image_url}
                                    alt={selectedEvent.name}
                                    className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-700"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                                <div className="absolute bottom-4 left-4 text-xs text-slate-400">
                                    Image Credit: {selectedEvent.image_credit}
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            )}

            <FeatureInfoModal
                isOpen={showInfoModal}
                onClose={() => setShowInfoModal(false)}
                title="Meteor Shower Surveillance"
                imageSrc={meteorImage}
                features={[
                    {
                        title: "What are Meteor Showers?",
                        desc: "Meteor showers occur when Earth passes through debris trails left by comets. As these particles burn up in our atmosphere, they create the spectacular streaks of light we see as 'shooting stars'.",
                        icon: <WiMeteor className="text-xl" />
                    },
                    {
                        title: "How do Satellites Help?",
                        desc: "Satellites and high-altitude sensors track atmospheric entry events and monitor orbital debris fields. This data helps predict the exact timing and intensity (ZHR) of showers, allowing for precise global visibility forecasts.",
                        icon: <MdSatelliteAlt className="text-lg" />
                    },
                    {
                        title: "What is ZHR?",
                        desc: "Zenith Hourly Rate (ZHR) is the number of meteors a single observer would see in one hour under perfect conditions. This dashboard tracks this key metric to tell you which events are worth staying up for.",
                        icon: <MdInsights className="text-lg" />
                    },
                    {
                        title: "How to use this Dashboard?",
                        desc: "Use the 'Upcoming Sequence' to find the next major event. Check the 'Visibility Score' and 'Moon Phase' to determine viewing quality—darker skies mean more visible meteors.",
                        icon: <MdVisibility className="text-lg" />
                    }
                ]}
                readMoreLink="https://www.imo.net/"
            />
        </div>
    );
};

export default MeteorCalendar;