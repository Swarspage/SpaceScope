import React, { useState, useEffect } from 'react';

const HeaderGreeting = ({ user }) => {
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
        <div className="flex flex-col justify-center h-full py-1">
            <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight uppercase leading-none drop-shadow-lg">
                {getGreeting()}, <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00d9ff] to-blue-600 filter drop-shadow-[0_0_8px_rgba(0,217,255,0.3)]">{user?.fullName?.split(' ')[0] || user?.username || "Explorer"}</span>
            </h1>
            <div className="flex items-center gap-3 mt-1.5">
                <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-[#00d9ff]/10 border border-[#00d9ff]/20 text-[#00d9ff] text-[10px] font-bold tracking-widest uppercase shadow-[0_0_10px_rgba(0,217,255,0.1)]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#00d9ff] animate-pulse" /> Systems Nominal
                </span>
                <span className="text-slate-500 font-mono text-[10px] tracking-wide border-l border-white/10 pl-3">UTC {formatUTC()}</span>
            </div>
        </div>
    );
};

export default React.memo(HeaderGreeting);
