import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { useAuth } from "../../Context/AuthContext";
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
import axios from "axios";
import { formatDistanceToNow, format } from "date-fns";

import { motion, AnimatePresence } from "framer-motion";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMapEvents,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix Leaflet default icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// Map Updater Component - Handles programmatic map moves
const MapUpdater = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.flyTo(center, 13, {
        animate: true,
        duration: 1.5,
      });
    }
  }, [center, map]);
  return null;
};

// Auto Locator Component - Finds user location on mount
const AutoLocator = ({ setLocation, setMapCenter }) => {
  const map = useMap();
  useEffect(() => {
    map.locate().on("locationfound", function (e) {
      setMapCenter([e.latlng.lat, e.latlng.lng]);
      map.flyTo(e.latlng, map.getZoom());
      fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${e.latlng.lat}&lon=${e.latlng.lng}`,
      )
        .then((res) => res.json())
        .then((data) => {
          const address =
            data.address.city || data.address.town || "My Location";
          setLocation(`${address}, ${data.address.country}`);
        });
    });
  }, [map]);
  return null;
};

const LocationPicker = ({ setLocation }) => {
  const [position, setPosition] = useState(null);
  const map = useMapEvents({
    click: async (e) => {
      const { lat, lng } = e.latlng;
      setPosition(e.latlng);
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`,
        );
        const data = await response.json();
        const address =
          data.address.city ||
          data.address.town ||
          data.address.village ||
          data.address.county ||
          "Unknown Location";
        setLocation(`${address}, ${data.address.country || ""}`);
      } catch (error) {
        console.error("Error fetching location:", error);
        setLocation(`${lat.toFixed(4)}, ${lng.toFixed(4)}`);
      }
    },
  });

  return position === null ? null : (
    <Marker position={position}>
      <Popup>Selected Location</Popup>
    </Marker>
  );
};

const PostMapPicker = ({ setLocation }) => {
  const [mapCenter, setMapCenter] = useState(null);
  const [mapSearchQuery, setMapSearchQuery] = useState("");
  const [mapLoading, setMapLoading] = useState(false);

  return (
    <div className="relative h-full w-full">
      {/* Search Bar Overlay */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1001] w-full max-w-sm px-4">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={mapSearchQuery}
              onChange={(e) => setMapSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  e.stopPropagation();
                  if (!mapSearchQuery.trim()) return;
                  setMapLoading(true);

                  // Check if input is coordinates
                  const coordRegex = /^(-?\d+(\.\d+)?),\s*(-?\d+(\.\d+)?)$/;
                  const match = mapSearchQuery.match(coordRegex);

                  if (match) {
                    const lat = parseFloat(match[1]);
                    const lon = parseFloat(match[3]);
                    setMapCenter([lat, lon]);
                    setMapLoading(false);
                  } else {
                    // Search by name
                    axios
                      .get(`https://nominatim.openstreetmap.org/search`, {
                        params: { q: mapSearchQuery, format: "json", limit: 1 },
                      })
                      .then((response) => {
                        if (response.data && response.data.length > 0) {
                          const { lat, lon } = response.data[0];
                          setMapCenter([parseFloat(lat), parseFloat(lon)]);
                        } else {
                          alert("Location not found");
                        }
                      })
                      .catch((err) => {
                        console.error("Search failed", err);
                      })
                      .finally(() => setMapLoading(false));
                  }
                }
              }}
              placeholder="Search city or coordinates..."
              className="w-full bg-[#0a0e17]/90 backdrop-blur-md border border-white/20 text-white rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:border-[#00ff88] transition-colors shadow-lg placeholder:text-slate-500 text-sm"
            />
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
          </div>
        </div>
      </div>

      {/* Map Loading State */}
      {mapLoading && (
        <div className="absolute inset-0 z-[1000] bg-[#0a0e17]/80 backdrop-blur-sm flex items-center justify-center">
          <div className="flex flex-col items-center gap-3 text-[#00ff88]">
            <Loader2 className="animate-spin h-8 w-8" />
            <span className="text-sm font-mono tracking-wider">
              LOCATING...
            </span>
          </div>
        </div>
      )}

      <MapContainer
        center={mapCenter || [51.505, -0.09]}
        zoom={13}
        style={{ height: "100%", width: "100%" }}
        zoomControl={false}
      >
        <AutoLocator setLocation={setLocation} setMapCenter={setMapCenter} />
        <MapUpdater center={mapCenter} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <LocationPicker setLocation={setLocation} />
        <div
          style={{
            position: "absolute",
            top: 10,
            right: 10,
            zIndex: 1000,
          }}
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigator.geolocation.getCurrentPosition((pos) => {
                const { latitude, longitude } = pos.coords;
                setMapCenter([latitude, longitude]);
                fetch(
                  `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`,
                )
                  .then((res) => res.json())
                  .then((data) => {
                    const address =
                      data.address.city || data.address.town || "My Location";
                    setLocation(`${address}, ${data.address.country}`);
                  });
              });
            }}
            className="bg-white/90 text-black px-3 py-1 rounded text-xs font-bold shadow-md hover:bg-white"
          >
            Find Me
          </button>
        </div>
      </MapContainer>
    </div>
  );
};

const CommunityPage = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false); // Mobile search toggle

  // Create Post State
  const [isCreating, setIsCreating] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [caption, setCaption] = useState("");

  const [location, setLocation] = useState("");

  // Map State
  const [showMap, setShowMap] = useState(false);

  const fileInputRef = useRef(null);

  // Modal State
  const [selectedPost, setSelectedPost] = useState(null);
  const [showPostMenu, setShowPostMenu] = useState(false);
  const [commentText, setCommentText] = useState("");

  // Polling
  useEffect(() => {
    fetchPosts();
    const interval = setInterval(fetchPosts, 15000);
    return () => clearInterval(interval);
  }, []);

  const fetchPosts = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/posts");
      setPosts(res.data);
      setLoading(false);
    } catch (err) {
      console.error("Failed to fetch posts", err);
      setLoading(false);
    }
  };

  // Derived State for Search
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
      await axios.post("http://localhost:5000/api/posts", formData, {
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
    if (!user) return;

    const isLiked = post.likes.includes(user.username);
    const newLikes = isLiked
      ? post.likes.filter((u) => u !== user.username)
      : [...post.likes, user.username];

    const updatedPost = { ...post, likes: newLikes };
    setPosts(posts.map((p) => (p._id === post._id ? updatedPost : p)));
    if (selectedPost && selectedPost._id === post._id)
      setSelectedPost(updatedPost);

    try {
      await axios.post(`http://localhost:5000/api/posts/${post._id}/like`, {
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

        await axios.delete(`http://localhost:5000/api/posts/${postId}`, {
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
      className={`p-2 rounded-full transition-all ${
        active
          ? "bg-[#00d9ff]/20 text-[#00d9ff]"
          : "text-slate-400 hover:bg-white/10 hover:text-white"
      }`}
    >
      {icon}
    </button>
  );

  return (
    <div className="flex h-screen bg-[#050714] text-slate-300 font-sans overflow-hidden">
      <Sidebar activeTab="Community" />

      <div className="flex-1 flex flex-col min-w-0 relative">
        {/* Header with Search - MATCHING DASHBOARD STYLE */}
        <header className="h-20 flex items-center justify-between px-6 border-b border-white/5 bg-black/20 backdrop-blur-md sticky top-0 z-10">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
              <MdPeople className="text-[#00d9ff]" /> Community
            </h1>
            <p className="text-xs text-slate-500 font-mono mt-1">
              Explore the cosmos together
            </p>
          </div>

          {/* Search Bar - Responsive */}
          <div
            className={`flex-1 max-w-2xl px-4 transition-all duration-300 ${isSearchOpen ? "absolute inset-x-0 top-0 h-full bg-[#050714] z-20 flex items-center px-4" : "hidden md:block"}`}
          >
            <div className="relative w-full group">
              <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-[#00d9ff] transition-colors text-lg" />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#0f1322] border border-white/10 rounded-lg py-2 pl-10 pr-10 md:pr-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#00d9ff]/50 focus:ring-1 focus:ring-[#00d9ff]/50 transition-all"
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

          {/* Right Side Actions */}
          <div className="flex items-center gap-3 md:gap-4 ml-2">
            {/* Mobile Search Toggle */}
            <button
              onClick={() => setIsSearchOpen(true)}
              className="md:hidden text-slate-400 hover:text-white p-2"
            >
              <MdSearch size={24} />
            </button>

            <button className="relative text-slate-400 hover:text-white transition-colors">
              <MdNotifications className="text-xl" />
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-red-500 rounded-full border border-[#080b14]"></span>
            </button>

            <div className="h-6 w-px bg-white/10 mx-1 hidden md:block"></div>

            <div
              className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => navigate("/profile")}
            >
              <div className="text-right hidden lg:block">
                {user ? (
                  <>
                    <div className="text-sm font-bold text-white leading-none mb-1">
                      {user.fullName || user.username}
                    </div>
                    <div className="text-[10px] text-[#00d9ff] font-medium">
                      @{user.username}
                    </div>
                  </>
                ) : (
                  <div className="text-sm text-white">Guest</div>
                )}
              </div>
              <UserAvatar username={user?.username || "Guest"} size="sm" />
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 p-4 md:p-6">
          <div className="max-w-7xl mx-auto w-full">
            <div className="mb-8 w-full flex justify-center">
              <motion.div
                layout
                transition={{
                  type: "spring",
                  stiffness: 350,
                  damping: 30,
                  mass: 1,
                }}
                onClick={() => !isCreating && setIsCreating(true)}
                className={`
          bg-[#0f1322] border border-white/10 shadow-2xl overflow-hidden relative
          ${
            isCreating
              ? "w-full max-w-2xl rounded-[24px] cursor-default"
              : "w-full max-w-xl rounded-full hover:bg-white/5 cursor-pointer"
          }
        `}
              >
                <AnimatePresence mode="wait">
                  {!isCreating ? (
                    /* --- COLLAPSED STATE --- */
                    <motion.div
                      key="collapsed"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0, transition: { duration: 0.1 } }}
                      className="flex items-center gap-4 p-2 pl-3 h-14"
                    >
                      <UserAvatar
                        username={user?.username || "Guest"}
                        size="sm"
                      />
                      <span className="text-slate-400 text-sm font-medium">
                        What's happening in the cosmos?
                      </span>
                      <motion.div
                        layoutId="action-button"
                        className="ml-auto bg-[#00d9ff] text-black w-10 h-10 rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(0,217,255,0.4)]"
                      >
                        <MdAdd size={22} />
                      </motion.div>
                    </motion.div>
                  ) : (
                    /* --- EXPANDED STATE --- */
                    <motion.div
                      key="expanded"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="p-6"
                    >
                      {/* Header */}
                      <div className="flex justify-between items-start mb-6">
                        <div className="flex items-center gap-3">
                          <UserAvatar
                            username={user?.username || "Guest"}
                            size="md"
                          />
                          <div>
                            <div className="text-white font-bold text-sm tracking-tight">
                              Create Post
                            </div>
                            <div className="text-slate-500 text-xs">
                              Share your cosmic discovery
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCancelCreate();
                          }}
                          className="hover:bg-white/10 p-2 rounded-full text-slate-400 transition-colors"
                        >
                          <X size={20} />
                        </button>
                      </div>

                      {/* Input Area */}
                      <textarea
                        value={caption}
                        onChange={(e) => setCaption(e.target.value)}
                        placeholder="What's happening in the cosmos?"
                        className="w-full bg-transparent text-white text-lg placeholder-slate-600 outline-none resize-none min-h-[120px] mb-4"
                        autoFocus
                      />

                      {/* Image Preview */}
                      <AnimatePresence>
                        {preview && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="relative mb-4 rounded-2xl overflow-hidden max-h-80 bg-black/50 border border-white/10"
                          >
                            <img
                              src={preview}
                              alt="Preview"
                              className="w-full h-full object-cover"
                            />
                            <button
                              onClick={() => {
                                setFile(null);
                                setPreview(null);
                              }}
                              className="absolute top-3 right-3 p-2 bg-black/60 backdrop-blur-md rounded-full text-white hover:bg-red-500 transition-colors"
                            >
                              <X size={16} />
                            </button>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* Map Picker */}
                      <AnimatePresence>
                        {showMap && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 400 }}
                            exit={{ opacity: 0, height: 0 }}
                            className="relative mb-4 rounded-xl overflow-hidden border border-white/10"
                          >
                            <PostMapPicker setLocation={setLocation} />
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* Footer Actions */}
                      <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                        <div className="flex gap-2">
                          <ActionButton
                            icon={<Camera size={20} />}
                            active={!!file}
                            onClick={() => fileInputRef.current.click()}
                          />
                          <div className="relative group">
                            <ActionButton
                              icon={<MapPin size={20} />}
                              active={showMap || !!location}
                              onClick={() => setShowMap(!showMap)}
                            />
                            {/* Location Tooltip/Input could go here */}
                          </div>
                        </div>

                        <motion.button
                          layoutId="action-button"
                          onClick={handleCreatePost}
                          disabled={(!file && !caption) || uploading}
                          className={`
                    px-8 py-2.5 rounded-full text-sm font-black transition-all
                    ${
                      (!file && !caption) || uploading
                        ? "bg-slate-800 text-slate-500 cursor-not-allowed"
                        : "bg-[#00d9ff] text-black hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(0,217,255,0.4)]"
                    }
                  `}
                        >
                          {uploading ? "TRANSMITTING..." : "POST"}
                        </motion.button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>

              <input
                ref={fileInputRef}
                type="file"
                hidden
                accept="image/*"
                onChange={handleFileSelect}
              />
            </div>

            {/* 2. POSTS GRID */}
            <div className="mb-4 text-sm text-slate-500 font-medium tracking-wider uppercase ml-1 border-b border-white/5 pb-2">
              Community Posts
            </div>

            {loading ? (
              <div className="flex justify-center py-20">
                <FaSpinner className="animate-spin text-[#00d9ff] text-4xl" />
              </div>
            ) : filteredPosts.length === 0 ? (
              <div className="text-center py-20 text-slate-500">
                <p className="text-xl">No posts found</p>
                <p className="text-sm mt-2">Be the first to share something!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 auto-rows-fr">
                {filteredPosts.map((post) => {
                  const isLiked = post.likes.includes(user?.username);
                  return (
                    <div
                      key={post._id}
                      onClick={() => setSelectedPost(post)}
                      className="group relative bg-[#0f1322] rounded-2xl overflow-hidden border border-white/5 aspect-square cursor-pointer hover:border-[#00d9ff]/30 transition-all duration-300 hover:shadow-2xl hover:shadow-[#00d9ff]/10"
                    >
                      <img
                        src={post.imageUrl}
                        alt="Post"
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />

                      {/* Hover Overlay */}
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                        <div className="flex items-center gap-2 mb-2">
                          <UserAvatar username={post.user} size="sm" />
                          <span className="text-white font-semibold text-sm drop-shadow-md">
                            {post.user}
                          </span>
                        </div>
                        <p className="text-white/90 text-sm line-clamp-2 mb-4 drop-shadow-md">
                          {post.caption}
                        </p>

                        <div className="flex items-center justify-between text-white border-t border-white/20 pt-4">
                          <div className="flex gap-4">
                            <div className="flex items-center gap-1.5">
                              <Heart
                                size={18}
                                className={
                                  isLiked
                                    ? "fill-pink-500 text-pink-500"
                                    : "text-white"
                                }
                              />
                              <span className="text-xs font-bold">
                                {post.likes.length}
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <MessageCircle size={18} />
                              <span className="text-xs font-bold">0</span>
                            </div>
                          </div>

                          {/* Location Badge */}
                          {post.location && (
                            <div className="flex items-center gap-1 text-[#00d9ff] max-w-[120px] ml-auto mr-4">
                              <MapPin size={14} className="shrink-0" />
                              <span className="text-[10px] truncate font-medium">
                                {post.location}
                              </span>
                            </div>
                          )}

                          <Share2
                            size={18}
                            className="hover:text-[#00d9ff] transition-colors"
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </main>

        {/* 3. SPLIT VIEW MODAL */}
        {selectedPost && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-0 md:p-8 animate-in fade-in duration-200"
            onClick={() => setSelectedPost(null)}
          >
            {/* Navigation Arrows */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleNavigatePost("prev");
              }}
              className="absolute left-4 p-3 rounded-full bg-white/5 text-white hover:bg-white/20 transition-colors hidden md:block z-50"
            >
              <MdChevronLeft size={32} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleNavigatePost("next");
              }}
              className="absolute right-4 p-3 rounded-full bg-white/5 text-white hover:bg-white/20 transition-colors hidden md:block z-50"
            >
              <MdChevronRight size={32} />
            </button>

            <div
              className="bg-[#0f1322] w-full max-w-6xl h-full md:max-h-[85vh] md:rounded-3xl overflow-hidden flex flex-col md:flex-row shadow-2xl border border-white/10"
              onClick={(e) => {
                e.stopPropagation();
                setShowPostMenu(false);
              }}
            >
              {/* Left: Image */}
              <div className="w-full md:w-[60%] h-[40vh] md:h-auto bg-black flex items-center justify-center relative shrink-0">
                <img
                  src={selectedPost.imageUrl}
                  alt="Full view"
                  className="max-w-full max-h-full object-contain"
                />

                <button
                  onClick={() => setSelectedPost(null)}
                  className="absolute top-4 left-4 p-2 bg-black/50 rounded-full text-white hover:bg-white/20 md:hidden z-50"
                >
                  <MdClose size={24} />
                </button>
              </div>

              {/* Right: Details */}
              <div className="w-full md:w-[40%] flex flex-col bg-[#0f1322] relative h-full">
                {/* Header */}
                <div className="p-4 border-b border-white/5 flex items-center justify-between shrink-0">
                  <div className="flex items-center gap-3">
                    <UserAvatar username={selectedPost.user} size="md" />
                    <div>
                      <div className="font-bold text-white leading-tight">
                        {selectedPost.user}
                      </div>
                      {selectedPost.location && (
                        <div className="text-xs text-slate-400 flex items-center gap-0.5 mt-0.5">
                          <MdLocationOn size={12} />
                          {selectedPost.location}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="relative">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowPostMenu(!showPostMenu);
                      }}
                      className="text-slate-400 hover:text-white p-2 rounded-full hover:bg-white/5"
                    >
                      <MdMoreVert size={24} />
                    </button>

                    {/* Dropdown Menu - PERMISSIONS UPDATE */}
                    {showPostMenu && (
                      <div className="absolute right-0 top-full mt-2 w-48 bg-[#1a1f35] rounded-xl shadow-xl border border-white/10 overflow-hidden z-20 py-1">
                        {user?.username === selectedPost.user && (
                          <>
                            <button
                              onClick={(e) =>
                                handleDelete(
                                  selectedPost._id,
                                  selectedPost.user,
                                  e,
                                )
                              }
                              className="w-full text-left px-4 py-3 text-red-500 text-sm hover:bg-white/5 flex items-center gap-2"
                            >
                              <MdDelete size={16} /> Delete Post
                            </button>
                            <button className="w-full text-left px-4 py-3 text-slate-300 text-sm hover:bg-white/5 flex items-center gap-2">
                              <MdArchive size={16} /> Archive
                            </button>
                          </>
                        )}

                        <button className="w-full text-left px-4 py-3 text-slate-300 text-sm hover:bg-white/5 flex items-center gap-2">
                          <MdBlock size={16} /> Block User
                        </button>
                        <button className="w-full text-left px-4 py-3 text-red-400 text-sm hover:bg-white/5 flex items-center gap-2 border-t border-white/5">
                          <MdFlag size={16} /> Report
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Scrollable Comment Section */}
                <div className="flex-1 overflow-y-auto p-4 scrollbar-thin scrollbar-thumb-white/10">
                  <div className="flex gap-3 mb-6">
                    <UserAvatar
                      username={selectedPost.user}
                      size="sm"
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <p className="text-sm text-white/90 whitespace-pre-wrap leading-relaxed">
                        <span className="font-bold text-white mr-2">
                          {selectedPost.user}
                        </span>
                        {selectedPost.caption}
                      </p>
                      <div className="text-xs text-slate-500 mt-2">
                        {formatDistanceToNow(new Date(selectedPost.createdAt), {
                          addSuffix: true,
                        })}
                      </div>
                    </div>
                  </div>

                  <div className="h-px bg-white/5 mb-6"></div>

                  <div className="flex flex-col gap-6 opacity-60 hover:opacity-100 transition-opacity">
                    <div className="flex gap-3">
                      <UserAvatar
                        username="NebulaWalker"
                        size="sm"
                        className="mt-1 bg-gradient-to-tr from-green-500 to-teal-500"
                      />
                      <div>
                        <p className="text-sm text-white/80">
                          <span className="font-bold text-white mr-2">
                            NebulaWalker
                          </span>
                          Stunning view! 🌌
                        </p>
                        <div className="flex items-center gap-4 mt-1 text-xs text-slate-500">
                          <span>2h</span>
                          <span className="cursor-pointer hover:text-white">
                            Reply
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="p-4 border-t border-white/5 bg-[#0f1322]">
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex gap-4">
                      <button
                        onClick={(e) => handleLike(selectedPost, e)}
                        className="hover:opacity-75 transition-opacity"
                      >
                        {selectedPost.likes.includes(user?.username) ? (
                          <MdFavorite size={28} className="text-pink-500" />
                        ) : (
                          <MdFavoriteBorder size={28} className="text-white" />
                        )}
                      </button>
                      <button className="hover:opacity-75 transition-opacity text-white">
                        <MessageCircle size={28} />
                      </button>
                      <button className="hover:opacity-75 transition-opacity text-white">
                        <Share2 size={28} />
                      </button>
                    </div>
                    <button className="hover:opacity-75 transition-opacity text-white">
                      <MdArchive size={28} />
                    </button>
                  </div>

                  <div className="mb-4">
                    <div className="font-bold text-white text-sm">
                      {selectedPost.likes.length} likes
                    </div>
                    <div className="text-[10px] text-slate-500 uppercase mt-1">
                      {format(
                        new Date(selectedPost.createdAt),
                        "MMMM d, yyyy",
                      ).toUpperCase()}
                    </div>
                  </div>

                  {/* Comment Input */}
                  <div className="flex items-center gap-3">
                    <div className="relative flex-1">
                      <input
                        type="text"
                        placeholder="Add a comment..."
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        className="w-full bg-transparent text-sm text-white placeholder-slate-500 outline-none"
                      />
                    </div>
                    <button
                      disabled={!commentText.trim()}
                      className={`font-semibold text-sm ${commentText.trim() ? "text-[#00d9ff] hover:text-white" : "text-[#00d9ff]/30 cursor-default"}`}
                    >
                      Post
                    </button>
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
