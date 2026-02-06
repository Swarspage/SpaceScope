import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { useAuth } from "../context/AuthContext";
import {
  MdAddPhotoAlternate,
  MdFavorite,
  MdFavoriteBorder,
  MdDelete,
  MdLocationOn,
  MdClose,
  MdSearch,
  MdChevronLeft,
  MdChevronRight,
  MdMoreVert,
  MdFlag,
  MdBlock,
  MdArchive,
  MdPeople,
  MdNotifications,
  MdSettings,
  MdAdd,
  MdArticle,
  MdGridView,
  MdViewStream
} from "react-icons/md";
import {
  FaUserAstronaut,
  FaSpinner,
  FaRegComment,
  FaRetweet,
  FaShare,
  FaPaperPlane,
} from "react-icons/fa";
import {
  Camera,
  X,
  Upload,
  Heart,
  MessageCircle,
  Repeat,
  Share2,
  MapPin,
  Image as ImageIcon,
  Search,
  Loader2,
} from "lucide-react";

import api from "../services/api";
import axios from "axios";
import { formatDistanceToNow, format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";

// --- NEW IMPORTS ---
import NewsFeed from "../components/NewsFeed";


const LocationSelector = ({ location, setLocation, setShowLocationSelector }) => {
  const [loading, setLoading] = useState(false);
  const [customInput, setCustomInput] = useState("");

  const handleUseMyLocation = () => {
    setLoading(true);
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const res = await axios.get(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );
          if (res.data) {
            const address =
              res.data.address.city ||
              res.data.address.town ||
              res.data.address.village ||
              res.data.address.county ||
              "Unknown Location";
            const country = res.data.address.country || "";
            setLocation(`${address}, ${country}`);
          }
        } catch (error) {
          console.error("Error fetching location", error);
          alert("Failed to fetch location");
        } finally {
          setLoading(false);
        }
      },
      (error) => {
        console.error("Geolocation error", error);
        alert("Unable to retrieve your location");
        setLoading(false);
      }
    );
  };

  const handleCustomLocationSubmit = async () => {
    if (!customInput.trim()) return;
    setLoading(true);
    try {
      const res = await axios.get(`https://nominatim.openstreetmap.org/search`, {
        params: { q: customInput, format: "json", limit: 1 }
      });
      if (res.data && res.data.length > 0) {
        const place = res.data[0];
        const parts = place.display_name.split(", ");
        const shortName = parts.length > 1 ? `${parts[0]}, ${parts[parts.length - 1]}` : parts[0];
        setLocation(shortName);
      } else {
        alert("Location not found, please check spelling.");
      }
    } catch (err) {
      console.error("Search failed", err);
      alert("Failed to validate location");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-black/40 backdrop-blur-md p-4 rounded-xl border border-white/10 mb-4 transition-all">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <MapPin size={14} className="text-[#00d9ff]" />
          Add Location
        </h3>
        <button onClick={() => setShowLocationSelector(false)} className="text-slate-500 hover:text-white"><X size={16} /></button>
      </div>

      <div className="flex flex-col gap-3">
        <button
          onClick={handleUseMyLocation}
          className="cursor-target flex items-center justify-center gap-2 w-full py-2 bg-[#00d9ff]/10 hover:bg-[#00d9ff]/20 text-[#00d9ff] rounded-lg border border-[#00d9ff]/30 transition-colors text-xs font-bold uppercase tracking-wider"
        >
          {loading ? <Loader2 className="animate-spin" size={14} /> : <MapPin size={14} />}
          Use My Current Location
        </button>

        <div className="text-center text-[10px] text-slate-500 font-mono uppercase">--- OR ---</div>

        <div className="flex gap-2">
          <input
            type="text"
            value={customInput}
            onChange={(e) => setCustomInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCustomLocationSubmit()}
            placeholder="Enter city manually..."
            className="cursor-target flex-1 bg-[#151a25] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-[#00d9ff] outline-none"
          />
          <button
            onClick={handleCustomLocationSubmit}
            className="bg-white/10 hover:bg-white/20 text-white px-3 rounded-lg flex items-center justify-center"
          >
            {loading ? <Loader2 className="animate-spin" size={16} /> : <Search size={16} />}
          </button>
        </div>

        {location && (
          <div className="text-xs text-[#00d9ff] mt-1 flex items-center gap-1">
            Selected: <span className="font-bold underline">{location}</span>
            <button onClick={() => setLocation("")} className="ml-2 text-red-400 hover:text-red-300"><X size={12} /></button>
          </div>
        )}
      </div>
    </div>
  );
};

const CommunityPage = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // --- MOBILE VIEW STATE ---
  const [activeTab, setActiveTab] = useState("posts"); // 'posts' or 'news'

  // Create Post State
  const [isCreating, setIsCreating] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [caption, setCaption] = useState("");
  const [location, setLocation] = useState("");
  const [showMap, setShowMap] = useState(false);

  const fileInputRef = useRef(null);

  // Modal State
  const [selectedPost, setSelectedPost] = useState(null);
  const [showPostMenu, setShowPostMenu] = useState(false);

  // Polling
  useEffect(() => {
    fetchPosts();
    const interval = setInterval(fetchPosts, 15000);
    return () => clearInterval(interval);
  }, []);

  const fetchPosts = async () => {
    try {
      const res = await api.get("/posts");
      setPosts(res.data);
      setLoading(false);
    } catch (err) {
      console.error("Failed to fetch posts", err);
      setLoading(false);
    }
  };

  const filteredPosts = posts.filter(
    (post) =>
      post.caption?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.user?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.location?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // --- CREATE POST LOGIC ---
  const handleFileSelect = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      if (selected.size > 5 * 1024 * 1024) {
        alert("File size must be less than 5MB");
        return;
      }
      setFile(selected);
      setPreview(URL.createObjectURL(selected));
    }
  };

  const handleCreatePost = async () => {
    if (!file && !caption) return;
    setUploading(true);

    const formData = new FormData();
    if (file) formData.append("image", file);
    formData.append("caption", caption);
    formData.append("location", location);
    formData.append("user", user?.username || "CosmicExplorer");

    try {
      await api.post("/posts", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      handleCancelCreate();
      fetchPosts();
    } catch (err) {
      console.error("Upload failed", err);
      alert("Failed to post. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleCancelCreate = (e) => {
    if (e) e.stopPropagation();
    setIsCreating(false);
    setFile(null);
    setPreview(null);
    setCaption("");
    setLocation("");
    setShowMap(false);
  };

  // --- ACTION LOGIC ---
  const handleLike = async (post, e) => {
    e?.stopPropagation();
    if (!user) return; // Silent fail if not logged in (or show auth prompt)

    const isLiked = post.likes.includes(user.username);
    const newLikes = isLiked
      ? post.likes.filter((u) => u !== user.username)
      : [...post.likes, user.username];

    const updatedPost = { ...post, likes: newLikes };
    setPosts(posts.map((p) => (p._id === post._id ? updatedPost : p)));
    if (selectedPost && selectedPost._id === post._id)
      setSelectedPost(updatedPost);

    try {
      await api.post(`/posts/${post._id}/like`, {
        userId: user.username,
      });
    } catch (err) {
      console.error("Like failed", err);
      fetchPosts();
    }
  };

  const handleDelete = async (postId, postUser, e) => {
    e?.stopPropagation();
    if (user?.username !== postUser) return;

    if (window.confirm("Are you sure you want to delete this post?")) {
      try {
        setPosts(posts.filter((p) => p._id !== postId));
        if (selectedPost?._id === postId) setSelectedPost(null);

        await api.delete(`/posts/${postId}`, {
          data: { userId: user.username },
        });
      } catch (err) {
        console.error("Delete failed", err);
        alert("Failed to delete post");
        fetchPosts();
      }
    }
  };

  const handleNavigatePost = (direction) => {
    if (!selectedPost) return;
    const currentIndex = filteredPosts.findIndex(
      (p) => p._id === selectedPost._id,
    );
    if (currentIndex === -1) return;

    let newIndex = direction === "next" ? currentIndex + 1 : currentIndex - 1;
    if (newIndex >= filteredPosts.length) newIndex = 0;
    if (newIndex < 0) newIndex = filteredPosts.length - 1;

    setSelectedPost(filteredPosts[newIndex]);
    setShowPostMenu(false);
  };

  // --- COMPONENTS ---
  const UserAvatar = ({ username, size = "md", className = "" }) => {
    let sizeClasses = "w-10 h-10 text-sm";
    if (size === "sm") sizeClasses = "w-8 h-8 text-xs";
    if (size === "lg") sizeClasses = "w-12 h-12 text-base";
    if (size === "xl") sizeClasses = "w-14 h-14 text-lg";

    return (
      <div
        className={`${sizeClasses} rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center font-bold text-white shadow-lg shrink-0 ${className}`}
      >
        {username?.charAt(0).toUpperCase()}
      </div>
    );
  };

  const ActionButton = ({ icon, active, onClick }) => (
    <button
      onClick={onClick}
      className={`p-2 rounded-full transition-all ${active
        ? "bg-[#00d9ff]/20 text-[#00d9ff]"
        : "text-slate-400 hover:bg-white/10 hover:text-white"
        }`}
    >
      {icon}
    </button>
  );

  return (
    <div className="flex h-screen bg-transparent text-slate-300 font-sans overflow-hidden">
      <Sidebar activeTab="Community" />

      <div className="flex-1 flex flex-col min-w-0 relative">
        {/* Header with Search */}
        <header className="h-20 shrink-0 flex items-center justify-between px-6 border-b border-white/5 bg-black/20 backdrop-blur-md sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
                <MdPeople className="text-[#00d9ff]" /> Community
              </h1>
              <p className="text-xs text-slate-500 font-mono mt-1 hidden md:block">
                Explore the cosmos together
              </p>
            </div>

            {/* Mobile Toggle Switches */}
            <div className="flex md:hidden bg-white/5 rounded-lg p-1 ml-4 border border-white/5">
              <button
                onClick={() => setActiveTab('posts')}
                className={`px-3 py-1 rounded text-xs font-bold transition-all ${activeTab === 'posts' ? 'bg-[#00d9ff] text-black shadow-lg' : 'text-slate-400'}`}
              >
                Posts
              </button>
              <button
                onClick={() => setActiveTab('news')}
                className={`px-3 py-1 rounded text-xs font-bold transition-all ${activeTab === 'news' ? 'bg-[#00d9ff] text-black shadow-lg' : 'text-slate-400'}`}
              >
                News
              </button>
            </div>
          </div>

          {/* Search Bar */}
          <div
            className={`flex-1 max-w-xl px-4 transition-all duration-300 ${isSearchOpen ? "absolute inset-x-0 top-0 h-full bg-[#050714] z-20 flex items-center px-4" : "hidden md:flex ml-auto justify-end"}`}
          >
            <div className="relative w-full group max-w-sm">
              <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-[#00d9ff] transition-colors text-lg" />
              <input
                type="text"
                placeholder="Search posts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="cursor-target w-full bg-[#0f1322] border border-white/10 rounded-lg py-2 pl-10 pr-10 md:pr-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#00d9ff]/50 focus:ring-1 focus:ring-[#00d9ff]/50 transition-all"
                autoFocus={isSearchOpen}
              />
              {isSearchOpen && (
                <button
                  onClick={() => setIsSearchOpen(false)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 p-1"
                >
                  <MdClose />
                </button>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 ml-4">
            <button
              onClick={() => setIsSearchOpen(true)}
              className="md:hidden text-slate-400 hover:text-white"
            >
              <MdSearch size={24} />
            </button>

            <div className="h-6 w-px bg-white/10 mx-1 hidden md:block"></div>

            <div onClick={() => navigate("/profile")} className="cursor-pointer hover:opacity-80">
              <UserAvatar username={user?.username || "Guest"} size="sm" />
            </div>
          </div>
        </header>

        {/* MAIN LAYOUT: Split for Desktop / Toggle for Mobile */}
        <div className="flex-1 overflow-hidden grid grid-cols-1 md:grid-cols-3 relative">

          {/* COLUMN 1: POSTS (2/3 Width on Desktop) */}
          <main className={`
                flex-col overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 p-4 md:p-6 md:col-span-2 md:border-r border-white/5
                ${activeTab === 'posts' ? 'flex' : 'hidden md:flex'}
            `}>

            {/* Create Post Section */}
            <div className="w-full flex justify-center mb-8">
              <motion.div
                layout
                transition={{ type: "spring", stiffness: 350, damping: 30 }}
                onClick={() => !isCreating && setIsCreating(true)}
                className={`bg-black/30 backdrop-blur-md border border-white/10 shadow-xl overflow-hidden relative ${isCreating ? "w-full max-w-xl rounded-[24px] cursor-default" : "w-full max-w-lg rounded-full hover:bg-white/5 cursor-pointer"}`}
              >
                <AnimatePresence mode="wait">
                  {!isCreating ? (
                    <motion.div
                      key="collapsed"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center gap-4 p-2 pl-3 h-14"
                    >
                      <UserAvatar username={user?.username || "Guest"} size="sm" />
                      <span className="text-slate-400 text-sm font-medium truncat pr-2">Share your discovery...</span>
                      <motion.div layoutId="action-button" className="ml-auto bg-[#00d9ff] text-black w-10 h-10 rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(0,217,255,0.4)]">
                        <MdAdd size={22} />
                      </motion.div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="expanded"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="p-6"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-3">
                          <UserAvatar username={user?.username || "Guest"} size="md" />
                          <div>
                            <div className="text-white font-bold text-sm">Create Post</div>
                            <div className="text-slate-500 text-xs">Share to the cosmos</div>
                          </div>
                        </div>
                        <button onClick={(e) => { e.stopPropagation(); handleCancelCreate(); }} className="hover:bg-white/10 p-2 rounded-full text-slate-400">
                          <X size={20} />
                        </button>
                      </div>

                      <textarea
                        value={caption}
                        onChange={(e) => setCaption(e.target.value)}
                        placeholder="What's happening?"
                        className="cursor-target w-full bg-transparent text-white text-base placeholder-slate-600 outline-none resize-none min-h-[100px] mb-4"
                        autoFocus
                      />

                      <AnimatePresence>
                        {preview && (
                          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="relative mb-4 rounded-xl overflow-hidden max-h-60 bg-black/50 border border-white/10">
                            <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                            <button onClick={() => { setFile(null); setPreview(null); }} className="absolute top-2 right-2 p-1.5 bg-black/60 rounded-full text-white hover:bg-red-500"><X size={14} /></button>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      <AnimatePresence>
                        {showMap && (
                          <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
                            <LocationSelector location={location} setLocation={setLocation} setShowLocationSelector={setShowMap} />
                          </motion.div>
                        )}
                      </AnimatePresence>

                      <div className="pt-3 border-t border-white/5 flex items-center justify-between">
                        <div className="flex gap-2">
                          <ActionButton icon={<Camera size={18} />} active={!!file} onClick={() => fileInputRef.current.click()} />
                          <ActionButton icon={<MapPin size={18} />} active={showMap || !!location} onClick={() => setShowMap(!showMap)} />
                        </div>
                        <motion.button
                          layoutId="action-button"
                          onClick={handleCreatePost}
                          disabled={(!file && !caption) || uploading}
                          className={`px-6 py-2 rounded-full text-xs font-black transition-all ${(!file && !caption) || uploading ? "bg-slate-800 text-slate-500" : "bg-[#00d9ff] text-black shadow-lg"}`}
                        >
                          {uploading ? "SENDING..." : "POST"}
                        </motion.button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
              <input ref={fileInputRef} type="file" hidden accept="image/*" onChange={handleFileSelect} />
            </div>

            {/* Posts Feed */}
            <div className="mb-4 text-sm text-slate-500 font-medium tracking-wider uppercase ml-1 pb-2 border-b border-white/5 flex justify-between items-center">
              <span>Latest Posts</span>
              <span className="text-xs text-[#00d9ff]">{filteredPosts.length}</span>
            </div>

            {loading ? (
              <div className="flex justify-center py-20"><FaSpinner className="animate-spin text-[#00d9ff] text-3xl" /></div>
            ) : filteredPosts.length === 0 ? (
              <div className="text-center py-20 text-slate-500">No posts found.</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 auto-rows-fr pb-20 md:pb-0">
                {filteredPosts.map((post) => {
                  const isLiked = post.likes.includes(user?.username);
                  return (
                    <div key={post._id} onClick={() => setSelectedPost(post)} className="cursor-pointer group relative bg-black/20 rounded-xl overflow-hidden border border-white/5 aspect-square hover:border-[#00d9ff]/30 transition-all hover:shadow-lg">
                      <img src={post.imageUrl} alt="Post" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                        <p className="text-white text-xs line-clamp-2 mb-2">{post.caption}</p>
                        <div className="flex items-center justify-between text-white/80">
                          <div className="flex items-center gap-1 text-xs"><Heart size={14} className={isLiked ? "fill-pink-500 text-pink-500" : "text-white"} /> {post.likes.length}</div>
                          <div className="text-[10px] text-[#00d9ff]">{post.user}</div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </main>

          {/* COLUMN 2: NEWS (1/3 Width on Desktop) */}
          <aside className={`
                flex-col bg-[#050714]/50 p-4 md:p-6 md:col-span-1 h-full overflow-hidden
                ${activeTab === 'news' ? 'flex' : 'hidden md:flex'}
            `}>
            <NewsFeed />
          </aside>

        </div>


        {/* 3. SPLIT VIEW MODAL (UNCHANGED LOGIC mostly, simplified styling) */}
        {selectedPost && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-0 md:p-8 animate-in fade-in duration-200" onClick={() => setSelectedPost(null)}>
            <button onClick={(e) => { e.stopPropagation(); handleNavigatePost("prev"); }} className="absolute left-4 p-3 rounded-full bg-white/5 text-white hover:bg-white/20 hidden md:block z-50"><MdChevronLeft size={32} /></button>
            <button onClick={(e) => { e.stopPropagation(); handleNavigatePost("next"); }} className="absolute right-4 p-3 rounded-full bg-white/5 text-white hover:bg-white/20 hidden md:block z-50"><MdChevronRight size={32} /></button>

            <div className="bg-[#0f1322] w-full max-w-5xl h-full md:max-h-[85vh] md:rounded-3xl overflow-hidden flex flex-col md:flex-row shadow-2xl border border-white/10" onClick={(e) => e.stopPropagation()}>
              {/* Left: Image */}
              <div className="w-full md:w-[60%] h-[45vh] md:h-auto bg-black flex items-center justify-center relative shrink-0">
                <img src={selectedPost.imageUrl} alt="Full view" className="max-w-full max-h-full object-contain" />
                <button onClick={() => setSelectedPost(null)} className="absolute top-4 left-4 p-2 bg-black/50 rounded-full text-white md:hidden z-50"><MdClose size={24} /></button>
              </div>

              {/* Right: Details */}
              <div className="w-full md:w-[40%] flex flex-col bg-[#0f1322] relative h-full">
                <div className="p-4 border-b border-white/5 flex items-center justify-between shrink-0">
                  <div className="flex items-center gap-3">
                    <UserAvatar username={selectedPost.user} size="md" />
                    <div>
                      <div className="font-bold text-white text-sm">{selectedPost.user}</div>
                      {selectedPost.location && <div className="text-xs text-slate-400 flex items-center gap-0.5"><MdLocationOn size={12} /> {selectedPost.location}</div>}
                    </div>
                  </div>
                  <div className="relative">
                    <button onClick={(e) => { e.stopPropagation(); setShowPostMenu(!showPostMenu); }} className="text-slate-400 hover:text-white p-2 rounded-full hover:bg-white/5"><MdMoreVert size={24} /></button>
                    {showPostMenu && (
                      <div className="absolute right-0 top-full mt-2 w-48 bg-[#1a1f35] rounded-xl shadow-xl border border-white/10 z-20 py-1">
                        {user?.username === selectedPost.user && (
                          <button onClick={(e) => handleDelete(selectedPost._id, selectedPost.user, e)} className="w-full text-left px-4 py-3 text-red-500 text-sm hover:bg-white/5 flex items-center gap-2">
                            <MdDelete /> Delete Post
                          </button>
                        )}
                        <button className="w-full text-left px-4 py-3 text-slate-300 text-sm hover:bg-white/5 flex items-center gap-2"><MdFlag /> Report</button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4">
                  <p className="text-white text-sm leading-relaxed mb-4">{selectedPost.caption}</p>

                  {/* Comments Placeholder */}
                  <div className="text-xs text-slate-500 font-mono text-center py-6 border-t border-white/5">
                    NO TRANSMISSIONS YET
                  </div>
                </div>

                <div className="p-4 border-t border-white/5 bg-[#0a0d16]">
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex gap-4">
                      <button onClick={(e) => handleLike(selectedPost, e)} className={`flex items-center gap-1.5 text-sm font-bold transition-colors ${selectedPost.likes.includes(user?.username) ? "text-pink-500" : "text-slate-300 hover:text-pink-500"}`}>
                        <Heart size={20} className={selectedPost.likes.includes(user?.username) ? "fill-current" : ""} /> {selectedPost.likes.length}
                      </button>
                      <button className="flex items-center gap-1.5 text-sm font-bold text-slate-300 hover:text-[#00d9ff] transition-colors"><MessageCircle size={20} /> 0</button>
                      <button className="flex items-center gap-1.5 text-sm font-bold text-slate-300 hover:text-green-500 transition-colors"><Share2 size={20} /></button>
                    </div>
                    <div className="text-[10px] text-slate-500 uppercase">{selectedPost.createdAt ? formatDistanceToNow(new Date(selectedPost.createdAt)) + " ago" : "Just now"}</div>
                  </div>
                  <div className="relative">
                    <input type="text" placeholder="Be nice..." className="w-full bg-[#151a25] border border-white/10 rounded-full py-2 pl-4 pr-10 text-sm text-white focus:border-[#00d9ff] outline-none" />
                    <button className="absolute right-2 top-1/2 -translate-y-1/2 text-[#00d9ff] hover:text-white p-1"><FaPaperPlane size={14} /></button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default CommunityPage;
