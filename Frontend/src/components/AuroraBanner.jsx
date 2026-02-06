import React from 'react';
import { BsFillLightningChargeFill } from 'react-icons/bs';
import { WiStars } from 'react-icons/wi';

const AuroraBanner = ({ auroraData }) => {
    // Helpers
    const kpIndex = auroraData?.kp_index || (auroraData?.length > 0 ? auroraData[auroraData.length - 1].kp_index : 0) || 2.3;
    const probability = auroraData?.probability || 15;

    const getStatus = (kp) => {
        if (kp >= 6) return { text: "EXTREME STORM", color: "text-red-500", glow: "shadow-red-500/50" };
        if (kp >= 5) return { text: "HIGH ACTIVITY", color: "text-orange-500", glow: "shadow-orange-500/50" };
        if (kp >= 4) return { text: "MODERATE", color: "text-yellow-400", glow: "shadow-yellow-400/50" };
        return { text: "LOW ACTIVITY", color: "text-green-400", glow: "shadow-green-400/50" };
    };

    const status = getStatus(kpIndex);

    return (
        <div className="relative w-full h-full overflow-hidden">
            {/* Background */}
            <div className="absolute inset-0 z-0 bg-[#050810]">
                {/* Aurora Image */}
                <img
                    src="https://images.unsplash.com/photo-1531366936337-7c912a4589a7?q=80&w=2070&auto=format&fit=crop"
                    alt="Aurora Borealis"
                    className="w-full h-full object-cover opacity-60"
                />
                {/* Green/Purple Gradient Overlay matching current status potentially */}
                <div className="absolute inset-0 bg-gradient-to-r from-[#050810] via-[#050810]/60 to-transparent" />
                <div className={`absolute top-0 right-0 w-full h-full bg-gradient-to-l from-green-500/10 to-transparent opacity-50 mix-blend-overlay`} />
            </div>

            {/* Content */}
            <div className="relative z-10 h-full flex flex-col justify-center p-8 md:p-12 max-w-4xl">
                <div className="flex items-center gap-3 mb-4">
                    <span className={`px-3 py-1 bg-white/10 ${status.color} font-bold text-xs rounded uppercase tracking-wider border border-current shadow-[0_0_15px_rgba(0,0,0,0.2)]`}>
                        Space Weather
                    </span>
                    <span className="flex items-center gap-1 text-xs font-bold text-slate-300 bg-white/10 px-3 py-1 rounded border border-white/10">
                        <WiStars size={16} /> Aurora
                    </span>
                </div>

                <h1 className="text-4xl md:text-6xl font-black text-white leading-none mb-4 md:mb-6 uppercase tracking-tight drop-shadow-lg">
                    Aurora <br /> Borealis
                </h1>

                <div className="flex items-end gap-x-8 gap-y-4 flex-wrap mb-6">
                    <div className="bg-black/40 backdrop-blur-md border border-white/10 p-4 rounded-xl">
                        <span className="text-xs text-slate-400 uppercase font-bold mb-1 block">Kp Index</span>
                        <div className={`text-5xl font-black ${status.color} drop-shadow-[0_0_10px_rgba(0,0,0,0.5)]`}>
                            {parseFloat(kpIndex).toFixed(1)}
                        </div>
                    </div>

                    <div className="mb-2">
                        <div className={`text-2xl font-bold ${status.color} mb-1 tracking-wider`}>
                            {status.text}
                        </div>
                        <p className="text-slate-400 text-sm">
                            Visibility Probability: <span className="text-white font-bold">{probability}%</span>
                        </p>
                    </div>
                </div>

                <div className="w-full max-w-md bg-white/10 h-1 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-green-400 via-yellow-400 to-red-500 transition-all duration-1000 ease-out"
                        style={{ width: `${(kpIndex / 9) * 100}%` }}
                    />
                </div>
                <div className="w-full max-w-md flex justify-between text-[9px] text-slate-500 mt-1 font-mono uppercase">
                    <span>Low (0)</span>
                    <span>Storm (5+)</span>
                    <span>Extreme (9)</span>
                </div>

            </div>
        </div>
    );
};

export default AuroraBanner;
