import React, { useMemo } from 'react';
import CountdownTimer from './CountdownTimer';
import { MdRocketLaunch, MdCalendarToday, MdLocationOn } from 'react-icons/md';
import { SiSpacex, SiNasa } from 'react-icons/si';

const UpcomingEventBanner = ({ event }) => {
    if (!event) return null;

    const eventDate = new Date(event.date_utc || event.date || event.launch_date);
    const provider = event.rocket?.configuration?.name || event.provider || 'SPACEX'; // Heuristic

    // Background Image Logic (Simple heuristic for now, could be enhanced)
    const bgImage = event.links?.flickr?.original?.[0]
        || "https://images.unsplash.com/photo-1517976487492-5750f3195933?q=80&w=2000&auto=format&fit=crop";

    const getProviderIcon = (p) => {
        const lower = String(p).toLowerCase();
        if (lower.includes('spacex') || lower.includes('falcon')) return <SiSpacex />;
        if (lower.includes('nasa')) return <SiNasa />;
        return <MdRocketLaunch />;
    };

    return (
        <div className="relative w-full h-[350px] md:h-[400px] rounded-2xl overflow-hidden border border-white/10 group">
            {/* Background Image with Overlay */}
            <div className="absolute inset-0 z-0">
                <img
                    src={bgImage}
                    alt="Launch Background"
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-[#050810] via-[#050810]/80 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#050810] via-transparent to-transparent" />
            </div>

            {/* Glowing Effects */}
            <div className="absolute -left-20 -bottom-20 w-[400px] h-[400px] bg-[#00d9ff]/20 rounded-full blur-[100px] pointer-events-none" />

            {/* Content */}
            <div className="relative z-10 h-full flex flex-col justify-center p-8 md:p-12 max-w-4xl">
                {/* Badge */}
                <div className="flex items-center gap-3 mb-4 animate-fade-in-up">
                    <span className="px-3 py-1 bg-[#00d9ff] text-black font-bold text-xs rounded uppercase tracking-wider shadow-[0_0_15px_rgba(0,217,255,0.4)]">
                        Upcoming Launch
                    </span>
                    <span className="flex items-center gap-1 text-xs font-bold text-slate-300 bg-white/10 px-3 py-1 rounded border border-white/10">
                        {getProviderIcon(provider)} {provider}
                    </span>
                </div>

                {/* Title */}
                <h1 className="text-4xl md:text-6xl font-black text-white leading-none mb-4 md:mb-6 uppercase tracking-tight drop-shadow-lg animate-fade-in-up delay-100">
                    {event.name}
                </h1>

                {/* Details */}
                <div className="flex flex-wrap items-center gap-6 mb-8 text-sm md:text-base text-slate-300 font-mono animate-fade-in-up delay-200">
                    <div className="flex items-center gap-2">
                        <MdCalendarToday className="text-[#00d9ff]" />
                        {eventDate.toLocaleString(undefined, { dateStyle: 'long', timeStyle: 'short' })}
                    </div>
                    {/* Location if available (SpaceX API often gives launchpad ID, would need lookup, skipping for simple banner unless enriched) */}
                </div>

                {/* Timer Section */}
                <div className="animate-fade-in-up delay-300">
                    <div className="inline-block bg-black/40 backdrop-blur-md border border-white/10 rounded-2xl p-6 md:px-10 md:py-6">
                        <CountdownTimer targetDate={eventDate} size="large" />
                    </div>
                </div>
            </div>

            {/* Right Side Info (Optional - for visual balance) */}
            <div className="hidden md:block absolute right-10 bottom-10 max-w-xs text-right animate-fade-in text-slate-400 text-xs">
                <p className="line-clamp-3">
                    {event.details || "Mission details are classified or not yet available. Prepare for liftoff."}
                </p>
            </div>
        </div>
    );
};

export default UpcomingEventBanner;
