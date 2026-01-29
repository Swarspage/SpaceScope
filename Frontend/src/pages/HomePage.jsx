import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  motion,
  useScroll,
  useTransform,
  AnimatePresence,
} from "framer-motion";
import {
  Rocket,
  Globe,
  Zap,
  Search,
  Bell,
  BookOpen,
  Menu,
  X,
  ChevronRight,
  Play,
  Check,
  Users,
  ArrowRight,
  Star,
  MapPin,
  Clock,
  Shield,
  Mail,
  Twitter,
  Instagram,
  Youtube,
  Github,
  Volume2,
  VolumeX,
} from "lucide-react";
import Logo from "../assets/Logo.png";
import dashboardPreview from "../assets/dashboard-preview.png";
import ambienceAudio from "../assets/ambience.mp3";
import Particles from "../components/Particles";
import TargetCursor from "../components/TargetCursor";

/* FONTS INJECTION
  (Include this in your index.css or within a <style> tag in the root)
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&family=Space+Grotesk:wght@400;700;900&display=swap');
*/
import ReactGlobe from "react-globe.gl";

function EarthGlobe() {
  const globeRef = useRef();
  const [size, setSize] = useState({ w: 600, h: 600 });

  useEffect(() => {
    const handleResize = () => {
      const isMobile = window.innerWidth < 768;
      setSize({
        w: isMobile ? 320 : 600,
        h: isMobile ? 320 : 600,
      });
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (!globeRef.current) return;

    globeRef.current.pointOfView({ lat: 10, lng: 80, altitude: 2.2 });

    // auto-rotate
    const controls = globeRef.current.controls();
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.6;
    controls.enableZoom = false;
    controls.enablePan = false;
  }, []);

  // Add this useState near other state declarations (around line 20-30)
  const [currentStatusIndex, setCurrentStatusIndex] = useState(0);

  // Add this useEffect for auto-rotation (around line 50-60 with other useEffects)
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStatusIndex((prev) => (prev + 1) % 5); // Rotate through 5 messages
    }, 5000); // Every 5 seconds
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full h-full">
      <ReactGlobe
        ref={globeRef}
        width={size.w}
        height={size.h}
        backgroundColor="rgba(0,0,0,0)"
        globeImageUrl="//unpkg.com/three-globe/example/img/earth-blue-marble.jpg"
        bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
        showAtmosphere={true}
        atmosphereColor="#00d9ff"
        atmosphereAltitude={0.18}
      />
    </div>
  );
}

const SectionHeading = ({ pre, title, highlight, sub }) => (
  <div className="text-center mb-16 relative z-10">
    {pre && (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-[#00d9ff] font-bold text-xs tracking-[0.2em] uppercase mb-4"
      >
        {pre}
      </motion.div>
    )}
    <motion.h2
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: 0.1 }}
      className="font-display font-black text-4xl md:text-5xl text-white mb-3 leading-tight"
    >
      {title}
    </motion.h2>
    {highlight && (
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.2 }}
        className="font-display font-bold text-3xl md:text-4xl bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent mb-6"
      >
        {highlight}
      </motion.h2>
    )}
    {sub && (
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.3 }}
        className="font-sans text-[#b8c5d6] text-lg max-w-2xl mx-auto"
      >
        {sub}
      </motion.p>
    )}
  </div>
);

const HomePage = () => {
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [quizState, setQuizState] = useState("question");
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const audioRef = useRef(null);

  // Parallax Scroll Hooks
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 1000], [0, 200]);
  const y2 = useTransform(scrollY, [0, 1000], [0, -150]);

  // Navbar Scroll Logic
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Simulated Live Data Logic
  const [issLat, setIssLat] = useState(45.23);
  const [issLon, setIssLon] = useState(-122.45);
  const [countdown, setCountdown] = useState(7200); // 2 hours

  useEffect(() => {
    const interval = setInterval(() => {
      setIssLat((prev) => prev + 0.01);
      setIssLon((prev) => prev + 0.02);
      setCountdown((prev) => (prev > 0 ? prev - 1 : 7200));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h}h ${m}m ${s}s`;
  };

  const toggleAudio = () => {
    if (audioRef.current) {
      if (isAudioPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsAudioPlaying(!isAudioPlaying);
    }
  };

  const howRef = useRef(null);

  const { scrollYProgress } = useScroll({
    target: howRef,
    offset: ["start center", "end center"],
  });

  const rocketX = useTransform(scrollYProgress, [0, 1], [0, 550]);
  const rocketRotate = useTransform(scrollYProgress, [0, 1], [0, 5]);

  // --- REUSABLE COMPONENTS ---

  // --- REUSABLE COMPONENTS ---
  // Moved outside to prevent re-creation on every render (which caused blinking)

  return (
    <div className="bg-transparent min-h-screen text-[#94a3b8] font-sans overflow-x-hidden selection:bg-[#00d9ff] selection:text-black">
      <TargetCursor
        spinDuration={5}
        hideDefaultCursor
        parallaxOn
        hoverDuration={0.95}
      />
      {/* Hidden Audio Element */}
      <audio
        ref={audioRef}
        src={ambienceAudio}
        loop
        onEnded={() => audioRef.current?.play()}
      />
      {/* 1. NAVIGATION HEADER */}
      <nav
        className={`fixed top-0 w-full z-50 transition-all duration-300 border-b ${isScrolled ? "bg-black/10 backdrop-blur-md border-white/5 py-3" : "bg-transparent border-transparent py-4 md:py-6"}`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-12 flex justify-between items-center">
          {/* Logo */}
          <div className="flex items-center">
            <img
              src={Logo}
              alt="Singularity"
              className="cursor-target h-10 w-auto object-contain"
            />
          </div>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-6 xl:gap-8">
            {["Features", "How It Works", "Community", "Pricing"].map(
              (item) => (
                <a
                  key={item}
                  href={`#${item.toLowerCase().replace(/\s/g, "-")}`}
                  className="cursor-target text-sm font-medium text-[#94a3b8] hover:text-[#00d9ff] transition-colors relative group"
                >
                  {item}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#00d9ff] transition-all group-hover:w-full"></span>
                </a>
              ),
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
            {/* Audio Toggle - Visible on all devices */}
            <button
              onClick={toggleAudio}
              className="cursor-target p-2 text-white hover:text-[#00d9ff] transition-colors hover:bg-white/5 rounded-lg"
              title={isAudioPlaying ? "Mute" : "Play Audio"}
            >
              {isAudioPlaying ? (
                <Volume2 className="w-5 h-5" />
              ) : (
                <VolumeX className="w-5 h-5" />
              )}
            </button>

            {/* Desktop Only Actions */}
            <button
              onClick={() => navigate("/login")}
              className="cursor-target hidden lg:block text-xs md:text-sm font-bold text-white hover:text-[#00d9ff] transition-colors px-3 md:px-4 py-2 border border-white/20 rounded-lg hover:bg-white/5 hover:border-[#00d9ff]/50"
            >
              Login
            </button>
            <button
              onClick={() => navigate("/login")}
              className="cursor-target hidden lg:block text-xs md:text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-violet-600 px-4 md:px-6 py-2 md:py-2.5 rounded-lg shadow-[0_0_20px_rgba(0,217,255,0.4)] hover:shadow-[0_0_30px_rgba(0,217,255,0.6)] hover:-translate-y-0.5 transition-all"
            >
              Get Started
            </button>
          </div>

          {/* Mobile Toggle */}
          <button
            className="cursor-target lg:hidden text-white ml-2 sm:ml-3"
            onClick={() => setMobileMenuOpen(true)}
          >
            <Menu className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>
      </nav>
      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            className="fixed inset-0 z-[60] bg-black/95 backdrop-blur-xl p-8 flex flex-col"
          >
            <div className="flex justify-end mb-12">
              <button onClick={() => setMobileMenuOpen(false)}>
                <X className="cursor-target w-8 h-8 text-white" />
              </button>
            </div>
            <div className="flex flex-col gap-8 text-center">
              {["Features", "How It Works", "Community"].map((item) => (
                <a
                  key={item}
                  href="#"
                  className="cursor-target font-display font-bold text-2xl text-white"
                >
                  {item}
                </a>
              ))}
              <div className="h-px bg-white/10 my-4"></div>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  navigate("/login");
                }}
                className="cursor-target w-full py-4 border border-white/20 rounded-xl text-white font-bold"
              >
                Login
              </button>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  navigate("/login");
                }}
                className="cursor-target w-full py-4 bg-gradient-to-r from-blue-600 to-violet-600 rounded-xl text-black font-bold"
              >
                Get Started
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* 2. HERO SECTION */}
      <section className="relative max-h-screen min-h-[80vh] h-[90vh] md:h-screen w-full flex items-center overflow-hidden px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 2xl:px-24 mt-20 sm:mt-16 md:mt-10 lg:mt-6">
        {/* Particles Background (KEEP YOUR EXISTING Particles component) */}
        <div className="absolute inset-0 z-0">
          {/* Your Particles component here - unchanged */}
          <Particles
            particleCount={150}
            particleSpread={12}
            speed={0.08}
            particleColors={["#00d9ff", "#b900ff", "#ffffff"]}
            alphaParticles={true}
            particleBaseSize={80}
            sizeRandomness={0.8}
            cameraDistance={22}
            disableRotation={false}
            className="opacity-40"
          />
        </div>

        {/* Subtle stars */}
        <div className="pointer-events-none absolute inset-0 opacity-30">
          <div className="absolute left-10 top-20 h-1 w-1 rounded-full bg-white/60"></div>
          <div className="absolute left-30 top-60 h-1 w-1 rounded-full bg-white/50"></div>
          <div className="absolute left-70 top-25 h-1 w-1 rounded-full bg-white/40"></div>
          <div className="absolute left-85 top-70 h-1 w-1 rounded-full bg-white/50"></div>
          <div className="absolute left-55 top-40 h-1 w-1 rounded-full bg-white/40"></div>
        </div>

        {/* 3D Earth Globe - BIGGER + BETTER POSITIONED */}
        <div className="absolute z-0 pointer-events-none right-0 md:right-2 lg:right-4 xl:right-8 2xl:right-16 top-1/2 -translate-y-1/2 opacity-25 md:opacity-80 w-[280px] h-[280px] sm:w-[340px] sm:h-[340px] md:w-[500px] md:h-[500px] lg:w-[650px] lg:h-[650px] xl:w-[750px] xl:h-[750px] 2xl:w-[900px] 2xl:h-[900px] drop-shadow-2xl shadow-blue-500/30 max-w-[95vw] max-h-[80vh] flex items-center justify-center">
          <EarthGlobe />
        </div>

        {/* Content Container */}
        <div className="max-w-7xl mx-auto w-full relative z-10 grid md:grid-cols-2 gap-8 sm:gap-10 md:gap-12 lg:gap-20 px-2">
          <div className="max-w-2xl space-y-8 lg:space-y-12">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 font-medium text-xs mb-8 backdrop-blur-xl"
            >
              <Star className="w-3 h-3 fill-current" />
              <span>For Space Enthusiasts</span>
            </motion.div>

            {/* Heading */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="font-display font-black text-3xl sm:text-4xl md:text-6xl lg:text-7xl xl:text-7xl text-white leading-[0.9] lg:leading-[0.88] mb-4 sm:mb-6"
            >
              Your Gateway to <br />
              <span className="bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">
                the Cosmos
              </span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-slate-300 text-sm sm:text-base md:text-lg lg:text-xl leading-relaxed mb-6 sm:mb-8 max-w-lg"
            >
              Track space missions, never miss celestial events, and explore the
              universe in real-time—all in one place.
            </motion.p>

            {/* Pills */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="flex flex-wrap gap-2 sm:gap-3 md:gap-4 mb-8 sm:mb-10 text-xs sm:text-sm"
            >
              <div className="flex items-center">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse mr-2"></div>
                <span>LIVE ISS Tracking</span>
              </div>
              <div className="flex items-center">
                <Zap className="w-3 h-3 text-orange-400 mr-2" />
                <span>Real-Time Alerts</span>
              </div>
              <div className="flex items-center">
                <BookOpen className="w-3 h-3 text-emerald-400 mr-2" />
                <span>Interactive Learning</span>
              </div>
            </motion.div>

            {/* CTAs - NEW SUBTLE INDIGO GRADIENT */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex flex-col sm:flex-row gap-3 sm:gap-4"
            >
              {/* Primary CTA */}
              <button
                onClick={() => navigate("/login")}
                className="cursor-target px-6 py-3 sm:px-8 sm:py-4 md:px-10 md:py-5 bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 rounded-lg sm:rounded-xl text-white font-bold text-sm sm:text-base md:text-lg shadow-xl shadow-blue-600/25 hover:shadow-2xl hover:shadow-blue-600/40 hover:-translate-y-1 transition-all duration-300 font-display tracking-wide group whitespace-nowrap"
              >
                Start Exploring for Free
                <ArrowRight className="w-5 h-5 ml-2 inline group-hover:translate-x-1 transition-transform" />
              </button>

              {/* Secondary CTA */}
              <button className="cursor-target px-6 py-3 sm:px-8 sm:py-4 md:px-10 md:py-5 bg-white/5 border border-white/20 rounded-lg sm:rounded-xl text-white font-bold text-sm sm:text-base md:text-lg flex items-center justify-center gap-2 hover:bg-white/10 hover:border-indigo-400 hover:text-indigo-400 transition-all backdrop-blur-xl hover:shadow-lg shadow-md shadow-white/10 group">
                Watch Demo
                <Play className="w-4 h-4 fill-current ml-1 group-hover:ml-2 transition-all" />
              </button>
            </motion.div>

            {/* Trust badges */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="mt-6 sm:mt-8 flex gap-4 sm:gap-6 text-xs sm:text-sm text-slate-500"
            >
              <span>Free forever</span>
              <span>•</span>
              <span>No credit card</span>
            </motion.div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center animate-bounce">
          <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center pt-2">
            <div className="w-1 h-2 bg-indigo-400 rounded-full animate-pulse"></div>
          </div>
          <span className="text-xs uppercase tracking-widest text-slate-500 mt-2 font-medium">
            Scroll
          </span>
        </div>
      </section>
      {/* 3. LIVE SPACE STATUS STRIP - SUBTLE & SEAMLESS */}
      <section className="w-full bg-[#0a0a1a]/80 backdrop-blur-md border-t border-white/10 border-b border-white/10 py-2 overflow-hidden relative group">
        <style>
          {`
      @keyframes scroll-left {
        0% { transform: translateX(0); }
        100% { transform: translateX(-50%); }
      }
      .animate-scroll {
        animation: scroll-left 35s linear infinite;
      }
      .pause-on-hover:hover {
        animation-play-state: paused;
      }
    `}
        </style>

        <div className="relative flex items-center">
          {/* FIXED LIVE BADGE - Z-INDEXED ABOVE SCROLL */}
          <div className="absolute left-0 z-20 pl-4 md:pl-8 bg-gradient-to-r from-[#0a0a1a] via-[#0a0a1a] to-transparent pr-8">
            <div className="flex items-center gap-2 bg-emerald-500/20 px-3 py-1 rounded-full border border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
              <div className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </div>
              <span className="text-[10px] md:text-xs font-black text-emerald-400 tracking-tighter uppercase">
                LIVE FEED
              </span>
            </div>
          </div>

          {/* SCROLLING CONTAINER */}
          <div
            className="cursor-target flex whitespace-nowrap animate-scroll pause-on-hover cursor-pointer"
            onClick={() => navigate("/login")}
          >
            {/* MAP DATA TWICE FOR SEAMLESS LOOP */}
            {[1, 2].map((loop) => (
              <div key={loop} className="flex items-center">
                {[
                  {
                    icon: "🛰️",
                    text: "ISS: Over Mumbai (14m)",
                    color: "text-blue-400",
                  },
                  {
                    icon: "🌌",
                    text: "Aurora: Kp 4.3 (Moderate)",
                    color: "text-purple-400",
                  },
                  {
                    icon: "🌍",
                    text: "CO₂: 421.9ppm (+2.1%)",
                    color: "text-emerald-400",
                  },
                  {
                    icon: "☄️",
                    text: "Geminids: Peak 22:47 IST",
                    color: "text-orange-400",
                  },
                  {
                    icon: "🚀",
                    text: "Starship: T-minus 2h 30m",
                    color: "text-pink-400",
                  },
                ].map((status, index) => (
                  <div
                    key={index}
                    className="flex items-center px-8 md:px-12 border-r border-white/5"
                  >
                    <span className={`text-lg md:text-xl mr-3 ${status.color}`}>
                      {status.icon}
                    </span>
                    <span className="text-xs md:text-sm font-mono font-medium text-white/90 tracking-wide">
                      {status.text}
                    </span>
                  </div>
                ))}
              </div>
            ))}
          </div>

          {/* SOURCES TAG */}
          <div className="absolute right-0 z-20 pr-4 md:pr-8 bg-gradient-to-l from-[#0a0a1a] via-[#0a0a1a] to-transparent pl-8 hidden sm:block">
            <span className="text-[10px] text-white/40 font-mono tracking-widest uppercase">
              NASA // ESA // NOAA
            </span>
          </div>
        </div>
      </section>

      {/* 3. PROBLEM STATEMENT */}
      <section className="py-16 sm:py-20 md:py-24 px-4 sm:px-6 md:px-12 bg-transparent relative">
        <div className="max-w-7xl mx-auto">
          <SectionHeading
            pre="THE CHALLENGE"
            title="Ever Missed a Meteor Shower?"
            sub="Or wondered when the ISS passes overhead? The universe is vast, but finding reliable info shouldn't be."
          />

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              {
                icon: Search,
                color: "#ff3366",
                title: "Fragmented Info",
                desc: "Checking 5 different websites just to plan one stargazing night.",
              },
              {
                icon: Clock,
                color: "#ffaa00",
                title: "Missed Events",
                desc: "Missing the Geminids peak because you didn't get a notification.",
              },
              {
                icon: BookOpen,
                color: "#b900ff",
                title: "Complex Jargon",
                desc: "Giving up on space news because it's too technical to understand.",
              },
            ].map((card, i) => (
              <motion.div
                key={i}
                whileHover={{
                  y: -8,
                  borderColor: card.color,
                  boxShadow: `0 0 30px ${card.color}20`,
                }}
                className="p-4 sm:p-6 md:p-8 lg:p-10 rounded-2xl bg-[#0f1322]/60 backdrop-blur-xl border border-white/5 group transition-all duration-300"
              >
                <div
                  className={`w-12 sm:w-14 h-12 sm:h-14 rounded-xl flex items-center justify-center mb-4 sm:mb-6 border bg-opacity-10`}
                  style={{
                    backgroundColor: `${card.color}10`,
                    borderColor: `${card.color}30`,
                    color: card.color,
                  }}
                >
                  <card.icon className="w-6 sm:w-7 h-6 sm:h-7" />
                </div>
                <h3 className="font-display font-bold text-lg sm:text-xl md:text-2xl text-white mb-2 sm:mb-3">
                  {card.title}
                </h3>
                <p className="text-[#b8c5d6] text-sm sm:text-base leading-relaxed">
                  {card.desc}
                </p>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-12 sm:mt-16 opacity-50">
            <div className="w-px h-12 sm:h-16 bg-[#00d9ff] mx-auto mb-3 sm:mb-4"></div>
            <p className="text-[#00d9ff] font-display font-bold text-sm sm:text-base">
              There's a better way...
            </p>
          </div>
        </div>
      </section>
      {/* 4. SOLUTION SHOWCASE - REAL PREVIEWS */}
      {/* 4. SOLUTION SHOWCASE - CLEAN + INTERACTIVE */}
      <section className="py-16 sm:py-20 md:py-24 px-4 sm:px-6 md:px-12 bg-transparent">
        <div className="max-w-7xl mx-auto">
          <SectionHeading
            pre="THE SOLUTION"
            title="One Platform. Everything Space."
            highlight="Personalized for You."
          />

          <div className="flex flex-col gap-20 max-w-6xl mx-auto">
            {[
              {
                title: "Real-Time Space Tracking",
                desc: "Get live updates on ISS position, aurora forecasts, and solar activity. Everything updates in real-time.",
                bullets: [
                  "Live ISS position every 5s",
                  "Aurora Kp Alerts",
                  "Solar Flare Warnings",
                ],
                visual: "dashboard",
              },
              {
                title: "Never Miss Cosmic Events",
                desc: "Personalized alerts for meteor showers, ISS passes, and auroras visible from your specific location.",
                bullets: [
                  "Meteor shower visibility",
                  "Pass predictions",
                  "Eclipse countdowns",
                ],
                visual: "mobile",
              },
              {
                title: "Learn Through Play",
                desc: "Interactive quizzes, engaging articles, and real-world applications. Gamify your learning.",
                bullets: [
                  "Interactive Quizzes",
                  "Earn Badges & XP",
                  "Leaderboards",
                ],
                visual: "quiz",
              },
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ margin: "-100px" }}
                className={`flex flex-col ${i % 2 === 1 ? "md:flex-row-reverse" : "md:flex-row"} items-center gap-8 sm:gap-10 md:gap-12 lg:gap-24`}
              >
                {/* Content - UNCHANGED */}
                <div className="flex-1 relative">
                  <span className="absolute -top-10 -left-6 text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-black text-transparent bg-clip-text bg-gradient-to-br from-blue-600 to-violet-600 opacity-10 select-none">
                    0{i + 1}
                  </span>
                  <h3 className="font-display font-bold text-xl sm:text-2xl md:text-3xl lg:text-4xl text-white mb-3 sm:mb-4 relative z-10">
                    {feature.title}
                  </h3>
                  <p className="text-[#b8c5d6] text-sm sm:text-base md:text-lg leading-relaxed mb-4 sm:mb-6">
                    {feature.desc}
                  </p>
                  <ul className="space-y-2 sm:space-y-3 mb-6 sm:mb-8">
                    {feature.bullets.map((b, idx) => (
                      <li
                        key={idx}
                        className="flex items-center gap-2 sm:gap-3 text-white text-sm sm:text-base"
                      >
                        <Check className="w-4 sm:w-5 h-4 sm:h-5 text-[#00ff88]" />{" "}
                        {b}
                      </li>
                    ))}
                  </ul>
                  <button className="cursor-target text-[#00d9ff] font-bold text-sm sm:text-base flex items-center gap-2 hover:gap-4 transition-all">
                    Try Live Demo <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

                {/* 1. DASHBOARD */}
                {feature.visual === "dashboard" && (
                  <div className="flex-1 w-full aspect-[4/3] relative overflow-hidden rounded-2xl shadow-[0_0_50px_rgba(0,217,255,0.1)] group hover:shadow-[0_0_50px_rgba(0,217,255,0.25)] transition-all">
                    <img
                      src={dashboardPreview}
                      alt="Dashboard"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 right-3 bg-emerald-500/95 backdrop-blur-sm text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg">
                      LIVE
                    </div>
                  </div>
                )}

                {/* 2. MOBILE NOTIFICATIONS - NO BOXES */}
                {feature.visual === "mobile" && (
                  <div className="flex-1 w-full aspect-[4/3] relative">
                    <div className="relative h-full flex items-center justify-center">
                      {/* Subtle glow behind */}
                      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#00d9ff]/10 via-transparent to-[#b900ff]/10 blur-2xl opacity-70" />

                      {/* Notification Stack */}
                      <div className="relative w-full h-full flex flex-col justify-center items-center gap-5 md:gap-6">
                        {/* Top notification (bigger, stronger, right displaced) */}
                        <div className="w-[260px] sm:w-[320px] md:w-[360px] translate-x-4 md:translate-x-10 -translate-y-2 md:-translate-y-4">
                          <div className="p-4 md:p-5 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-[0_0_30px_rgba(0,217,255,0.12)] hover:shadow-[0_0_40px_rgba(0,217,255,0.25)] hover:-translate-y-1 transition-all duration-300">
                            <div className="flex items-start gap-4">
                              <div className="w-12 h-12 rounded-xl bg-[#00d9ff]/15 border border-[#00d9ff]/25 flex items-center justify-center text-2xl">
                                🛰️
                              </div>

                              <div className="min-w-0 flex-1">
                                <p className="text-white font-display font-bold text-base md:text-lg leading-tight truncate">
                                  ISS Visible Overhead
                                </p>
                                <p className="text-[#b8c5d6] text-sm md:text-[15px] mt-1">
                                  14 min • 67° elevation • Clear sky
                                </p>

                                <div className="mt-3 flex items-center gap-2">
                                  <span className="text-[11px] font-mono tracking-widest uppercase text-[#00ff88] bg-[#00ff88]/10 border border-[#00ff88]/20 px-2 py-1 rounded-full">
                                    LIVE
                                  </span>
                                  <span className="text-[11px] font-mono tracking-widest uppercase text-[#00d9ff] bg-[#00d9ff]/10 border border-[#00d9ff]/20 px-2 py-1 rounded-full">
                                    TRACKING
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Bottom notification (bigger, stronger, left displaced) */}
                        <div className="w-[240px] sm:w-[300px] md:w-[340px] -translate-x-4 md:-translate-x-8 translate-y-2">
                          <div className="p-4 md:p-5 rounded-2xl bg-white/7 backdrop-blur-xl border border-white/15 shadow-[0_0_25px_rgba(185,0,255,0.10)] hover:shadow-[0_0_35px_rgba(185,0,255,0.22)] hover:translate-x-1 transition-all duration-300">
                            <div className="flex items-start gap-4">
                              <div className="w-12 h-12 rounded-xl bg-[#b900ff]/15 border border-[#b900ff]/25 flex items-center justify-center text-2xl">
                                ☄️
                              </div>

                              <div className="min-w-0 flex-1">
                                <p className="text-white font-display font-bold text-base md:text-lg leading-tight">
                                  Geminids Peak Tonight
                                </p>
                                <p className="text-[#b8c5d6] text-sm md:text-[15px] mt-1">
                                  Active now • Best view: 2:10 AM
                                </p>

                                <div className="mt-3 flex items-center gap-2">
                                  <span className="text-[11px] font-mono tracking-widest uppercase text-[#b900ff] bg-[#b900ff]/10 border border-[#b900ff]/20 px-2 py-1 rounded-full">
                                    EVENT
                                  </span>
                                  <span className="text-[11px] font-mono tracking-widest uppercase text-[#00d9ff] bg-[#00d9ff]/10 border border-[#00d9ff]/20 px-2 py-1 rounded-full">
                                    ALERT
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Small extra micro-ping for life */}
                        <div className="absolute bottom-6 right-8 w-2.5 h-2.5 rounded-full bg-[#00ff88] animate-ping opacity-40" />
                        <div className="absolute bottom-6 right-8 w-2.5 h-2.5 rounded-full bg-[#00ff88] opacity-80" />
                      </div>
                    </div>
                  </div>
                )}
                {/* 3. TINY WORKING QUIZ - NO OUTER BG */}
                {feature.visual === "quiz" && (
                  <div className="flex-1 w-full aspect-[4/3] relative">
                    {/* Soft glow only (no panel box) */}
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#b900ff]/10 via-transparent to-[#00d9ff]/10 blur-2xl opacity-70" />

                    <div className="relative h-full flex items-center justify-center px-4">
                      {/* Quiz State */}
                      {quizState === "question" && (
                        <div className="w-full max-w-sm md:max-w-md">
                          <div className="flex items-center justify-between mb-5">
                            <span className="text-xs font-mono font-bold tracking-widest uppercase text-[#b8c5d6]">
                              QUICK QUIZ
                            </span>

                            <span className="text-xs font-mono font-bold tracking-widest uppercase text-[#00ff88] bg-[#00ff88]/10 border border-[#00ff88]/20 px-2 py-1 rounded-full backdrop-blur-sm">
                              +25 XP
                            </span>
                          </div>

                          <h4 className="text-white font-display font-black text-2xl md:text-3xl mb-6 leading-tight">
                            What causes auroras?
                          </h4>

                          <div className="space-y-3">
                            <button
                              onClick={() => setQuizState("correct")}
                              className="w-full p-4 rounded-2xl bg-white/5 border border-white/15 hover:bg-white/10 hover:border-[#00ff88]/40 text-left transition-all duration-300"
                            >
                              <p className="text-white font-display font-bold text-base md:text-lg">
                                Solar wind particles
                              </p>
                              <p className="text-[#b8c5d6] text-sm mt-1">
                                Charged particles interacting with Earth’s
                                atmosphere
                              </p>
                            </button>

                            <button
                              onClick={() => setQuizState("wrong")}
                              className="w-full p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-[#b900ff]/35 text-left transition-all duration-300"
                            >
                              <p className="text-white font-display font-bold text-base md:text-lg">
                                Moonlight reflections
                              </p>
                              <p className="text-[#b8c5d6] text-sm mt-1">
                                Light bouncing off clouds at night
                              </p>
                            </button>
                          </div>
                        </div>
                      )}

                      {quizState === "correct" && (
                        <motion.div
                          initial={{ scale: 0.95, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          className="w-full max-w-sm md:max-w-md text-center"
                        >
                          <div className="mx-auto w-20 h-20 rounded-2xl bg-[#00ff88]/15 border border-[#00ff88]/30 flex items-center justify-center mb-6 shadow-[0_0_40px_rgba(0,255,136,0.15)]">
                            <Check className="w-10 h-10 text-[#00ff88]" />
                          </div>

                          <h3 className="font-display font-black text-3xl text-white mb-3">
                            Correct.
                          </h3>

                          <p className="text-[#b8c5d6] text-base md:text-lg leading-relaxed mb-7">
                            Solar wind particles excite atmospheric gases —
                            that’s the aurora glow.
                          </p>

                          <button
                            onClick={() => setQuizState("question")}
                            className="inline-flex items-center justify-center gap-2 px-8 py-3 rounded-2xl font-bold text-white bg-gradient-to-r from-blue-600 to-violet-600 hover:opacity-95 transition-all shadow-xl"
                          >
                            More Questions <ArrowRight className="w-4 h-4" />
                          </button>
                        </motion.div>
                      )}

                      {quizState === "wrong" && (
                        <motion.div
                          initial={{ scale: 0.95, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          className="w-full max-w-sm md:max-w-md text-center"
                        >
                          <div className="mx-auto w-20 h-20 rounded-2xl bg-rose-500/15 border border-rose-400/30 flex items-center justify-center mb-6 shadow-[0_0_40px_rgba(244,63,94,0.12)]">
                            <span className="text-4xl text-rose-400 font-black">
                              ✕
                            </span>
                          </div>

                          <h3 className="font-display font-black text-3xl text-white mb-3">
                            Not quite.
                          </h3>

                          <p className="text-[#b8c5d6] text-base md:text-lg leading-relaxed mb-7">
                            Auroras happen due to solar wind particles — not
                            moonlight.
                          </p>

                          <button
                            onClick={() => setQuizState("question")}
                            className="inline-flex items-center justify-center px-8 py-3 rounded-2xl font-bold text-white bg-white/5 border border-white/15 hover:bg-white/10 hover:border-white/25 transition-all"
                          >
                            Try Again
                          </button>
                        </motion.div>
                      )}
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. LIVE DATA PREVIEW — Mission Control Panel (Narrative + Bento) */}
      <section
        className="
    px-4 sm:px-6 md:px-12
    py-16 sm:py-20 md:py-24
    bg-transparent relative overflow-hidden
    lg:min-h-screen
    flex items-center
  "
        id="live-preview"
      >
        <div className="max-w-7xl mx-auto relative z-10">
          <SectionHeading
            pre="SEE IT IN ACTION"
            title="Real-Time Space Data"
            sub="It’s not a demo — this updates live from space weather + orbit data."
          />

          {/* Narrative strip */}
          <div className="mt-10 mb-10">
            <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#0f1322]/40 backdrop-blur-xl">
              <div className="absolute inset-0 opacity-40 bg-gradient-to-r from-[#00d9ff]/10 via-[#b900ff]/10 to-[#00ff88]/10" />
              <div className="relative px-5 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#00ff88] animate-pulse shadow-[0_0_12px_rgba(0,255,136,0.5)]" />
                  <p className="text-sm md:text-base text-[#cbd5e1] font-medium">
                    While you’re on this page, the ISS keeps moving — and
                    SpaceScope keeps tracking.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2 text-xs md:text-sm font-mono text-[#94a3b8]">
                  <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10">
                    🛰️ ISS: Live
                  </span>
                  <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10">
                    ⚡ Kp: Live
                  </span>
                  <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10">
                    ⏱️ Pass Timer: Live
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Mission Control Layout */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-stretch">
            {/* LEFT: Big ISS Panel */}
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="md:col-span-7"
            >
              <div className="relative h-full rounded-3xl border border-white/10 bg-[#0f1322]/60 backdrop-blur-xl overflow-hidden group">
                {/* subtle glow */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-[#00d9ff]/10 via-transparent to-[#b900ff]/10" />

                {/* Live badge */}
                <div className="absolute top-5 right-5 flex items-center gap-2 bg-[#00ff88]/10 px-3 py-1 rounded-full border border-[#00ff88]/20">
                  <span className="w-2 h-2 bg-[#00ff88] rounded-full animate-pulse"></span>
                  <span className="text-[10px] font-bold text-[#00ff88] tracking-wider">
                    LIVE
                  </span>
                </div>

                <div className="relative p-6 sm:p-8 md:p-10">
                  <div className="flex items-start justify-between gap-4 sm:gap-6">
                    <div>
                      <h4 className="text-white font-display font-black text-xl sm:text-2xl md:text-3xl mb-2 sm:mb-3">
                        🛰️ ISS Mission Trace
                      </h4>
                      <p className="text-[#94a3b8] text-xs sm:text-sm md:text-base leading-relaxed max-w-xl">
                        Ever missed an ISS pass because you found out too late?
                        <span className="text-white/90 font-semibold">
                          {" "}
                          SpaceScope tracks it live{" "}
                        </span>
                        and tells you exactly when to look up.
                      </p>
                    </div>
                  </div>

                  {/* Coordinates */}
                  <div className="mt-6 sm:mt-8 grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div className="rounded-2xl bg-[#050714]/60 border border-white/10 p-3 sm:p-4">
                      <p className="text-[#94a3b8] text-[10px] sm:text-xs mb-1 font-medium">
                        Current Latitude
                      </p>
                      <p className="font-mono text-[#00d9ff] text-lg sm:text-xl font-black">
                        {issLat.toFixed(2)}°
                      </p>
                    </div>
                    <div className="rounded-2xl bg-[#050714]/60 border border-white/10 p-3 sm:p-4">
                      <p className="text-[#94a3b8] text-[10px] sm:text-xs mb-1 font-medium">
                        Current Longitude
                      </p>
                      <p className="font-mono text-[#00d9ff] text-lg sm:text-xl font-black">
                        {issLon.toFixed(2)}°
                      </p>
                    </div>
                  </div>

                  {/* Map / Visual */}
                  <div className="mt-6 rounded-2xl bg-[#050714] border border-white/10 overflow-hidden relative">
                    <div className="absolute inset-0 opacity-25 bg-[url('https://upload.wikimedia.org/wikipedia/commons/e/ec/World_map_blank_without_borders.svg')] bg-cover bg-center invert" />

                    {/* Orbit line */}
                    <div className="absolute inset-0">
                      <div className="absolute top-1/2 left-0 right-0 h-px border-t border-dashed border-[#00d9ff]/40" />
                    </div>

                    {/* “ISS dot” */}
                    <motion.div
                      initial={{ x: "-40%" }}
                      whileInView={{ x: "40%" }}
                      viewport={{ once: false, amount: 0.3 }}
                      transition={{
                        duration: 2.5,
                        ease: "easeInOut",
                        repeat: Infinity,
                        repeatType: "reverse",
                      }}
                      className="absolute top-1/2 left-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-[0_0_14px_rgba(255,255,255,0.9)]"
                    />

                    <div className="relative h-44 md:h-56" />

                    {/* bottom overlay */}
                    <div className="relative px-4 sm:px-5 py-3 sm:py-4 border-t border-white/10 bg-gradient-to-r from-[#0f1322]/80 to-[#050714]/80">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <p className="text-[10px] sm:text-xs md:text-sm text-[#cbd5e1] font-medium">
                          By the time you reached this section, the ISS has
                          already moved again.
                        </p>
                        <span className="text-[9px] sm:text-[10px] md:text-xs font-mono text-[#94a3b8] whitespace-nowrap">
                          27,600 km/h • ~420 km altitude
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* CTA */}
                  <div className="mt-8 flex flex-col sm:flex-row gap-3">
                    <button
                      onClick={() => navigate("/login")}
                      className="px-7 py-3 rounded-2xl font-bold text-white bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-700 hover:opacity-95 transition-all shadow-xl hover:shadow-2xl"
                    >
                      Open Live Dashboard →
                    </button>

                    <button
                      onClick={() => navigate("/login")}
                      className="px-7 py-3 rounded-2xl font-bold text-white/90 border border-white/15 bg-white/5 hover:bg-white/10 transition-all"
                    >
                      Enable ISS Alerts
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* RIGHT: Stack (Kp + Countdown) */}
            <div className="md:col-span-5 flex flex-col gap-8">
              {/* KP PANEL */}
              <motion.div
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.6, ease: "easeOut", delay: 0.05 }}
                className="rounded-3xl border border-white/10 bg-[#0f1322]/60 backdrop-blur-xl overflow-hidden"
              >
                <div className="p-8 md:p-9 relative">
                  <div className="absolute top-5 right-5 flex items-center gap-2 bg-[#00ff88]/10 px-3 py-1 rounded-full border border-[#00ff88]/20">
                    <span className="w-2 h-2 bg-[#00ff88] rounded-full animate-pulse"></span>
                    <span className="text-[10px] font-bold text-[#00ff88] tracking-wider">
                      LIVE
                    </span>
                  </div>

                  <h4 className="text-white font-display font-black text-2xl mb-2">
                    ⚡ Aurora Watch (Kp Index)
                  </h4>

                  <p className="text-[#94a3b8] text-sm leading-relaxed">
                    Ever checked the sky and wondered “is tonight the night?”
                    SpaceScope translates space weather into a simple signal you
                    can act on.
                  </p>

                  <div className="mt-6 flex items-end justify-between gap-4">
                    <div>
                      <div className="text-6xl font-display font-black text-[#ffaa00] drop-shadow-[0_0_18px_rgba(255,170,0,0.35)]">
                        5.2
                      </div>
                      <div className="text-white font-semibold mt-1">
                        Geomagnetic Storm: G1
                      </div>
                      <div className="text-[#b8c5d6] text-sm mt-1">
                        Aurora possible at higher latitudes
                      </div>
                    </div>

                    {/* Vertical meter = less “card-y” */}
                    <div className="w-12 h-32 rounded-2xl bg-[#050714]/70 border border-white/10 overflow-hidden flex items-end">
                      <motion.div
                        initial={{ height: 0 }}
                        whileInView={{ height: "58%" }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="w-full bg-gradient-to-t from-[#00ff88] via-[#ffaa00] to-[#ff3366]"
                      />
                    </div>
                  </div>

                  <div className="mt-6 text-xs font-mono text-[#94a3b8] flex items-center justify-between">
                    <span>NOAA feed • live updates</span>
                    <span className="text-white/80">Status: Stable</span>
                  </div>
                </div>
              </motion.div>

              {/* COUNTDOWN PANEL */}
              <motion.div
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.6, ease: "easeOut", delay: 0.12 }}
                className="rounded-3xl border border-white/10 bg-[#0f1322]/60 backdrop-blur-xl overflow-hidden"
              >
                <div className="p-8 md:p-9">
                  <h4 className="text-white font-display font-black text-2xl mb-2">
                    🚀 Next ISS Pass
                  </h4>

                  <p className="text-[#94a3b8] text-sm leading-relaxed">
                    The difference between seeing it and missing it is usually
                    <span className="text-white/90 font-semibold">
                      {" "}
                      one notification.
                    </span>
                  </p>

                  <div className="mt-6 rounded-2xl bg-[#050714]/60 border border-white/10 p-5 text-center">
                    <div className="text-4xl md:text-5xl font-mono font-black text-[#00d9ff]">
                      {formatTime(countdown)}
                    </div>
                    <p className="text-[#94a3b8] text-sm mt-2">
                      Time until pass over your location
                    </p>
                  </div>

                  <div className="mt-5 grid grid-cols-2 gap-4">
                    <div className="rounded-2xl bg-white/5 border border-white/10 p-4">
                      <p className="text-[#94a3b8] text-xs">Max Elevation</p>
                      <p className="text-white font-bold text-lg">67°</p>
                    </div>
                    <div className="rounded-2xl bg-white/5 border border-white/10 p-4 text-right">
                      <p className="text-[#94a3b8] text-xs">Duration</p>
                      <p className="text-white font-bold text-lg">4 min</p>
                    </div>
                  </div>

                  <div className="mt-6 flex gap-3">
                    <button
                      onClick={() => navigate("/login")}
                      className="w-full px-6 py-3 rounded-2xl font-bold text-white bg-white/5 border border-white/15 hover:bg-white/10 hover:border-[#00d9ff]/40 transition-all"
                    >
                      Notify Me
                    </button>
                    <button
                      onClick={() => navigate("/login")}
                      className="w-full px-6 py-3 rounded-2xl font-bold text-white bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-700 hover:opacity-95 transition-all shadow-xl"
                    >
                      Personalize →
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Bottom micro-copy */}
          <div className="text-center mt-12">
            <p className="text-[#64748b] text-sm font-medium mb-4">
              Real-time data is powerful — but the real win is knowing what
              matters *to you*.
            </p>
          </div>
        </div>

        {/* Background blobs */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-10 w-64 h-64 md:w-96 md:h-96 bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-full blur-3xl animate-pulse"></div>
          <div
            className="absolute bottom-1/4 right-10 w-[450px] h-[450px] md:w-[600px] md:h-[600px] bg-gradient-to-l from-cyan-500/3 to-blue-500/3 rounded-full blur-3xl animate-pulse"
            style={{ animationDelay: "3s" }}
          ></div>
        </div>
      </section>

      {/* 6. FEATURES GRID */}
      {/* 6. FEATURES GRID */}
      <section
        className="py-16 sm:py-20 md:py-24 px-4 sm:px-6 md:px-12 bg-transparent"
        id="features"
      >
        <div className="max-w-7xl mx-auto">
          <SectionHeading pre="POWERFUL FEATURES" title="Everything You Need" />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Globe,
                title: "ISS Live Tracking",
                desc: "Real-time orbital position, ground tracks, and visibility zones.",
              },
              {
                icon: Zap,
                title: "Space Weather Monitor",
                desc: "Live solar wind, geomagnetic storms, and flare activity.",
              },
              {
                icon: Star,
                title: "Meteor Shower Alerts",
                desc: "Peak nights, radiant direction, and visibility conditions.",
              },
              {
                icon: Shield,
                title: "Radiation & Solar Flux",
                desc: "X-ray flux levels and space radiation indicators.",
              },
              {
                icon: Rocket,
                title: "Launch & Mission Feeds",
                desc: "Upcoming launches, mission timelines, and milestones.",
              },
              {
                icon: BookOpen,
                title: "Educational Insights",
                desc: "Learn the science behind what’s happening above you.",
              },
              {
                icon: Globe,
                title: "Earth Observation",
                desc: "CO₂ presence, atmospheric changes, and climate signals.",
              },
              {
                icon: Zap,
                title: "Aurora Visibility",
                desc: "Kp index forecasts translated into simple visibility signals.",
              },
              {
                icon: Star,
                title: "Personalized Alerts",
                desc: "Only get notified when something matters to your location.",
              },
            ].map((f, i) => (
              <div
                key={i}
                className="
            p-6 sm:p-8 rounded-2xl
            bg-[#0f1322]/40 border border-white/5
            hover:bg-[#0f1322]/80 hover:border-[#00d9ff]/30
            hover:-translate-y-1
            transition-all duration-300
            group cursor-default
          "
              >
                <div className="w-12 h-12 rounded-lg bg-[#00d9ff]/10 border border-[#00d9ff]/20 flex items-center justify-center mb-6 text-[#00d9ff] group-hover:rotate-12 transition-transform">
                  <f.icon className="w-6 h-6" />
                </div>

                <h3 className="font-display font-bold text-xl text-white mb-2">
                  {f.title}
                </h3>

                <p className="text-[#b8c5d6] text-sm leading-relaxed">
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. HOW IT WORKS */}
      {/* 7. HOW IT WORKS — Rocket Scroll Line */}
      {/* 7. HOW IT WORKS — Rocket Scroll Line */}
      <section
        className="py-16 sm:py-20 md:py-24 px-4 sm:px-6 md:px-12 bg-transparent"
        id="how-it-works"
        ref={howRef}
      >
        <div className="max-w-7xl mx-auto">
          <SectionHeading
            pre="GETTING STARTED"
            title="Start in 3 Simple Steps"
          />

          <div className="relative flex flex-col md:flex-row justify-between items-start gap-6 md:gap-12 mt-12 md:mt-20">
            {/* Connecting Line (Desktop) */}
            <div className="hidden md:block absolute top-12 left-[15%] right-[15%] h-0.5 bg-gradient-to-r from-blue-600 to-violet-600 z-0 overflow-visible">
              {/* Rocket moving on scroll */}
              <motion.div
                style={{ x: rocketX, rotate: rocketRotate }}
                className="absolute -top-4 left-0"
              >
                <div
                  className="text-4xl drop-shadow-[0_0_14px_rgba(0,217,255,0.6)] transform -rotate-90"
                  style={{ transformOrigin: "center" }}
                >
                  🚀
                </div>
              </motion.div>
            </div>

            {[
              {
                num: "01",
                icon: "📝",
                title: "Sign Up Free",
                desc: "Create your account in 30 seconds. No credit card.",
              },
              {
                num: "02",
                icon: "⚙️",
                title: "Set Preferences",
                desc: "Tell us your location and interests.",
              },
              {
                num: "03",
                icon: "🚀",
                title: "Start Exploring",
                desc: "Get real-time alerts and track missions.",
              },
            ].map((step, i) => (
              <div
                key={i}
                className="relative z-10 flex flex-col items-center text-center w-full md:w-1/3"
              >
                <div className="w-24 h-24 rounded-full bg-[#050714] border-4 border-[#0a0e17] flex items-center justify-center relative mb-6 group">
                  <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#00d9ff] to-[#b900ff] opacity-20 group-hover:opacity-40 transition-opacity"></div>
                  <div className="absolute inset-0 rounded-full border-2 border-[#00d9ff] animate-ping opacity-20"></div>
                  <span className="font-display font-black text-3xl text-white">
                    {step.num}
                  </span>
                  <span className="absolute -bottom-2 text-2xl">
                    {step.icon}
                  </span>
                </div>

                <h3 className="font-display font-bold text-2xl text-white mb-3">
                  {step.title}
                </h3>
                <p className="text-[#b8c5d6] max-w-xs">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 8. SOCIAL PROOF */}
      <section
        className="py-16 sm:py-20 md:py-24 px-4 sm:px-6 md:px-12 bg-transparent"
        id="community"
      >
        <div className="max-w-7xl mx-auto">
          <SectionHeading
            pre="JOIN THE COMMUNITY"
            title="50,000+ Space Enthusiasts"
            highlight="Worldwide"
          />

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-20 border-b border-white/5 pb-12">
            {[
              { n: "50K+", l: "Active Users", i: Users },
              { n: "500K", l: "Events Tracked", i: Star },
              { n: "1M+", l: "Notifications", i: Bell },
              { n: "4.9", l: "App Rating", i: Star },
            ].map((stat, i) => (
              <div
                key={i}
                className="text-center p-6 bg-[#0f1322]/40 rounded-2xl hover:-translate-y-2 transition-transform"
              >
                <stat.i className="w-8 h-8 text-[#00d9ff] mx-auto mb-4" />
                <div className="font-display font-black text-3xl md:text-4xl text-white mb-2">
                  {stat.n}
                </div>
                <div className="text-[#94a3b8] text-sm uppercase tracking-wide">
                  {stat.l}
                </div>
              </div>
            ))}
          </div>

          {/* Testimonial */}
          <div className="max-w-4xl mx-auto bg-[#0f1322]/60 backdrop-blur-xl border border-white/10 rounded-2xl p-8 md:p-12 text-center relative">
            <div className="text-[#00d9ff]/20 absolute top-8 left-8 text-8xl font-serif leading-none">
              "
            </div>
            <div className="flex justify-center gap-1 mb-6">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className="w-5 h-5 fill-[#ffaa00] text-[#ffaa00]"
                />
              ))}
            </div>
            <p className="text-xl md:text-2xl text-white italic leading-relaxed mb-8 relative z-10">
              "Singularity helped me catch my first ISS pass! The notifications
              are perfect and the real-time tracking is incredible. It's the
              only space app I need."
            </p>
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-gray-700 border-2 border-[#00d9ff] mb-3 overflow-hidden">
                <img
                  src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"
                  alt="User"
                />
              </div>
              <div className="font-display font-bold text-lg text-white">
                Sarah Jenkins
              </div>
              <div className="text-[#94a3b8] text-sm">
                Science Teacher, New York
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PRICING SECTION */}
      <section
        id="pricing"
        className="py-20 sm:py-24 px-5 sm:px-6 md:px-12 bg-transparent relative overflow-hidden"
      >
        <div className="max-w-7xl mx-auto relative z-10">
          {/* Header */}
          <div className="text-center mb-12 sm:mb-16">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-[#00d9ff]/15 via-[#b900ff]/15 to-[#00ff88]/15 px-4 py-2 rounded-full border border-white/10 backdrop-blur-xl mb-6">
              <span className="w-2 h-2 rounded-full bg-[#00ff88] animate-pulse" />
              <span className="text-xs font-mono font-bold tracking-widest uppercase text-[#cbd5e1]">
                PRICING
              </span>
            </div>

            <h2 className="font-display text-4xl sm:text-5xl md:text-6xl font-black text-transparent text-white  mb-4">
              Pricing
            </h2>

            <p className="text-slate-400 text-base sm:text-lg max-w-2xl mx-auto">
              Choose the trajectory that fits your mission.
            </p>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {/* Observer */}
            <div className="group rounded-3xl border border-white/10 bg-[#0f1322]/55 backdrop-blur-xl p-6 sm:p-8 hover:-translate-y-1 hover:border-[#00d9ff]/35 transition-all duration-300">
              <h3 className="font-display text-xl sm:text-2xl font-black text-white mb-2">
                Observer
              </h3>

              <div className="mb-7 sm:mb-8">
                <div className="flex items-end gap-2">
                  <span className="text-4xl sm:text-5xl font-display font-black text-white">
                    $0
                  </span>
                  <span className="text-slate-400 text-sm mb-1">/ month</span>
                </div>
              </div>

              <ul className="space-y-3 text-sm text-[#b8c5d6]">
                <li className="flex items-center gap-3">
                  <span className="w-2 h-2 rounded-full bg-[#00d9ff]" />
                  Launch tracking
                </li>
                <li className="flex items-center gap-3">
                  <span className="w-2 h-2 rounded-full bg-[#00d9ff]" />
                  Basic notifications
                </li>
                <li className="flex items-center gap-3">
                  <span className="w-2 h-2 rounded-full bg-[#00d9ff]" />
                  Public API access
                </li>
              </ul>

              <button className="mt-8 sm:mt-10 w-full px-6 py-3 rounded-2xl font-bold text-white bg-white/5 border border-white/15 hover:bg-white/10 hover:border-[#00d9ff]/40 transition-all">
                Get Started
              </button>
            </div>

            {/* Commander (Recommended) */}
            <div className="group relative rounded-3xl border border-[#b900ff]/35 bg-[#0f1322]/70 backdrop-blur-xl p-6 sm:p-8 hover:-translate-y-1 transition-all duration-300 shadow-[0_0_0_1px_rgba(185,0,255,0.15)]">
              {/* glow */}
              <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-[#b900ff]/15 via-transparent to-[#00d9ff]/10 pointer-events-none" />

              {/* badge */}
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full bg-gradient-to-r from-[#b900ff] to-[#00d9ff] text-white text-xs font-bold tracking-widest shadow-xl">
                RECOMMENDED
              </div>

              <div className="relative">
                <h3 className="font-display text-xl sm:text-2xl font-black text-white mb-2">
                  Commander
                </h3>

                <div className="mb-7 sm:mb-8">
                  <div className="flex items-end gap-2">
                    <span className="text-4xl sm:text-5xl font-display font-black text-white">
                      $29
                    </span>
                    <span className="text-slate-400 text-sm mb-1">/ month</span>
                  </div>
                </div>

                <ul className="space-y-3 text-sm text-[#b8c5d6]">
                  <li className="flex items-center gap-3">
                    <span className="w-2 h-2 rounded-full bg-[#b900ff]" />
                    Real-time telemetry
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="w-2 h-2 rounded-full bg-[#b900ff]" />
                    Priority alerts
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="w-2 h-2 rounded-full bg-[#b900ff]" />
                    Advanced analytics
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="w-2 h-2 rounded-full bg-[#b900ff]" />
                    Team dashboard
                  </li>
                </ul>

                <button className="mt-8 sm:mt-10 w-full px-6 py-3 rounded-2xl font-bold text-white bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-700 hover:opacity-95 transition-all shadow-xl">
                  Start Commander
                </button>
              </div>
            </div>

            {/* Enterprise */}
            <div className="group rounded-3xl border border-white/10 bg-[#0f1322]/55 backdrop-blur-xl p-6 sm:p-8 hover:-translate-y-1 hover:border-[#00ff88]/30 transition-all duration-300 sm:col-span-2 lg:col-span-1">
              <h3 className="font-display text-xl sm:text-2xl font-black text-white mb-2">
                Enterprise
              </h3>

              <div className="mb-7 sm:mb-8">
                <div className="flex items-end gap-2">
                  <span className="text-3xl sm:text-4xl md:text-5xl font-display font-black text-white">
                    Custom
                  </span>
                </div>
              </div>

              <ul className="space-y-3 text-sm text-[#b8c5d6]">
                <li className="flex items-center gap-3">
                  <span className="w-2 h-2 rounded-full bg-[#00ff88]" />
                  Dedicated satellite link
                </li>
                <li className="flex items-center gap-3">
                  <span className="w-2 h-2 rounded-full bg-[#00ff88]" />
                  Raw data export
                </li>
                <li className="flex items-center gap-3">
                  <span className="w-2 h-2 rounded-full bg-[#00ff88]" />
                  SLA support
                </li>
                <li className="flex items-center gap-3">
                  <span className="w-2 h-2 rounded-full bg-[#00ff88]" />
                  On-premise deployment
                </li>
              </ul>

              <button className="mt-8 sm:mt-10 w-full px-6 py-3 rounded-2xl font-bold text-white bg-white/5 border border-white/15 hover:bg-white/10 hover:border-[#00ff88]/40 transition-all">
                Contact Sales
              </button>
            </div>
          </div>
        </div>

        {/* Background blobs */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-6 sm:left-10 w-56 h-56 sm:w-80 sm:h-80 md:w-96 md:h-96 bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-full blur-3xl animate-pulse" />
          <div
            className="absolute bottom-1/4 right-6 sm:right-10 w-[340px] h-[340px] sm:w-[450px] sm:h-[450px] md:w-[600px] md:h-[600px] bg-gradient-to-l from-cyan-500/3 to-blue-500/3 rounded-full blur-3xl animate-pulse"
            style={{ animationDelay: "3s" }}
          />
        </div>
      </section>

      {/* 9. FINAL CTA */}
      <section className="py-32 px-6 md:px-12 relative overflow-hidden flex items-center justify-center">
        {/* Background Galaxy Effect */}
        <div className="absolute inset-0 bg-transparent z-0"></div>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 100, repeat: Infinity, ease: "linear" }}
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
            Join thousands of space enthusiasts tracking missions, catching
            meteor showers, and learning about the cosmos.
          </p>
          <div className="flex flex-col items-center gap-6">
            <button
              onClick={() => navigate("/login")}
              className="px-10 py-5 bg-gradient-to-r from-[#00d9ff] to-[#b900ff] rounded-xl text-black font-bold text-xl shadow-[0_0_40px_rgba(0,217,255,0.6)] hover:scale-105 hover:shadow-[0_0_60px_rgba(0,217,255,0.8)] transition-all"
            >
              Create Free Account
            </button>
            <button
              onClick={() => navigate("/login")}
              className="text-[#94a3b8] hover:text-white underline decoration-dashed underline-offset-4"
            >
              Already a member? Log in
            </button>
          </div>
          <div className="mt-12 flex flex-wrap justify-center gap-4 text-[#64748b] text-sm">
            <span className="flex items-center gap-2">
              <Check className="w-4 h-4 text-[#00d9ff]" /> Free forever
            </span>
            <span className="flex items-center gap-2">
              <Check className="w-4 h-4 text-[#00d9ff]" /> No credit card
            </span>
            <span className="flex items-center gap-2">
              <Check className="w-4 h-4 text-[#00d9ff]" /> Cancel anytime
            </span>
          </div>
        </div>
      </section>
      {/* 10. FOOTER */}
      <footer className="bg-black/80 pt-20 pb-10 px-6 md:px-12 border-t border-white/5 text-[#94a3b8]">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="col-span-1">
            <div className="flex items-center mb-4">
              <img
                src={Logo}
                alt="Singularity"
                className="h-8 w-auto object-contain"
              />
            </div>
            <p className="text-sm italic mb-6">Your Gateway to the Cosmos.</p>
            <div className="flex gap-4">
              {[Twitter, Instagram, Youtube, Github].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center hover:bg-[#00d9ff]/20 hover:text-[#00d9ff] transition-all"
                >
                  <Icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          {[
            {
              head: "Product",
              links: ["Features", "How It Works", "Pricing", "API", "Roadmap"],
            },
            {
              head: "Learn",
              links: ["Blog", "Tutorials", "Community", "Support", "FAQ"],
            },
          ].map((col, i) => (
            <div key={i}>
              <h4 className="font-display font-bold text-white mb-6">
                {col.head}
              </h4>
              <ul className="space-y-3 text-sm">
                {col.links.map((l) => (
                  <li key={l}>
                    <a
                      href="#"
                      className="hover:text-[#00d9ff] transition-colors"
                    >
                      {l}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Connect */}
          <div>
            <h4 className="font-display font-bold text-white mb-6">Connect</h4>
            <p className="text-sm mb-4">Stay updated with space news.</p>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="Your email"
                className="bg-[#1a2036] border border-white/10 rounded-lg px-4 py-2 text-sm w-full focus:outline-none focus:border-[#00d9ff]"
              />
              <button className="bg-[#00d9ff]/10 border border-[#00d9ff]/30 text-[#00d9ff] px-4 py-2 rounded-lg font-bold hover:bg-[#00d9ff]/20 transition-all">
                Go
              </button>
            </div>
            <div className="flex items-center gap-2 mt-4 text-sm">
              <Mail className="w-4 h-4" /> hello@Singularity.com
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-xs">
          <p>© 2025 Singularity. Built with data from NASA, NOAA & ESA.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-[#00d9ff]">
              Privacy Policy
            </a>
            <a href="#" className="hover:text-[#00d9ff]">
              Terms of Service
            </a>
            <a href="#" className="hover:text-[#00d9ff]">
              Cookies
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
