import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, User, Loader2, Sparkles } from 'lucide-react';

const Chatbot = () => {
  const [messages, setMessages] = useState([
    { id: 1, type: 'bot', text: "Hi there! I'm VitalityAI, your personal health companion. You can ask me about your diet, workouts, or stress management." }
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
    if (!input.trim()) return;

    const userMessage = { id: Date.now(), type: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      let aiResponseText = "That's a great question! Based on your health data, I'd recommend ensuring you stay hydrated and keep a balanced diet.";
      
      const lowerInput = userMessage.text.toLowerCase();
      if (lowerInput.includes("healthy") && lowerInput.includes("diet")) {
        aiResponseText = "Your current diet is looking good, but you could increase your protein intake based on your recent activity levels.";
      } else if (lowerInput.includes("eat")) {
        aiResponseText = "A grilled chicken salad or a quinoa bowl would be perfect for your nutritional goals right now.";
      } else if (lowerInput.includes("stress")) {
        aiResponseText = "Take a deep breath. Try the 4-7-8 breathing technique: inhale for 4 seconds, hold for 7, and exhale for 8. Let's do a 5-minute meditation later.";
      }

      setMessages(prev => [...prev, { id: Date.now(), type: 'bot', text: aiResponseText }]);
      setIsTyping(false);
    }, 1500);
  };

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-140px)] flex flex-col">
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2 flex items-center justify-center gap-3">
          <Bot className="text-primary-500" size={32} />
          VitalityAI Assistant
        </h1>
        <p className="text-slate-600 dark:text-slate-400">Ask any health, diet, or wellness questions.</p>
      </div>

      <div className="flex-grow glass-panel rounded-3xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden shadow-2xl">
        {/* Chat Area */}
        <div className="flex-grow overflow-y-auto p-6 space-y-6">
          <AnimatePresence>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-4 max-w-[80%] ${msg.type === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                  msg.type === 'user' ? 'bg-primary-500 text-white' : 'bg-gradient-to-br from-health-green to-health-blue text-white shadow-lg'
                }`}>
                  {msg.type === 'user' ? <User size={20} /> : <Bot size={20} />}
                </div>
                <div className={`p-4 rounded-2xl ${
                  msg.type === 'user' 
                    ? 'bg-primary-500 text-white rounded-tr-none' 
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-100 dark:border-slate-700 rounded-tl-none shadow-sm'
                }`}>
                  <p className="leading-relaxed">{msg.text}</p>
                </div>
              </motion.div>
            ))}
            {isTyping && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex gap-4 max-w-[80%]"
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-health-green to-health-blue text-white flex items-center justify-center shrink-0 shadow-lg">
                  <Bot size={20} />
                </div>
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-tl-none flex items-center gap-2 text-slate-500">
                  <Loader2 size={16} className="animate-spin" />
                  AI is thinking...
                </div>
              </motion.div>
            )}
            <div ref={messagesEndRef} />
          </AnimatePresence>
        </div>

        {/* Suggested Prompts */}
        <div className="px-6 pb-2 flex gap-2 overflow-x-auto hide-scrollbar">
          {["Is my diet healthy?", "What should I eat today?", "How to reduce stress?"].map((prompt, i) => (
            <button
              key={i}
              onClick={() => setInput(prompt)}
              className="whitespace-nowrap px-4 py-2 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-sm text-slate-600 dark:text-slate-300 transition-colors border border-slate-200 dark:border-slate-700"
            >
              <Sparkles size={14} className="inline mr-1 text-primary-500" />
              {prompt}
            </button>
          ))}
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md border-t border-slate-200 dark:border-slate-800">
          <form onSubmit={handleSend} className="relative flex items-center">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me anything..."
              className="w-full pl-6 pr-16 py-4 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-shadow shadow-sm dark:text-white"
            />
            <button
              type="submit"
              disabled={!input.trim() || isTyping}
              className="absolute right-2 w-10 h-10 flex items-center justify-center bg-primary-500 hover:bg-primary-600 text-white rounded-full transition-transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send size={18} className={input.trim() ? "ml-0.5" : ""} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Chatbot;
