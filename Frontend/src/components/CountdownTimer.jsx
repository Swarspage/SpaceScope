import React, { useState, useEffect } from 'react';

const CountdownTimer = ({ targetDate, size = "normal" }) => {
    const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0, isPast: false });

    useEffect(() => {
        if (!targetDate) return;

        const calculate = () => {
            const now = new Date().getTime();
            const target = new Date(targetDate).getTime();
            let diff = target - now;
            const isPast = diff < 0;

            if (isPast) diff = Math.abs(diff);

            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diff % (1000 * 60)) / 1000);

            setTimeLeft({ days, hours, minutes, seconds, isPast });
        };

        calculate();
        const timer = setInterval(calculate, 1000);
        return () => clearInterval(timer);
    }, [targetDate]);

    // Scaling classes based on size prop
    const textSize = size === "large" ? "text-3xl md:text-5xl" : "text-2xl md:text-3xl";
    const labelSize = size === "large" ? "text-xs md:text-sm" : "text-[9px]";
    const gap = size === "large" ? "gap-4 md:gap-6" : "gap-3";

    return (
        <div className="flex flex-col items-center">
            <div className={`text-[10px] font-bold uppercase tracking-[0.2em] mb-2 ${timeLeft.isPast ? 'text-[#00ff88]' : 'text-[#00d9ff]'}`}>
                {timeLeft.isPast ? 'MISSION ELAPSED TIME (T+)' : 'T-MINUS COUNTDOWN'}
            </div>
            <div className={`flex items-center ${gap} font-mono text-white`}>
                <div className="text-center">
                    <div className={`${textSize} font-bold leading-none`}>{String(timeLeft.days).padStart(2, '0')}</div>
                    <div className={`${labelSize} text-slate-500 uppercase mt-1`}>Days</div>
                </div>
                <div className={`${textSize} text-slate-600`}>:</div>
                <div className="text-center">
                    <div className={`${textSize} font-bold leading-none`}>{String(timeLeft.hours).padStart(2, '0')}</div>
                    <div className={`${labelSize} text-slate-500 uppercase mt-1`}>Hrs</div>
                </div>
                <div className={`${textSize} text-slate-600`}>:</div>
                <div className="text-center">
                    <div className={`${textSize} font-bold leading-none`}>{String(timeLeft.minutes).padStart(2, '0')}</div>
                    <div className={`${labelSize} text-slate-500 uppercase mt-1`}>Mins</div>
                </div>
                <div className={`${textSize} text-slate-600`}>:</div>
                <div className="text-center">
                    <div className={`${textSize} font-bold leading-none text-[#00d9ff]`}>{String(timeLeft.seconds).padStart(2, '0')}</div>
                    <div className={`${labelSize} text-slate-500 uppercase mt-1`}>Secs</div>
                </div>
            </div>
        </div>
    );
};

export default CountdownTimer;
