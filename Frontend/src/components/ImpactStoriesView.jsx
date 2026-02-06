import React from 'react';
import { ChevronLeft, Calendar, MapPin, ExternalLink, Info } from 'lucide-react';
import impactStoriesData from '../data/ImpactStories.json';

// --- IMPACT STORIES COMPONENT ---
const ImpactStoriesView = ({ activeChannel, onBack }) => {
    // Map activeChannel to feature key if needed, or pass feature key directly
    // For ApplicationsPage, it passes 'ndvi', 'co2' etc. which need mapping.
    // For specialized pages (Aurora, ISS), we might want to pass the exact feature key 'aurora_tracker' or 'iss_tracker'.

    // Helper to map channel IDs to feature keys (reused from ApplicationsPage default mapping, but extended)
    const CHANNEL_TO_FEATURE = {
        ndvi: 'ndvi_map',
        co2: 'co2_chart',
        temp: 'temperature_chart',
        light: 'light_pollution_map',
        weather: 'cloud_cover_map',
        debris: 'orbital_debris_map',
        // Direct mappings for new pages
        aurora: 'aurora_tracker',
        iss: 'iss_tracker'
    };

    const featureKey = CHANNEL_TO_FEATURE[activeChannel] || activeChannel;

    const stories = impactStoriesData.filter(s => s.feature === featureKey);

    return (
        <div className="w-full h-full flex flex-col bg-[#0a0e17] text-white p-4 md:p-6 overflow-y-auto z-[2000] relative rounded-3xl">
            {/* Header */}
            <div className="flex items-center gap-4 mb-6 pt-2">
                <button
                    onClick={onBack}
                    className="flex items-center gap-2 px-4 py-2 bg-[#151a25] border border-white/10 rounded-lg hover:border-[#00ff88] hover:text-[#00ff88] transition-all group"
                >
                    <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                    <span className="font-bold text-sm uppercase tracking-wider">Back to Map</span>
                </button>
                <div>
                    <h2 className="text-2xl font-black uppercase tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400">
                        Impact Stories
                    </h2>
                    <p className="text-xs text-slate-400">Real-world applications and events</p>
                </div>
            </div>

            {/* Stories Grid */}
            {stories.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-8">
                    {stories.map(story => (
                        <div key={story.id} className="bg-[#151a25] border border-white/10 rounded-xl overflow-hidden hover:border-[#00ff88]/50 transition-all hover:shadow-[0_0_20px_rgba(0,255,136,0.1)] group flex flex-col">
                            {/* Image Section - No detailed text overlay anymore */}
                            <div className="relative h-48 md:h-56 overflow-hidden">
                                <img
                                    src={story.image_url}
                                    alt={story.title}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                />
                                <div className="absolute top-3 right-3">
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border backdrop-blur-md shadow-lg ${story.impact_type === 'positive'
                                        ? 'bg-green-500/20 border-green-500 text-green-400'
                                        : 'bg-red-500/20 border-red-500 text-red-400'
                                        }`}>
                                        {story.impact_type}
                                    </span>
                                </div>
                            </div>

                            {/* Content Section - All text here for maximum visibility */}
                            <div className="p-5 flex flex-col flex-1">
                                {/* Title */}
                                <h3 className="text-xl font-bold text-white mb-2 leading-tight group-hover:text-[#00ff88] transition-colors">
                                    {story.title}
                                </h3>

                                {/* Metadata Row */}
                                <div className="flex items-center gap-3 text-xs text-slate-400 uppercase tracking-widest font-bold mb-4">
                                    <div className="flex items-center gap-1">
                                        <Calendar size={12} className="text-[#00ff88]" />
                                        {story.date}
                                    </div>
                                    <span className="text-slate-700">|</span>
                                    <div className="flex items-center gap-1">
                                        <MapPin size={12} className="text-[#00ff88]" />
                                        {story.location.name}
                                    </div>
                                </div>

                                {/* Story Text */}
                                <div className="text-sm text-slate-300 leading-relaxed mb-6 flex-1 whitespace-pre-wrap">
                                    {story.story}
                                </div>

                                {/* Footer */}
                                <div className="flex items-center justify-between pt-4 border-t border-white/5 mt-auto">
                                    <div className="flex gap-2 flex-wrap">
                                        {story.tags.slice(0, 2).map(tag => (
                                            <span key={tag} className="text-[10px] text-slate-500 bg-black/30 px-2 py-1 rounded border border-white/5">
                                                #{tag}
                                            </span>
                                        ))}
                                    </div>
                                    <a
                                        href={story.source_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-[#00ff88] text-xs font-bold uppercase tracking-wider flex items-center gap-1 hover:underline ml-2"
                                    >
                                        Read Source <ExternalLink size={12} />
                                    </a>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center h-64 text-slate-500">
                    <Info size={48} className="mb-4 opacity-50" />
                    <p>No stories found for this category yet.</p>
                </div>
            )}
        </div>
    );
};

export default ImpactStoriesView;
