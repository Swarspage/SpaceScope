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
    Calendar,
    X,
    ExternalLink
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
import quizData from '../data/Quiz.json';
import learningVideos from '../data/learningZoneYtVideos.json';
import articlesData from '../data/articles.json';

const LearningPage = () => {
    // Router and Auth
    const navigate = useNavigate();
    const { user, loading: authLoading } = useAuth();

    // --- STATE MANAGEMENT ---
    const [activeTab, setActiveTab] = useState('Quizzes');
    const [searchQuery, setSearchQuery] = useState('');
    
    // STRUCTURED FILTERS STATE (Removed difficulty from top level)
    const [filters, setFilters] = useState({
        topic: 'All Topics',
        mode: 'All Modes',
        sort: 'Popular'
    });

    const [quizContent] = useState(quizData);
    const [showLeaderboard, setShowLeaderboard] = useState(true);
    
    // MODAL STATE
    const [selectedTopic, setSelectedTopic] = useState(null); // The topic object opened in modal
    const [activeQuiz, setActiveQuiz] = useState(null); // The specific quiz (topic+level) currently being played

    // --- MOCKED USER MEMORY / PROGRESS ---
    // Tracks progress per difficulty id: "TopicName-level" -> 'completed' | 'in-progress'
    const [userProgress] = useState({
        'Space Missions (JWST, Perseverance, etc.)-easy': 'completed',
        'Satellites & Applications (Agriculture, Climate)-easy': 'in-progress',
        'Cosmic Events (Supernovae, Black Holes)-medium': 'completed',
        'Solar System Exploration-easy': 'in-progress'
    });

    // --- DATA TRANSFORMATION: TOPIC AGGREGATION ---
    const topicCards = useMemo(() => {
        if (!quizContent || !quizContent.topics) return [];
        
        return quizContent.topics.map((topicItem, idx) => {
            const levels = ['easy', 'medium', 'hard'];
            let totalQuestions = 0;
            let minTime = Infinity;
            let maxTime = 0;
            let hasNew = false;
            let hasTrending = false;
            
            // Analyze difficulties
            const difficulties = levels.map(level => {
                const questions = topicItem.quizzes?.[level] || [];
                if (questions.length === 0) return null;

                const time = Math.ceil(questions.length * 0.8);
                totalQuestions += questions.length;
                if (time < minTime) minTime = time;
                if (time > maxTime) maxTime = time;

                const id = `${topicItem.topic}-${level}`;
                
                // Mock attributes for specific levels
                const isNew = (idx + questions.length) % 7 === 0;
                if (isNew) hasNew = true;

                return {
                    level,
                    questionsCount: questions.length,
                    timeEstimate: time,
                    status: userProgress[id] || 'unattempted',
                    questions: questions
                };
            }).filter(Boolean);

            if (difficulties.length === 0) return null;

            // Mock Trend
            hasTrending = (idx % 3 === 0);

            // Determine Overall Topic Status
            const statuses = difficulties.map(d => d.status);
            let overallStatus = 'unattempted';
            if (statuses.some(s => s === 'in-progress')) overallStatus = 'in-progress';
            else if (statuses.every(s => s === 'completed')) overallStatus = 'completed';

            return {
                id: topicItem.topic,
                topic: topicItem.topic,
                description: topicItem.info,
                image: getImageForTopic(topicItem.topic),
                totalQuestions,
                timeRange: minTime === Infinity ? "0" : `${minTime}-${maxTime}`,
                difficulties, // Array of available difficulties
                status: overallStatus,
                isNew: hasNew,
                isTrending: hasTrending,
                popularityScore: Math.floor(Math.random() * 1000)
            };
        }).filter(Boolean);
    }, [quizContent, userProgress]);

    // --- ARTICLES DATA & STATE ---
    const [articleTopic, setArticleTopic] = useState('All Topics');
    const [activeArticle, setActiveArticle] = useState(null);

    // Helper to derive topic from title (since JSON lacks it)
    const getTopicFromTitle = (title) => {
        const t = title.toLowerCase();
        if (t.includes('mars')) return 'Mars';
        if (t.includes('webb') || t.includes('telescope')) return 'Space Tech';
        if (t.includes('black hole')) return 'Black Holes';
        if (t.includes('exoplanet') || t.includes('habitable') || t.includes('orbiting')) return 'Exoplanets';
        if (t.includes('solar system')) return 'Solar System';
        return 'General Space';
    };

    const processedArticles = useMemo(() => {
        return (articlesData || []).map(article => ({
            ...article,
            // Use existing topic if available, else derive
            topic: article.topic || getTopicFromTitle(article.title),
            // Ensure fallbacks
            source: article.source || "Verified Source",
            domain: article.domain || "External",
            category: article.category || "Overview",
            reading_time: article.reading_time || "5 min",
            published_date: article.published_date
        }));
    }, []);

    // Get unique topics for properties
    const articleTopics = useMemo(() => {
        const topics = new Set(processedArticles.map(a => a.topic));
        return ['All Topics', ...Array.from(topics).sort()];
    }, [processedArticles]);

    // Filter and Group Articles
    const articleSections = useMemo(() => {
        // 1. Filter by Topic
        let filtered = processedArticles;
        if (articleTopic !== 'All Topics') {
            filtered = filtered.filter(a => a.topic === articleTopic);
        }

        // 2. Group by Section (Category)
        const sections = {
            startHere: filtered.filter(a => ['Overview', 'Explainer'].includes(a.category)),
            deepDives: filtered.filter(a => ['Research', 'Deep Dive'].includes(a.category)),
            updates: filtered.filter(a => ['News', 'Update'].includes(a.category))
        };

        return sections;
    }, [processedArticles, articleTopic]);

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

    // --- VIDEO STATE & LOGIC ---
    const [activeVideo, setActiveVideo] = useState(null);

    const videoSections = useMemo(() => {
        if (!learningVideos) return [];

        return Object.entries(learningVideos).map(([key, items]) => {
            // Format Title: rocket_launches -> Rocket Launches
            const title = key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
            
            return {
                id: key,
                title,
                videos: items.map(item => {
                    const videoId = getVideoId(item.link);
                    return {
                        id: videoId || Math.random().toString(),
                        title: item.name,
                        url: item.link,
                        embedUrl: videoId ? `https://www.youtube.com/embed/${videoId}` : null,
                        thumbnail: getThumbnailUrl(videoId),
                        date: item.time_and_date,
                        location: item.location
                    };
                })
            };
        });
    }, []);

    const filteredContent = useMemo(() => {
        if (activeTab !== 'Quizzes') return [];
        
        // Apply Topic & Search Filter
        let content = topicCards.filter(q => {
            const matchesTopic = filters.topic === 'All Topics' || q.topic === filters.topic;
            const matchesSearch = !searchQuery || 
                                  q.topic.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                  q.description.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesTopic && matchesSearch;
        });

        // Apply Sort
        if (filters.sort === 'New') {
            content = [...content].sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));
        } else if (filters.sort === 'Popular' || filters.sort === 'Trending') {
             content = [...content].sort((a, b) => (b.isTrending ? 1 : 0) - (a.isTrending ? 1 : 0));
        }

        return content;
    }, [topicCards, filters, activeTab, searchQuery]);

    // DERIVED SECTIONS FOR GUIDED LAYOUT
    const sections = useMemo(() => {
        return {
            continueLearning: topicCards.filter(q => q.status === 'in-progress'),
            newArrivals: topicCards.filter(q => q.isNew && q.status !== 'completed'),
            trending: topicCards.filter(q => q.isTrending),
            recommended: topicCards.slice(0, 3) 
        };
    }, [topicCards]);

    const leaderboardData = [
        { rank: 1, name: "AstroAlex", xp: 15420, avatar: "👨‍🚀" },
        { rank: 2, name: "CosmicKate", xp: 14850, avatar: "👩‍🚀" },
        { rank: 3, name: "StarLord_99", xp: 14200, avatar: "👽" },
        { rank: 4, name: "NebulaNova", xp: 13500, avatar: "👾" },
        { rank: 5, name: "Cmdr. Shepard", xp: 12800, avatar: "🤖", isUser: true },
    ];

    function getImageForTopic(topic) {
        // Mapping topics to specific, reliable high-quality Unsplash images
        // These are static links to "real existing images" as requested
        const topicImages = {
            "Space Missions (JWST, Perseverance, etc.)": "https://images.unsplash.com/photo-1516849841032-87cbac4d88f7?q=80&w=800", // Rocket/Mission
            "Satellites & Applications (Agriculture, Climate)": "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=800", // Earth/Satellite view
            "Cosmic Events (Aurora, Meteor showers, Solar flares)": "https://images.unsplash.com/photo-1531306728370-e2ebd9d7bb99?q=80&w=800", // Aurora
            "Solar System (Planets, asteroids)": "https://images.unsplash.com/photo-1531306728370-e2ebd9d7bb99?q=80&w=800", // Planet
            "Exoplanets & Deep Space": "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?q=80&w=800", // Deep Space/Nebula
            "Space Technology & Engineering": "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=800" // Tech/Engineering
        };

        return topicImages[topic] || "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?q=80&w=800"; // Fallback
    }

    const getDifficultyColor = (level) => {
        switch (level.toLowerCase()) {
            case 'easy': return { text: 'text-[#00ff88]', bg: 'bg-[#00ff88]/20', border: 'border-[#00ff88]/40', label: 'Beginner' };
            case 'medium': return { text: 'text-[#ffaa00]', bg: 'bg-[#ffaa00]/20', border: 'border-[#ffaa00]/40', label: 'Intermediate' };
            case 'hard': return { text: 'text-[#ff3366]', bg: 'bg-[#ff3366]/20', border: 'border-[#ff3366]/40', label: 'Advanced' };
            default: return { text: 'text-white', bg: 'bg-white/20', border: 'border-white/40', label: level };
        }
    };

    const topicCategories = useMemo(() => {
        const topics = new Set(topicCards.map(q => q.topic));
        return Array.from(topics);
    }, [topicCards]);

    const QuizFilters = ({ searchQuery, setSearchQuery }) => (
        <div className="flex flex-col md:flex-row md:items-center gap-4 mb-8 sticky top-0 z-30 py-4 -mx-2 px-2 border-b border-white/5 backdrop-blur-xl">
             {/* Search Input - FIRST as requested */}
            <div className="relative w-full md:w-auto md:flex-1 md:max-w-[320px] animate-fade-in group">
                <MdSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-[#00d9ff] transition-colors" size={18} />
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search topics..."
                    className="w-full appearance-none bg-[#0f1322] border border-white/10 rounded-full py-2.5 pl-10 pr-5 text-[13px] font-medium text-slate-300 placeholder-slate-500 focus:outline-none focus:border-[#00d9ff]/50 focus:bg-[#0f1322]/80 transition-all shadow-sm"
                />
            </div>

            {/* Filters Wrapper for mobile wrapping */}
            <div className="flex flex-wrap items-center gap-3">
                {/* Topic Selector */}
                <div className="relative group">
                    <select 
                        value={filters.topic}
                        onChange={(e) => setFilters(prev => ({...prev, topic: e.target.value}))}
                        className="appearance-none bg-[#0f1322]/80 border border-white/10 rounded-full py-2.5 pl-4 pr-10 text-[13px] font-medium text-slate-300 focus:outline-none focus:border-[#00d9ff]/50 cursor-pointer min-w-[160px] hover:border-white/20 transition-colors"
                    >
                        <option value="All Topics">All Topics</option>
                        {topicCategories.map(topic => (
                            <option key={topic} value={topic}>{topic}</option>
                        ))}
                    </select>
                    <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" size={14} />
                </div>

                {/* Mode Selector */}
                <div className="relative group">
                    <select 
                        value={filters.mode}
                        onChange={(e) => setFilters(prev => ({...prev, mode: e.target.value}))}
                        className="appearance-none bg-[#0f1322]/80 border border-white/10 rounded-full py-2.5 pl-4 pr-10 text-[13px] font-medium text-slate-300 focus:outline-none focus:border-[#00d9ff]/50 cursor-pointer hover:border-white/20 transition-colors"
                    >
                        <option value="All Modes">All Modes</option>
                        <option value="Learn">Learn</option>
                        <option value="Practice">Practice</option>
                        <option value="Challenge">Challenge</option>
                    </select>
                    <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" size={14} />
                </div>

                {/* Sort Selector */}
                <div className="relative group">
                    <select 
                        value={filters.sort}
                        onChange={(e) => setFilters(prev => ({...prev, sort: e.target.value}))}
                        className="appearance-none bg-[#0f1322]/80 border border-white/10 rounded-full py-2.5 pl-4 pr-10 text-[13px] font-medium text-[#94a3b8] focus:outline-none focus:border-[#00d9ff]/50 cursor-pointer min-w-[140px] hover:border-white/20 transition-colors"
                    >
                        <option value="Popular">Sort: Popular</option>
                        <option value="New">Sort: Newest</option>
                        <option value="XP">Sort: XP Value</option>
                        <option value="Time">Sort: Duration</option>
                    </select>
                    <Filter className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" size={12} />
                </div>
            </div>
        </div>
    );

    // --- COMPONENTS ---
    
    // Modal Component
    const QuizSelectionModal = ({ topic, onClose }) => {
        const [timerEnabled, setTimerEnabled] = useState(false);
        const [selectedDuration, setSelectedDuration] = useState(5);
        
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
                <div className="relative w-full max-w-2xl bg-[#0a0e17] border border-white/10 rounded-3xl overflow-hidden shadow-2xl animate-fade-in-up">
                    
                    {/* Header */}
                    <div className="p-6 border-b border-white/5 flex items-center justify-between">
                        <div>
                            <h2 className="text-xl font-bold text-white mb-1">{topic.topic}</h2>
                            <p className="text-sm text-slate-400">Select difficulty to start</p>
                        </div>
                        <button onClick={onClose} className="p-2 rounded-full hover:bg-white/5 transition-colors text-slate-400 hover:text-white">
                            <ArrowRight className="rotate-45" size={20} />
                        </button>
                    </div>

                    {/* Difficulties */}
                    <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-4">
                         {['easy', 'medium', 'hard'].map(level => {
                             const data = topic.difficulties.find(d => d.level === level);
                             if (!data) return (
                                 <div key={level} className="border border-white/5 rounded-2xl p-4 flex flex-col items-center justify-center text-slate-600 opacity-50 cursor-not-allowed">
                                     <span className="uppercase text-xs font-bold">{level}</span>
                                     <span className="text-xs mt-1">Locked</span>
                                 </div>
                             );

                             const theme = getDifficultyColor(level);
                             return (
                                 <div key={level} className="relative group border border-white/10 bg-white/5 rounded-2xl p-5 flex flex-col hover:border-[#00d9ff]/50 transition-all cursor-default">
                                     <div className={`text-xs font-bold uppercase mb-4 ${theme.text}`}>{theme.label}</div>
                                     <div className="text-2xl font-black text-white mb-1">{data.questionsCount}</div>
                                     <div className="text-xs text-slate-400 mb-6 font-medium tracking-wide">Questions</div>
                                     
                                     {data.status === 'completed' && <div className="absolute top-4 right-4 text-[#00ff88]"><Sparkles size={14} /></div>}
                                     
                                     <button 
                                        onClick={() => {
                                            setActiveQuiz({ ...topic, ...data, timeLimit: timerEnabled ? selectedDuration : null });
                                            onClose();
                                        }}
                                        className={`w-full py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                                            data.status === 'completed' 
                                            ? 'bg-white/5 text-slate-400 hover:bg-white/10' 
                                            : 'bg-[#00d9ff]/10 text-[#00d9ff] hover:bg-[#00d9ff] hover:text-black'
                                        }`}
                                     >
                                         {data.status === 'completed' ? 'Replay' : data.status === 'in-progress' ? 'Resume' : 'Start'}
                                     </button>
                                 </div>
                             );
                         })}
                    </div>

                    {/* Timer Section */}
                    <div className="px-8 pb-8">
                        <div className="bg-[#0f1322] rounded-xl p-5 border border-white/5 flex flex-col md:flex-row items-center justify-between gap-6">
                            <div className="flex items-center gap-4">
                                <div className={`w-12 h-6 rounded-full p-1 cursor-pointer transition-colors ${timerEnabled ? 'bg-[#00d9ff]' : 'bg-slate-700'}`} onClick={() => setTimerEnabled(!timerEnabled)}>
                                    <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${timerEnabled ? 'translate-x-6' : 'translate-x-0'}`} />
                                </div>
                                <div>
                                    <div className="text-sm font-bold text-white flex items-center gap-2"><Clock size={14} className={timerEnabled ? 'text-[#00d9ff]' : 'text-slate-500'} /> Timed Mode</div>
                                    <div className="text-xs text-slate-500">Challenge yourself with a countdown</div>
                                </div>
                            </div>

                            {timerEnabled && (
                                <div className="flex items-center gap-2">
                                    {[5, 10, 15].map(min => (
                                        <button 
                                            key={min}
                                            onClick={() => setSelectedDuration(min)}
                                            className={`px-4 py-2 rounded-lg text-xs font-bold border transition-all ${selectedDuration === min 
                                                ? 'bg-[#00d9ff]/20 border-[#00d9ff] text-[#00d9ff]' 
                                                : 'bg-transparent border-white/10 text-slate-400 hover:text-white'}`}
                                        >
                                            {min}m
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    };



    const TopicCard = ({ topic }) => {
        const isCompleted = topic.status === 'completed';
        const isInProgress = topic.status === 'in-progress';
        
        return (
            <div 
                onClick={() => setSelectedTopic(topic)}
                className="group relative flex flex-col h-full rounded-2xl overflow-hidden bg-black/30 backdrop-blur-md border border-white/5 hover:border-[#00d9ff]/30 transition-all hover:-translate-y-1 cursor-pointer"
            >
                <div className="relative h-[160px] w-full overflow-hidden">
                    <img src={topic.image} alt={topic.topic} className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 ${isCompleted ? 'grayscale-[50%]' : ''}`} />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0f1322] via-transparent to-transparent opacity-90" />
                    
                    <div className="absolute top-3 left-3 flex gap-1.5 z-10">
                        {['easy', 'medium', 'hard'].map(level => {
                             const isAvailable = topic.difficulties?.some(d => d.level === level);
                             if (!isAvailable) return null;
                             const color = level === 'easy' ? 'bg-[#00d9ff]' : level === 'medium' ? 'bg-orange-400' : 'bg-red-500';
                             return <div key={level} className={`w-2 h-2 rounded-full ${color} shadow-sm ring-1 ring-black/20`} title={level} />
                        })}
                    </div>

                    <div className="absolute top-3 right-3 flex gap-2">
                        {topic.isNew && <div className="px-2 py-1 rounded bg-blue-500/20 border border-blue-500/40 text-[10px] font-bold text-blue-400 uppercase tracking-wider backdrop-blur-md">NEW</div>}
                    </div>

                     {/* Topic Stats Overlay */}
                    <div className="absolute bottom-3 left-3 flex items-center gap-3 text-white/80 text-[11px] font-medium backdrop-blur-md px-2 py-1 rounded-lg bg-black/20">
                        <div className="flex items-center gap-1.5"><List size={11} /> {topic.totalQuestions} Qs</div>
                        <div className="w-px h-3 bg-white/20" />
                        <div className="flex items-center gap-1.5"><Clock size={11} /> {topic.timeRange} min</div>
                    </div>
                </div>
                
                <div className="p-5 flex flex-col flex-grow">
                    <h3 className={`font-bold text-lg mb-2 line-clamp-2 ${isCompleted ? 'text-slate-400' : 'text-white'}`}>{topic.topic}</h3>
                    <p className="text-[13px] leading-relaxed text-slate-400/90 tracking-wide font-light mb-4 line-clamp-2 flex-grow drop-shadow-[0_1px_1px_rgba(0,0,0,0.5)] pl-1 border-l-2 border-[#00d9ff]/10">
                        {topic.description}
                    </p>
                    
                    <div className="mt-auto">
                        <button className={`w-full py-2.5 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 group-hover:gap-3 ${
                            isCompleted ? 'bg-white/5 text-slate-400' : 'bg-[#00d9ff]/10 text-[#00d9ff] border border-[#00d9ff]/20'
                        }`}>
                           {isCompleted ? 'Topic Completed' : isInProgress ? 'Continue Topic' : 'Open Topic'} <ArrowRight size={14} />
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    const ArticlePreviewModal = ({ article, onClose }) => {
        if (!article) return null;
        return (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
                <div className="relative w-full max-w-lg bg-[#0a0e17] border border-white/10 rounded-2xl overflow-hidden shadow-2xl animate-fade-in-up">
                    <div className="p-6">
                        <div className="flex items-start justify-between mb-4">
                            <div>
                                <div className="text-[#00d9ff] text-xs font-bold uppercase tracking-wider mb-2">{article.topic} • {article.category}</div>
                                <h2 className="text-xl font-bold text-white leading-tight">{article.title}</h2>
                            </div>
                            <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full text-slate-400 transition-colors">
                                <X size={20} />
                            </button>
                        </div>
                        
                        <div className="bg-white/5 rounded-xl p-4 mb-6 border border-white/5">
                            <p className="text-slate-300 text-sm leading-relaxed">{article.preview || "No preview available."}</p>
                        </div>

                        <div className="flex items-center gap-4 text-xs text-slate-500 mb-6 font-medium">
                            <div className="flex items-center gap-1.5"><Clock size={12} /> {article.reading_time || article.readTime || '5 min'} read</div>
                            <div className="w-1 h-1 rounded-full bg-white/20" />
                            <div className="flex items-center gap-1.5"><ExternalLink size={12} /> {article.source}</div>
                            {article.published_date && (
                                <>
                                    <div className="w-1 h-1 rounded-full bg-white/20" />
                                    <div>{article.published_date}</div>
                                </>
                            )}
                        </div>

                        <div className="flex gap-3">
                            <a 
                                href={article.url} 
                                target="_blank" 
                                rel="noreferrer"
                                className="flex-1 bg-[#00d9ff] text-black font-bold py-3 rounded-xl text-sm flex items-center justify-center gap-2 hover:bg-[#00c2e6] transition-colors"
                            >
                                Read Full Article <ExternalLink size={14} />
                            </a>
                            <button 
                                onClick={onClose}
                                className="px-6 py-3 rounded-xl border border-white/10 text-white font-bold text-sm hover:bg-white/5 transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const ArticleCard = ({ article, onClick }) => (
        <div 
            onClick={() => onClick(article)}
            className="group flex flex-col h-full rounded-2xl overflow-hidden bg-black/30 backdrop-blur-md border border-white/5 hover:border-[#00d9ff]/30 transition-all hover:-translate-y-1 cursor-pointer"
        >
            <div className="p-5 flex flex-col flex-grow">
                <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-bold text-[#00d9ff] uppercase tracking-wider bg-[#00d9ff]/10 px-2 py-1 rounded-lg border border-[#00d9ff]/20">
                        {article.category}
                    </span>
                    {article.topic && <span className="text-[10px] text-slate-500 font-medium">{article.topic}</span>}
                </div>
                
                <h3 className="font-bold text-base text-white mb-3 line-clamp-2 leading-snug group-hover:text-[#00d9ff] transition-colors">
                    {article.title}
                </h3>
                
                <p className="text-xs text-slate-400 line-clamp-3 mb-4 leading-relaxed">
                    {article.preview}
                </p>

                <div className="mt-auto pt-4 border-t border-white/5 flex items-center justify-between text-[11px] text-[#64748b]">
                    <div className="flex items-center gap-2">
                        {article.source}
                    </div>
                    <div className="flex items-center gap-1 text-[#00d9ff] group-hover:underline">
                        Read <ArrowRight size={10} />
                    </div>
                </div>
            </div>
        </div>
    );

    const VideoPlayerModal = ({ video, onClose }) => {
        if (!video) return null;
        return (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={onClose} />
                <div className="relative w-full max-w-4xl bg-[#0a0e17] border border-white/10 rounded-2xl overflow-hidden shadow-2xl animate-fade-in-up flex flex-col max-h-[90vh]">
                    
                    {/* Header */}
                    <div className="p-4 border-b border-white/5 flex items-center justify-between bg-black/40">
                        <h3 className="font-bold text-white line-clamp-1">{video.title}</h3>
                        <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full text-slate-400 transition-colors">
                            <X size={20} />
                        </button>
                    </div>

                    {/* Player */}
                    <div className="relative w-full aspect-video bg-black">
                        {video.embedUrl ? (
                            <iframe 
                                src={`${video.embedUrl}?autoplay=1`} 
                                title={video.title}
                                className="absolute inset-0 w-full h-full" 
                                frameBorder="0" 
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                                allowFullScreen
                            />
                        ) : (
                            <div className="absolute inset-0 flex items-center justify-center text-slate-500">
                                Video embed not available
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="p-6 bg-[#0f1322]">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="space-y-1">
                                <div className="flex items-center gap-2 text-xs text-[#00d9ff] font-bold uppercase tracking-wider">
                                    <Calendar size={12} /> {video.date || 'Date unknown'}
                                </div>
                                {video.location && video.location !== "N/A" && (
                                    <div className="flex items-center gap-2 text-xs text-slate-400">
                                        <MapPin size={12} /> {video.location}
                                    </div>
                                )}
                            </div>
                            
                            <div className="flex gap-3">
                                <a 
                                    href={video.url} 
                                    target="_blank" 
                                    rel="noreferrer"
                                    className="px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-sm flex items-center gap-2 transition-colors"
                                >
                                    <Play size={14} fill="currentColor" /> Watch on YouTube
                                </a>
                                <button 
                                    onClick={onClose}
                                    className="px-6 py-2.5 rounded-xl border border-white/10 text-white font-bold text-sm hover:bg-white/5 transition-colors"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const VideoCard = ({ video, onClick }) => (
        <div
            onClick={() => onClick(video)}
            className="group min-w-[300px] md:min-w-[360px] rounded-2xl overflow-hidden bg-black/30 backdrop-blur-md border border-white/5 hover:border-[#00d9ff]/30 transition-all hover:-translate-y-1 cursor-pointer flex flex-col snap-start"
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
            </div>

            <div className="p-4 flex flex-col flex-grow">
                <h3 className="font-bold text-sm text-white mb-2 line-clamp-2 leading-tight group-hover:text-[#00d9ff] transition-colors">{video.title}</h3>

                <div className="mt-auto space-y-1.5">
                    {video.date && (
                        <div className="flex items-start gap-2 text-[10px] text-slate-400">
                            <Calendar size={10} className="mt-0.5 shrink-0" />
                            <span className="line-clamp-1">{video.date}</span>
                        </div>
                    )}
                    {video.location && video.location !== "N/A" && video.location !== "Not specified" && (
                        <div className="flex items-start gap-2 text-[10px] text-slate-400">
                            <MapPin size={10} className="mt-0.5 shrink-0" />
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
                                <h1 className="text-2xl font-bold text-white mb-1">Learning Zone</h1>
                                <p className="text-sm font-medium text-slate-400/80 tracking-wide drop-shadow-sm">Explore space science through interactive content</p>
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
                                <div>
                                    <QuizFilters searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
                                    
                                    {/* GUIDED SECTIONS */}
                                    {filters.topic === 'All Topics' && !searchQuery && (
                                        <>
                                            {/* Continue Learning */}
                                            {sections.continueLearning.length > 0 && (
                                                <div className="mb-10 animate-fade-in">
                                                    <div className="flex items-center gap-2 mb-4">
                                                        <Clock className="text-[#ffaa00]" size={20} />
                                                        <h2 className="text-xl font-bold text-white">Continue Where You Left Off</h2>
                                                    </div>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                                        {sections.continueLearning.map((topic) => (
                                                            <TopicCard key={topic.id} topic={topic} />
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {/* New Topics Grid */}
                                            {sections.newArrivals.length > 0 && (
                                                <div className="mb-12">
                                                    <div className="flex items-center gap-2 mb-6">
                                                        <Sparkles className="text-[#00d9ff]" size={20} />
                                                        <h2 className="text-xl font-bold text-white">New Topics</h2>
                                                    </div>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                                        {sections.newArrivals.map(topic => (
                                                            <TopicCard key={topic.id} topic={topic} />
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                            
                                            {/* Trending Grid */}
                                            {sections.trending.length > 0 && (
                                                <div className="mb-12">
                                                    <div className="flex items-center gap-2 mb-6">
                                                        <Trophy className="text-[#ff3366]" size={20} />
                                                        <h2 className="text-xl font-bold text-white">Trending Now</h2>
                                                    </div>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                                        {sections.trending.map(topic => (
                                                             <TopicCard key={topic.id} topic={topic} />
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </>
                                    )}

                                    {/* MAIN CATALOG */}
                                    <div className="space-y-6 pb-12">
                                        <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                                            <LayoutGrid className="text-slate-400" size={24} />
                                            Topic Catalog
                                        </h2>
                                        
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                            {filteredContent.map((topic) => (
                                                <TopicCard key={topic.id} topic={topic} />
                                            ))}
                                        </div>
                                        
                                        {filteredContent.length === 0 && (
                                            <div className="text-center py-20 text-slate-500">
                                                No topics match your selected filters. try adjusting criteria.
                                            </div>
                                        )}
                                    </div>

                                    {/* SELECTION MODAL */}
                                    {selectedTopic && <QuizSelectionModal topic={selectedTopic} onClose={() => setSelectedTopic(null)} />}
                                </div>
                                </div>
                            )}

                            {activeTab === 'Articles' && (
                                <div className="max-w-[1400px] mx-auto animate-fade-in">
                                    {/* 1. Topic Filter Row */}
                                    <div className="mb-8 overflow-x-auto">
                                        <div className="flex items-center gap-2 pb-2">
                                            {articleTopics.map(topic => (
                                                <button
                                                    key={topic}
                                                    onClick={() => setArticleTopic(topic)}
                                                    className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all border ${
                                                        articleTopic === topic
                                                        ? 'bg-[#00d9ff] text-black border-[#00d9ff]'
                                                        : 'bg-white/5 text-slate-400 border-white/5 hover:bg-white/10 hover:text-white'
                                                    }`}
                                                >
                                                    {topic}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* 2. Sections */}
                                    <div className="space-y-12">
                                        
                                        {/* Start Here */}
                                        {articleSections.startHere.length > 0 && (
                                            <div>
                                                <div className="flex items-center gap-2 mb-6">
                                                    <div className="p-2 rounded-lg bg-green-500/10 text-green-400"><FileText size={18} /></div>
                                                    <h2 className="text-xl font-bold text-white">Start Here</h2>
                                                </div>
                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                                    {articleSections.startHere.map((article, idx) => (
                                                        <ArticleCard key={article.id || idx} article={article} onClick={setActiveArticle} />
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Deep Dives */}
                                        {articleSections.deepDives.length > 0 && (
                                            <div>
                                                <div className="flex items-center gap-2 mb-6">
                                                    <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400"><LayoutGrid size={18} /></div>
                                                    <h2 className="text-xl font-bold text-white">Deep Dives</h2>
                                                </div>
                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                                    {articleSections.deepDives.map((article, idx) => (
                                                        <ArticleCard key={article.id || idx} article={article} onClick={setActiveArticle} />
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Updates */}
                                        {articleSections.updates.length > 0 && (
                                            <div>
                                                <div className="flex items-center gap-2 mb-6">
                                                    <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400"><Sparkles size={18} /></div>
                                                    <h2 className="text-xl font-bold text-white">Updates & Discoveries</h2>
                                                </div>
                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                                    {articleSections.updates.map((article, idx) => (
                                                        <ArticleCard key={article.id || idx} article={article} onClick={setActiveArticle} />
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Empty State */}
                                        {Object.values(articleSections).every(arr => arr.length === 0) && (
                                            <div className="text-center py-20 text-slate-500">
                                                No articles found for "{articleTopic}".
                                            </div>
                                        )}

                                    </div>

                                    {/* Preview Modal */}
                                    {activeArticle && <ArticlePreviewModal article={activeArticle} onClose={() => setActiveArticle(null)} />}
                                </div>
                            )}

                            {activeTab === 'Videos' && (
                                <div className="max-w-[1400px] mx-auto animate-fade-in space-y-12 pb-20">
                                    {videoSections.length > 0 ? (
                                        videoSections.map((section) => (
                                            <div key={section.id} className="relative group/section">
                                                <div className="flex items-center justify-between gap-2 mb-4 px-2">
                                                    <div className="flex items-center gap-2">
                                                        <div className="p-2 rounded-lg bg-[#00d9ff]/10 text-[#00d9ff]"><Video size={18} /></div>
                                                        <h2 className="text-xl font-bold text-white">{section.title}</h2>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <button 
                                                            onClick={() => document.getElementById(`carousel-${section.id}`).scrollBy({ left: -300, behavior: 'smooth' })}
                                                            className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                                                        >
                                                            <ChevronLeft size={18} />
                                                        </button>
                                                        <button 
                                                            onClick={() => document.getElementById(`carousel-${section.id}`).scrollBy({ left: 300, behavior: 'smooth' })}
                                                            className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                                                        >
                                                            <ChevronRight size={18} />
                                                        </button>
                                                    </div>
                                                </div>
                                                
                                                {/* Horizontal Carousel */}
                                                <div 
                                                    id={`carousel-${section.id}`}
                                                    className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x px-2 scroll-smooth"
                                                >
                                                    {section.videos.map(video => (
                                                        <VideoCard key={video.id} video={video} onClick={setActiveVideo} />
                                                    ))}
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center py-20 text-[#94a3b8]">No videos found.</div>
                                    )}

                                    {/* Video Player Modal */}
                                    {activeVideo && <VideoPlayerModal video={activeVideo} onClose={() => setActiveVideo(null)} />}
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