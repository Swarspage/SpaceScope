import React from 'react';
import { Lock, Check, ChevronRight, Star, Trophy, MapPin } from 'lucide-react';

const ModuleJourney = ({ modules, moduleProgress, onModuleSelect }) => {
    // Calculate overall progress
    const totalModules = modules.length;
    const completedModules = modules.filter(m => moduleProgress[m.id]?.status === 'completed').length;
    const overallProgress = Math.round((completedModules / totalModules) * 100);

    return (
        <div className="w-full max-w-7xl mx-auto px-4 py-8 relative">
            {/* Background Ambience */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-[100px] pointer-events-none" />

            {/* Header & Overall Progress */}
            <div className="mb-12 relative z-10">
                <div className="bg-[#0f1322]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-xl">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                                <MapPin className="text-[#00d9ff]" />
                                Your Learning Journey
                            </h2>
                            <p className="text-slate-400 text-sm mt-1">Master space science one module at a time</p>
                        </div>
                        <div className="text-right">
                            <div className="text-3xl font-black text-[#00d9ff]">{overallProgress}%</div>
                            <div className="text-xs text-slate-500 uppercase font-bold tracking-wider">Complete</div>
                        </div>
                    </div>

                    <div className="w-full h-3 bg-[#0a0e17] rounded-full overflow-hidden border border-white/5">
                        <div
                            className="h-full bg-gradient-to-r from-[#00d9ff] to-[#00ff88] transition-all duration-1000 ease-out"
                            style={{ width: `${overallProgress}%` }}
                        />
                    </div>
                </div>
            </div>

            {/* Modules Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10 px-4">
                {/* Connecting Line (Desktop) */}
                <div className="hidden md:block absolute top-[100px] bottom-20 left-[16.666%] w-0.5 bg-gradient-to-b from-[#00d9ff]/20 to-transparent -z-10" />
                <div className="hidden md:block absolute top-[100px] bottom-20 left-[50%] w-0.5 bg-gradient-to-b from-[#00d9ff]/20 to-transparent -z-10" />
                <div className="hidden md:block absolute top-[100px] bottom-20 left-[83.333%] w-0.5 bg-gradient-to-b from-[#00d9ff]/20 to-transparent -z-10" />

                {modules.map((module) => {
                    // Status Logic:
                    // 1. If explicit state exists, use it.
                    // 2. Fallback to default unlocked property.
                    // 3. IMPORTANT: If previous module is complete, this one is unlocked.

                    let status = 'locked';
                    const modState = moduleProgress[module.id];
                    if (modState) {
                        status = modState.status;
                        // If DB says unlocked (e.g. pre-unlocked), trust it
                        if (modState.unlocked) status = (status === 'locked' ? 'unlocked' : status);
                    } else if (module.unlocked_by_default) {
                        status = 'unlocked';
                    }

                    // Force unlocked if not explicitly locked and previous completed (redundant if DB logic works, but UI safety)
                    // Actually, let's rely on what `LearningPage` passes in via `moduleProgress` map which should have handled logic.
                    // But to be safe:
                    const isLocked = status === 'locked' && !module.unlocked_by_default && (!modState || !modState.unlocked);
                    const isCompleted = status === 'completed';
                    const isInProgress = status === 'in-progress' || (status === 'unlocked' && !isCompleted); // unlocked treated as ready to start
                    const progress = modState?.progress || 0;

                    return (
                        <div
                            key={module.id}
                            onClick={() => !isLocked && onModuleSelect(module)}
                            className={`
                group relative flex flex-col items-center text-center p-6 rounded-3xl transition-all duration-300
                ${isLocked
                                    ? 'bg-[#0a0e17]/50 border border-white/5 grayscale opacity-60 cursor-not-allowed'
                                    : 'bg-[#0f1322]/80 backdrop-blur-lg border border-white/10 cursor-pointer hover:-translate-y-2 hover:shadow-[0_0_30px_rgba(0,217,255,0.15)]'
                                }
                ${isInProgress ? 'border-[#00d9ff]/50 shadow-[0_0_20px_rgba(0,217,255,0.1)]' : ''}
              `}
                        >
                            {/* Status Badge */}
                            <div className="absolute top-4 right-4">
                                {isLocked && <Lock size={16} className="text-slate-500" />}
                                {isCompleted && (
                                    <div className="w-6 h-6 rounded-full bg-[#00ff88]/20 flex items-center justify-center border border-[#00ff88]">
                                        <Check size={14} className="text-[#00ff88]" />
                                    </div>
                                )}
                            </div>

                            {/* Icon */}
                            <div className={`
                w-20 h-20 rounded-full flex items-center justify-center text-4xl mb-4 shadow-lg relative
                ${isLocked ? 'bg-slate-800 text-slate-600' : 'bg-gradient-to-br from-[#1a2333] to-[#0a0e17] text-white border border-white/10 group-hover:scale-110 transition-transform duration-300'}
                ${isInProgress ? 'ring-2 ring-[#00d9ff] ring-offset-2 ring-offset-[#0a0e17]' : ''}
              `}>
                                {module.icon}
                                {isInProgress && (
                                    <svg className="absolute inset-0 w-full h-full rotate-[-90deg]" viewBox="0 0 36 36">
                                        <path
                                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                            fill="none"
                                            stroke="#00d9ff"
                                            strokeWidth="2"
                                            strokeDasharray={`${progress}, 100`}
                                        />
                                    </svg>
                                )}
                            </div>

                            {/* Content */}
                            <h3 className={`text-lg font-bold mb-2 ${isLocked ? 'text-slate-500' : 'text-white'}`}>
                                {module.title}
                            </h3>
                            <p className="text-xs text-slate-400 mb-4 h-8 line-clamp-2">
                                {module.description}
                            </p>

                            {/* Footer */}
                            <div className="mt-auto w-full pt-4 border-t border-white/5 flex items-center justify-between">
                                <div className="flex items-center gap-1.5 text-xs font-bold text-[#fbbf24]">
                                    <Star size={12} fill="currentColor" />
                                    <span>{module.xp_reward} XP</span>
                                </div>

                                {isCompleted && (
                                    <div className="text-[10px] bg-[#fbbf24]/10 text-[#fbbf24] px-2 py-0.5 rounded border border-[#fbbf24]/20 truncate max-w-[100px]">
                                        {module.badge}
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default ModuleJourney;
