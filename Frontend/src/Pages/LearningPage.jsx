import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    GraduationCap,
    Trophy,
    LayoutGrid,
    FileText,
    Video,
    Filter,
    ChevronDown,
    Clock,
    List,
    Play,
    ArrowRight,
    Sparkles,
    ChevronLeft,
    ChevronRight,
    MapPin,
    Calendar
} from 'lucide-react';
import {
    MdSearch,
    MdNotifications,
    MdSettings,
} from 'react-icons/md';
import { FaUserAstronaut } from 'react-icons/fa';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../../Context/AuthContext';
import QuizActiveView from './QuizActiveView';

// --- IMPORTANT: DATA IMPORT ---
import quizData from '../../Quiz.json';
import learningVideos from '../data/learningZoneYtVideos.json';

const LearningPage = () => {
    // Router and Auth
    const navigate = useNavigate();
    const { user, loading: authLoading } = useAuth();

    // --- STATE MANAGEMENT ---
    const [activeTab, setActiveTab] = useState('Quizzes');
    const [activeFilter, setActiveFilter] = useState('All Topics');
    const [quizContent] = useState(quizData);
    const [showLeaderboard, setShowLeaderboard] = useState(true);
    const [activeQuiz, setActiveQuiz] = useState(null);

    // --- DATA TRANSFORMATION ---
    const flattenedQuizzes = useMemo(() => {
        if (!quizContent || !quizContent.topics) return [];
        return quizContent.topics.flatMap(topicItem => {
            const levels = ['easy', 'medium', 'hard'];
            return levels.map(level => {
                const questions = topicItem.quizzes?.[level] || [];
                if (questions.length === 0) return null;
                return {
                    id: `${topicItem.topic}-${level}`,
                    topic: topicItem.topic,
                    description: topicItem.info,
                    level: level,
                    questionsCount: questions.length,
                    timeEstimate: Math.ceil(questions.length * 0.8),
                    image: getImageForTopic(topicItem.topic),
                    questions: questions
                };
            }).filter(Boolean);
        });
    }, [quizContent]);

    const articles = useMemo(() => {
        if (!quizContent || !quizContent.topics) return [];
        return quizContent.topics.flatMap(topic =>
            (topic.sources || [])
                .filter(source => source.type.toLowerCase().includes('web') || source.type.toLowerCase().includes('article'))
                .map(source => ({
                    title: source.title,
                    url: source.url,
                    topic: topic.topic,
                    type: 'Article',
                    readTime: '5 min read'
                }))
        );
    }, [quizContent]);

    // --- VIDEO HELPER FUNCTIONS ---
    const getVideoId = (url) => {
        if (!url) return null;
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    };

    const getThumbnailUrl = (videoId) => {
        return videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : null;
    };

    const videos = useMemo(() => {
        const allVideos = [];

        const processCategory = (category, items) => {
            return items.map(item => {
                const videoId = getVideoId(item.link);
                return {
                    id: videoId || Math.random().toString(),
                    title: item.name,
                    url: item.link,
                    thumbnail: getThumbnailUrl(videoId),
                    category: category,
                    date: item.time_and_date,
                    location: item.location
                };
            });
        };

        if (learningVideos.rocket_launches) {
            allVideos.push(...processCategory('Launch', learningVideos.rocket_launches));
        }
        if (learningVideos.cosmic_events) {
            allVideos.push(...processCategory('Event', learningVideos.cosmic_events));
        }
        if (learningVideos.informative_videos) {
            allVideos.push(...processCategory('Documentary', learningVideos.informative_videos));
        }

        return allVideos;
    }, []);

    const filteredContent = useMemo(() => {
        if (activeTab !== 'Quizzes') return [];
        let content = flattenedQuizzes;
        if (activeFilter !== 'All Topics') {
            if (['Easy', 'Medium', 'Hard'].includes(activeFilter)) {
                content = content.filter(q => q.level.toLowerCase() === activeFilter.toLowerCase());
            } else {
                content = content.filter(q => {
                    if (activeFilter === "Space Missions" && q.topic.includes("Space Missions")) return true;
                    if (activeFilter === "Satellites" && q.topic.includes("Satellites")) return true;
                    if (activeFilter === "Cosmic Events" && q.topic.includes("Cosmic Events")) return true;
                    if (activeFilter === "Solar System" && q.topic.includes("Solar System")) return true;
                    if (activeFilter === "Exoplanets" && q.topic.includes("Exoplanets")) return true;
                    if (activeFilter === "Space Tech" && (q.topic.includes("Technology") || q.topic.includes("Engineering"))) return true;
                    return false;
                });
            }
        }
        return content;
    }, [flattenedQuizzes, activeFilter, activeTab]);

    const leaderboardData = [
        { rank: 1, name: "AstroAlex", xp: 15420, avatar: "👨‍🚀" },
        { rank: 2, name: "CosmicKate", xp: 14850, avatar: "👩‍🚀" },
        { rank: 3, name: "StarLord_99", xp: 14200, avatar: "👽" },
        { rank: 4, name: "NebulaNova", xp: 13500, avatar: "👾" },
        { rank: 5, name: "Cmdr. Shepard", xp: 12800, avatar: "🤖", isUser: true },
    ];

    function getImageForTopic(topic) {
        const t = topic.toLowerCase();
        // High quality Unsplash images
        if (t.includes('space missions')) return "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&q=80&w=800"; // Launch
        if (t.includes('satellites')) return "https://images.unsplash.com/photo-1541188495357-ad2db385d439?auto=format&fit=crop&q=80&w=800"; // Satellite
        if (t.includes('cosmic events')) return "https://images.unsplash.com/photo-1531306728370-e2ebd9d7bb99?auto=format&fit=crop&q=80&w=800"; // Aurora
        if (t.includes('solar system')) return "https://images.unsplash.com/photo-1614730341194-75c60740a2d3?auto=format&fit=crop&q=80&w=800"; // Planets
        if (t.includes('exoplanets')) return "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?auto=format&fit=crop&q=80&w=800"; // Deep Space
        if (t.includes('technology') || t.includes('engineering')) return "https://images.unsplash.com/photo-1517976487492-5750f3195933?auto=format&fit=crop&q=80&w=800"; // Tech

        return "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=800"; // General
    }

    const getDifficultyColor = (level) => {
        switch (level.toLowerCase()) {
            case 'easy': return { text: 'text-[#00ff88]', bg: 'bg-[#00ff88]/20', border: 'border-[#00ff88]/40', label: 'Beginner' };
            case 'medium': return { text: 'text-[#ffaa00]', bg: 'bg-[#ffaa00]/20', border: 'border-[#ffaa00]/40', label: 'Intermediate' };
            case 'hard': return { text: 'text-[#ff3366]', bg: 'bg-[#ff3366]/20', border: 'border-[#ff3366]/40', label: 'Advanced' };
            default: return { text: 'text-white', bg: 'bg-white/20', border: 'border-white/40', label: level };
        }
    };

    const topicCategories = [
        "Space Missions",
        "Satellites",
        "Cosmic Events",
        "Solar System",
        "Exoplanets",
        "Space Tech"
    ];

    const FilterBar = () => (
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div className="flex gap-3 overflow-x-auto pb-2 w-full md:w-auto scrollbar-hide">
                <button
                    onClick={() => setActiveFilter('All Topics')}
                    className={`px-5 py-2.5 rounded-full text-[13px] font-medium border whitespace-nowrap transition-all ${activeFilter === 'All Topics'
                        ? 'bg-[#00d9ff]/15 border-[#00d9ff]/30 text-[#00d9ff]'
                        : 'bg-[#0f1322]/60 border-white/10 text-[#94a3b8] hover:text-white'
                        }`}
                >
                    All Topics
                </button>
                {topicCategories.map((filter) => (
                    <button
                        key={filter}
                        onClick={() => setActiveFilter(filter)}
                        className={`px-5 py-2.5 rounded-full text-[13px] font-medium border whitespace-nowrap transition-all ${activeFilter === filter
                            ? 'bg-[#00d9ff]/15 border-[#00d9ff]/30 text-[#00d9ff]'
                            : 'bg-[#0f1322]/60 border-white/10 text-[#94a3b8] hover:text-white'
                            }`}
                    >
                        {filter}
                    </button>
                ))}
                <div className="h-6 w-px bg-white/10 mx-2 self-center" />
                {['Easy', 'Medium', 'Hard'].map((filter) => (
                    <button
                        key={filter}
                        onClick={() => setActiveFilter(filter)}
                        className={`px-4 py-2.5 rounded-full text-[13px] font-medium border whitespace-nowrap transition-all ${activeFilter === filter
                            ? 'bg-purple-500/20 border-purple-500/40 text-purple-400'
                            : 'bg-[#0f1322]/60 border-white/10 text-[#94a3b8] hover:text-white'
                            }`}
                    >
                        {filter}
                    </button>
                ))}
            </div>
            <button className="flex items-center gap-2 px-4 py-2 bg-[#0f1322]/60 border border-white/10 rounded-full text-[#94a3b8] text-[13px]">
                <Filter size={14} /> Sort by: Popular <ChevronDown size={14} />
            </button>
        </div>
    );

    const QuizCard = ({ quiz, index }) => {
        const theme = getDifficultyColor(quiz.level);
        return (
            <div className="group relative flex flex-col h-full rounded-2xl overflow-hidden bg-black/30 backdrop-blur-md border border-white/5 hover:border-[#00d9ff]/30 transition-all hover:-translate-y-1 cursor-pointer">
                <div className="relative h-[180px] w-full overflow-hidden">
                    <img src={quiz.image} alt={quiz.topic} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0f1322] via-transparent to-transparent opacity-90" />
                    <div className={`absolute top-3 right-3 px-3 py-1.5 rounded-full border text-[11px] font-bold uppercase ${theme.text} ${theme.bg} ${theme.border}`}>
                        {theme.label}
                    </div>
                </div>
                <div className="p-5 flex flex-col flex-grow">
                    <h3 className="font-bold text-lg text-white mb-2 line-clamp-2">{quiz.topic}</h3>
                    <p className="text-[13px] text-[#94a3b8] mb-4 line-clamp-2 flex-grow">{quiz.description}</p>
                    <div className="flex items-center gap-4 mb-4 text-[#b8c5d6] text-xs">
                        <div className="flex items-center gap-1.5"><Clock size={12} /><span>~{quiz.timeEstimate} min</span></div>
                        <div className="flex items-center gap-1.5"><List size={12} /><span>{quiz.questionsCount} questions</span></div>
                    </div>
                    <button
                        onClick={() => setActiveQuiz(quiz)}
                        className="w-full py-3 rounded-lg bg-gradient-to-r from-[#00d9ff] to-[#b900ff] text-black text-sm font-bold transition-all group-hover:scale-[1.02]"
                    >
                        Participate
                    </button>
                </div>
            </div>
        );
    };

    const ArticleCard = ({ article }) => (
        <div className="group flex flex-col h-full rounded-2xl overflow-hidden bg-black/30 backdrop-blur-md border border-white/5 hover:border-[#00d9ff]/30 transition-all hover:-translate-y-1">
            <div className="relative h-40 w-full overflow-hidden bg-gray-900">
                <FileText className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white/20" size={48} />
                <div className="absolute top-3 left-3 px-2.5 py-1 bg-[#00d9ff]/20 rounded-full text-[10px] font-bold text-[#00d9ff] uppercase">
                    {article.topic}
                </div>
            </div>
            <div className="p-5 flex flex-col flex-grow">
                <h3 className="font-bold text-base text-white mb-2 line-clamp-2 group-hover:text-[#00d9ff]">{article.title}</h3>
                <div className="mt-auto pt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-[#64748b]">
                    <span>{article.readTime}</span>
                    <a href={article.url} target="_blank" rel="noreferrer" className="text-[#00d9ff] hover:underline flex items-center gap-1">Read <ArrowRight size={10} /></a>
                </div>
            </div>
        </div>
    );

    const VideoCard = ({ video }) => (
        <div
            onClick={() => window.open(video.url, '_blank')}
            className="group rounded-2xl overflow-hidden bg-black/30 backdrop-blur-md border border-white/5 hover:border-[#00d9ff]/30 transition-all hover:-translate-y-1 cursor-pointer flex flex-col h-full"
        >
            <div className="relative aspect-video bg-black overflow-hidden">
                {video.thumbnail ? (
                    <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-90 group-hover:opacity-100" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-900">
                        <Video className="text-white/20" size={48} />
                    </div>
                )}

                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-all flex items-center justify-center">
                    <div className="w-14 h-14 rounded-full bg-[#00d9ff]/20 border border-[#00d9ff]/50 flex items-center justify-center text-[#00d9ff] shadow-[0_0_20px_rgba(0,217,255,0.3)] group-hover:scale-110 transition-transform">
                        <Play size={24} fill="currentColor" />
                    </div>
                </div>

                <div className="absolute top-3 left-3 px-2 py-0.5 rounded bg-black/60 border border-white/10 text-[10px] font-bold text-[#00d9ff] uppercase backdrop-blur-sm">
                    {video.category}
                </div>
            </div>

            <div className="p-5 flex flex-col flex-grow">
                <h3 className="font-bold text-base text-white mb-3 line-clamp-2 leading-tight group-hover:text-[#00d9ff] transition-colors">{video.title}</h3>

                <div className="mt-auto space-y-2">
                    {video.date && (
                        <div className="flex items-start gap-2 text-[11px] text-slate-400">
                            <Calendar size={12} className="mt-0.5" />
                            <span className="line-clamp-1">{video.date}</span>
                        </div>
                    )}
                    {video.location && video.location !== "N/A" && video.location !== "Not specified" && (
                        <div className="flex items-start gap-2 text-[11px] text-slate-400">
                            <MapPin size={12} className="mt-0.5" />
                            <span className="line-clamp-1">{video.location}</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );

    return (
        <div className="flex h-screen bg-transparent text-slate-300 font-sans overflow-hidden">
            <Sidebar activeTab="Learning Zone" />

            <div className="flex-1 flex flex-col min-w-0 bg-transparent relative">
                <div className="absolute top-[-20%] left-[20%] w-[500px] h-[500px] bg-[#00d9ff]/5 rounded-full blur-[100px] pointer-events-none" />

                {/* Header */}
                <header className="h-16 flex items-center justify-between px-6 border-b border-white/5 bg-black/20 backdrop-blur-md sticky top-0 z-10">
                    <div className="flex-1 max-w-xl">
                        <div className="relative group">
                            <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-[#00d9ff] text-lg" />
                            <input
                                type="text"
                                placeholder="Search quizzes, articles, or videos..."
                                className="w-full bg-[#0f1322] border border-white/10 rounded-lg py-2 pl-10 pr-12 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#00d9ff]/50"
                            />
                        </div>
                    </div>
                    <div className="flex items-center gap-4 ml-4">
                        <button className="relative text-slate-400 hover:text-white">
                            <MdNotifications className="text-xl" />
                            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-red-500 rounded-full" />
                        </button>
                        <button onClick={() => navigate('/profile')} className="text-slate-400 hover:text-white">
                            <MdSettings className="text-xl" />
                        </button>
                        <div className="h-8 w-px bg-white/10" />
                        <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/profile')}>
                            <div className="text-right hidden md:block">
                                {authLoading ? (
                                    <div className="h-4 w-24 bg-slate-700 rounded animate-pulse" />
                                ) : user ? (
                                    <>
                                        <div className="text-sm font-bold text-white">{user.fullName || user.username}</div>
                                        <div className="text-[10px] text-[#00d9ff]">@{user.username}</div>
                                    </>
                                ) : (
                                    <div className="text-sm font-bold text-white">Guest</div>
                                )}
                            </div>
                            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#00d9ff] to-blue-600 p-0.5">
                                <div className="w-full h-full rounded-full bg-[#080b14] flex items-center justify-center">
                                    {user ? (
                                        <span className="text-white text-sm font-bold">{(user.fullName || user.username)?.charAt(0).toUpperCase()}</span>
                                    ) : (
                                        <FaUserAstronaut className="text-white text-sm" />
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Main Content */}
                <main className="flex-1 overflow-y-auto">
                    <div className="px-6 py-4 border-b border-white/5">
                        <div className="flex items-center gap-3">
                            <GraduationCap className="text-[#00d9ff]" size={28} />
                            <div>
                                <h1 className="text-2xl font-bold text-white">Learning Zone</h1>
                                <p className="text-sm text-slate-400">Explore space science through interactive content</p>
                            </div>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="h-14 bg-[#0a0e17]/80 border-b border-white/5 px-8 flex items-center gap-2 sticky top-0 z-40">
                        {[
                            { id: 'Quizzes', icon: <FileText size={16} /> },
                            { id: 'Articles', icon: <LayoutGrid size={16} /> },
                            { id: 'Videos', icon: <Video size={16} /> },
                            { id: 'Leaderboard', icon: <Trophy size={16} /> }
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => {
                                    setActiveTab(tab.id);
                                    if (tab.id === 'Leaderboard') setShowLeaderboard(true);
                                }}
                                className={`flex items-center gap-2 px-6 py-3 text-sm font-medium border-b-2 transition-all ${activeTab === tab.id
                                    ? 'border-[#00d9ff] text-[#00d9ff] bg-[#00d9ff]/5'
                                    : 'border-transparent text-[#94a3b8] hover:text-white'
                                    }`}
                            >
                                {tab.icon} {tab.id}
                            </button>
                        ))}
                    </div>

                    {/* Content */}
                    <div className="flex p-8">
                        <div className={`flex-1 ${showLeaderboard && activeTab !== 'Leaderboard' ? 'xl:w-[70%]' : 'w-full'}`}>
                            {activeTab === 'Quizzes' && (
                                <div>
                                    <FilterBar />
                                    <div className="flex items-center gap-2 mb-6 text-white font-bold text-xl">
                                        <Sparkles className="text-[#00d9ff]" size={20} /> Recommended for You
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8 pb-8 border-b border-white/5">
                                        {filteredContent.slice(0, 3).map((quiz, idx) => (
                                            <QuizCard key={quiz.id} quiz={quiz} index={idx} />
                                        ))}
                                    </div>
                                    <h2 className="font-bold text-xl text-white mb-6">All Quizzes</h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-12">
                                        {filteredContent.map((quiz, idx) => (
                                            <QuizCard key={quiz.id} quiz={quiz} index={idx} />
                                        ))}
                                    </div>
                                    {filteredContent.length > 0 && (
                                        <div className="flex justify-center gap-2 mt-8 pb-12">
                                            <button className="w-10 h-10 flex items-center justify-center rounded-lg bg-[#0f1322]/60 border border-white/10 text-[#94a3b8]"><ChevronLeft size={16} /></button>
                                            <button className="w-10 h-10 flex items-center justify-center rounded-lg bg-[#00d9ff]/15 border border-[#00d9ff]/30 text-[#00d9ff]">1</button>
                                            <button className="w-10 h-10 flex items-center justify-center rounded-lg bg-[#0f1322]/60 border border-white/10 text-[#94a3b8]">2</button>
                                            <button className="w-10 h-10 flex items-center justify-center rounded-lg bg-[#0f1322]/60 border border-white/10 text-[#94a3b8]"><ChevronRight size={16} /></button>
                                        </div>
                                    )}
                                </div>
                            )}

                            {activeTab === 'Articles' && (
                                <div className="max-w-[1400px] mx-auto">
                                    {articles.length > 0 ? (
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                            {articles.map((article, idx) => (
                                                <ArticleCard key={idx} article={article} />
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-20 text-[#94a3b8]">No articles found.</div>
                                    )}
                                </div>
                            )}

                            {activeTab === 'Videos' && (
                                <div className="max-w-[1400px] mx-auto">
                                    {videos.length > 0 ? (
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                            {videos.map((video, idx) => (
                                                <VideoCard key={idx} video={video} />
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-20 text-[#94a3b8]">No videos found.</div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Leaderboard Sidebar */}
                        {showLeaderboard && activeTab !== 'Leaderboard' && (
                            <div className="hidden xl:block w-[30%] min-w-[320px] max-w-[400px] pl-8 border-l border-white/5">
                                <div className="sticky top-0 bg-black/30 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                                    <div className="flex justify-between items-center mb-4">
                                        <div className="flex items-center gap-2">
                                            <Trophy className="text-[#ffd700]" size={20} />
                                            <h3 className="font-bold text-lg text-white">Leaderboard</h3>
                                        </div>
                                    </div>
                                    <div className="bg-[#00d9ff]/10 border border-[#00d9ff]/30 rounded-xl p-4 mb-4">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <span className="font-black text-2xl text-[#00d9ff]">#5</span>
                                                <div>
                                                    <div className="font-bold text-sm text-white">You</div>
                                                    <div className="text-[10px] text-[#00ff88]">▲ 12 ranks up</div>
                                                </div>
                                            </div>
                                            <div className="font-bold text-[#00d9ff]">12,800 XP</div>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        {leaderboardData.map((u) => (
                                            <div key={u.rank} className={`flex items-center gap-3 py-3 px-2 rounded-lg ${u.isUser ? 'bg-[#00d9ff]/10' : ''}`}>
                                                <div className={`w-8 text-center font-bold ${u.rank <= 3 ? 'text-[#ffd700]' : 'text-[#64748b]'}`}>
                                                    {u.rank <= 3 ? (u.rank === 1 ? '🥇' : u.rank === 2 ? '🥈' : '🥉') : u.rank}
                                                </div>
                                                <div className="w-8 h-8 rounded-full border-2 border-[#2e364f] flex items-center justify-center bg-black/30 backdrop-blur-md text-lg">{u.avatar}</div>
                                                <div className="flex-1"><div className="text-[13px] text-white">{u.name}</div></div>
                                                <div className="font-bold text-[13px] text-[#94a3b8]">{u.xp.toLocaleString()} XP</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </main>
            </div>

            {/* Quiz Active View Modal */}
            {activeQuiz && (
                <QuizActiveView
                    topicTitle={activeQuiz.topic}
                    difficulty={activeQuiz.level}
                    questions={activeQuiz.questions}
                    onClose={() => setActiveQuiz(null)}
                    onComplete={(finalScore) => {
                        console.log("XP Earned:", finalScore);
                    }}
                />
            )}
        </div>
    );
};

export default LearningPage; 