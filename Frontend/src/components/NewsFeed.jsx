import React, { useMemo } from 'react';
import { MdArticle, MdOpenInNew, MdAccessTime } from 'react-icons/md';
import articlesData from '../data/articles.json';

const NewsFeed = () => {
    // strict filter for category: "News"
    const newsArticles = useMemo(() => {
        return articlesData.filter(article => article.category === 'News');
    }, []);

    if (newsArticles.length === 0) {
        return (
            <div className="text-center py-10 text-slate-500 text-sm">
                No news updates available.
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col">
            <div className="mb-6 text-sm text-[#00d9ff] font-bold tracking-wider uppercase flex items-center gap-2 border-b border-[#00d9ff]/20 pb-3">
                <MdArticle size={18} /> Latest News
            </div>

            <div className="flex-1 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-white/10 space-y-4 pb-20">
                {newsArticles.map((article, index) => {
                    const dateDisplay = article.published_date
                        ? new Date(article.published_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
                        : "Recent";

                    return (
                        <a
                            key={index}
                            href={article.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block group bg-gradient-to-br from-[#0f1322] to-black border border-white/5 hover:border-[#00d9ff]/30 rounded-2xl p-5 transition-all hover:translate-x-1 hover:shadow-lg hover:shadow-[#00d9ff]/5 relative overflow-hidden"
                        >
                            {/* Hover accent */}
                            <div className="absolute top-0 left-0 w-1 h-full bg-[#00d9ff] opacity-0 group-hover:opacity-100 transition-opacity" />

                            <div className="flex justify-between items-start gap-4">
                                <h3 className="text-white font-bold text-base leading-snug group-hover:text-[#00d9ff] transition-colors line-clamp-2">
                                    {article.title}
                                </h3>
                                <div className="p-2 rounded-full bg-white/5 group-hover:bg-[#00d9ff]/20 group-hover:text-[#00d9ff] transition-colors shrink-0">
                                    <MdOpenInNew size={16} />
                                </div>
                            </div>

                            <p className="text-slate-400 text-sm mt-3 line-clamp-3 leading-relaxed opacity-80 group-hover:opacity-100 transition-opacity">
                                {article.preview}
                            </p>

                            <div className="flex items-center justify-between mt-5 pt-4 border-t border-white/5">
                                <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
                                    <div className="w-2 h-2 rounded-full bg-[#00d9ff]" />
                                    {article.source}
                                </div>
                                <div className="flex items-center gap-1.5 text-xs text-slate-500 font-mono bg-white/5 px-2 py-1 rounded-md">
                                    <MdAccessTime size={12} />
                                    {dateDisplay}
                                </div>
                            </div>
                        </a>
                    );
                })}
            </div>
        </div>
    );
};

export default NewsFeed;
