import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, Wind, Leaf, ArrowRight, Brain, Zap, Sparkles, Activity } from 'lucide-react';

const Home = () => {
  return (
    <div className="space-y-32 pb-24 overflow-hidden text-slate-900 dark:text-white">
      
      {/* 1. HERO SECTION - Ultra Premium, Breathtaking */}
      <section className="relative pt-24 lg:pt-40 px-4 max-w-7xl mx-auto min-h-[90vh]">
        {/* Hypnotic Glowing Background Mesh (Dark & Light compatible) */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[600px] max-w-4xl opacity-50 dark:opacity-40 animate-pulse pointer-events-none" style={{ animationDuration: '6s' }}>
          <div className="absolute top-0 right-1/4 w-[400px] h-[400px] bg-indigo-500/40 rounded-full mix-blend-screen filter blur-[100px] blob"></div>
          <div className="absolute bottom-0 left-1/4 w-[500px] h-[500px] bg-emerald-500/30 rounded-full mix-blend-screen filter blur-[120px] blob" style={{ animationDelay: '-4s' }}></div>
          <div className="absolute top-1/4 left-1/3 w-[300px] h-[300px] bg-cyan-500/40 rounded-full mix-blend-screen filter blur-[90px] blob" style={{ animationDelay: '-7s' }}></div>
        </div>

        <div className="relative z-10 flex flex-col items-center text-center max-w-4xl mx-auto space-y-10">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full border border-slate-900/10 dark:border-white/10 bg-white/50 dark:bg-black/50 backdrop-blur-2xl shadow-xl backdrop-saturate-200"
          >
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></div>
            <span className="text-sm font-bold tracking-widest uppercase bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-emerald-500">StudentCare 2.0 is Live</span>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.1, ease: 'easeOut' }}
            className="text-6xl md:text-8xl font-black tracking-tighter leading-[1.05]"
          >
            Reclaim your <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-cyan-400 to-emerald-400 glow-text drop-shadow-sm">
              brilliance.
            </span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.2, ease: 'easeOut' }}
            className="text-xl md:text-2xl text-slate-600 dark:text-slate-400 max-w-2xl font-medium leading-relaxed"
          >
            A breathtakingly simple ecosystem designed to track your health, clear your mind, and elevate your academic life without the overwhelming noise.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.3, ease: 'easeOut' }}
            className="flex flex-col sm:flex-row gap-6 pt-4 w-full sm:w-auto"
          >
            <Link to="/register" className="group relative px-10 py-5 rounded-3xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-lg overflow-hidden flex items-center justify-center gap-2 shadow-2xl transition-transform hover:scale-105">
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-emerald-500 opacity-0 group-hover:opacity-10 transition-opacity"></div>
              Begin Experience <ArrowRight className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>

          {/* Abstract Hero UI Display */}
          <motion.div 
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, delay: 0.5, ease: 'easeOut' }}
            className="w-full max-w-5xl mt-16 relative"
          >
             <div className="aspect-[21/9] w-full rounded-[2rem] border border-white/40 dark:border-white/10 bg-white/20 dark:bg-black/40 backdrop-blur-3xl shadow-2xl overflow-hidden flex items-center justify-center relative group">
                <div className="absolute inset-0 bg-gradient-to-t from-white/40 dark:from-black/60 to-transparent z-10"></div>
                
                {/* Stunning floating elements inside the frame */}
                <div className="absolute z-20 flex gap-8 items-center justify-center w-full h-full p-8">
                  {/* Left Floating stat */}
                  <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-white/50 dark:border-white/10 p-6 rounded-3xl shadow-xl transform -translate-y-8 group-hover:-translate-y-12 transition-transform duration-700">
                     <div className="flex items-center gap-4 mb-3">
                       <div className="p-3 bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-2xl"><Leaf size={24}/></div>
                       <div className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Nutrition</div>
                     </div>
                     <div className="text-3xl font-black">100%</div>
                     <div className="text-sm font-semibold text-emerald-500 mt-1">Perfect Harmony</div>
                  </div>

                  {/* Center Main Orb */}
                  <div className="relative w-48 h-48 rounded-full bg-gradient-to-tr from-indigo-500 to-cyan-400 flex items-center justify-center shadow-[0_0_80px_rgba(99,102,241,0.5)] transform scale-100 group-hover:scale-110 transition-transform duration-1000">
                    <div className="absolute inset-1 rounded-full bg-slate-900 dark:bg-black flex items-center justify-center m-1">
                      <div className="text-center">
                         <Brain className="mx-auto text-indigo-400 mb-2" size={32} />
                         <span className="text-2xl font-black text-white">Zen</span>
                      </div>
                    </div>
                  </div>

                  {/* Right Floating stat */}
                  <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-white/50 dark:border-white/10 p-6 rounded-3xl shadow-xl transform translate-y-8 group-hover:translate-y-12 transition-transform duration-700">
                     <div className="flex items-center gap-4 mb-3">
                       <div className="p-3 bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 rounded-2xl"><Wind size={24}/></div>
                       <div className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Breathe</div>
                     </div>
                     <div className="text-3xl font-black">AQI 42</div>
                     <div className="text-sm font-semibold text-cyan-500 mt-1">Crystal Clear Air</div>
                  </div>
                </div>
             </div>
          </motion.div>
        </div>
      </section>

      {/* 2. PREMIUM FEATURE SHOWCASE */}
      <section className="max-w-7xl mx-auto px-4 z-10 relative mt-24">
        <div className="mb-20 text-center">
          <h2 className="text-4xl md:text-6xl font-black mb-6 tracking-tight">
            Designed for <span className="text-slate-400 dark:text-slate-500">absolute clarity.</span>
          </h2>
          <p className="text-xl text-slate-500 font-medium max-w-2xl mx-auto">
            Say goodbye to clunky interfaces. Every pixel of StudentCare is engineered to make you feel calm, in control, and powerful.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Card 1 */}
          <div className="glass-panel rounded-[2rem] p-10 flex flex-col justify-between group hover:-translate-y-2 transition-transform duration-500 h-[400px]">
             <div>
               <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-400 to-indigo-600 flex items-center justify-center text-white mb-8 shadow-lg shadow-indigo-500/30">
                 <Brain size={32} />
               </div>
               <h3 className="text-3xl font-bold mb-4">Mind Companion</h3>
               <p className="text-slate-600 dark:text-slate-400 text-lg leading-relaxed font-medium">
                 An intelligent, deeply empathetic AI listener ready 24/7 to help you de-stress and refocus your energy.
               </p>
             </div>
          </div>

          {/* Card 2 */}
          <div className="glass-panel rounded-[2rem] p-10 flex flex-col justify-between group hover:-translate-y-2 transition-transform duration-500 h-[400px]">
             <div>
               <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white mb-8 shadow-lg shadow-emerald-500/30">
                 <Leaf size={32} />
               </div>
               <h3 className="text-3xl font-bold mb-4">Visual Nutrition</h3>
               <p className="text-slate-600 dark:text-slate-400 text-lg leading-relaxed font-medium">
                 Simply point your camera. We instantly analyze what you're eating and how it fuels your specific academic goals.
               </p>
             </div>
          </div>

          {/* Card 3 */}
          <div className="glass-panel rounded-[2rem] p-10 flex flex-col justify-between group hover:-translate-y-2 transition-transform duration-500 h-[400px]">
             <div>
               <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center text-white mb-8 shadow-lg shadow-cyan-500/30">
                 <Wind size={32} />
               </div>
               <h3 className="text-3xl font-bold mb-4">Environment Sync</h3>
               <p className="text-slate-600 dark:text-slate-400 text-lg leading-relaxed font-medium">
                 Real-time climate and air quality mapping. Always know the best hours to step outside or study indoors.
               </p>
             </div>
          </div>
        </div>
      </section>

      {/* 3. FINAL UPLIFTING CTA */}
      <section className="max-w-6xl mx-auto px-4 text-center mt-32 mb-20">
        <div className="rounded-[3rem] p-12 md:p-24 shadow-2xl relative overflow-hidden bg-slate-900 border border-slate-800">
          <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-indigo-600 rounded-full mix-blend-screen filter blur-[120px] opacity-40"></div>
          <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-cyan-500 rounded-full mix-blend-screen filter blur-[120px] opacity-30"></div>
          
          <div className="relative z-10 space-y-10">
             <div className="inline-flex items-center justify-center p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 mb-4">
                <Heart className="text-rose-400 animate-pulse" size={40} />
             </div>
            <h2 className="text-5xl md:text-7xl font-black text-white tracking-tight">
              You deserve to <br/> feel incredible.
            </h2>
            <p className="text-xl md:text-2xl text-slate-300 max-w-2xl mx-auto font-medium">
              Join the beautiful ecosystem that actually cares about you.
            </p>
            <div className="pt-8">
              <Link to="/register" className="inline-flex items-center gap-3 px-10 py-5 rounded-full bg-white text-slate-900 font-extrabold text-xl hover:shadow-[0_0_40px_rgba(255,255,255,0.3)] hover:scale-105 transition-all duration-300">
                Begin Now <Sparkles size={24} />
              </Link>
            </div>
          </div>
        </div>
      </section>
      
    </div>
  );
};

export default Home;
