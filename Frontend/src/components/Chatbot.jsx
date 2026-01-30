import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, Bot, Sparkles, User } from 'lucide-react';

import chatbotData from '../data/chatbotData.json';

const Chatbot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [inputValue, setInputValue] = useState('');
    const [messages, setMessages] = useState([
        {
            id: 1,
            text: "Greetings, Explorer! 🚀 I'm Astro, your guide to the cosmos. How can I assist you with SpaceScope today?",
            sender: 'ai',
            timestamp: new Date().toISOString(),
            relatedTopics: ['what_can_you_do', 'explain_ndvi', 'explain_co2']
        }
    ]);
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping, isOpen]);

    const findBestMatch = (text) => {
        const lowerText = text.toLowerCase();

        // 1. Exact ID match (for button clicks)
        const idMatch = chatbotData.find(item => item.id === text);
        if (idMatch) return idMatch;

        // 2. Keyword matching
        // Sort by number of matching keywords to find best specific match
        const matches = chatbotData.map(item => {
            const matchCount = item.keywords.filter(k => lowerText.includes(k.toLowerCase())).length;
            return { item, matchCount };
        }).filter(m => m.matchCount > 0);

        matches.sort((a, b) => b.matchCount - a.matchCount);

        if (matches.length > 0) return matches[0].item;

        return null;
    };

    const getTopicTitle = (id) => {
        const topic = chatbotData.find(t => t.id === id);
        return topic ? topic.keywords[0] : id.replace(/_/g, ' '); // Fallback to ID if not found
    };

    const handleSend = (text = inputValue) => {
        if (!text.trim()) return;

        // If text matches an ID exactly, use the keyword as display text, otherwise use text
        // This is a bit tricky, let's just use the text passed in
        // But if it's an ID click, we want to show a nice label.
        // Let's handle clicks separately or rely on the caller to pass display text.

        // Actually, let's refactor handleSend to take (text, isId = false)
        // But for now, let's just assume standard send.

        const newUserMsg = {
            id: Date.now(),
            text: text,
            sender: 'user',
            timestamp: new Date().toISOString()
        };

        setMessages(prev => [...prev, newUserMsg]);
        setInputValue('');
        setIsTyping(true);

        setTimeout(() => {
            const match = findBestMatch(text);
            let responseText = "That's a fascinating topic! 🌠 While I specialize in SpaceScope's data tools (NDVI, CO2, Debris, etc.), I'm always learning. Try asking me about 'NDVI', 'CO2', or 'Space Junk'!";
            let related = [];

            if (match) {
                responseText = match.response;
                related = match.relatedTopics || [];
            }

            const newAiMsg = {
                id: Date.now() + 1,
                text: responseText,
                sender: 'ai',
                timestamp: new Date().toISOString(),
                relatedTopics: related
            };

            setMessages(prev => [...prev, newAiMsg]);
            setIsTyping(false);
        }, 1000);
    };

    const handleTopicClick = (topicId) => {
        const topic = chatbotData.find(t => t.id === topicId);
        if (topic) {
            // Show the first keyword as the user message for better UX
            handleSend(topic.keywords[0]);
        }
    };

    const handleFormSubmit = (e) => {
        e.preventDefault();
        handleSend();
    };

    return (
        <div className="fixed bottom-6 right-6 z-[9999] font-inter">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute bottom-20 right-0 w-[350px] md:w-[400px] h-[600px] bg-[#0a0e17]/90 backdrop-blur-xl border border-[#00ff88]/30 rounded-2xl shadow-[0_0_50px_rgba(0,255,136,0.15)] flex flex-col overflow-hidden"
                    >
                        {/* Header */}
                        <div className="p-4 bg-gradient-to-r from-[#00ff88]/10 to-transparent border-b border-white/5 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-[#00ff88]/20 flex items-center justify-center border border-[#00ff88]/50">
                                    <Bot size={18} className="text-[#00ff88]" />
                                </div>
                                <div>
                                    <h3 className="text-white font-bold text-sm flex items-center gap-2">
                                        Astro Guide <Sparkles size={12} className="text-yellow-400" />
                                    </h3>
                                    <div className="text-[10px] text-slate-400 flex items-center gap-1">
                                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                                        Online
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="cursor-target text-slate-400 hover:text-white transition-colors"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* Messages Body */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
                            {messages.map((msg) => (
                                <div
                                    key={msg.id}
                                    className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                                >
                                    <div
                                        className={`max-w-[85%] p-3.5 rounded-2xl text-sm leading-relaxed shadow-lg ${msg.sender === 'user'
                                            ? 'bg-[#00ff88] text-black rounded-tr-sm font-medium'
                                            : 'bg-[#151a25] text-slate-200 border border-white/10 rounded-tl-sm'
                                            }`}
                                    >
                                        {/* Render text with basic markdown-like bolding */}
                                        {msg.text.split('**').map((part, i) =>
                                            i % 2 === 1 ? <strong key={i} className="font-bold">{part}</strong> : part
                                        )}
                                    </div>

                                    {/* Related Topics Buttons */}
                                    {msg.sender === 'ai' && msg.relatedTopics && msg.relatedTopics.length > 0 && (
                                        <div className="mt-2 flex flex-wrap gap-2 max-w-[90%]">
                                            {msg.relatedTopics.map(topicId => (
                                                <button
                                                    key={topicId}
                                                    onClick={() => handleTopicClick(topicId)}
                                                    className="cursor-target text-xs bg-[#00ff88]/10 hover:bg-[#00ff88]/20 text-[#00ff88] border border-[#00ff88]/30 px-3 py-1.5 rounded-full transition-colors font-medium"
                                                >
                                                    {getTopicTitle(topicId)} ↗
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}

                            {isTyping && (
                                <div className="flex justify-start">
                                    <div className="bg-[#151a25] border border-white/10 px-4 py-3 rounded-2xl rounded-tl-sm flex items-center gap-1">
                                        <span className="w-1.5 h-1.5 bg-[#00ff88] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                                        <span className="w-1.5 h-1.5 bg-[#00ff88] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                                        <span className="w-1.5 h-1.5 bg-[#00ff88] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Footer */}
                        <form onSubmit={handleFormSubmit} className="p-3 border-t border-white/10 bg-[#0a0e17]/50">
                            <div className="relative flex items-center gap-2">
                                <input
                                    type="text"
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    placeholder="Ask Astro about space..."
                                    className="cursor-target flex-1 bg-[#151a25] border border-white/10 text-white text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-[#00ff88]/50 transition-colors placeholder:text-slate-500"
                                />
                                <button
                                    type="submit"
                                    disabled={!inputValue.trim()}
                                    className="cursor-target p-3 bg-[#00ff88] hover:bg-[#00ff88]/90 text-black rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <Send size={18} />
                                </button>
                            </div>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsOpen(!isOpen)}
                className={`cursor-target w-14 h-14 rounded-full shadow-[0_0_30px_rgba(0,255,136,0.3)] flex items-center justify-center transition-colors border border-[#00ff88]/50 ${isOpen ? 'bg-[#151a25] text-white' : 'bg-[#00ff88] text-black'
                    }`}
            >
                {isOpen ? (
                    <X size={24} />
                ) : (
                    <MessageSquare size={24} fill="currentColor" />
                )}
            </motion.button>
        </div>
    );
};

export default Chatbot;
