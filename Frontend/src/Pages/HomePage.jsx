import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import {
    Rocket, Globe, Zap, Search, Bell, BookOpen, Menu, X,
    ChevronRight, Play, Check, Users, ArrowRight, Star,
    MapPin, Clock, Shield, Mail, Twitter, Instagram, Youtube, Github
} from 'lucide-react';
import Logo from '../assets/Logo.png';

/* FONTS INJECTION 
  (Include this in your index.css or within a <style> tag in the root)
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&family=Space+Grotesk:wght@400;700;900&display=swap');
*/

const HomePage = () => {
    const navigate = useNavigate();
    const [isScrolled, setIsScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    // Parallax Scroll Hooks
    const { scrollY } = useScroll();
    const y1 = useTransform(scrollY, [0, 1000], [0, 200]);
    const y2 = useTransform(scrollY, [0, 1000], [0, -150]);

    // Navbar Scroll Logic
    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 50);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Simulated Live Data Logic
    const [issLat, setIssLat] = useState(45.23);
    const [issLon, setIssLon] = useState(-122.45);
    const [countdown, setCountdown] = useState(7200); // 2 hours

    useEffect(() => {
        const interval = setInterval(() => {
            setIssLat(prev => prev + 0.01);
            setIssLon(prev => prev + 0.02);
            setCountdown(prev => (prev > 0 ? prev - 1 : 7200));
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    const formatTime = (seconds) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        return `${h}h ${m}m ${s}s`;
    };

    // --- REUSABLE COMPONENTS ---

    const SectionHeading = ({ pre, title, highlight, sub }) => (
        <div className="text-center mb-16 relative z-10">
            {pre && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    className="text-[#00d9ff] font-bold text-xs tracking-[0.2em] uppercase mb-4"
                >
                    {pre}
                </motion.div>
            )}
            <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="font-display font-black text-4xl md:text-5xl text-white mb-3 leading-tight"
            >
                {title}
            </motion.h2>
            {highlight && (
                <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="font-display font-bold text-3xl md:text-4xl bg-gradient-to-r from-[#00d9ff] to-[#b900ff] bg-clip-text text-transparent mb-6"
                >
                    {highlight}
                </motion.h2>
            )}
            {sub && (
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="font-sans text-[#b8c5d6] text-lg max-w-2xl mx-auto"
                >
                    {sub}
                </motion.p>
            )}
        </div>
    );

    return (
        <div className="bg-[#050714] min-h-screen text-[#94a3b8] font-sans overflow-x-hidden selection:bg-[#00d9ff] selection:text-black">

            {/* 1. NAVIGATION HEADER */}
            <nav className={`fixed top-0 w-full z-50 transition-all duration-300 border-b ${isScrolled ? 'bg-[#050714]/90 backdrop-blur-xl border-white/5 py-3' : 'bg-transparent border-transparent py-6'}`}>
                <div className="max-w-7xl mx-auto px-6 md:px-12 flex justify-between items-center">
                    {/* Logo */}
                    <div className="flex items-center">
                        <img src={Logo} alt="Singularity" className="h-20 w-auto object-contain" />
                    </div>

                    {/* Desktop Nav */}
                    <div className="hidden md:flex items-center gap-8">
                        {['Features', 'How It Works', 'Community', 'Pricing'].map((item) => (
                            <a key={item} href={`#${item.toLowerCase().replace(/\s/g, '-')}`} className="text-sm font-medium text-[#94a3b8] hover:text-[#00d9ff] transition-colors relative group">
                                {item}
                                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#00d9ff] transition-all group-hover:w-full"></span>
                            </a>
                        ))}
                    </div>

                    {/* Actions */}
                    <div className="hidden md:flex items-center gap-4">
                        <button onClick={() => navigate('/login')} className="text-sm font-bold text-white hover:text-[#00d9ff] transition-colors px-4 py-2 border border-white/20 rounded-lg hover:bg-white/5 hover:border-[#00d9ff]/50">
                            Login
                        </button>
                        <button onClick={() => navigate('/login')} className="text-sm font-bold text-black bg-gradient-to-r from-[#00d9ff] to-[#b900ff] px-6 py-2.5 rounded-lg shadow-[0_0_20px_rgba(0,217,255,0.4)] hover:shadow-[0_0_30px_rgba(0,217,255,0.6)] hover:-translate-y-0.5 transition-all">
                            Get Started
                        </button>
                    </div>

                    {/* Mobile Toggle */}
                    <button className="md:hidden text-white" onClick={() => setMobileMenuOpen(true)}>
                        <Menu className="w-6 h-6" />
                    </button>
                </div>
            </nav>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div
                        initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
                        className="fixed inset-0 z-[60] bg-[#050714]/98 backdrop-blur-xl p-8 flex flex-col"
                    >
                        <div className="flex justify-end mb-12">
                            <button onClick={() => setMobileMenuOpen(false)}><X className="w-8 h-8 text-white" /></button>
                        </div>
                        <div className="flex flex-col gap-8 text-center">
                            {['Features', 'How It Works', 'Community'].map((item) => (
                                <a key={item} href="#" className="font-display font-bold text-2xl text-white">{item}</a>
                            ))}
                            <div className="h-px bg-white/10 my-4"></div>
                            <button onClick={() => { setMobileMenuOpen(false); navigate('/login'); }} className="w-full py-4 border border-white/20 rounded-xl text-white font-bold">Login</button>
                            <button onClick={() => { setMobileMenuOpen(false); navigate('/login'); }} className="w-full py-4 bg-gradient-to-r from-[#00d9ff] to-[#b900ff] rounded-xl text-black font-bold">Get Started</button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* 2. HERO SECTION */}
            <section className="relative h-screen w-full flex items-center overflow-hidden">
                {/* Background Elements */}
                <div className="absolute inset-0 z-0">
                    {[...Array(50)].map((_, i) => (
                        <motion.div
                            key={i}
                            className="absolute bg-white rounded-full opacity-40"
                            style={{
                                top: `${Math.random() * 100}%`,
                                left: `${Math.random() * 100}%`,
                                width: Math.random() < 0.5 ? '1px' : '2px',
                                height: Math.random() < 0.5 ? '1px' : '2px',
                                y: y1
                            }}
                            animate={{ opacity: [0.2, 0.8, 0.2] }}
                            transition={{ duration: 2 + Math.random() * 3, repeat: Infinity }}
                        />
                    ))}
                    {/* Decorative Planets */}
                    <motion.div style={{ y: y2 }} className="absolute top-20 -left-20 w-96 h-96 bg-[#00d9ff]/10 rounded-full blur-[100px]" />
                    <motion.div style={{ y: y1 }} className="absolute bottom-0 -right-20 w-[500px] h-[500px] bg-[#b900ff]/10 rounded-full blur-[120px]" />
                </div>

                {/* 3D Earth Simulation (CSS only) */}
                <div className="absolute right-0 top-1/2 -translate-y-1/2 md:translate-x-1/4 opacity-40 md:opacity-100 z-0 pointer-events-none">
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 120, repeat: Infinity, ease: "linear" }}
                        className="w-[300px] md:w-[600px] h-[300px] md:h-[600px] rounded-full relative"
                        style={{
                            background: 'radial-gradient(circle at 30% 30%, #0a2f5f, #000000)',
                            boxShadow: 'inset -20px -20px 50px rgba(0,0,0,0.5), 0 0 50px rgba(0, 217, 255, 0.2)'
                        }}
                    >
                        {/* Atmosphere */}
                        <div className="absolute inset-0 rounded-full shadow-[0_0_40px_rgba(0,217,255,0.3)_inset]"></div>
                        {/* Orbiting ISS */}
                        <motion.div
                            animate={{ rotate: -360 }}
                            transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
                            className="absolute inset-[-40px] border border-dashed border-[#00d9ff]/30 rounded-full"
                        >
                            <div className="absolute top-1/2 -right-2 w-4 h-4 bg-white rounded-full shadow-[0_0_10px_white]"></div>
                        </motion.div>
                    </motion.div>
                </div>

                <div className="max-w-7xl mx-auto px-6 md:px-12 w-full relative z-10 grid md:grid-cols-2">
                    <div className="max-w-2xl">
                        {/* Badge */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#00d9ff]/10 border border-[#00d9ff]/20 text-[#00d9ff] font-medium text-xs mb-8"
                        >
                            <Star className="w-3 h-3 fill-current" /> 50,000+ Space Enthusiasts
                        </motion.div>

                        {/* Heading */}
                        <motion.h1
                            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                            className="font-display font-black text-5xl md:text-7xl text-white leading-[1.1] mb-6"
                        >
                            Your Gateway to <br />
                            <span className="bg-gradient-to-r from-[#00d9ff] to-[#b900ff] bg-clip-text text-transparent">the Cosmos</span>
                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                            className="text-[#b8c5d6] text-lg md:text-xl leading-relaxed mb-8 max-w-lg"
                        >
                            Track space missions, never miss celestial events, and explore the universe in real-time—all in one place.
                        </motion.p>

                        {/* Pills */}
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
                            className="flex flex-wrap gap-4 mb-10"
                        >
                            {[
                                { icon: <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse mr-2" />, text: "LIVE ISS Tracking" },
                                { icon: <Zap className="w-3 h-3 text-[#ffaa00] mr-2" />, text: "Real-Time Alerts" },
                                { icon: <BookOpen className="w-3 h-3 text-[#00ff88] mr-2" />, text: "Interactive Learning" }
                            ].map((pill, i) => (
                                <div key={i} className="flex items-center px-4 py-2 rounded-full bg-[#0a0e17]/60 border border-white/10 backdrop-blur-md text-sm text-white">
                                    {pill.icon} {pill.text}
                                </div>
                            ))}
                        </motion.div>

                        {/* CTAs */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
                            className="flex flex-col sm:flex-row gap-4"
                        >
                            <button onClick={() => navigate('/login')} className="px-8 py-4 bg-gradient-to-r from-[#00d9ff] to-[#b900ff] rounded-lg text-black font-bold text-lg shadow-[0_0_25px_rgba(0,217,255,0.4)] hover:shadow-[0_0_40px_rgba(0,217,255,0.6)] hover:-translate-y-1 transition-all">
                                Start Exploring for Free
                            </button>
                            <button className="px-8 py-4 bg-white/5 border border-white/20 rounded-lg text-white font-bold text-lg flex items-center justify-center gap-2 hover:bg-white/10 hover:border-[#00d9ff]/50 hover:text-[#00d9ff] transition-all">
                                <Play className="w-4 h-4 fill-current" /> Watch Demo
                            </button>
                        </motion.div>

                        {/* Trust */}
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}
                            className="mt-8 flex gap-6 text-sm text-[#64748b]"
                        >
                            <span>✓ Free forever</span>
                            <span>•</span>
                            <span>✓ No credit card</span>
                        </motion.div>
                    </div>
                </div>

                {/* Scroll Indicator */}
                <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center animate-bounce">
                    <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center pt-2">
                        <div className="w-1 h-2 bg-[#00d9ff] rounded-full animate-pulse"></div>
                    </div>
                    <span className="text-[10px] uppercase tracking-widest text-[#64748b] mt-2">Scroll</span>
                </div>
            </section>

            {/* 3. PROBLEM STATEMENT */}
            <section className="py-24 px-6 md:px-12 bg-[#0a0e17] relative">
                <div className="max-w-7xl mx-auto">
                    <SectionHeading pre="THE CHALLENGE" title="Ever Missed a Meteor Shower?" sub="Or wondered when the ISS passes overhead? The universe is vast, but finding reliable info shouldn't be." />

                    <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                        {[
                            { icon: Search, color: '#ff3366', title: "Fragmented Info", desc: "Checking 5 different websites just to plan one stargazing night." },
                            { icon: Clock, color: '#ffaa00', title: "Missed Events", desc: "Missing the Geminids peak because you didn't get a notification." },
                            { icon: BookOpen, color: '#b900ff', title: "Complex Jargon", desc: "Giving up on space news because it's too technical to understand." }
                        ].map((card, i) => (
                            <motion.div
                                key={i}
                                whileHover={{ y: -8, borderColor: card.color, boxShadow: `0 0 30px ${card.color}20` }}
                                className="p-10 rounded-2xl bg-[#0f1322]/60 backdrop-blur-xl border border-white/5 group transition-all duration-300"
                            >
                                <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-6 border bg-opacity-10`} style={{ backgroundColor: `${card.color}10`, borderColor: `${card.color}30`, color: card.color }}>
                                    <card.icon className="w-7 h-7" />
                                </div>
                                <h3 className="font-display font-bold text-2xl text-white mb-3">{card.title}</h3>
                                <p className="text-[#b8c5d6] leading-relaxed">{card.desc}</p>
                            </motion.div>
                        ))}
                    </div>

                    <div className="text-center mt-16 opacity-50">
                        <div className="w-px h-16 bg-[#00d9ff] mx-auto mb-4"></div>
                        <p className="text-[#00d9ff] font-display font-bold">There's a better way...</p>
                    </div>
                </div>
            </section>

            {/* 4. SOLUTION SHOWCASE */}
            <section className="py-24 px-6 md:px-12 bg-gradient-to-b from-[#0a0e17] to-[#050714]">
                <div className="max-w-7xl mx-auto">
                    <SectionHeading pre="THE SOLUTION" title="One Platform. Everything Space." highlight="Personalized for You." />

                    <div className="flex flex-col gap-20 max-w-6xl mx-auto">
                        {[
                            {
                                title: "Real-Time Space Tracking",
                                desc: "Get live updates on ISS position, aurora forecasts, and solar activity. Everything updates in real-time.",
                                bullets: ["Live ISS position every 5s", "Aurora Kp Alerts", "Solar Flare Warnings"],
                                visual: "dashboard"
                            },
                            {
                                title: "Never Miss Cosmic Events",
                                desc: "Personalized alerts for meteor showers, ISS passes, and auroras visible from your specific location.",
                                bullets: ["Meteor shower visibility", "Pass predictions", "Eclipse countdowns"],
                                visual: "mobile"
                            },
                            {
                                title: "Learn Through Play",
                                desc: "Interactive quizzes, engaging articles, and real-world applications. Gamify your learning.",
                                bullets: ["Interactive Quizzes", "Earn Badges & XP", "Leaderboards"],
                                visual: "quiz"
                            }
                        ].map((feature, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 50 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ margin: "-100px" }}
                                className={`flex flex-col ${i % 2 === 1 ? 'md:flex-row-reverse' : 'md:flex-row'} items-center gap-12 md:gap-24`}
                            >
                                {/* Content */}
                                <div className="flex-1 relative">
                                    <span className="absolute -top-10 -left-6 text-9xl font-black text-transparent bg-clip-text bg-gradient-to-br from-[#00d9ff] to-[#b900ff] opacity-10 select-none">0{i + 1}</span>
                                    <h3 className="font-display font-bold text-3xl text-white mb-4 relative z-10">{feature.title}</h3>
                                    <p className="text-[#b8c5d6] text-lg leading-relaxed mb-6">{feature.desc}</p>
                                    <ul className="space-y-3 mb-8">
                                        {feature.bullets.map((b, idx) => (
                                            <li key={idx} className="flex items-center gap-3 text-white">
                                                <Check className="w-5 h-5 text-[#00ff88]" /> {b}
                                            </li>
                                        ))}
                                    </ul>
                                    <button className="text-[#00d9ff] font-bold flex items-center gap-2 hover:gap-4 transition-all">
                                        Try Live Demo <ArrowRight className="w-4 h-4" />
                                    </button>
                                </div>

                                {/* Visual Placeholder */}
                                <div className="flex-1 w-full aspect-[4/3] bg-[#0a0e17] border border-white/10 rounded-2xl relative overflow-hidden shadow-[0_0_50px_rgba(0,217,255,0.05)] group hover:shadow-[0_0_50px_rgba(0,217,255,0.15)] transition-all">
                                    {/* Decorative Elements inside Visual */}
                                    <div className="absolute inset-0 bg-gradient-to-br from-[#00d9ff]/5 to-[#b900ff]/5"></div>
                                    <div className="absolute inset-4 border border-dashed border-white/10 rounded-xl flex items-center justify-center">
                                        <span className="text-white/20 font-display font-bold text-xl uppercase tracking-widest">{feature.visual} Preview</span>
                                    </div>
                                    {/* Simulated Interface Elements */}
                                    <div className="absolute bottom-8 left-8 right-8 h-2 bg-white/10 rounded-full overflow-hidden">
                                        <motion.div
                                            className="h-full bg-gradient-to-r from-[#00d9ff] to-[#b900ff]"
                                            initial={{ width: "0%" }}
                                            whileInView={{ width: "70%" }}
                                            transition={{ duration: 1.5 }}
                                        />
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 5. LIVE DATA PREVIEW */}
            <section className="py-24 px-6 md:px-12 bg-[#050714] relative overflow-hidden">
                <div className="max-w-7xl mx-auto">
                    <SectionHeading pre="SEE IT IN ACTION" title="Real-Time Space Data" sub="Data updates live directly from NASA and NOAA APIs." />

                    <div className="grid md:grid-cols-3 gap-8">
                        {/* Widget 1: ISS */}
                        <div className="bg-[#0f1322]/60 backdrop-blur-xl border border-white/10 rounded-2xl p-8 relative hover:-translate-y-2 hover:border-[#00d9ff]/30 transition-all duration-300 group">
                            <div className="absolute top-4 right-4 flex items-center gap-2 bg-[#00ff88]/10 px-3 py-1 rounded-full border border-[#00ff88]/20">
                                <span className="w-2 h-2 bg-[#00ff88] rounded-full animate-pulse"></span>
                                <span className="text-[10px] font-bold text-[#00ff88] tracking-wider">LIVE</span>
                            </div>
                            <h4 className="text-white font-display font-bold text-xl mb-4">🛰️ ISS Location</h4>
                            <p className="text-[#94a3b8] text-sm mb-1">Current Coordinates:</p>
                            <p className="font-mono text-[#00d9ff] text-lg mb-6">
                                Lat: {issLat.toFixed(2)}° N <br /> Lon: {issLon.toFixed(2)}° W
                            </p>
                            <div className="h-32 bg-[#050714] rounded-lg border border-white/5 relative overflow-hidden">
                                <div className="absolute inset-0 opacity-30 bg-[url('https://upload.wikimedia.org/wikipedia/commons/e/ec/World_map_blank_without_borders.svg')] bg-cover bg-center invert"></div>
                                <div className="absolute top-1/2 left-1/2 w-3 h-3 bg-white rounded-full shadow-[0_0_10px_white] -translate-x-1/2 -translate-y-1/2"></div>
                                <div className="absolute top-1/2 left-0 right-0 h-px border-t border-dashed border-[#00d9ff]/50"></div>
                            </div>
                        </div>

                        {/* Widget 2: Kp Index */}
                        <div className="bg-[#0f1322]/60 backdrop-blur-xl border border-white/10 rounded-2xl p-8 relative hover:-translate-y-2 hover:border-[#ffaa00]/30 transition-all duration-300">
                            <div className="absolute top-4 right-4 flex items-center gap-2 bg-[#00ff88]/10 px-3 py-1 rounded-full border border-[#00ff88]/20">
                                <span className="w-2 h-2 bg-[#00ff88] rounded-full animate-pulse"></span>
                                <span className="text-[10px] font-bold text-[#00ff88] tracking-wider">LIVE</span>
                            </div>
                            <h4 className="text-white font-display font-bold text-xl mb-4">⚡ Kp Index</h4>
                            <div className="flex flex-col items-center justify-center py-4">
                                <span className="text-7xl font-display font-black text-[#ffaa00] drop-shadow-[0_0_20px_rgba(255,170,0,0.4)] animate-pulse">5.2</span>
                                <span className="text-white font-medium mt-2">Geomagnetic Storm: G1</span>
                            </div>
                            <p className="text-center text-[#b8c5d6] text-sm mb-4">Aurora visible in high latitudes</p>
                            <div className="w-full h-2 bg-[#1a2036] rounded-full overflow-hidden">
                                <motion.div initial={{ width: 0 }} whileInView={{ width: "58%" }} className="h-full bg-gradient-to-r from-[#00ff88] via-[#ffaa00] to-[#ff3366]"></motion.div>
                            </div>
                        </div>

                        {/* Widget 3: Countdown */}
                        <div className="bg-[#0f1322]/60 backdrop-blur-xl border border-white/10 rounded-2xl p-8 relative hover:-translate-y-2 hover:border-[#b900ff]/30 transition-all duration-300">
                            <h4 className="text-white font-display font-bold text-xl mb-6">🚀 Next ISS Pass</h4>
                            <div className="text-center mb-6">
                                <div className="text-4xl font-mono font-black text-[#00d9ff] mb-2">{formatTime(countdown)}</div>
                                <p className="text-[#94a3b8] text-sm">Time until pass over your location</p>
                            </div>
                            <div className="grid grid-cols-2 gap-4 border-t border-white/5 pt-4">
                                <div>
                                    <p className="text-[#94a3b8] text-xs">Max Elevation</p>
                                    <p className="text-white font-bold text-lg">67°</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[#94a3b8] text-xs">Duration</p>
                                    <p className="text-white font-bold text-lg">4 min</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="text-center mt-12">
                        <p className="text-[#64748b] text-sm font-medium mb-4">All data updates in real-time via secure satellites</p>
                        <button onClick={() => navigate('/login')} className="px-8 py-3 bg-[#0a0e17] border border-white/20 rounded-lg text-white font-bold hover:bg-white/5 hover:border-[#00d9ff]/50 transition-all">
                            Sign Up to Customize Data
                        </button>
                    </div>
                </div>
            </section>

            {/* 6. FEATURES GRID */}
            <section className="py-24 px-6 md:px-12 bg-[#0a0e17]" id="features">
                <div className="max-w-7xl mx-auto">
                    <SectionHeading pre="POWERFUL FEATURES" title="Everything You Need" />

                    <div className="grid md:grid-cols-3 gap-6">
                        {[
                            { icon: Globe, title: "Live ISS Tracker", desc: "Precision tracking with ground paths and visibility cones." },
                            { icon: Zap, title: "Aurora Forecasts", desc: "Notifications when the northern lights are visible near you." },
                            { icon: Star, title: "Meteor Showers", desc: "Calendar predictions based on moon phase and weather." },
                            { icon: Rocket, title: "Mission Timelines", desc: "Follow Artemis, SpaceX, and NASA missions live." },
                            { icon: Shield, title: "Solar Monitor", desc: "Real-time X-ray flux and solar wind data." },
                            { icon: BookOpen, title: "Gamified Learning", desc: "Earn XP and badges by learning space science." }
                        ].map((f, i) => (
                            <div key={i} className="p-8 rounded-2xl bg-[#0f1322]/40 border border-white/5 hover:bg-[#0f1322]/80 hover:border-[#00d9ff]/30 hover:-translate-y-1 transition-all duration-300 group cursor-default">
                                <div className="w-12 h-12 rounded-lg bg-[#00d9ff]/10 border border-[#00d9ff]/20 flex items-center justify-center mb-6 text-[#00d9ff] group-hover:rotate-12 transition-transform">
                                    <f.icon className="w-6 h-6" />
                                </div>
                                <h3 className="font-display font-bold text-xl text-white mb-2">{f.title}</h3>
                                <p className="text-[#b8c5d6] text-sm leading-relaxed">{f.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 7. HOW IT WORKS */}
            <section className="py-24 px-6 md:px-12 bg-gradient-to-b from-[#0a0e17] to-[#050714]" id="how-it-works">
                <div className="max-w-7xl mx-auto">
                    <SectionHeading pre="GETTING STARTED" title="Start in 3 Simple Steps" />

                    <div className="relative flex flex-col md:flex-row justify-between items-start gap-12 mt-20">
                        {/* Connecting Line (Desktop) */}
                        <div className="hidden md:block absolute top-12 left-[15%] right-[15%] h-0.5 bg-gradient-to-r from-[#00d9ff] to-[#b900ff] z-0">
                            <div className="absolute top-1/2 -translate-y-1/2 w-full flex justify-between px-12">
                                <ArrowRight className="text-[#00d9ff] animate-pulse" />
                                <ArrowRight className="text-[#b900ff] animate-pulse" />
                            </div>
                        </div>

                        {[
                            { num: "01", icon: "📝", title: "Sign Up Free", desc: "Create your account in 30 seconds. No credit card." },
                            { num: "02", icon: "⚙️", title: "Set Preferences", desc: "Tell us your location and interests." },
                            { num: "03", icon: "🚀", title: "Start Exploring", desc: "Get real-time alerts and track missions." }
                        ].map((step, i) => (
                            <div key={i} className="relative z-10 flex flex-col items-center text-center w-full md:w-1/3">
                                <div className="w-24 h-24 rounded-full bg-[#050714] border-4 border-[#0a0e17] flex items-center justify-center relative mb-6 group">
                                    <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#00d9ff] to-[#b900ff] opacity-20 group-hover:opacity-40 transition-opacity"></div>
                                    <div className="absolute inset-0 rounded-full border-2 border-[#00d9ff] animate-ping opacity-20"></div>
                                    <span className="font-display font-black text-3xl text-white">{step.num}</span>
                                    <span className="absolute -bottom-2 text-2xl">{step.icon}</span>
                                </div>
                                <h3 className="font-display font-bold text-2xl text-white mb-3">{step.title}</h3>
                                <p className="text-[#b8c5d6] max-w-xs">{step.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 8. SOCIAL PROOF */}
            <section className="py-24 px-6 md:px-12 bg-[#050714]" id="community">
                <div className="max-w-7xl mx-auto">
                    <SectionHeading pre="JOIN THE COMMUNITY" title="50,000+ Space Enthusiasts" highlight="Worldwide" />

                    {/* Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-20 border-b border-white/5 pb-12">
                        {[
                            { n: "50K+", l: "Active Users", i: Users },
                            { n: "500K", l: "Events Tracked", i: Star },
                            { n: "1M+", l: "Notifications", i: Bell },
                            { n: "4.9", l: "App Rating", i: Star }
                        ].map((stat, i) => (
                            <div key={i} className="text-center p-6 bg-[#0f1322]/40 rounded-2xl hover:-translate-y-2 transition-transform">
                                <stat.i className="w-8 h-8 text-[#00d9ff] mx-auto mb-4" />
                                <div className="font-display font-black text-3xl md:text-4xl text-white mb-2">{stat.n}</div>
                                <div className="text-[#94a3b8] text-sm uppercase tracking-wide">{stat.l}</div>
                            </div>
                        ))}
                    </div>

                    {/* Testimonial */}
                    <div className="max-w-4xl mx-auto bg-[#0f1322]/60 backdrop-blur-xl border border-white/10 rounded-2xl p-8 md:p-12 text-center relative">
                        <div className="text-[#00d9ff]/20 absolute top-8 left-8 text-8xl font-serif leading-none">"</div>
                        <div className="flex justify-center gap-1 mb-6">
                            {[...Array(5)].map((_, i) => <Star key={i} className="w-5 h-5 fill-[#ffaa00] text-[#ffaa00]" />)}
                        </div>
                        <p className="text-xl md:text-2xl text-white italic leading-relaxed mb-8 relative z-10">
                            "Singularity helped me catch my first ISS pass! The notifications are perfect and the real-time tracking is incredible. It's the only space app I need."
                        </p>
                        <div className="flex flex-col items-center">
                            <div className="w-16 h-16 rounded-full bg-gray-700 border-2 border-[#00d9ff] mb-3 overflow-hidden">
                                <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="User" />
                            </div>
                            <div className="font-display font-bold text-lg text-white">Sarah Jenkins</div>
                            <div className="text-[#94a3b8] text-sm">Science Teacher, New York</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 9. FINAL CTA */}
            <section className="py-32 px-6 md:px-12 relative overflow-hidden flex items-center justify-center">
                {/* Background Galaxy Effect */}
                <div className="absolute inset-0 bg-gradient-to-b from-[#050714] to-[#0a0e17] z-0"></div>
                <motion.div
                    animate={{ rotate: 360 }} transition={{ duration: 100, repeat: Infinity, ease: "linear" }}
                    className="absolute w-[800px] h-[800px] bg-gradient-to-r from-[#00d9ff]/5 to-[#b900ff]/5 rounded-full blur-3xl z-0"
                />

                <div className="relative z-10 text-center max-w-3xl mx-auto">
                    <h2 className="font-display font-black text-5xl md:text-7xl text-white leading-tight mb-2">
                        Ready to Explore
                    </h2>
                    <h2 className="font-display font-black text-5xl md:text-7xl bg-gradient-to-r from-[#00d9ff] to-[#b900ff] bg-clip-text text-transparent mb-8">
                        the Universe?
                    </h2>
                    <p className="text-[#b8c5d6] text-xl mb-12">
                        Join thousands of space enthusiasts tracking missions, catching meteor showers, and learning about the cosmos.
                    </p>
                    <div className="flex flex-col items-center gap-6">
                        <button onClick={() => navigate('/login')} className="px-10 py-5 bg-gradient-to-r from-[#00d9ff] to-[#b900ff] rounded-xl text-black font-bold text-xl shadow-[0_0_40px_rgba(0,217,255,0.6)] hover:scale-105 hover:shadow-[0_0_60px_rgba(0,217,255,0.8)] transition-all">
                            Create Free Account
                        </button>
                        <button onClick={() => navigate('/login')} className="text-[#94a3b8] hover:text-white underline decoration-dashed underline-offset-4">
                            Already a member? Log in
                        </button>
                    </div>
                    <div className="mt-12 flex flex-wrap justify-center gap-4 text-[#64748b] text-sm">
                        <span className="flex items-center gap-2"><Check className="w-4 h-4 text-[#00d9ff]" /> Free forever</span>
                        <span className="flex items-center gap-2"><Check className="w-4 h-4 text-[#00d9ff]" /> No credit card</span>
                        <span className="flex items-center gap-2"><Check className="w-4 h-4 text-[#00d9ff]" /> Cancel anytime</span>
                    </div>
                </div>
            </section>

            {/* 10. FOOTER */}
            <footer className="bg-[#0a0e17] pt-20 pb-10 px-6 md:px-12 border-t border-white/5 text-[#94a3b8]">
                <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
                    {/* Brand */}
                    <div className="col-span-1">
                        <div className="flex items-center mb-4">
                            <img src={Logo} alt="Singularity" className="h-8 w-auto object-contain" />
                        </div>
                        <p className="text-sm italic mb-6">Your Gateway to the Cosmos.</p>
                        <div className="flex gap-4">
                            {[Twitter, Instagram, Youtube, Github].map((Icon, i) => (
                                <a key={i} href="#" className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center hover:bg-[#00d9ff]/20 hover:text-[#00d9ff] transition-all">
                                    <Icon className="w-5 h-5" />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Links */}
                    {[
                        { head: "Product", links: ["Features", "How It Works", "Pricing", "API", "Roadmap"] },
                        { head: "Learn", links: ["Blog", "Tutorials", "Community", "Support", "FAQ"] }
                    ].map((col, i) => (
                        <div key={i}>
                            <h4 className="font-display font-bold text-white mb-6">{col.head}</h4>
                            <ul className="space-y-3 text-sm">
                                {col.links.map(l => (
                                    <li key={l}><a href="#" className="hover:text-[#00d9ff] transition-colors">{l}</a></li>
                                ))}
                            </ul>
                        </div>
                    ))}

                    {/* Connect */}
                    <div>
                        <h4 className="font-display font-bold text-white mb-6">Connect</h4>
                        <p className="text-sm mb-4">Stay updated with space news.</p>
                        <div className="flex gap-2">
                            <input type="email" placeholder="Your email" className="bg-[#1a2036] border border-white/10 rounded-lg px-4 py-2 text-sm w-full focus:outline-none focus:border-[#00d9ff]" />
                            <button className="bg-[#00d9ff]/10 border border-[#00d9ff]/30 text-[#00d9ff] px-4 py-2 rounded-lg font-bold hover:bg-[#00d9ff]/20 transition-all">Go</button>
                        </div>
                        <div className="flex items-center gap-2 mt-4 text-sm">
                            <Mail className="w-4 h-4" /> hello@Singularity.com
                        </div>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-xs">
                    <p>© 2025 Singularity. Built with data from NASA, NOAA & ESA.</p>
                    <div className="flex gap-6">
                        <a href="#" className="hover:text-[#00d9ff]">Privacy Policy</a>
                        <a href="#" className="hover:text-[#00d9ff]">Terms of Service</a>
                        <a href="#" className="hover:text-[#00d9ff]">Cookies</a>
                    </div>
                </div>
            </footer>

        </div>
    );
};

export default HomePage;