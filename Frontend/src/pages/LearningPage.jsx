import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    GraduationCap,
    Trophy,
    Video,
    Calendar,
    MapPin,
    X,
    Play,
    ExternalLink,
    LayoutGrid
} from 'lucide-react';
import { MdInfoOutline } from 'react-icons/md';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import QuizActiveView from './QuizActiveView';

// --- COMPONENTS ---
import ModuleJourney from '../components/ModuleJourney';
import ModuleDetail from '../components/ModuleDetail';
import FeatureInfoModal from "../components/FeatureInfoModal";

// --- DATA ---
import modulesData from '../data/modules.json';
import quizData from '../data/Quiz.json';
import videoData from '../data/learningZoneYtVideos.json';
import articleData from '../data/articles.json';

const LearningPage = () => {
    // Router and Auth
    const navigate = useNavigate();
    const { user } = useAuth();

    // --- STATE ---
    const [currentModule, setCurrentModule] = useState(null); // If null, show Journey. If set, show Detail.

    // Module Progress State (Mocked/Derived for now, could be from API)
    // Structure: { moduleId: { status: 'completed'|'in-progress'|'locked', progress: 0-100, completedIndices: [] } }
    const [moduleProgress, setModuleProgress] = useState({});

    // Modals & Active Content
    const [activeVideo, setActiveVideo] = useState(null);
    const [activeArticle, setActiveArticle] = useState(null);
    const [activeQuiz, setActiveQuiz] = useState(null); // For QuizActiveView
    const [showInfoModal, setShowInfoModal] = useState(false);

    // Leaderboard
    const [leaderboardData, setLeaderboardData] = useState([]);
    const [showLeaderboard, setShowLeaderboard] = useState(true);
    const [xpFilter, setXpFilter] = useState('total'); // 'total' | 'learning'

    // --- INITIALIZATION ---
    useEffect(() => {
        const fetchProgress = async () => {
            if (!user) return;
            try {
                const response = await api.get(`/learning/progress?userId=${user.id || user._id}`);
                if (response.data && response.data.success) {
                    const dbProgress = response.data.progress;

                    // Transform DB progress array to Map for easier access
                    // Structure: { moduleId: { status, progress, completedIndices, unlocked } }
                    const progressMap = {};

                    // First, map DB entries
                    if (dbProgress.modules) {
                        dbProgress.modules.forEach(m => {
                            progressMap[m.module_id] = {
                                status: m.completion_percentage === 100 ? 'completed' : 'in-progress',
                                progress: m.completion_percentage,
                                completedIndices: [], // We need to map strings to indices or just store strings. Ideally store strings.
                                // Let's store raw completed_content for ModuleDetail to check
                                completedContent: m.completed_content || [],
                                unlocked: m.unlocked
                            };
                        });
                    }

                    // Then merge with defaults from modules.json (for unlocked_by_default)
                    // If not in DB, set default state
                    modulesData.modules.forEach(m => {
                        if (!progressMap[m.id]) {
                            progressMap[m.id] = {
                                status: m.unlocked_by_default ? 'in-progress' : 'locked', // actually 'unlocked' but UI calls it in-progress or unlocked
                                progress: 0,
                                completedContent: [],
                                unlocked: m.unlocked_by_default
                            };
                        } else {
                            // db override might be needed if defaults change, but DB truth is primary
                            // ensure unlocked status is at least what DB says
                        }
                    });

                    setModuleProgress(progressMap);
                }
            } catch (error) {
                console.error("Failed to fetch learning progress", error);
            }
        };

        if (user) {
            fetchProgress();
        }
    }, [user]);

    // --- LEADERBOARD FETCH ---
    const fetchLeaderboard = async () => {
        try {
            const response = await api.get('/auth/leaderboard');
            if (response.status === 200) {
                const data = response.data;
                const formattedData = data.leaderboard.map((userItem, index) => ({
                    rank: index + 1,
                    name: userItem.username,
                    xp: userItem.xp || 0,
                    learningXP: userItem.learning_progress?.total_learning_xp || 0,
                    badgeCount: userItem.learning_progress?.badges?.length || 0,
                    avatar: userItem.avatar || "👨‍🚀",
                    isUser: user?.username === userItem.username,
                    quizHistory: userItem.quizHistory || []
                }));
                setLeaderboardData(formattedData);
            }
        } catch (error) {
            console.error("Failed to fetch leaderboard:", error);
        }
    };

    useEffect(() => {
        if (user) fetchLeaderboard();
    }, [user]);


    // --- HELPERS ---
    const getQuizForModule = (moduleQuiz) => {
        // Find matching topic in quizData
        // moduleQuiz.topic is string title. quizData.topics has `topic` field.
        // We try to find a topic that contains the module words or is similar.
        if (!quizData || !quizData.topics) return null;

        const targetTopic = moduleQuiz.topic.toLowerCase();

        // Simple fuzzy match or fallback
        let foundTopic = quizData.topics.find(t =>
            t.topic.toLowerCase().includes(targetTopic) ||
            targetTopic.includes(t.topic.toLowerCase())
        );

        // Fallback for demo
        if (!foundTopic && quizData.topics.length > 0) foundTopic = quizData.topics[0];

        if (!foundTopic) return null;

        const level = moduleQuiz.difficulty || 'easy';
        const questions = foundTopic.quizzes?.[level] || [];

        // Limit question count as per module spec
        const count = moduleQuiz.question_count || 10;
        const selectedQuestions = questions.slice(0, count);

        return {
            topic: foundTopic.topic,
            level: level,
            questions: selectedQuestions
        };
    };

    // --- HANDLERS ---
    const handleContentCompletion = async (moduleId, contentType, rewardXP, moduleBadge) => {
        try {
            if (!user) return;
            const res = await api.post('/learning/complete-content', {
                userId: user.id || user._id,
                moduleId,
                contentType,
                moduleRewardXP: rewardXP,
                moduleBadge
            });

            if (res.data && res.data.success) {
                // Update local state to reflect change immediately
                const { newXp, newBadge, moduleCompleted, nextModuleUnlocked } = res.data.updates;

                // Show celebration/toast
                if (newXp > 0) {
                    // TODO: Add toast notification "Earned +XX XP!"
                    console.log(`Earned ${newXp} XP!`);
                }
                if (newBadge) {
                    alert(`🏅 Badge Unlocked: ${newBadge}!`);
                }
                if (moduleCompleted) {
                    // Trigger confetti?
                    import('canvas-confetti').then((confetti) => confetti.default());
                }

                // Refresh progress
                // Re-fetch or manually merge. Re-fetching is safer for sync.
                const updatedDBProgress = res.data.progress;

                setModuleProgress(prev => {
                    const newMap = { ...prev };

                    updatedDBProgress.modules.forEach(m => {
                        newMap[m.module_id] = {
                            status: m.completion_percentage === 100 ? 'completed' : 'in-progress',
                            progress: m.completion_percentage,
                            completedContent: m.completed_content || [],
                            unlocked: m.unlocked
                        };
                    });

                    return newMap;
                });

                // Also refresh leaderboard if XP changed
                if (newXp > 0) fetchLeaderboard();
            }
        } catch (err) {
            console.error("Completion error:", err);
        }
    };

    const handleModuleSelect = (module) => {
        // Prevent opening locked modules (double check UI logic)
        const state = moduleProgress[module.id];
        if (state && !state.unlocked && state.status === 'locked') return; // Strict lock check
        setCurrentModule(module);
    };

    const handleBackToJourney = () => {
        setCurrentModule(null);
    };

    const handleOpenVideo = (videoItem) => {
        // Find specific video from data
        let realVideo = null;
        if (videoItem.video_key && videoData[videoItem.video_key]) {
            realVideo = videoData[videoItem.video_key][videoItem.video_index];
        }

        // Construct object for player
        const finalVideo = {
            title: realVideo ? realVideo.name : videoItem.title,
            // Convert Youtube watch link to embed link
            embedUrl: realVideo
                ? realVideo.link.replace("watch?v=", "embed/")
                : "https://www.youtube.com/embed/dQw4w9WgXcQ",
            ...videoItem
        };

        setActiveVideo(finalVideo);

        // Mark video as complete when opened 
        if (currentModule) {
            handleContentCompletion(
                currentModule.id,
                'video',
                currentModule.xp_reward,
                currentModule.badge
            );
        }
    };

    const handleOpenArticle = (articleItem) => {
        let realArticle = null;
        if (typeof articleItem.article_index === 'number' && articleData[articleItem.article_index]) {
            realArticle = articleData[articleItem.article_index];
        }

        setActiveArticle({
            title: realArticle ? realArticle.title : articleItem.title,
            category: realArticle ? realArticle.category : articleItem.category,
            preview: realArticle ? realArticle.preview : "An interesting article found in the archives of space history.",
            url: realArticle ? realArticle.url : "#",
            ...articleItem
        });

        if (currentModule) {
            handleContentCompletion(
                currentModule.id,
                'article',
                currentModule.xp_reward,
                currentModule.badge
            );
        }
    };

    const handleOpenQuiz = (quizItem) => {
        const quizConfig = getQuizForModule(quizItem);
        if (quizConfig && quizConfig.questions.length > 0) {
            setActiveQuiz(quizConfig);
        } else {
            console.warn("No questions found for quiz", quizItem);
            alert("Quiz not available yet.");
        }
    };

    // --- MODAL COMPONENTS (Inline for simplicity) ---
    const ArticlePreviewModal = ({ article, onClose }) => (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
            <div className="relative w-[95%] md:w-full md:max-w-lg bg-[#0a0e17] border border-white/10 rounded-2xl overflow-hidden shadow-2xl animate-fade-in-up">
                <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                        <div>
                            <div className="text-[#00d9ff] text-xs font-bold uppercase tracking-wider mb-2">{article.category}</div>
                            <h2 className="text-xl font-bold text-white leading-tight">{article.title}</h2>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full text-slate-400 transition-colors"><X size={20} /></button>
                    </div>
                    <div className="bg-white/5 rounded-xl p-4 mb-6 border border-white/5">
                        <p className="text-slate-300 text-sm leading-relaxed">{article.preview || "Preview content loading..."}</p>
                    </div>
                    <div className="flex gap-3">
                        <a href={article.url || '#'} target="_blank" rel="noreferrer" className="flex-1 bg-[#00d9ff] text-black font-bold py-3 rounded-xl text-sm flex items-center justify-center gap-2 hover:bg-[#00c2e6] transition-colors">
                            Read Full Article <ExternalLink size={14} />
                        </a>
                        <button onClick={onClose} className="px-6 py-3 rounded-xl border border-white/10 text-white font-bold text-sm hover:bg-white/5 transition-colors">Close</button>
                    </div>
                </div>
            </div>
        </div>
    );

    const VideoPlayerModal = ({ video, onClose }) => (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={onClose} />
            <div className="relative w-[95%] md:w-full md:max-w-4xl bg-[#0a0e17] border border-white/10 rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
                <div className="p-4 border-b border-white/5 flex items-center justify-between bg-black/40">
                    <h3 className="font-bold text-white line-clamp-1">{video.title}</h3>
                    <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full text-slate-400"><X size={20} /></button>
                </div>
                <div className="relative w-full aspect-video bg-black">
                    <iframe src={video.embedUrl} title={video.title} className="absolute inset-0 w-full h-full" frameBorder="0" allow="autoplay; encrypted-media" allowFullScreen />
                </div>
            </div>
        </div>
    );

    return (
        <div className="flex h-screen bg-transparent text-slate-300 font-sans overflow-hidden">
            <Sidebar activeTab="Learning Zone" />

            <div className="flex-1 flex flex-col min-w-0 bg-transparent relative">
                {/* Background FX */}
                <div className="absolute top-[-20%] left-[20%] w-[500px] h-[500px] bg-[#00d9ff]/5 rounded-full blur-[100px] pointer-events-none" />

                <main className="flex-1 overflow-y-auto">
                    {/* Header */}
                    <div className="px-4 py-3 md:px-6 md:py-4 border-b border-white/5 flex items-center justify-between bg-[#0a0e17]/80 backdrop-blur-md sticky top-0 z-30">
                        <div className="flex items-center gap-3">
                            <GraduationCap className="text-[#00d9ff]" size={28} />
                            <div>
                                <h1 className="text-2xl font-bold text-white mb-1">Learning Zone</h1>
                                <p className="text-sm font-medium text-slate-400/80">Interactive Space Academy</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setShowInfoModal(true)}
                            className="px-4 py-2 bg-[#00ff88]/20 hover:bg-[#00ff88]/40 border border-[#00ff88] rounded-full text-white text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2"
                        >
                            <MdInfoOutline className="text-lg" /> Guide
                        </button>
                    </div>

                    <div className="flex flex-col xl:flex-row min-h-[calc(100vh-80px)]">
                        {/* Main Interaction Area */}
                        <div className={`flex-1 p-4 md:p-8 transition-all duration-300 ${!currentModule && showLeaderboard ? 'xl:mr-0' : ''}`}>
                            {currentModule ? (
                                <ModuleDetail
                                    module={currentModule}
                                    progress={moduleProgress[currentModule.id]}
                                    onBack={handleBackToJourney}
                                    onOpenVideo={handleOpenVideo}
                                    onOpenArticle={handleOpenArticle}
                                    onOpenQuiz={handleOpenQuiz}
                                />
                            ) : (
                                <ModuleJourney
                                    modules={modulesData.modules}
                                    moduleProgress={moduleProgress}
                                    onModuleSelect={handleModuleSelect}
                                />
                            )}
                        </div>

                        {/* Leaderboard Sidebar - Only show in Journey view on desktop */}
                        {!currentModule && showLeaderboard && (
                            <div className="hidden xl:block w-[320px] border-l border-white/5 bg-[#0a0e17]/30">
                                <div className="sticky top-24 p-6">
                                    <div className="flex items-center justify-between mb-6">
                                        <div className="flex items-center gap-2">
                                            <Trophy className="text-[#ffd700]" size={20} />
                                            <h3 className="font-bold text-lg text-white">Leaderboard</h3>
                                        </div>
                                    </div>

                                    {/* XP Filter Toggle */}
                                    <div className="flex bg-black/40 p-1 rounded-lg mb-4 border border-white/5">
                                        <button
                                            onClick={() => setXpFilter('total')}
                                            className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${xpFilter === 'total' ? 'bg-[#00d9ff]/20 text-[#00d9ff] shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
                                        >
                                            Total XP
                                        </button>
                                        <button
                                            onClick={() => setXpFilter('learning')}
                                            className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${xpFilter === 'learning' ? 'bg-[#00d9ff]/20 text-[#00d9ff] shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
                                        >
                                            Learning XP
                                        </button>
                                    </div>

                                    <div className="space-y-3">
                                        {/* Sort and map based on filter */}
                                        {[...leaderboardData]
                                            .sort((a, b) => {
                                                const xpA = xpFilter === 'learning' ? a.learningXP : a.xp;
                                                const xpB = xpFilter === 'learning' ? b.learningXP : b.xp;
                                                return xpB - xpA;
                                            })
                                            .slice(0, 10)
                                            .map((u, idx) => (
                                                <div key={idx} className={`flex items-center gap-3 p-3 rounded-xl border border-white/5 ${u.isUser ? 'bg-[#00d9ff]/10 border-[#00d9ff]/30' : 'bg-black/20'}`}>
                                                    <div className={`w-6 text-center font-bold ${idx < 3 ? 'text-[#ffd700]' : 'text-slate-500'}`}>{idx + 1}</div>
                                                    <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-sm border border-white/10 relative">
                                                        {u.avatar}
                                                        {u.badgeCount > 0 && (
                                                            <div className="absolute -top-1 -right-1 w-4 h-4 bg-[#ffd700] rounded-full text-[8px] flex items-center justify-center text-black font-bold border border-[#0a0e17]">
                                                                {u.badgeCount}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="flex-1 truncate text-sm font-medium text-white">{u.name}</div>
                                                    <div className="text-xs font-mono font-bold text-[#00ff88]">
                                                        {xpFilter === 'learning' ? u.learningXP : u.xp}
                                                    </div>
                                                </div>
                                            ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </main>
            </div>

            {/* Global Modals */}
            {activeArticle && <ArticlePreviewModal article={activeArticle} onClose={() => setActiveArticle(null)} />}
            {activeVideo && <VideoPlayerModal video={activeVideo} onClose={() => setActiveVideo(null)} />}

            {activeQuiz && (
                <QuizActiveView
                    topicTitle={activeQuiz.topic}
                    difficulty={activeQuiz.level}
                    questions={activeQuiz.questions}
                    onClose={() => setActiveQuiz(null)}
                    onComplete={async (result) => {
                        try {
                            if (!user) return;
                            // 1. Submit standard quiz result (for history/leaderboard)
                            await api.post('/auth/quiz-result', {
                                userId: user.id || user._id,
                                topic: activeQuiz.topic,
                                difficulty: activeQuiz.level,
                                score: result.score,
                                correctAnswers: result.correctAnswers,
                                totalQuestions: result.totalQuestions
                            });

                            // 2. Mark Module Content as Complete
                            if (currentModule) {
                                // Only mark complete if score is passing? (e.g. > 50%)
                                // For now, simple completion
                                handleContentCompletion(
                                    currentModule.id,
                                    'quiz',
                                    currentModule.xp_reward,
                                    currentModule.badge
                                );
                            } else {
                                // If quiz taken outside module context (if possible), just refresh leaderboard
                                fetchLeaderboard();
                            }

                        } catch (error) {
                            console.error("Quiz submission error:", error);
                        }
                    }}
                />
            )}

            <FeatureInfoModal
                isOpen={showInfoModal}
                onClose={() => setShowInfoModal(false)}
                title="Your Journey"
                features={[
                    { title: "Modules", desc: "Unlock modules sequentially to master topics.", icon: <LayoutGrid /> },
                    { title: "XP & Badges", desc: "Earn XP and badges for completing modules.", icon: <Trophy /> }
                ]}
            />
        </div>
    );
};

export default LearningPage;