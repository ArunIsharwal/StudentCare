import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wind, MapPin, AlertTriangle, Activity, Search, Leaf } from 'lucide-react';
import axios from 'axios';

const WeatherAQI = () => {
  const [city, setCity] = useState('');
  const [calories, setCalories] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [aqiData, setAqiData] = useState(null);
  const [healthData, setHealthData] = useState(null);

  const fetchEnvironmentData = async (e) => {
    e.preventDefault();
    if (!city) {
      setError("Please enter a city or place.");
      return;
    }
    
    setLoading(true);
    setError('');
    setAqiData(null);
    setHealthData(null);

    try {
      // 1. Fetch live AQI from your backend
      const aqiResponse = await axios.get(`http://127.0.0.1:8001/health-intelligence/aqi?place=${encodeURIComponent(city)}`);
      const aqiResult = aqiResponse.data;
      setAqiData(aqiResult);

      // 2. If calories are provided, dynamically calculate the Health Score
      if (calories && aqiResult.aqi !== null) {
        try {
          const healthResponse = await axios.get(`http://127.0.0.1:8001/health-intelligence/health_score?aqi=${aqiResult.aqi}&calories=${calories}`);
          setHealthData(healthResponse.data);
        } catch (healthErr) {
          console.error("Health score error", healthErr);
          // Only show error locally, don't crash the AQI view
        }
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || "Failed to fetch data. Ensure the backend is running and you spelled the city correctly.");
    } finally {
      setLoading(false);
    }
  };

  const getAQIColor = (aqi) => {
    if (aqi <= 50) return "from-emerald-500 to-teal-500";
    if (aqi <= 100) return "from-yellow-400 to-orange-500";
    if (aqi <= 150) return "from-orange-500 to-red-500";
    return "from-red-500 to-rose-700";
  };

  const getRecommendation = (aqi) => {
    if (aqi <= 50) return "Air quality is good. Perfect day for outdoor activities.";
    if (aqi <= 100) return "Air quality is acceptable. Unusually sensitive individuals should limit prolonged outdoor exertion.";
    return "Poor air quality. Avoid outdoor activities, and keep windows closed.";
  };

  const getHealthCategoryColor = (category) => {
    switch (category) {
      case 'Excellent': return "bg-emerald-100 text-emerald-700 border-emerald-300";
      case 'Good': return "bg-teal-100 text-teal-700 border-teal-300";
      case 'Moderate': return "bg-orange-100 text-orange-700 border-orange-300";
      case 'Poor': return "bg-red-100 text-red-700 border-red-300";
      default: return "bg-slate-100 text-slate-700 border-slate-300";
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-8 min-h-[80vh]">
      
      {/* Centered Clean Header */}
      <div className="text-center space-y-4 mb-8">
        <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white transition-colors">
          Health Intelligence
        </h1>
        <p className="text-slate-500 max-w-xl mx-auto text-lg">
          Check real-time air quality and generate your AI-driven health score.
        </p>
      </div>

      {/* Input Form overriding other UI */}
      <form 
        onSubmit={fetchEnvironmentData} 
        className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none flex flex-col md:flex-row gap-4 items-center z-10 relative"
      >
        <div className="flex-1 w-full flex items-center bg-slate-50 dark:bg-slate-800/50 px-5 py-4 rounded-2xl border border-slate-100 dark:border-slate-800 transition-all focus-within:border-cyan-500 focus-within:ring-2 focus-within:ring-cyan-500/20">
          <MapPin className="text-cyan-500 mr-3 shrink-0" size={24} />
          <input 
            type="text" 
            placeholder="Enter city or place (e.g. Kochi)" 
            className="bg-transparent border-none outline-none w-full text-slate-900 dark:text-white placeholder:text-slate-400 text-lg"
            value={city}
            onChange={(e) => setCity(e.target.value)}
          />
        </div>
        
        <div className="flex-1 w-full flex items-center bg-slate-50 dark:bg-slate-800/50 px-5 py-4 rounded-2xl border border-slate-100 dark:border-slate-800 transition-all focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/20">
          <Activity className="text-indigo-500 mr-3 shrink-0" size={24} />
          <input 
            type="number" 
            placeholder="Daily calories (optional)" 
            className="bg-transparent border-none outline-none w-full text-slate-900 dark:text-white placeholder:text-slate-400 text-lg"
            value={calories}
            onChange={(e) => setCalories(e.target.value)}
          />
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="w-full md:w-auto bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white px-10 py-4 rounded-2xl font-black text-lg flex items-center justify-center gap-2 transition-all transform active:scale-95 shadow-lg shadow-blue-500/30 disabled:opacity-70 disabled:active:scale-100"
        >
          {loading ? (
             <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
                <Wind size={24} />
             </motion.div>
          ) : (
            <Search size={24} />
          )}
          <span>Analyze</span>
        </button>
      </form>

      {/* Error State */}
      <AnimatePresence>
        {error && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }} 
            animate={{ opacity: 1, height: 'auto' }} 
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="p-5 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-2xl border border-red-100 dark:border-red-900/30 flex items-center gap-3">
              <AlertTriangle size={20} className="shrink-0" />
              <p className="font-medium">{error}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Output Section Overriding Empty Space */}
      <AnimatePresence mode="wait">
        {aqiData && !loading && (
          <motion.div 
            initial={{ opacity: 0, y: 30 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0, y: -20 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4"
          >
            {/* Real-time AQI Card */}
            <div className={`p-8 md:p-10 rounded-3xl bg-gradient-to-br ${getAQIColor(aqiData.aqi)} text-white shadow-2xl relative overflow-hidden flex flex-col justify-between min-h-[350px]`}>
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/20 rounded-full -mr-24 -mt-24 blur-3xl opacity-70" />
              
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-6">
                  <span className="bg-white/20 backdrop-blur-md px-4 py-1.5 rounded-full text-xs font-black tracking-widest uppercase inline-flex items-center gap-2 shadow-sm border border-white/10">
                    <Wind size={14} /> LIVE AQI
                  </span>
                  <span className="text-white/80 text-xs text-right max-w-[150px] font-medium leading-tight">
                    {new Date(aqiData.last_updated).toLocaleString()}
                  </span>
                </div>
                
                <h2 className="text-8xl font-black mb-1 drop-shadow-sm">{aqiData.aqi ?? 'N/A'}</h2>
                <p className="text-3xl font-black mb-2 opacity-95">{aqiData.category}</p>
                <p className="text-sm text-white/90 font-medium flex items-center gap-1.5">
                  <MapPin size={16}/> {aqiData.location}
                </p>
              </div>

              <div className="mt-8 bg-black/15 p-5 rounded-2xl backdrop-blur-md border border-white/20 relative z-10">
                <p className="text-sm font-semibold leading-relaxed drop-shadow-sm">{getRecommendation(aqiData.aqi)}</p>
                {aqiData.inconsistency_flag && (
                  <p className="text-xs text-yellow-200 mt-3 flex items-start gap-1.5 font-medium opacity-90 p-2 bg-black/20 rounded-lg">
                    <AlertTriangle size={14} className="shrink-0 mt-0.5 text-yellow-400" />
                    <span>{aqiData.inconsistency_flag}</span>
                  </p>
                )}
              </div>
            </div>

            {/* AI Health Insight Card */}
            {healthData ? (
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 md:p-10 border border-slate-200 dark:border-slate-800 shadow-xl flex flex-col relative overflow-hidden">
                <div className="flex items-center gap-4 mb-8">
                  <div className="p-3.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-2xl shadow-sm">
                    <Activity size={28} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white">AI Health Insight</h3>
                    <p className="text-slate-500 text-sm font-medium">Personalized well-being analysis</p>
                  </div>
                </div>

                <div className="text-center flex-grow flex flex-col justify-center items-center">
                  <p className="text-slate-400 font-bold uppercase tracking-widest text-xs mb-3">Overall Health Score</p>
                  <div className="flex items-baseline justify-center gap-2 mb-6">
                    <span className="text-8xl font-black text-slate-900 dark:text-white tracking-tighter">{healthData.health_score}</span>
                    <span className="text-2xl font-bold text-slate-300">/ 100</span>
                  </div>
                  <div className={`px-8 py-2.5 rounded-full font-black text-lg uppercase tracking-wide border-2 ${getHealthCategoryColor(healthData.category)} shadow-sm`}>
                    {healthData.category}
                  </div>
                </div>

                <div className="mt-10 space-y-3">
                   <div className="flex justify-between items-center p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800/80">
                      <span className="text-sm font-semibold text-slate-500">AQI Component Score</span>
                      <span className="font-black text-slate-900 dark:text-white text-lg">{healthData.details?.aqi_score_component ?? 0}</span>
                   </div>
                   <div className="flex justify-between items-center p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800/80">
                      <span className="text-sm font-semibold text-slate-500">Diet Component (Calories)</span>
                      <span className="font-black text-slate-900 dark:text-white text-lg">{healthData.details?.calorie_score_component ?? 0}</span>
                   </div>
                </div>
              </div>
            ) : (
               <div className="bg-slate-50 dark:bg-slate-900/40 rounded-3xl p-8 border-2 border-slate-200 dark:border-slate-800 border-dashed flex flex-col items-center justify-center text-center">
                  <div className="p-5 bg-white dark:bg-slate-800 shadow-sm rounded-full text-slate-400 mb-5">
                    <Leaf size={40} className="text-cyan-500/50" />
                  </div>
                  <h4 className="text-xl font-bold text-slate-700 dark:text-slate-300 mb-2">Want a full health analysis?</h4>
                  <p className="text-slate-500 text-sm max-w-[250px] font-medium leading-relaxed">Enter your daily calorie intake along with your city to unlock your personalized ML Health Score.</p>
               </div>
            )}
            
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Empty State Instructions (When first loaded) */}
      {!aqiData && !loading && !error && (
        <div className="text-center pt-20 pb-12 flex flex-col items-center justify-center animate-pulse">
           <MapPin size={48} className="text-slate-200 dark:text-slate-800 mb-4" />
          <p className="text-slate-400 font-bold text-lg">Enter a city to initialize telemetry protocol</p>
        </div>
      )}

    </div>
  );
};

export default WeatherAQI;