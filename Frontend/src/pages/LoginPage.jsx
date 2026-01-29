// import React, { useState, useEffect } from 'react';
// import {
//   MdRocketLaunch,
//   MdEmail,
//   MdLock,
//   MdVisibility,
//   MdVisibilityOff,
//   MdCheckCircle,
//   MdPublic,
//   MdAnalytics,
//   MdGroups
// } from 'react-icons/md';
// import { FaGoogle, FaGithub } from 'react-icons/fa';

// const LoginPage = () => {
//   const [activeTab, setActiveTab] = useState('login');
//   const [showPassword, setShowPassword] = useState(false);
//   const [showResetModal, setShowResetModal] = useState(false);
//   const [showVerifyOverlay, setShowVerifyOverlay] = useState(false);

//   // Parallax effect logic for stars
//   useEffect(() => {
//     const handleMouseMove = (e) => {
//       const moveX = e.clientX * -0.01;
//       const moveY = e.clientY * -0.01;
//       const stars = document.querySelector('.stars-bg');
//       if (stars) {
//         stars.style.backgroundPosition = `calc(0px + ${moveX}px) calc(0px + ${moveY}px)`;
//       }
//     };
//     document.addEventListener('mousemove', handleMouseMove);
//     return () => document.removeEventListener('mousemove', handleMouseMove);
//   }, []);

//   // Custom CSS for stars
//   const customStyles = `
//     .stars-bg {
//       background-image: 
//         radial-gradient(1px 1px at 20px 30px, #eee, rgba(0,0,0,0)),
//         radial-gradient(1px 1px at 40px 70px, #fff, rgba(0,0,0,0)),
//         radial-gradient(1px 1px at 50px 160px, #ddd, rgba(0,0,0,0)),
//         radial-gradient(2px 2px at 90px 40px, #fff, rgba(0,0,0,0)),
//         radial-gradient(2px 2px at 130px 80px, #fff, rgba(0,0,0,0));
//       background-repeat: repeat; 
//       background-size: 200px 200px;
//     }
//     .custom-scrollbar::-webkit-scrollbar { width: 4px; }
//     .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
//     .custom-scrollbar::-webkit-scrollbar-thumb { background: #334155; border-radius: 2px; }
//   `;

//   return (
//     <div className="bg-background-dark min-h-screen text-slate-300 font-display overflow-hidden flex selection:bg-primary selection:text-black">
//       <style>{customStyles}</style>

//       {/* === LEFT PANEL: AUTH SIDEBAR === */}
//       <div className="w-full lg:w-[480px] bg-panel-dark border-r border-white/5 flex flex-col relative z-20 shadow-2xl h-screen flex-shrink-0">

//         {/* Header / Logo */}
//         <div className="p-8 pb-4 flex items-center justify-between">
//           <div className="flex items-center gap-3">
//             <div className="w-10 h-10 rounded-xl bg-btn-gradient flex items-center justify-center shadow-lg shadow-primary/20 text-white">
//               <MdRocketLaunch className="text-xl" />
//             </div>
//             <div>
//               <h1 className="text-xl font-bold text-white tracking-tight leading-none">Singularity</h1>
//               <span className="text-[10px] font-bold text-primary tracking-widest uppercase">Dashboard</span>
//             </div>
//           </div>
//         </div>

//         {/* Tab Switcher */}
//         <div className="px-8 flex border-b border-white/5 relative">
//           <button
//             onClick={() => setActiveTab('login')}
//             className={`flex-1 pb-4 text-sm font-medium transition-all relative ${activeTab === 'login' ? 'text-primary' : 'text-secondary hover:text-white'}`}
//           >
//             Login
//             {activeTab === 'login' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary shadow-[0_0_10px_#00d9ff]"></div>}
//           </button>
//           <button
//             onClick={() => setActiveTab('register')}
//             className={`flex-1 pb-4 text-sm font-medium transition-all relative ${activeTab === 'register' ? 'text-primary' : 'text-secondary hover:text-white'}`}
//           >
//             Register
//             {activeTab === 'register' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary shadow-[0_0_10px_#00d9ff]"></div>}
//           </button>
//         </div>

//         {/* Form Content */}
//         <div className="flex-1 overflow-y-auto custom-scrollbar p-8 flex flex-col justify-center">

//           {/* Welcome Header */}
//           <div className="mb-8 animate-slide-up">
//             <h2 className="text-3xl font-bold text-white mb-2">Welcome Back</h2>
//             <p className="text-secondary text-sm">Enter your credentials to access the mission control.</p>
//           </div>

//           {/* --- LOGIN FORM --- */}
//           {activeTab === 'login' && (
//             <form className="flex flex-col gap-5 animate-slide-up" onSubmit={(e) => e.preventDefault()}>
//               {/* Email */}
//               <div className="relative group">
//                 <MdEmail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary transition-colors text-lg" />
//                 <input
//                   type="text"
//                   className="w-full bg-input-bg border border-input-border rounded-lg h-12 pl-11 pr-4 text-white text-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all placeholder:text-slate-600"
//                   placeholder="Email or Username"
//                 />
//               </div>

//               {/* Password */}
//               <div className="relative group">
//                 <MdLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary transition-colors text-lg" />
//                 <input
//                   type={showPassword ? "text" : "password"}
//                   className="w-full bg-input-bg border border-input-border rounded-lg h-12 pl-11 pr-12 text-white text-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all placeholder:text-slate-600"
//                   placeholder="Password"
//                 />
//                 <button
//                   type="button"
//                   onClick={() => setShowPassword(!showPassword)}
//                   className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
//                 >
//                   {showPassword ? <MdVisibilityOff /> : <MdVisibility />}
//                 </button>
//               </div>

//               {/* Options */}
//               <div className="flex items-center justify-between text-xs">
//                 <label className="flex items-center gap-2 cursor-pointer group">
//                   <input type="checkbox" className="w-3.5 h-3.5 rounded border-slate-600 bg-transparent text-primary focus:ring-offset-0 focus:ring-0" />
//                   <span className="text-secondary group-hover:text-white transition-colors">Remember me</span>
//                 </label>
//                 <button type="button" onClick={() => setShowResetModal(true)} className="text-primary hover:text-white transition-colors">
//                   Forgot password?
//                 </button>
//               </div>

//               {/* Submit Button */}
//               <button className="w-full h-12 rounded-lg bg-btn-gradient text-white font-bold text-sm tracking-wide shadow-[0_4px_20px_rgba(0,217,255,0.3)] hover:shadow-[0_4px_25px_rgba(0,217,255,0.5)] hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 group mt-2">
//                 <span>LAUNCH CONSOLE</span>
//                 <MdRocketLaunch className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
//               </button>
//             </form>
//           )}

//           {/* --- REGISTER FORM --- */}
//           {activeTab === 'register' && (
//             <form className="flex flex-col gap-4 animate-slide-up" onSubmit={(e) => { e.preventDefault(); setShowVerifyOverlay(true); }}>
//               <div className="relative group">
//                 <input type="text" className="w-full bg-input-bg border border-input-border rounded-lg h-12 px-4 text-white text-sm focus:border-primary focus:outline-none transition-all placeholder:text-slate-600" placeholder="Full Name" />
//               </div>
//               <div className="relative group">
//                 <input type="text" className="w-full bg-input-bg border border-input-border rounded-lg h-12 px-4 text-white text-sm focus:border-primary focus:outline-none transition-all placeholder:text-slate-600" placeholder="Username" />
//               </div>
//               <div className="relative group">
//                 <input type="email" className="w-full bg-input-bg border border-input-border rounded-lg h-12 px-4 text-white text-sm focus:border-primary focus:outline-none transition-all placeholder:text-slate-600" placeholder="Email Address" />
//               </div>
//               <div className="relative group">
//                 <input type="password" className="w-full bg-input-bg border border-input-border rounded-lg h-12 px-4 text-white text-sm focus:border-primary focus:outline-none transition-all placeholder:text-slate-600" placeholder="Password" />
//               </div>

//               {/* Strength Meter */}
//               <div className="flex gap-1 h-1 w-full">
//                 <div className="h-full w-1/4 bg-error rounded-full"></div>
//                 <div className="h-full w-1/4 bg-warning rounded-full"></div>
//                 <div className="h-full w-1/4 bg-input-border rounded-full"></div>
//                 <div className="h-full w-1/4 bg-input-border rounded-full"></div>
//               </div>

//               <button className="w-full h-12 rounded-lg bg-btn-gradient text-white font-bold text-sm shadow-[0_4px_20px_rgba(0,217,255,0.3)] hover:shadow-[0_4px_25px_rgba(0,217,255,0.5)] hover:-translate-y-0.5 transition-all mt-2">
//                 CREATE ACCOUNT
//               </button>
//             </form>
//           )}

//           {/* Social Login */}
//           <div className="mt-8">
//             <div className="flex items-center gap-4 mb-6">
//               <div className="h-px bg-white/5 flex-1"></div>
//               <span className="text-secondary text-[10px] uppercase tracking-wider">Or continue with</span>
//               <div className="h-px bg-white/5 flex-1"></div>
//             </div>
//             <div className="grid grid-cols-2 gap-4">
//               <button className="h-10 rounded-lg bg-[#1a1f2e] border border-white/5 hover:border-white/20 hover:bg-white/5 transition-all flex items-center justify-center gap-2 text-sm text-white">
//                 <FaGoogle className="text-white" />
//                 <span>Google</span>
//               </button>
//               <button className="h-10 rounded-lg bg-[#1a1f2e] border border-white/5 hover:border-white/20 hover:bg-white/5 transition-all flex items-center justify-center gap-2 text-sm text-white">
//                 <FaGithub className="text-white" />
//                 <span>GitHub</span>
//               </button>
//             </div>
//           </div>

//           <div className="mt-8 text-center">
//             <p className="text-secondary text-xs">
//               New to Singularity? <button onClick={() => setActiveTab('register')} className="text-primary font-bold hover:underline">Create an account</button>
//             </p>
//           </div>

//         </div>

//         {/* Footer Info */}
//         <div className="p-6 border-t border-white/5 flex justify-between items-center text-[10px] font-mono text-slate-600 uppercase tracking-wider">
//           <span>System v2.4.0</span>
//           <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-green-500"></div> Secure Connection</span>
//         </div>
//       </div>

//       {/* === RIGHT PANEL: HERO SECTION === */}
//       <div className="hidden lg:flex flex-1 relative items-center justify-center overflow-hidden bg-background-dark">
//         {/* Background Stars & Gradient */}
//         <div className="absolute inset-0 bg-space-gradient z-0"></div>
//         <div className="absolute inset-0 stars-bg opacity-40 animate-[float_100s_linear_infinite]" style={{ animationDuration: '100s', animationName: 'none' }}></div>

//         {/* Content Container */}
//         <div className="relative z-10 w-full max-w-3xl flex flex-col items-center">

//           {/* Visual Container */}
//           <div className="relative w-[480px] h-[480px] mb-12 animate-float">

//             {/* Status Card (Top Left) */}
//             <div className="absolute top-16 -left-16 bg-[#0f121d]/80 backdrop-blur-md border border-white/10 p-4 rounded-xl shadow-2xl z-20 flex items-center gap-3 animate-[bounce_4s_infinite]">
//               <div className="w-2 h-2 rounded-full bg-success animate-pulse shadow-[0_0_8px_#00ff88]"></div>
//               <div>
//                 <p className="text-[10px] text-secondary font-bold uppercase tracking-wider leading-none mb-0.5">Status</p>
//                 <p className="text-white font-mono text-sm font-bold leading-none">Systems Online</p>
//               </div>
//             </div>

//             {/* Main Astronaut Image */}
//             <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-2xl border border-white/5 group">
//               {/* Inner shadow/gradient overlay */}
//               <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10"></div>
//               <img
//                 src="https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?q=80&w=2072&auto=format&fit=crop"
//                 alt="Astronaut"
//                 className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-[2s]"
//               />
//             </div>

//             {/* Live Feed Card (Bottom Right) */}
//             <div className="absolute bottom-12 -right-12 bg-[#0f121d]/80 backdrop-blur-md border border-white/10 p-4 rounded-xl shadow-2xl z-20 flex items-center gap-3 animate-[bounce_5s_infinite]">
//               <div className="w-8 h-8 rounded-full bg-warning/20 flex items-center justify-center text-warning">
//                 <MdPublic className="animate-spin duration-[3s]" />
//               </div>
//               <div>
//                 <p className="text-[10px] text-secondary font-bold uppercase tracking-wider leading-none mb-0.5">Live Feed</p>
//                 <p className="text-white font-mono text-sm font-bold leading-none">Connecting...</p>
//               </div>
//             </div>
//           </div>

//           {/* Text Content */}
//           <h2 className="text-5xl font-bold text-white mb-6 tracking-tight text-center drop-shadow-2xl">
//             Your Gateway to the <br />
//             <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-500">Cosmos</span>
//           </h2>

//           <p className="text-secondary text-lg text-center max-w-lg mb-10 leading-relaxed">
//             Track missions in real-time, analyze celestial data, and join a community of space explorers.
//           </p>

//           {/* Feature Pills */}
//           <div className="flex gap-4">
//             <div className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#151a29] border border-white/10 text-sm text-secondary hover:text-white hover:border-primary/50 transition-all cursor-default">
//               <MdRocketLaunch className="text-primary" />
//               <span>Telemetry</span>
//             </div>
//             <div className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#151a29] border border-white/10 text-sm text-secondary hover:text-white hover:border-primary/50 transition-all cursor-default">
//               <MdAnalytics className="text-primary" />
//               <span>Data Analysis</span>
//             </div>
//             <div className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#151a29] border border-white/10 text-sm text-secondary hover:text-white hover:border-primary/50 transition-all cursor-default">
//               <MdGroups className="text-primary" />
//               <span>Explorer Community</span>
//             </div>
//           </div>

//         </div>
//       </div>

//       {/* === MODALS === */}

//       {/* Reset Password */}
//       {showResetModal && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-slide-up" onClick={() => setShowResetModal(false)}>
//           <div className="w-full max-w-md bg-[#1a1f3a] border border-white/10 rounded-2xl p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
//             <div className="mb-6">
//               <h3 className="text-xl font-bold text-white">Reset Password</h3>
//               <p className="text-secondary text-sm mt-1">Enter your email for reset instructions.</p>
//             </div>
//             <input type="email" className="w-full bg-input-bg border border-input-border rounded-lg h-12 px-4 text-white text-sm focus:border-primary focus:outline-none mb-4" placeholder="Email Address" />
//             <button onClick={() => { alert('Link sent'); setShowResetModal(false) }} className="w-full h-12 rounded-lg bg-primary text-black font-bold text-sm hover:bg-white transition-colors">SEND LINK</button>
//           </div>
//         </div>
//       )}

//       {/* Verify Email */}
//       {showVerifyOverlay && (
//         <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-space-gradient p-6 text-center animate-slide-up">
//           <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center mb-6 relative">
//             <div className="absolute inset-0 rounded-full border border-primary animate-ping opacity-20"></div>
//             <MdCheckCircle className="text-4xl text-primary" />
//           </div>
//           <h2 className="text-3xl font-bold text-white mb-2">Check your Email</h2>
//           <p className="text-secondary text-lg mb-8">We sent a verification link to <span className="text-white">explorer@Singularity.com</span></p>
//           <button onClick={() => { setShowVerifyOverlay(false); setActiveTab('login'); }} className="px-8 py-3 rounded-lg bg-primary text-black font-bold hover:bg-white transition-colors">Back to Login</button>
//         </div>
//       )}
//     </div>
//   );
// };

// export default LoginPage;

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  MdRocketLaunch,
  MdEmail,
  MdLock,
  MdVisibility,
  MdVisibilityOff,
  MdCheckCircle,
  MdPublic,
  MdAnalytics,
  MdGroups,
  MdPerson,
  MdLocationOn
} from 'react-icons/md';
import { FaGoogle, FaGithub } from 'react-icons/fa';
import Logo from '../assets/Logo.png';
import TargetCursor from '../components/TargetCursor';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login, user } = useAuth();

  const [activeTab, setActiveTab] = useState('login');
  const [showPassword, setShowPassword] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [showVerifyOverlay, setShowVerifyOverlay] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Login form state
  const [loginData, setLoginData] = useState({
    emailOrUsername: '',
    password: ''
  });

  // Register form state
  const [registerData, setRegisterData] = useState({
    username: '',
    email: '',
    password: '',
    fullName: '',
    location: ''
  });

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  // Parallax effect logic for stars
  useEffect(() => {
    const handleMouseMove = (e) => {
      const moveX = e.clientX * -0.01;
      const moveY = e.clientY * -0.01;
      const stars = document.querySelector('.stars-bg');
      if (stars) {
        stars.style.backgroundPosition = `calc(0px + ${moveX}px) calc(0px + ${moveY}px)`;
      }
    };
    document.addEventListener('mousemove', handleMouseMove);
    return () => document.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Handle Login
  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      login(data.user);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle Register
  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(registerData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      // Show success message and switch to login
      setShowVerifyOverlay(true);
      setRegisterData({
        username: '',
        email: '',
        password: '',
        fullName: '',
        location: ''
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Custom CSS for stars
  const customStyles = `
    .stars-bg {
      background-image: 
        radial-gradient(1px 1px at 20px 30px, #eee, rgba(0,0,0,0)),
        radial-gradient(1px 1px at 40px 70px, #fff, rgba(0,0,0,0)),
        radial-gradient(1px 1px at 50px 160px, #ddd, rgba(0,0,0,0)),
        radial-gradient(2px 2px at 90px 40px, #fff, rgba(0,0,0,0)),
        radial-gradient(2px 2px at 130px 80px, #fff, rgba(0,0,0,0));
      background-repeat: repeat; 
      background-size: 200px 200px;
    }
    .custom-scrollbar::-webkit-scrollbar { width: 4px; }
    .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
    .custom-scrollbar::-webkit-scrollbar-thumb { background: #334155; border-radius: 2px; }
  `;

  return (
    <div className="bg-transparent min-h-screen text-slate-300 font-display overflow-hidden flex selection:bg-primary selection:text-black">
      <style>{customStyles}</style>
      <TargetCursor
        spinDuration={5}
        hideDefaultCursor
        parallaxOn
        hoverDuration={0.95}
      />

      {/* === LEFT PANEL: AUTH SIDEBAR === */}
      <div className="w-full lg:w-[480px] bg-panel-dark/90 border-r border-white/5 flex flex-col relative z-20 shadow-2xl h-screen flex-shrink-0">

        {/* Header / Logo */}
        <div className="p-8 pb-4 flex items-center justify-between">
          <div className="flex items-center">
            <img src={Logo} alt="Singularity" className="h-10 w-auto object-contain" />
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="px-8 flex border-b border-white/5 relative">
          <button
            onClick={() => { setActiveTab('login'); setError(''); }}
            className={`cursor-target flex-1 pb-4 text-sm font-medium transition-all relative ${activeTab === 'login' ? 'text-primary' : 'text-secondary hover:text-white'}`}
          >
            Login
            {activeTab === 'login' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary shadow-[0_0_10px_#00d9ff]"></div>}
          </button>
          <button
            onClick={() => { setActiveTab('register'); setError(''); }}
            className={`cursor-target flex-1 pb-4 text-sm font-medium transition-all relative ${activeTab === 'register' ? 'text-primary' : 'text-secondary hover:text-white'}`}
          >
            Register
            {activeTab === 'register' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary shadow-[0_0_10px_#00d9ff]"></div>}
          </button>
        </div>

        {/* Form Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-8 flex flex-col justify-center">

          {/* Welcome Header */}
          <div className="mb-8 animate-slide-up">
            <h2 className="text-3xl font-bold text-white mb-2">
              {activeTab === 'login' ? 'Welcome Back' : 'Join Singularity'}
            </h2>
            <p className="text-secondary text-sm">
              {activeTab === 'login'
                ? 'Enter your credentials to access the mission control.'
                : 'Create your account and start exploring the cosmos.'}
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* --- LOGIN FORM --- */}
          {activeTab === 'login' && (
            <form className="flex flex-col gap-5 animate-slide-up" onSubmit={handleLogin}>
              {/* Email */}
              <div className="relative group">
                <MdEmail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary transition-colors text-lg" />
                <input
                  type="text"
                  value={loginData.emailOrUsername}
                  onChange={(e) => setLoginData({ ...loginData, emailOrUsername: e.target.value })}
                  className="cursor-target w-full bg-input-bg border border-input-border rounded-lg h-12 pl-11 pr-4 text-white text-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all placeholder:text-slate-600"
                  placeholder="Email or Username"
                  required
                />
              </div>

              {/* Password */}
              <div className="relative group">
                <MdLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary transition-colors text-lg" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={loginData.password}
                  onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                  className="cursor-target w-full bg-input-bg border border-input-border rounded-lg h-12 pl-11 pr-12 text-white text-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all placeholder:text-slate-600"
                  placeholder="Password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="cursor-target absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                >
                  {showPassword ? <MdVisibilityOff /> : <MdVisibility />}
                </button>
              </div>

              {/* Options */}
              <div className="flex items-center justify-between text-xs">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input type="checkbox" className="w-3.5 h-3.5 rounded border-slate-600 bg-transparent text-primary focus:ring-offset-0 focus:ring-0" />
                  <span className="text-secondary group-hover:text-white transition-colors">Remember me</span>
                </label>
                <button type="button" onClick={() => setShowResetModal(true)} className="cursor-target text-primary hover:text-white transition-colors">
                  Forgot password?
                </button>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="cursor-target w-full h-12 rounded-lg bg-btn-gradient text-white font-bold text-sm tracking-wide shadow-[0_4px_20px_rgba(0,217,255,0.3)] hover:shadow-[0_4px_25px_rgba(0,217,255,0.5)] hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 group mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span>{loading ? 'LAUNCHING...' : 'LAUNCH CONSOLE'}</span>
                {!loading && <MdRocketLaunch className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />}
              </button>
            </form>
          )}

          {/* --- REGISTER FORM --- */}
          {activeTab === 'register' && (
            <form className="flex flex-col gap-4 animate-slide-up" onSubmit={handleRegister}>
              {/* Full Name */}
              <div className="relative group">
                <MdPerson className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary transition-colors text-lg" />
                <input
                  type="text"
                  value={registerData.fullName}
                  onChange={(e) => setRegisterData({ ...registerData, fullName: e.target.value })}
                  className="w-full bg-input-bg border border-input-border rounded-lg h-12 pl-11 pr-4 text-white text-sm focus:border-primary focus:outline-none transition-all placeholder:text-slate-600"
                  placeholder="Full Name"
                  required
                />
              </div>

              {/* Username */}
              <div className="relative group">
                <input
                  type="text"
                  value={registerData.username}
                  onChange={(e) => setRegisterData({ ...registerData, username: e.target.value })}
                  className="w-full bg-input-bg border border-input-border rounded-lg h-12 px-4 text-white text-sm focus:border-primary focus:outline-none transition-all placeholder:text-slate-600"
                  placeholder="Username"
                  required
                />
              </div>

              {/* Email */}
              <div className="relative group">
                <MdEmail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary transition-colors text-lg" />
                <input
                  type="email"
                  value={registerData.email}
                  onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                  className="w-full bg-input-bg border border-input-border rounded-lg h-12 pl-11 pr-4 text-white text-sm focus:border-primary focus:outline-none transition-all placeholder:text-slate-600"
                  placeholder="Email Address"
                  required
                />
              </div>

              {/* Location */}
              <div className="relative group">
                <MdLocationOn className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary transition-colors text-lg" />
                <input
                  type="text"
                  value={registerData.location}
                  onChange={(e) => setRegisterData({ ...registerData, location: e.target.value })}
                  className="w-full bg-input-bg border border-input-border rounded-lg h-12 pl-11 pr-4 text-white text-sm focus:border-primary focus:outline-none transition-all placeholder:text-slate-600"
                  placeholder="Location (Optional)"
                />
              </div>

              {/* Password */}
              <div className="relative group">
                <MdLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary transition-colors text-lg" />
                <input
                  type="password"
                  value={registerData.password}
                  onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                  className="w-full bg-input-bg border border-input-border rounded-lg h-12 pl-11 pr-4 text-white text-sm focus:border-primary focus:outline-none transition-all placeholder:text-slate-600"
                  placeholder="Password (min 6 characters)"
                  required
                  minLength={6}
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full h-12 rounded-lg bg-btn-gradient text-white font-bold text-sm shadow-[0_4px_20px_rgba(0,217,255,0.3)] hover:shadow-[0_4px_25px_rgba(0,217,255,0.5)] hover:-translate-y-0.5 transition-all mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'CREATING ACCOUNT...' : 'CREATE ACCOUNT'}
              </button>
            </form>
          )}

          {/* Social Login */}
          <div className="mt-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="h-px bg-white/5 flex-1"></div>
              <span className="text-secondary text-[10px] uppercase tracking-wider">Or continue with</span>
              <div className="h-px bg-white/5 flex-1"></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <button className="cursor-target h-10 rounded-lg bg-[#1a1f2e] border border-white/5 hover:border-white/20 hover:bg-white/5 transition-all flex items-center justify-center gap-2 text-sm text-white">
                <FaGoogle className="text-white" />
                <span>Google</span>
              </button>
              <button className="cursor-target h-10 rounded-lg bg-[#1a1f2e] border border-white/5 hover:border-white/20 hover:bg-white/5 transition-all flex items-center justify-center gap-2 text-sm text-white">
                <FaGithub className="text-white" />
                <span>GitHub</span>
              </button>
            </div>
          </div>

          <div className="mt-8 text-center">
            <p className="text-secondary text-xs">
              {activeTab === 'login' ? (
                <>New to Singularity? <button onClick={() => { setActiveTab('register'); setError(''); }} className="text-primary font-bold hover:underline">Create an account</button></>
              ) : (
                <>Already have an account? <button onClick={() => { setActiveTab('login'); setError(''); }} className="text-primary font-bold hover:underline">Sign in</button></>
              )}
            </p>
          </div>

        </div>

        {/* Footer Info */}
        <div className="p-6 border-t border-white/5 flex justify-between items-center text-[10px] font-mono text-slate-600 uppercase tracking-wider">
          <span>System v2.4.0</span>
          <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-green-500"></div> Secure Connection</span>
        </div>
      </div>

      {/* === RIGHT PANEL: HERO SECTION === */}
      <div className="hidden lg:flex flex-1 relative items-center justify-center overflow-hidden bg-transparent">
        {/* Background Stars & Gradient */}
        <div className="absolute inset-0 bg-space-gradient z-0"></div>
        <div className="absolute inset-0 stars-bg opacity-40 animate-[float_100s_linear_infinite]" style={{ animationDuration: '100s', animationName: 'none' }}></div>

        {/* Content Container */}
        <div className="relative z-10 w-full max-w-3xl flex flex-col items-center">

          {/* Visual Container */}
          <div className="relative w-[480px] h-[480px] mb-12 animate-float">

            {/* Status Card (Top Left) */}
            <div className="absolute top-16 -left-16 bg-[#0f121d]/80 backdrop-blur-md border border-white/10 p-4 rounded-xl shadow-2xl z-20 flex items-center gap-3 animate-[bounce_4s_infinite]">
              <div className="w-2 h-2 rounded-full bg-success animate-pulse shadow-[0_0_8px_#00ff88]"></div>
              <div>
                <p className="text-[10px] text-secondary font-bold uppercase tracking-wider leading-none mb-0.5">Status</p>
                <p className="text-white font-mono text-sm font-bold leading-none">Systems Online</p>
              </div>
            </div>

            {/* Main Astronaut Image */}
            <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-2xl border border-white/5 group">
              {/* Inner shadow/gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10"></div>
              <img
                src="https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?q=80&w=2072&auto=format&fit=crop"
                alt="Astronaut"
                className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-[2s]"
              />
            </div>

            {/* Live Feed Card (Bottom Right) */}
            <div className="absolute bottom-12 -right-12 bg-[#0f121d]/80 backdrop-blur-md border border-white/10 p-4 rounded-xl shadow-2xl z-20 flex items-center gap-3 animate-[bounce_5s_infinite]">
              <div className="w-8 h-8 rounded-full bg-warning/20 flex items-center justify-center text-warning">
                <MdPublic className="animate-spin duration-[3s]" />
              </div>
              <div>
                <p className="text-[10px] text-secondary font-bold uppercase tracking-wider leading-none mb-0.5">Live Feed</p>
                <p className="text-white font-mono text-sm font-bold leading-none">Connecting...</p>
              </div>
            </div>
          </div>

          {/* Text Content */}
          <h2 className="text-5xl font-bold text-white mb-6 tracking-tight text-center drop-shadow-2xl">
            Your Gateway to the <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-500">Cosmos</span>
          </h2>

          <p className="text-secondary text-lg text-center max-w-lg mb-10 leading-relaxed">
            Track missions in real-time, analyze celestial data, and join a community of space explorers.
          </p>

          {/* Feature Pills */}
          <div className="flex gap-4">
            <div className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#151a29] border border-white/10 text-sm text-secondary hover:text-white hover:border-primary/50 transition-all cursor-default">
              <MdRocketLaunch className="text-primary" />
              <span>Telemetry</span>
            </div>
            <div className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#151a29] border border-white/10 text-sm text-secondary hover:text-white hover:border-primary/50 transition-all cursor-default">
              <MdAnalytics className="text-primary" />
              <span>Data Analysis</span>
            </div>
            <div className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#151a29] border border-white/10 text-sm text-secondary hover:text-white hover:border-primary/50 transition-all cursor-default">
              <MdGroups className="text-primary" />
              <span>Explorer Community</span>
            </div>
          </div>

        </div>
      </div>

      {/* === MODALS === */}

      {/* Reset Password */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-slide-up" onClick={() => setShowResetModal(false)}>
          <div className="w-full max-w-md bg-[#1a1f3a] border border-white/10 rounded-2xl p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="mb-6">
              <h3 className="text-xl font-bold text-white">Reset Password</h3>
              <p className="text-secondary text-sm mt-1">Enter your email for reset instructions.</p>
            </div>
            <input type="email" className="w-full bg-input-bg border border-input-border rounded-lg h-12 px-4 text-white text-sm focus:border-primary focus:outline-none mb-4" placeholder="Email Address" />
            <button onClick={() => { alert('Link sent'); setShowResetModal(false) }} className="w-full h-12 rounded-lg bg-primary text-black font-bold text-sm hover:bg-white transition-colors">SEND LINK</button>
          </div>
        </div>
      )}

      {/* Verify Email */}
      {showVerifyOverlay && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-space-gradient p-6 text-center animate-slide-up">
          <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center mb-6 relative">
            <div className="absolute inset-0 rounded-full border border-primary animate-ping opacity-20"></div>
            <MdCheckCircle className="text-4xl text-primary" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">Account Created!</h2>
          <p className="text-secondary text-lg mb-8">Welcome to Singularity. You can now log in with your credentials.</p>
          <button onClick={() => { setShowVerifyOverlay(false); setActiveTab('login'); }} className="px-8 py-3 rounded-lg bg-primary text-black font-bold hover:bg-white transition-colors">Go to Login</button>
        </div>
      )}
    </div>
  );
};

export default LoginPage;