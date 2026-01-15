import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
    MdRocketLaunch,
    MdDashboard,
    MdSchool,
    MdSatelliteAlt
} from 'react-icons/md';
import Logo from '../assets/Logo.png';

const Sidebar = ({ activeTab = 'Dashboard' }) => {
    const navigate = useNavigate();

    const NavItem = ({ icon: Icon, label, active, onClick }) => (
        <button
            onClick={onClick}
            className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-all duration-200 border-l-2 ${active
                ? 'border-[#00d9ff] text-white bg-gradient-to-r from-[#00d9ff]/10 to-transparent'
                : 'border-transparent text-slate-400 hover:text-white hover:bg-white/5'
                }`}
        >
            <Icon className={`text-xl ${active ? 'text-[#00d9ff]' : 'text-slate-400'}`} />
            {label}
        </button>
    );

    return (
        <aside className="w-64 bg-[#0a0e17] border-r border-white/5 flex flex-col flex-shrink-0 z-20">
            {/* App Logo */}
            <div className="h-40 flex items-center px-4">
                <img src={Logo} alt="Singularity" className="h-20 w-auto object-contain" />
            </div>

            {/* Main Menu */}
            <div className="flex-1 overflow-y-auto py-4 custom-scrollbar">
                <div className="px-6 pb-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Main Menu</div>
                <nav className="space-y-1 mb-6">
                    <NavItem
                        icon={MdDashboard}
                        label="Dashboard"
                        active={activeTab === 'Dashboard'}
                        onClick={() => navigate('/dashboard')}
                    />
                    <NavItem
                        icon={MdRocketLaunch}
                        label="Missions"
                        active={activeTab === 'Missions'}
                        onClick={() => navigate('/missions')}
                    />
                    <NavItem
                        icon={MdSchool}
                        label="Learning Zone"
                        active={activeTab === 'Learning Zone'}
                        onClick={() => navigate('/learning')}
                    />
                    <NavItem
                        icon={MdSatelliteAlt}
                        label="Satellite Showcase"
                        active={activeTab === 'Satellite Showcase'}
                        onClick={() => { }}
                    />
                </nav>
            </div>
        </aside>
    );
};

export default Sidebar;
