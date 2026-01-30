import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  MdRocketLaunch,
  MdDashboard,
  MdSchool,
  MdSatelliteAlt,
  MdPerson,
  MdLogout,
  MdPeople,
  MdMenu,
  MdClose
} from "react-icons/md";
import Logo from "../assets/Logo.png";

const Sidebar = ({ activeTab = "Dashboard", forceOpen = false }) => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [isOpen, setIsOpen] = React.useState(false);

  // Close sidebar when route changes on mobile
  React.useEffect(() => {
    setIsOpen(false);
  }, [navigate]);

  const NavItem = ({ icon: Icon, label, active, onClick, id, customClasses = "" }) => (
    <div className="px-3 mb-1">
      <button
        id={id}
        onClick={onClick}
        className={`cursor-target w-full flex items-center gap-3 px-4 py-3.5 text-sm font-medium transition-all duration-300 rounded-xl border ${active
          ? "bg-[#00d9ff]/10 border-[#00d9ff]/50 text-[#00d9ff] shadow-[0_0_15px_rgba(0,217,255,0.15)]"
          : customClasses || "border-transparent text-slate-400 hover:text-white hover:bg-white/5 hover:translate-x-1"
          }`}
      >
        <Icon
          className={`text-xl ${active ? "text-[#00d9ff]" : customClasses ? "text-inherit" : "text-slate-400 group-hover:text-white"}`}
        />
        {label}
      </button>
    </div>
  );

  return (
    <>
      {/* Mobile Toggle Button - Visible only on small screens */}
      {!forceOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="md:hidden fixed top-4 left-4 z-50 p-2 bg-[#030508]/80 backdrop-blur-md border border-gray-500/30 rounded-lg text-slate-300 shadow-lg hover:text-[#00d9ff] transition-colors"
        >
          <MdMenu className="text-2xl" />
        </button>
      )}

      {/* Mobile Overlay Backdrop */}
      {(isOpen || forceOpen) && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
          onClick={() => !forceOpen && setIsOpen(false)}
        />
      )}

      <aside
        className={`
          fixed md:relative 
          top-0 left-0 h-full md:h-[calc(100vh-1rem)]
          w-64 
          bg-[#030508]/95 md:bg-[#030508]/90 backdrop-blur-2xl 
          border-r border-gray-500/30 
          md:rounded-r-3xl 
          flex flex-col flex-shrink-0 
          z-50 
          shadow-[5px_0_30px_rgba(0,0,0,0.5)] 
          md:my-2 md:ml-2 
          transition-transform duration-300 ease-in-out
          ${(isOpen || forceOpen) ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
      >

        {/* Mobile Close Button */}
        <button
          onClick={() => setIsOpen(false)}
          className="absolute top-4 right-4 text-slate-400 hover:text-white md:hidden p-1"
        >
          <MdClose className="text-2xl" />
        </button>

        {/* App Logo */}
        <div className="h-48 flex flex-col items-center justify-center p-6 border-b border-gray-500/10 mb-4 relative overflow-hidden">
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

          <div
            className="cursor-target relative group cursor-pointer transition-transform duration-500 hover:scale-105"
            onClick={() => navigate("/")}
          >
            <div className="absolute -inset-8 bg-[#00d9ff]/20 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            <img
              src={Logo}
              alt="SpaceScope"
              className="h-28 w-auto object-contain relative z-10 drop-shadow-[0_0_25px_rgba(0,217,255,0.3)]"
            />
          </div>
        </div>

        {/* Main Menu */}
        <div className="flex-1 overflow-y-auto py-2 custom-scrollbar">
          <div className="px-7 pb-4 text-[11px] font-bold text-gray-500 uppercase tracking-[0.2em]">
            Main Menu
          </div>
          <nav className="space-y-1 mb-6">
            <NavItem
              id="nav-dashboard"
              icon={MdDashboard}
              label="Dashboard"
              active={activeTab === "Dashboard"}
              onClick={() => navigate("/dashboard")}
            />
            <NavItem
              id="nav-missions"
              icon={MdRocketLaunch}
              label="Missions"
              active={activeTab === "Missions"}
              onClick={() => navigate("/missions")}
            />
            <NavItem
              id="nav-learning"
              icon={MdSchool}
              label="Learning Zone"
              active={activeTab === "Learning Zone"}
              onClick={() => navigate("/learning")}
            />
            <NavItem
              id="nav-applications"
              icon={MdSatelliteAlt}
              label="Applications"
              active={activeTab === "Applications"}
              onClick={() => navigate("/applications")}
            />
            <NavItem
              id="nav-community"
              icon={MdPeople}
              label="Community"
              active={activeTab === "Community"}
              onClick={() => navigate("/community")}
            />
          </nav>
        </div>

        {/* Bottom Navigation */}
        <div className="p-4 border-t border-gray-500/10 bg-black/20 md:rounded-br-3xl space-y-1">
          <NavItem
            id="nav-profile"
            icon={MdPerson}
            label="Profile"
            active={activeTab === "Profile"}
            onClick={() => navigate("/profile")}
          />
          <NavItem
            id="nav-logout"
            icon={MdLogout}
            label="Logout"
            active={false}
            onClick={logout}
            customClasses="border-transparent text-red-500/80 hover:text-red-400 hover:bg-red-500/10 hover:translate-x-1"
          />
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
