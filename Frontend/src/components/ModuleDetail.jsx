import React from 'react';
import {
    ArrowLeft,
    Play,
    FileText,
    HelpCircle,
    Check,
    Lock,
    Clock,
    Trophy
} from 'lucide-react';

const ModuleDetail = ({ module, progress, onBack, onOpenVideo, onOpenArticle, onOpenQuiz }) => {
    // If no module selected, return null (though parent should handle this)
    if (!module) return null;

    const contentItems = module.content || [];

    // Use completedContent array if available (mapped from DB), fallback to indices or legacy
    const completedArray = progress?.completedContent || [];
    const completedCount = contentItems.filter(item => completedArray.includes(item.type)).length;

    // Recalculate if needed, or trust progress percent
    const totalCount = contentItems.length;
    const progressPercent = Math.round((completedCount / totalCount) * 100);
    const isModuleComplete = progressPercent === 100;

    const getIcon = (type) => {
        switch (type) {
            case 'video': return <Play size={20} fill="currentColor" />;
            case 'article': return <FileText size={20} />;
            case 'quiz': return <HelpCircle size={20} />;
            default: return <FileText size={20} />;
        }
    };

    const getActionLabel = (type) => {
        switch (type) {
            case 'video': return 'Watch Video';
            case 'article': return 'Read Article';
            case 'quiz': return 'Take Quiz';
            default: return 'Start';
        }
    };

    const handleItemClick = (item) => {
        if (item.type === 'video') onOpenVideo(item);
        else if (item.type === 'article') onOpenArticle(item);
        else if (item.type === 'quiz') onOpenQuiz(item);
    };

    return (
        <div className="w-full max-w-5xl mx-auto px-4 py-6 relative animate-fade-in">
            {/* Navigation */}
            <button
                onClick={onBack}
                className="mb-6 flex items-center gap-2 text-slate-400 hover:text-white transition-colors group"
            >
                <div className="p-2 rounded-full bg-white/5 group-hover:bg-white/10">
                    <ArrowLeft size={16} />
                </div>
                <span className="text-sm font-medium">Back to Journey</span>
            </button>

            {/* Header */}
            <div className="bg-[#0f1322]/80 backdrop-blur-xl border border-white/10 rounded-3xl p-8 mb-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-[#00d9ff]/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />

                <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                    <div className="flex items-center gap-6">
                        <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-[#1a2333] to-[#0a0e17] border border-white/10 flex items-center justify-center text-5xl shadow-lg">
                            {module.icon}
                        </div>
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <h1 className="text-3xl font-bold text-white">{module.title}</h1>
                                {isModuleComplete && (
                                    <span className="px-3 py-1 bg-[#00ff88]/20 text-[#00ff88] text-xs font-bold rounded-full border border-[#00ff88]/30 flex items-center gap-1.5">
                                        <Check size={12} /> Completed
                                    </span>
                                )}
                            </div>
                            <p className="text-slate-400 text-lg">{module.description}</p>

                            <div className="mt-4 flex items-center gap-6 text-sm">
                                <div className="flex items-center gap-2 text-[#fbbf24]">
                                    <Trophy size={16} />
                                    <span className="font-bold">{module.xp_reward} XP Reward</span>
                                </div>
                                <div className="flex items-center gap-2 text-slate-400">
                                    <div className="w-32 h-2 bg-white/10 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-[#00d9ff] transition-all duration-500"
                                            style={{ width: `${progressPercent}%` }}
                                        />
                                    </div>
                                    <span>{completedCount}/{totalCount} Completed</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {contentItems.map((item, idx) => {
                    const isItemCompleted = completedArray.includes(item.type);
                    // Unlock logic: First item always unlocked, others unlock if previous is complete
                    // OR if module is already in progress/completed, we might want to check exact logic.
                    // For now, let's say all unlocked if module is unlocked, visual indication of completion.

                    return (
                        <div
                            key={idx}
                            className={`
                group bg-[#0f1322] border border-white/5 rounded-2xl p-6 hover:border-[#00d9ff]/30 transition-all hover:-translate-y-1
                ${isItemCompleted ? 'border-[#00ff88]/30' : ''}
              `}
                        >
                            <div className="flex items-start justify-between mb-6">
                                <div className={`
                  w-12 h-12 rounded-xl flex items-center justify-center text-white
                  ${item.type === 'video' ? 'bg-red-500/20 text-red-500' : ''}
                  ${item.type === 'article' ? 'bg-blue-500/20 text-blue-500' : ''}
                  ${item.type === 'quiz' ? 'bg-purple-500/20 text-purple-500' : ''}
                `}>
                                    {getIcon(item.type)}
                                </div>
                                {isItemCompleted ? (
                                    <div className="w-8 h-8 rounded-full bg-[#00ff88]/20 flex items-center justify-center border border-[#00ff88]/30">
                                        <Check size={16} className="text-[#00ff88]" />
                                    </div>
                                ) : (
                                    <div className="px-2 py-1 bg-white/5 text-slate-500 text-xs font-bold rounded uppercase">
                                        To Do
                                    </div>
                                )}
                            </div>

                            <div className="mb-6">
                                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">{item.type}</div>
                                <h3 className="text-lg font-bold text-white mb-2 leading-tight">{item.title}</h3>
                                {item.category && <p className="text-sm text-slate-400">{item.category}</p>}
                                {item.difficulty && <p className="text-sm text-slate-400 capitalize">{item.difficulty} Difficulty</p>}
                            </div>

                            <button
                                onClick={() => handleItemClick(item)}
                                className={`
                  w-full py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2
                  ${isItemCompleted
                                        ? 'bg-white/5 text-slate-400 hover:bg-white/10'
                                        : 'bg-[#00d9ff]/10 text-[#00d9ff] hover:bg-[#00d9ff] hover:text-[#0f1322]'
                                    }
                `}
                            >
                                {isItemCompleted ? 'Review' : getActionLabel(item.type)}
                                {!isItemCompleted && <ArrowLeft className="rotate-180" size={14} />}
                            </button>
                        </div>
                    );
                })}
            </div>

            {!isModuleComplete && (
                <div className="mt-8 p-4 rounded-xl bg-[#00d9ff]/10 border border-[#00d9ff]/20 flex items-center justify-center gap-3 text-[#00d9ff] text-sm font-bold">
                    <Lock size={16} />
                    Complete all items to unlock the {module.badge} badge!
                </div>
            )}
        </div>
    );
};

export default ModuleDetail;
