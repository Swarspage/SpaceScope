import React, { useState } from 'react';
import {
    ArrowRight,
    CheckCircle2,
    XCircle,
    Trophy,
    RotateCcw,
    X,
    ExternalLink,
    HelpCircle,
    Zap
} from 'lucide-react';
import { MdSmartToy } from 'react-icons/md';
import FeatureAIPopup from "../components/FeatureAIPopup";

const QuizActiveView = ({
    topicTitle = "Space Missions",
    difficulty = "easy",
    questions = [], // This expects the array: quizzes['easy']
    onClose,      // Function to close the modal/view
    onComplete    // Function to handle completion (update XP, etc.)
}) => {
    // --- STATE ---
    const [currentIndex, setCurrentIndex] = useState(0);
    const [selectedOption, setSelectedOption] = useState(null);
    const [isAnswered, setIsAnswered] = useState(false);
    const [score, setScore] = useState(0);
    const [showResult, setShowResult] = useState(false);
    const [streak, setStreak] = useState(0);

    // Safe check if questions are empty
    if (!questions || questions.length === 0) return null;

    const currentQuestion = questions[currentIndex];
    const progress = ((currentIndex + 1) / questions.length) * 100;

    const [showAIPopup, setShowAIPopup] = useState(false);

    const quizSuggestions = [
        "What is the answer?",
        "Explain the solution",
        "Explain the question"
    ];

    const quizFeatureData = {
        label: "Quiz Assistant",
        description: `Current Question: "${currentQuestion.question}"`,
        details: [
            ...currentQuestion.options.map(opt => `- ${opt}`),
            `[HIDDEN CONTEXT]: The Correct Answer is "${currentQuestion.answer}". Content: ${currentQuestion.explanation}`
        ],
        satelliteHelp: "You are a helpful tutor. If the user asks for the answer, give it to them but explain why. If they ask for an explanation, explain the concept clearly. Use the hidden context to verify the correct answer.",
        didYouKnow: "Focus on keywords in the question to find the right path."
    };

    // --- LOGIC ---

    const handleOptionSelect = (option) => {
        if (isAnswered) return; // Prevent changing answer
        setSelectedOption(option);
    };

    const handleSubmit = () => {
        if (!selectedOption) return;

        const isCorrect = selectedOption === currentQuestion.answer;
        setIsAnswered(true);

        if (isCorrect) {
            setScore(prev => prev + 10); // +10 points per correct answer
            setStreak(prev => prev + 1);
        } else {
            setStreak(0);
        }
    };

    const handleNext = () => {
        if (currentIndex < questions.length - 1) {
            setCurrentIndex(prev => prev + 1);
            setSelectedOption(null);
            setIsAnswered(false);
        } else {
            setShowResult(true);
            if (onComplete) {
                onComplete({
                    score,
                    correctAnswers: score / 10,
                    totalQuestions: questions.length
                });
            }
        }
    };

    const getOptionStyle = (option) => {
        const baseStyle = "cursor-target w-full p-4 rounded-xl border text-left transition-all duration-200 flex items-center justify-between group relative overflow-hidden";

        // State: Question Answered
        if (isAnswered) {
            if (option === currentQuestion.answer) {
                // Correct Answer (Green)
                return `${baseStyle} bg-[#00ff88]/10 border-[#00ff88] text-[#00ff88] shadow-[0_0_15px_rgba(0,255,136,0.2)]`;
            }
            if (option === selectedOption && option !== currentQuestion.answer) {
                // Wrong Selection (Red)
                return `${baseStyle} bg-[#ff3366]/10 border-[#ff3366] text-[#ff3366] opacity-80`;
            }
            // Unselected Options (Dimmed)
            return `${baseStyle} bg-[#0f1322]/40 border-white/5 text-[#94a3b8] opacity-50`;
        }

        // State: Waiting for Input
        if (selectedOption === option) {
            // Selected (Cyan)
            return `${baseStyle} bg-[#00d9ff]/10 border-[#00d9ff] text-white shadow-[0_0_10px_rgba(0,217,255,0.2)]`;
        }

        // Default Hover State
        return `${baseStyle} bg-[#0f1322]/60 border-white/10 text-[#b8c5d6] hover:bg-[#00d9ff]/5 hover:border-[#00d9ff]/50 hover:text-white`;
    };

    // --- RESULT VIEW ---
    if (showResult) {
        const percentage = Math.round((score / (questions.length * 10)) * 100);

        return (
            <div className="fixed inset-0 z-[100] bg-[#050714]/95 flex items-center justify-center p-4 animate-fade-in">
                {/* Background Effects */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,217,255,0.1)_0%,rgba(5,7,20,1)_70%)] pointer-events-none" />

                <div className="relative w-full max-w-md bg-[#0a0e17]/80 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 text-center shadow-[0_0_50px_rgba(0,217,255,0.15)]">
                    <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-[#00d9ff] to-[#b900ff] rounded-full p-[2px] shadow-[0_0_30px_rgba(185,0,255,0.4)] animate-bounce-slow">
                        <div className="w-full h-full bg-[#050714] rounded-full flex items-center justify-center">
                            <Trophy size={40} className="text-[#ffd700]" />
                        </div>
                    </div>

                    <h2 className="font-['Space_Grotesk'] font-bold text-3xl text-white mb-2">
                        Mission Complete!
                    </h2>
                    <p className="text-[#94a3b8] mb-8">
                        You've completed the {topicTitle} ({difficulty}) module.
                    </p>

                    <div className="grid grid-cols-2 gap-4 mb-8">
                        <div className="bg-[#0f1322] border border-white/10 rounded-xl p-4">
                            <div className="text-[#94a3b8] text-xs uppercase tracking-wider mb-1">Score</div>
                            <div className="font-['Space_Grotesk'] font-bold text-2xl text-[#00d9ff]">{score} XP</div>
                        </div>
                        <div className="bg-[#0f1322] border border-white/10 rounded-xl p-4">
                            <div className="text-[#94a3b8] text-xs uppercase tracking-wider mb-1">Accuracy</div>
                            <div className="font-['Space_Grotesk'] font-bold text-2xl text-[#00ff88]">{percentage}%</div>
                        </div>
                    </div>

                    <button
                        onClick={onClose}
                        className="cursor-target w-full py-4 rounded-xl bg-gradient-to-r from-[#00d9ff] to-[#b900ff] text-black font-bold text-lg shadow-[0_0_20px_rgba(0,217,255,0.4)] hover:scale-[1.02] transition-transform"
                    >
                        Return to Base
                    </button>
                </div>
            </div>
        );
    }

    // --- ACTIVE QUIZ VIEW ---
    return (
        <div className="fixed inset-0 z-[10000] bg-[#050714] flex flex-col animate-fade-in">

            {showAIPopup && (
                <FeatureAIPopup
                    feature={quizFeatureData}
                    onClose={() => setShowAIPopup(false)}
                />
            )}

            {/* HEADER */}
            <div className="h-auto min-h-[5rem] shrink-0 px-4 md:px-12 py-3 flex items-center justify-between border-b border-white/5 bg-[#0a0e17]/80 backdrop-blur-xl gap-4 flex-wrap">
                <div className="flex items-center gap-3 md:gap-4 flex-1">
                    <button onClick={onClose} className="cursor-target p-2 hover:bg-white/5 rounded-full text-[#94a3b8] transition-colors shrink-0">
                        <X size={24} />
                    </button>
                    <div className="min-w-0">
                        <h2 className="font-['Space_Grotesk'] font-bold text-base md:text-lg text-white leading-tight line-clamp-1">{topicTitle}</h2>
                        <div className="flex items-center gap-2 text-xs text-[#94a3b8]">
                            <span className="uppercase tracking-wider text-[#00d9ff]">{difficulty}</span>
                            <span className="w-1 h-1 rounded-full bg-white/20" />
                            <span className="whitespace-nowrap">Q {currentIndex + 1} / {questions.length}</span>
                        </div>
                    </div>
                </div>

                {/* Score & Streak */}
                <div className="flex items-center gap-6">
                    {streak > 1 && (
                        <div className="hidden md:flex items-center gap-1 text-[#ffaa00] font-bold animate-pulse">
                            <Zap size={16} fill="currentColor" />
                            <span>{streak} Streak!</span>
                        </div>
                    )}
                    <div className="px-4 py-1.5 rounded-full bg-[#00d9ff]/10 border border-[#00d9ff]/20 text-[#00d9ff] font-['Space_Grotesk'] font-bold">
                        {score} XP
                    </div>
                </div>
            </div>

            {/* PROGRESS BAR */}
            <div className="h-1 w-full bg-[#0f1322]">
                <div
                    className="h-full bg-gradient-to-r from-[#00d9ff] to-[#b900ff] transition-all duration-500 ease-out shadow-[0_0_10px_rgba(0,217,255,0.5)]"
                    style={{ width: `${progress}%` }}
                />
            </div>

            {/* MAIN CONTENT */}
            <div className="flex-1 overflow-y-auto">
                <div className="max-w-3xl mx-auto px-4 md:px-6 py-6 md:py-12">

                    {/* QUESTION CARD */}
                    <div className="mb-8 md:mb-10">
                        <h3 className="font-['Space_Grotesk'] font-bold text-xl md:text-3xl text-white leading-relaxed mb-6">
                            {currentQuestion.question}
                        </h3>

                        {/* Options Grid */}
                        <div className="grid gap-4">
                            {currentQuestion.options.map((option, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => handleOptionSelect(option)}
                                    disabled={isAnswered}
                                    className={getOptionStyle(option)}
                                >
                                    <span className="font-medium text-[15px]">{option}</span>

                                    {/* Status Icons */}
                                    {isAnswered && option === currentQuestion.answer && (
                                        <CheckCircle2 className="text-[#00ff88] shrink-0 ml-3" size={20} />
                                    )}
                                    {isAnswered && option === selectedOption && option !== currentQuestion.answer && (
                                        <XCircle className="text-[#ff3366] shrink-0 ml-3" size={20} />
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* EXPLANATION PANEL (Appears after answering) */}
                    {isAnswered && (
                        <div className="animate-fade-in-up">
                            <div className={`rounded-xl p-6 border mb-8 ${selectedOption === currentQuestion.answer
                                ? 'bg-[#00ff88]/5 border-[#00ff88]/20'
                                : 'bg-[#ff3366]/5 border-[#ff3366]/20'
                                }`}>
                                <div className="flex items-start gap-4">
                                    <div className={`p-2 rounded-lg shrink-0 ${selectedOption === currentQuestion.answer ? 'bg-[#00ff88]/10 text-[#00ff88]' : 'bg-[#ff3366]/10 text-[#ff3366]'
                                        }`}>
                                        {selectedOption === currentQuestion.answer ? <CheckCircle2 size={24} /> : <HelpCircle size={24} />}
                                    </div>
                                    <div>
                                        <h4 className={`font-bold mb-2 ${selectedOption === currentQuestion.answer ? 'text-[#00ff88]' : 'text-[#ff3366]'
                                            }`}>
                                            {selectedOption === currentQuestion.answer ? 'Correct!' : 'Not quite right...'}
                                        </h4>
                                        <p className="text-[#b8c5d6] text-sm leading-relaxed mb-4">
                                            {currentQuestion.explanation}
                                        </p>

                                        {currentQuestion.source_url && (
                                            <a
                                                href={currentQuestion.source_url}
                                                rel="noreferrer"
                                                className="cursor-target inline-flex items-center gap-1 text-xs text-[#00d9ff] hover:text-[#b900ff] transition-colors"
                                            >
                                                <ExternalLink size={12} />
                                                Source Reference
                                            </a>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* BOTTOM ACTION BAR */}
            <div className="h-24 shrink-0 border-t border-white/5 bg-[#0a0e17]/80 backdrop-blur-xl flex items-center justify-between px-6">
                <button
                    onClick={() => setShowAIPopup(true)}
                    className="cursor-target px-4 md:px-6 py-3 rounded-xl border border-[#00ff88]/30 bg-[#00ff88]/10 text-[#00ff88] font-bold text-sm hover:bg-[#00ff88]/20 flex items-center gap-2 transition-all hover:shadow-[0_0_15px_rgba(0,255,136,0.2)]"
                >
                    <MdSmartToy size={20} />
                    <span className="hidden md:inline">Ask AI Help</span>
                    <span className="md:hidden">AI Help</span>
                </button>

                <div className="max-w-3xl w-full flex justify-end">
                    {!isAnswered ? (
                        <button
                            onClick={handleSubmit}
                            disabled={!selectedOption}
                            className={`cursor-target px-8 py-3.5 rounded-xl font-bold text-sm transition-all duration-200 ${selectedOption
                                ? 'bg-gradient-to-r from-[#00d9ff] to-[#b900ff] text-black shadow-[0_0_15px_rgba(0,217,255,0.3)] hover:scale-105 transform cursor-pointer'
                                : 'bg-[#0f1322] text-[#64748b] border border-white/5 cursor-not-allowed'
                                }`}
                        >
                            Submit Answer
                        </button>
                    ) : (
                        <button
                            onClick={handleNext}
                            className="cursor-target px-8 py-3.5 rounded-xl bg-white text-black font-bold text-sm shadow-[0_0_15px_rgba(255,255,255,0.2)] hover:bg-[#e2e8f0] hover:scale-105 transition-all duration-200 flex items-center gap-2"
                        >
                            {currentIndex === questions.length - 1 ? 'Finish Quiz' : 'Next Question'}
                            <ArrowRight size={18} />
                        </button>
                    )}
                </div>
            </div>

        </div>
    );
};

export default QuizActiveView;