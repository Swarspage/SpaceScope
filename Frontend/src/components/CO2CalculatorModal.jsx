import React, { useState, useEffect } from 'react';
import { X, TreePine, Car, Zap, RefreshCw, Leaf, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const TARGET_OFFSET = 150000; // Goal: 150k tonnes

const CircularProgress = ({ progress }) => {
    const radius = 60;
    const stroke = 8;
    const normalizedRadius = radius - stroke * 2;
    const circumference = normalizedRadius * 2 * Math.PI;
    const strokeDashoffset = circumference - (progress / 100) * circumference;

    return (
        <div className="relative flex items-center justify-center w-40 h-40">
            <svg
                height={radius * 2}
                width={radius * 2}
                className="transform -rotate-90"
            >
                {/* Track */}
                <circle
                    stroke="#1e293b"
                    strokeWidth={stroke}
                    fill="transparent"
                    r={normalizedRadius}
                    cx={radius}
                    cy={radius}
                />
                {/* Progress */}
                <circle
                    stroke={progress >= 100 ? "#00ff88" : "#00d9ff"}
                    strokeWidth={stroke}
                    strokeDasharray={circumference + ' ' + circumference}
                    style={{ strokeDashoffset, transition: 'stroke-dashoffset 0.5s ease-in-out, stroke 0.5s ease' }}
                    strokeLinecap="round"
                    fill="transparent"
                    r={normalizedRadius}
                    cx={radius}
                    cy={radius}
                />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                {progress >= 100 ? (
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="text-[#00ff88]"
                    >
                        <CheckCircle size={32} />
                    </motion.div>
                ) : (
                    <>
                        <span className="text-3xl font-black text-white">{Math.min(100, Math.round(progress))}%</span>
                        <span className="text-[10px] text-slate-400 uppercase tracking-widest">Solved</span>
                    </>
                )}
            </div>
        </div>
    );
};

const CO2CalculatorModal = ({ isOpen, onClose }) => {
    const [trees, setTrees] = useState(0);
    const [vehicles, setVehicles] = useState(0);
    const [solar, setSolar] = useState(0);
    const [totalOffset, setTotalOffset] = useState(0);
    const [progress, setProgress] = useState(0);

    // Annual CO2 offset factors (approximate tonnes)
    const FACTOR_TREE = 0.02;     // 20kg per tree/year
    const FACTOR_CAR = 4.6;       // 4.6 tonnes per car/year
    const FACTOR_SOLAR = 1.5;     // 1.5 tonnes per panel/year

    useEffect(() => {
        const offset = (trees * FACTOR_TREE) + (vehicles * FACTOR_CAR) + (solar * FACTOR_SOLAR);
        setTotalOffset(offset);
        const pct = (offset / TARGET_OFFSET) * 100;
        setProgress(pct);
    }, [trees, vehicles, solar]);

    if (!isOpen) return null;

    const isCrisisAverted = progress >= 100;

    return (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose}></div>

            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className={`relative bg-[#0a0e17] w-full max-w-4xl rounded-3xl border transition-colors duration-500 shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[90vh] ${isCrisisAverted ? 'border-[#00ff88] shadow-[0_0_100px_rgba(0,255,136,0.2)]' : 'border-white/10'}`}
            >
                {/* Confetti / Celebration Overlay */}
                {isCrisisAverted && (
                    <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
                        {[...Array(20)].map((_, i) => (
                            <motion.div
                                key={i}
                                initial={{ y: -50, opacity: 1 }}
                                animate={{ y: 800, opacity: 0, rotate: 360 }}
                                transition={{ duration: 2 + Math.random() * 2, repeat: Infinity, delay: Math.random() * 2 }}
                                className="absolute w-2 h-2 rounded-full"
                                style={{
                                    left: `${Math.random() * 100}%`,
                                    backgroundColor: Math.random() > 0.5 ? '#00ff88' : '#00d9ff'
                                }}
                            />
                        ))}
                    </div>
                )}

                {/* Left Panel: Sliders */}
                <div className="flex-1 p-6 md:p-8 flex flex-col relative z-10">
                    <div className="flex justify-between items-center mb-6">
                        <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-xl transition-colors ${isCrisisAverted ? 'bg-[#00ff88] text-black' : 'bg-white/5 text-white'}`}>
                                <Leaf size={24} />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-white">Impact Simulator</h2>
                                <p className="text-xs text-slate-400 uppercase tracking-wider">Target: {TARGET_OFFSET.toLocaleString()} tonnes</p>
                            </div>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full text-slate-400 hover:text-white">
                            <X size={20} />
                        </button>
                    </div>

                    <div className="space-y-8 flex-1 overflow-y-auto pr-2">
                        {/* Trees */}
                        <div>
                            <div className="flex justify-between mb-2">
                                <label className="flex items-center gap-2 text-[#00ff88] font-bold text-sm uppercase tracking-wide">
                                    <TreePine size={16} /> Plant Trees
                                </label>
                                <span className="font-mono text-white text-sm">{trees.toLocaleString()}</span>
                            </div>
                            <input
                                type="range"
                                min="0" max="5000000" step="5000"
                                value={trees}
                                onChange={(e) => setTrees(Number(e.target.value))}
                                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-[#00ff88]"
                            />
                        </div>

                        {/* Vehicles */}
                        <div>
                            <div className="flex justify-between mb-2">
                                <label className="flex items-center gap-2 text-[#00d9ff] font-bold text-sm uppercase tracking-wide">
                                    <Car size={16} /> Remove Cars
                                </label>
                                <span className="font-mono text-white text-sm">{vehicles.toLocaleString()}</span>
                            </div>
                            <input
                                type="range"
                                min="0" max="30000" step="100"
                                value={vehicles}
                                onChange={(e) => setVehicles(Number(e.target.value))}
                                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-[#00d9ff]"
                            />
                        </div>

                        {/* Solar */}
                        <div>
                            <div className="flex justify-between mb-2">
                                <label className="flex items-center gap-2 text-yellow-400 font-bold text-sm uppercase tracking-wide">
                                    <Zap size={16} /> Solar Panels
                                </label>
                                <span className="font-mono text-white text-sm">{solar.toLocaleString()}</span>
                            </div>
                            <input
                                type="range"
                                min="0" max="50000" step="100"
                                value={solar}
                                onChange={(e) => setSolar(Number(e.target.value))}
                                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-yellow-400"
                            />
                        </div>
                    </div>
                </div>

                {/* Right Panel: Results & Visualization */}
                <div className={`w-full md:w-80 p-8 flex flex-col items-center justify-center text-center relative transition-colors duration-500 ${isCrisisAverted ? 'bg-gradient-to-b from-[#00ff88]/10 to-[#00ff88]/5' : 'bg-white/5'}`}>

                    <div className="mb-6">
                        <CircularProgress progress={progress} />
                    </div>

                    <div className="space-y-1 z-10">
                        {isCrisisAverted ? (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="space-y-2"
                            >
                                <div className="text-[#00ff88] font-black text-2xl uppercase tracking-widest text-shadow-glow">
                                    Crisis Averted
                                </div>
                                <div className="text-white text-sm">
                                    Great job! You've offset enough carbon to meet the city's climate goals.
                                </div>
                            </motion.div>
                        ) : (
                            <>
                                <div className="text-xs text-slate-400 uppercase tracking-widest font-bold">Projected Reduction</div>
                                <div className="text-3xl font-black text-white tabular-nums">
                                    {Math.round(totalOffset).toLocaleString()} <span className="text-sm text-slate-500 font-normal">t/yr</span>
                                </div>
                                <div className="text-xs text-slate-500 mt-2">
                                    Goal: {TARGET_OFFSET.toLocaleString()} tonnes
                                </div>
                            </>
                        )}
                    </div>
                </div>

            </motion.div>
        </div>
    );
};

export default CO2CalculatorModal;
