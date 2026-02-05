import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Bot, Sparkles, MessageSquare } from 'lucide-react';
import { API_BASE_URL } from '../config';

const MissionAIPopup = ({ mission, onClose }) => {
    const [messages, setMessages] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);

    // Initial greeting
    useEffect(() => {
        setMessages([
            {
                id: 'init',
                text: `Hello! I'm ready to answer questions about the **${mission.name}** mission.`,
                sender: 'ai',
                timestamp: new Date().toISOString()
            }
        ]);
    }, [mission]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping]);

    const handleSend = async (text = inputValue) => {
        if (!text.trim()) return;

        const newUserMsg = {
            id: Date.now(),
            text: text,
            sender: 'user',
            timestamp: new Date().toISOString()
        };

        setMessages(prev => [...prev, newUserMsg]);
        setInputValue('');
        setIsTyping(true);

        try {
            // Construct context-aware prompt
            // We append hidden context to the user's message so the backend AI knows what we're talking about
            const contextString = `\n\n[System Context: User is viewing the "${mission.name}" mission by ${mission.provider}. Status: ${mission.status}. Launch Date: ${new Date(mission.date).toLocaleDateString()}. Location: ${mission.location}. Description: ${mission.description}. Please answer the user's question specifically in the context of this mission.]`;

            const payloadMessage = text + contextString;

            const response = await fetch(`${API_BASE_URL}/api/ai/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message: payloadMessage }),
            });

            if (!response.ok) throw new Error('Network response was not ok');

            const data = await response.json();

            const newAiMsg = {
                id: Date.now() + 1,
                text: data.response,
                sender: 'ai',
                timestamp: new Date().toISOString()
            };

            setMessages(prev => [...prev, newAiMsg]);

        } catch (error) {
            console.error("Mission AI Error:", error);
            const errorMsg = {
                id: Date.now() + 1,
                text: "I'm having trouble retrieving data for this mission. Please try again.",
                sender: 'ai',
                timestamp: new Date().toISOString()
            };
            setMessages(prev => [...prev, errorMsg]);
        } finally {
            setIsTyping(false);
        }
    };

    const handleFormSubmit = (e) => {
        e.preventDefault();
        handleSend();
    };

    const suggestedQuestions = [
        "Was this mission successful?",
        "What was the main payload?",
        "Tell me about the launch vehicle.",
        "Why is this mission important?"
    ];

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 pointer-events-none"
        >
            {/* Backdrop managed by parent or transparent here to allow clicking outside if needed, 
                but usually we want a modal experience. 
                For this specific request "1 pop up opens... in the popup window itself", 
                we make it a floating window on top of everything. 
            */}

            <div className="pointer-events-auto w-full max-w-md bg-[#0a0e17]/95 backdrop-blur-2xl border border-[#00d9ff]/30 rounded-2xl shadow-[0_0_80px_rgba(0,217,255,0.2)] flex flex-col overflow-hidden max-h-[600px] h-[80vh]">

                {/* Header */}
                <div className="p-4 bg-gradient-to-r from-[#00d9ff]/10 to-transparent border-b border-white/10 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#00d9ff]/20 flex items-center justify-center border border-[#00d9ff]/50">
                            <Bot size={20} className="text-[#00d9ff]" />
                        </div>
                        <div>
                            <h3 className="text-white font-bold text-sm flex items-center gap-2">
                                Mission Intel <Sparkles size={12} className="text-yellow-400" />
                            </h3>
                            <div className="text-[10px] text-slate-400 truncate max-w-[200px]">
                                Focusing on: <span className="text-white">{mission.name}</span>
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Chat Area */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-[#1a2036]">
                    {messages.map((msg) => (
                        <div key={msg.id} className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                            <div
                                className={`max-w-[85%] p-3 rounded-2xl text-sm leading-relaxed ${msg.sender === 'user'
                                    ? 'bg-[#00d9ff] text-black rounded-tr-sm font-bold'
                                    : 'bg-white/10 text-slate-200 border border-white/5 rounded-tl-sm'
                                    }`}
                            >
                                {msg.text.split('**').map((part, i) =>
                                    i % 2 === 1 ? <strong key={i} className="text-white font-black">{part}</strong> : part
                                )}
                            </div>
                        </div>
                    ))}

                    {isTyping && (
                        <div className="flex justify-start">
                            <div className="bg-white/10 border border-white/5 px-4 py-3 rounded-2xl rounded-tl-sm flex items-center gap-1">
                                <span className="w-1.5 h-1.5 bg-[#00d9ff] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                                <span className="w-1.5 h-1.5 bg-[#00d9ff] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                                <span className="w-1.5 h-1.5 bg-[#00d9ff] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                            </div>
                        </div>
                    )}

                    {/* Suggestions (Always show options to prompt user) */}
                    {!isTyping && (
                        <div className="grid grid-cols-1 gap-2 mt-4 pb-2">
                            {suggestedQuestions.map((q, i) => (
                                <button
                                    key={i}
                                    onClick={() => handleSend(q)}
                                    className="text-left text-xs text-[#00d9ff] bg-[#00d9ff]/5 hover:bg-[#00d9ff]/10 border border-[#00d9ff]/20 px-3 py-2 rounded-lg transition-colors flex items-center gap-2 group"
                                >
                                    <MessageSquare size={12} className="opacity-50 group-hover:opacity-100" />
                                    {q}
                                </button>
                            ))}
                        </div>
                    )}

                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <form onSubmit={handleFormSubmit} className="p-4 bg-black/40 border-t border-white/10 shrink-0">
                    <div className="relative flex items-center gap-2">
                        <input
                            type="text"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            placeholder="Ask about this mission..."
                            className="flex-1 bg-[#1a2036] border border-white/10 text-white text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-[#00d9ff]/50 transition-colors placeholder:text-slate-500"
                        />
                        <button
                            type="submit"
                            disabled={!inputValue.trim() || isTyping}
                            className="p-3 bg-[#00d9ff] hover:bg-[#00d9ff]/90 text-black rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Send size={18} />
                        </button>
                    </div>
                </form>

            </div>
        </motion.div>
    );
};

export default MissionAIPopup;
