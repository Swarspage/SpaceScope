import React from 'react';
import { MdClose, MdArrowForward } from 'react-icons/md';

const FeatureInfoModal = ({ isOpen, onClose, title, imageSrc, description, features = [], readMoreLink }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 md:p-8 bg-black/80 backdrop-blur-md animate-fadeIn">
            <div
                className="bg-[#050714]/90 border border-white/10 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-[0_0_50px_-12px_rgba(0,217,255,0.3)] relative animate-scaleIn ring-1 ring-white/5"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Decorative Background Elements */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-[#00d9ff]/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#00ff88]/5 rounded-full blur-3xl translate-y-1/3 -translate-x-1/3 pointer-events-none" />

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 bg-black/40 hover:bg-black/80 backdrop-blur-md rounded-full text-white/70 hover:text-white transition-all z-50 border border-white/10 group overflow-hidden"
                >
                    <div className="absolute inset-0 bg-gradient-to-tr from-[#00d9ff]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <MdClose size={20} className="relative z-10" />
                </button>

                {/* Top: Header Section (Distinct) */}
                <div className="px-8 pt-10 pb-6 relative z-20 shrink-0">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="h-[1px] w-8 bg-gradient-to-r from-transparent to-[#00d9ff]" />
                        <div className="text-[#00d9ff] text-[10px] font-bold uppercase tracking-[0.3em] font-mono shadow-[0_0_10px_rgba(0,217,255,0.5)]">
                            Feature Overview
                        </div>
                        <div className="h-[1px] w-8 bg-gradient-to-l from-transparent to-[#00d9ff]" />
                    </div>

                    <h2 className="text-3xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-[#e0faff] to-[#00d9ff] tracking-tight leading-tight drop-shadow-[0_0_15px_rgba(0,217,255,0.3)]">
                        {title}
                    </h2>
                </div>

                {/* Scrollable Content Area */}
                <div className="flex-1 overflow-y-auto custom-scrollbar relative z-20 flex flex-col">

                    {/* Feature Image (Hero) */}
                    {imageSrc && (
                        <div className="w-full relative shrink-0 group perspective-1000 px-8">
                            <div className="absolute inset-0 bg-gradient-to-b from-[#00d9ff]/5 via-transparent to-transparent opacity-50" />
                            <div className="relative z-10 w-full h-64 md:h-80 flex items-center justify-center py-6">
                                {/* Glowing Orb Behind Image */}
                                <div className="absolute w-48 h-48 bg-[#00d9ff]/20 rounded-full blur-[60px] animate-pulse-slow" />

                                <img
                                    src={imageSrc}
                                    alt={title}
                                    className="h-full w-auto object-contain drop-shadow-[0_0_25px_rgba(0,217,255,0.4)] hover:scale-105 transition-transform duration-700 ease-in-out"
                                />
                            </div>
                        </div>
                    )}

                    {/* Bottom: Content */}
                    <div className="px-8 pb-10">
                        {/* Generic Content Sections */}
                        <div className="space-y-6">
                            {features.map((section, idx) => (
                                <div key={idx} className="flex items-start gap-5 p-4 rounded-xl bg-white/5 border border-white/5 hover:border-[#00d9ff]/30 transition-all duration-300 group hover:bg-white/[0.07] hover:shadow-[0_0_30px_-10px_rgba(0,217,255,0.1)]">
                                    <div className="shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-[#00d9ff]/10 to-[#00ff88]/5 flex items-center justify-center text-[#00d9ff] border border-white/10 group-hover:scale-110 group-hover:shadow-[0_0_15px_rgba(0,217,255,0.3)] transition-all duration-300">
                                        {section.icon}
                                    </div>
                                    <div>
                                        <h3 className="text-white font-bold text-lg mb-2 group-hover:text-[#00d9ff] transition-colors">
                                            {section.title}
                                        </h3>
                                        <p className="text-slate-300 text-sm leading-relaxed text-justify font-light opacity-90">
                                            {section.desc}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Footer Link */}
                        {readMoreLink && (
                            <div className="mt-8 flex justify-end">
                                <a
                                    href={readMoreLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="group relative px-6 py-3 bg-[#00d9ff]/10 hover:bg-[#00d9ff]/20 border border-[#00d9ff]/30 rounded-lg overflow-hidden transition-all duration-300 hover:shadow-[0_0_20px_rgba(0,217,255,0.4)]"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#00d9ff]/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                                    <div className="flex items-center gap-3 text-[#00d9ff] font-bold uppercase tracking-wider text-xs">
                                        Read Full Documentation
                                        <MdArrowForward className="group-hover:translate-x-1 transition-transform" />
                                    </div>
                                </a>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div >
    );
};

export default FeatureInfoModal;
