import React, { useState, useEffect } from 'react';

const DashboardHeader = ({ user, quote }) => {
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const formatUTC = () => currentTime.toUTCString().split(' ')[4];

    const getGreeting = () => {
        const hours = currentTime.getHours();
        if (hours < 12) return "Good Morning";
        if (hours < 18) return "Good Afternoon";
        return "Good Evening";
    };

    return (
        <div>
            <div className="flex items-center gap-3 mb-2">
                <span className="px-2 py-0.5 rounded bg-green-500/10 border border-green-500/20 text-green-400 text-[10px] font-bold tracking-wider uppercase">
                    Systems Nominal
                </span>
                <span className="text-slate-400 font-mono text-xs">UTC {formatUTC()}</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-white uppercase tracking-tight leading-none">
                {getGreeting()}, <br />
                <span className="text-[#00d9ff]">{user?.fullName?.split(' ')[0] || user?.username || "Explorer"}</span>
            </h2>
            <div className="mt-2 text-slate-400 text-sm italic border-l-2 border-[#00d9ff] pl-3 py-1">
                "{quote.text}" <span className="text-slate-600 block text-xs not-italic mt-0.5">— {quote.author}</span>
            </div>
        </div>
    );
};

export default React.memo(DashboardHeader);
