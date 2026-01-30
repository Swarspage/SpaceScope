import React, { useState, useEffect } from 'react';
import { MdClose, MdChevronRight, MdCheck, MdChevronLeft } from 'react-icons/md';

const Tutorial = ({ user, onComplete, onSkip, onStepChange }) => {
    const [step, setStep] = useState(0);
    const [targetRect, setTargetRect] = useState(null);
    const [windowSize, setWindowSize] = useState({ width: window.innerWidth, height: window.innerHeight });

    const steps = [
        {
            title: "Welcome to Singularity Dashboard",
            content: "Your gateway to the cosmos. Monitor space missions, track satellites, and explore the universe.",
            target: null, // Center screen
        },
        {
            title: "Mission Control",
            content: "This is your main dashboard. View active missions, ISS tracking, solar activity, and more at a glance.",
            target: "nav-dashboard",
        },
        {
            title: "Space Missions",
            content: "Track past and upcoming rocket launches from agencies like SpaceX, NASA, and more.",
            target: "nav-missions",
        },
        {
            title: "Learning Zone",
            content: "Expand your knowledge! Access educational resources, quizzes, and facts about the universe.",
            target: "nav-learning",
        },
        {
            title: "Satellite Applications",
            content: "Explore various satellite applications and their impact on Earth.",
            target: "nav-applications",
        },
        {
            title: "Community",
            content: "Connect with other space enthusiasts, share thoughts, and discuss cosmic events.",
            target: "nav-community",
        },
    ];

    // Handle Resize
    useEffect(() => {
        const handleResize = () => setWindowSize({ width: window.innerWidth, height: window.innerHeight });
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        if (steps[step].target) {
            const updateRect = () => {
                const element = document.getElementById(steps[step].target);
                if (element) {
                    const rect = element.getBoundingClientRect();
                    // Determine if element is visible (roughly)
                    if (rect.width > 0 && rect.height > 0) {
                        setTargetRect(rect);
                    }
                }
            };

            updateRect();
            // Optional: observer or interval if element moves/animates
            const interval = setInterval(updateRect, 100);
            return () => clearInterval(interval);
        } else {
            setTargetRect(null);
        }
    }, [step, windowSize]);

    const handleNext = () => {
        if (step < steps.length - 1) {
            const nextStep = step + 1;
            setStep(nextStep);
            if (onStepChange) onStepChange(nextStep);
        } else {
            onComplete();
        }
    };

    const handlePrev = () => {
        if (step > 0) {
            const prevStep = step - 1;
            setStep(prevStep);
            if (onStepChange) onStepChange(prevStep);
        }
    };

    // Calculate popup position (simplified preference: Right > Bottom > Left > Top)
    const getPopupStyle = () => {
        if (!targetRect) {
            return {
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)'
            };
        }

        // On mobile, if we are targeting sidebar items (which are on the left),
        // we ideally want the popup to be centered horizontally or at the bottom.
        const isMobile = windowSize.width < 768;

        if (isMobile) {
            // Simple mobile logic: position at bottom of screen or center if target is obscured
            // But if target is sidebar item, it's visible. Center vertically, push right?
            // Actually, sidebar takes ~80% width usually? No, w-64 is 256px.
            // Screen width ~375. 375 - 256 = 119px space on right. Too small.
            // So we must overlay.
            // Let's position it at the bottom of the screen to minimize obstruction of the specific target item
            // unless the target item is at the very bottom.
            if (targetRect.bottom > windowSize.height - 300) {
                // Target is low, put popup at top
                return {
                    top: '10%',
                    left: '50%',
                    transform: 'translate(-50%, 0)'
                };
            } else {
                // Target is high/mid, put popup at bottom
                return {
                    bottom: '5%',
                    left: '50%',
                    transform: 'translate(-50%, 0)'
                };
            }
        }

        const spaceRight = windowSize.width - targetRect.right;
        const spaceBottom = windowSize.height - targetRect.bottom;

        // Default to right if space available
        if (spaceRight > 420) {
            return {
                top: Math.max(20, Math.min(windowSize.height - 300, targetRect.top)),
                left: targetRect.right + 20
            };
        }

        // Else bottom
        if (spaceBottom > 350) {
            return {
                top: targetRect.bottom + 20,
                left: Math.max(20, Math.min(windowSize.width - 400, targetRect.left))
            };
        }

        // Fallback centerish (shouldn't happen for sidebar)
        return {
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)'
        };
    };

    return (
        <div className="fixed inset-0 z-[60] pointer-events-none">
            {/* 4-Part Backdrop to create a "hole" */}
            {targetRect ? (
                <>
                    {/* Top */}
                    <div className="absolute bg-black/80 backdrop-blur-sm pointer-events-auto transition-all duration-300"
                        style={{ top: 0, left: 0, width: '100%', height: targetRect.top - 5 }} />
                    {/* Bottom */}
                    <div className="absolute bg-black/80 backdrop-blur-sm pointer-events-auto transition-all duration-300"
                        style={{ top: targetRect.bottom + 5, left: 0, width: '100%', bottom: 0 }} />
                    {/* Left */}
                    <div className="absolute bg-black/80 backdrop-blur-sm pointer-events-auto transition-all duration-300"
                        style={{ top: targetRect.top - 5, left: 0, width: targetRect.left - 5, height: targetRect.height + 10 }} />
                    {/* Right */}
                    <div className="absolute bg-black/80 backdrop-blur-sm pointer-events-auto transition-all duration-300"
                        style={{ top: targetRect.top - 5, left: targetRect.right + 5, right: 0, height: targetRect.height + 10 }} />

                    {/* Spotlight Border (Visual only) */}
                    <div
                        className="absolute border-2 border-[#00d9ff] rounded-lg shadow-[0_0_30px_rgba(0,217,255,0.4)] pointer-events-none transition-all duration-300"
                        style={{
                            top: targetRect.top - 5,
                            left: targetRect.left - 5,
                            width: targetRect.width + 10,
                            height: targetRect.height + 10,
                        }}
                    />
                </>
            ) : (
                <div className="absolute inset-0 bg-black/80 backdrop-blur-sm pointer-events-auto" />
            )}

            {/* Tutorial Card */}
            <div
                className={`bg-[#0f1322] border border-[#00d9ff]/30 rounded-2xl w-[90vw] md:w-[400px] shadow-2xl absolute overflow-hidden transition-all duration-500 pointer-events-auto`}
                style={getPopupStyle()}
            >
                {/* Header Background */}
                <div className="absolute top-0 inset-x-0 h-24 bg-gradient-to-b from-[#00d9ff]/10 to-transparent pointer-events-none" />

                <div className="p-6 relative z-10">
                    <div className="flex justify-between items-start mb-4">
                        <div className="text-[10px] uppercase font-bold text-[#00d9ff] tracking-widest border border-[#00d9ff]/20 px-2 py-0.5 rounded bg-[#00d9ff]/5">
                            Tutorial {step + 1}/{steps.length}
                        </div>
                        <button onClick={onSkip} className="text-slate-500 hover:text-white transition-colors">
                            <MdClose />
                        </button>
                    </div>

                    <h3 className="text-xl font-bold text-white mb-2">{steps[step].title}</h3>
                    <p className="text-slate-400 text-sm leading-relaxed mb-6">
                        {steps[step].content}
                    </p>

                    <div className="flex items-center justify-between">
                        <div className="flex gap-1">
                            {steps.map((_, idx) => (
                                <div
                                    key={idx}
                                    className={`h-1.5 rounded-full transition-all duration-300 ${idx === step ? 'w-6 bg-[#00d9ff]' : 'w-1.5 bg-slate-700'}`}
                                />
                            ))}
                        </div>

                        <div className="flex gap-2">
                            {step > 0 && (
                                <button
                                    onClick={handlePrev}
                                    className="px-4 py-2 rounded-lg border border-white/10 hover:bg-white/5 text-slate-300 text-sm font-medium transition-all"
                                >
                                    <MdChevronLeft className="text-xl" />
                                </button>
                            )}
                            <button
                                onClick={handleNext}
                                className="px-6 py-2 rounded-lg bg-[#00d9ff] hover:bg-cyan-400 text-black text-sm font-bold transition-all shadow-[0_0_20px_rgba(0,217,255,0.2)] hover:shadow-[0_0_30px_rgba(0,217,255,0.4)] flex items-center gap-2"
                            >
                                {step === steps.length - 1 ? 'Finish' : 'Next'}
                                {step === steps.length - 1 ? <MdCheck /> : <MdChevronRight />}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Tutorial;
