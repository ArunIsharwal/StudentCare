import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, User, Loader2, Sparkles, X, RotateCcw } from 'lucide-react';

const Chatbot = () => {
  const [messages, setMessages] = useState([
    { id: 1, type: 'bot', text: "Hello! I'm StudentCar. I can help you with nutrition, exercise, and mental wellness. What's on your mind?" }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return;

    const userMessage = { id: Date.now(), type: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    setTimeout(() => {
      let aiResponseText = "That's an interesting point! To give you the best advice, should we focus on your nutrition or your daily activity levels?";
      const lowerInput = userMessage.text.toLowerCase();

      if (lowerInput.includes("diet") || lowerInput.includes("eat")) {
        aiResponseText = "Focusing on high-fiber foods and lean proteins will keep your energy stable throughout your study sessions. Would you like a meal suggestion?";
      } else if (lowerInput.includes("stress") || lowerInput.includes("tired")) {
        aiResponseText = "I understand. When feeling overwhelmed, try the 4-7-8 breathing technique: Inhale for 4s, hold for 7s, exhale for 8s. It resets your nervous system instantly.";
      }

      setMessages(prev => [...prev, { id: Date.now(), type: 'bot', text: aiResponseText }]);
      setIsTyping(false);
    }, 1500);
  };

  const clearChat = () => {
    setMessages([{ id: 1, type: 'bot', text: "Chat reset. How can I help you now?" }]);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] max-w-3xl mx-auto px-4 py-4">
      
      {/* 1. Header Area */}
      <div className="flex items-center justify-between mb-6 px-2">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-slate-900 dark:bg-white flex items-center justify-center text-white dark:text-slate-900 shadow-lg">
            <Bot size={28} />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight text-slate-900 dark:text-white">StudentCare</h1>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Active Assistant</span>
            </div>
          </div>
        </div>
        <button 
          onClick={clearChat}
          className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all"
          title="Reset Conversation"
        >
          <RotateCcw size={20} />
        </button>
      </div>

      {/* 2. Chat Area */}
      <div className="flex-grow bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none flex flex-col overflow-hidden relative">
        
        <div className="flex-grow overflow-y-auto p-6 space-y-8 scroll-smooth">
          <AnimatePresence initial={false}>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[85%] md:max-w-[75%] p-4 md:p-5 rounded-3xl text-sm md:text-base leading-relaxed shadow-sm ${
                  msg.type === 'user' 
                    ? 'bg-slate-900 text-white rounded-tr-none' 
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-tl-none'
                }`}>
                  {msg.text}
                </div>
              </motion.div>
            ))}
            
            {isTyping && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-3xl rounded-tl-none flex items-center gap-3">
                  <div className="flex gap-1">
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" />
                  </div>
                  <span className="text-xs font-bold text-slate-400 uppercase">StudentCare is typing</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </div>

        {/* 3. Input & Suggestion Area */}
        <div className="p-4 bg-slate-50/50 dark:bg-slate-900/50 backdrop-blur-md border-t border-slate-100 dark:border-slate-800">
          
          <div className="flex gap-2 overflow-x-auto pb-4 px-2 no-scrollbar">
            {["Analyze my diet", "Reduce stress", "Workout plan"].map((prompt) => (
              <button
                key={prompt}
                onClick={() => setInput(prompt)}
                className="shrink-0 px-4 py-2 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-600 dark:text-slate-300 hover:border-blue-500 transition-all shadow-sm"
              >
                <Sparkles size={12} className="inline mr-1.5 text-blue-500" />
                {prompt}
              </button>
            ))}
          </div>

          <form onSubmit={handleSend} className="relative group">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Message StudentCar..."
              className="w-full pl-6 pr-14 py-5 rounded-[2rem] bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-800 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all dark:text-white text-base shadow-inner"
            />
            <button
              type="submit"
              disabled={!input.trim() || isTyping}
              className="absolute right-2 top-2 bottom-2 aspect-square flex items-center justify-center bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-full transition-all active:scale-90 disabled:opacity-20"
            >
              <Send size={18} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Chatbot;