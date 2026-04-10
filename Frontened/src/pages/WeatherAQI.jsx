import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Wind, Thermometer, Droplets, MapPin, AlertTriangle, CloudSun, Smartphone, Info } from 'lucide-react';

const WeatherAQI = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchWeather = setTimeout(() => {
      setData({
        location: "University Campus",
        temp: 24,
        humidity: 60,
        aqi: 55,
        aqiStatus: "Moderate",
        recommendation: "Air quality is acceptable. However, unusually sensitive individuals should consider limiting prolonged outdoor exertion."
      });
      setLoading(false);
    }, 1500);
    return () => clearTimeout(fetchWeather);
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <motion.div 
          animate={{ rotate: 360 }} 
          transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
          className="text-cyan-500 mb-4"
        >
          <Wind size={48} />
        </motion.div>
        <p className="text-slate-500 font-medium animate-pulse">Scanning environment...</p>
      </div>
    );
  }

  // Logic to determine color based on AQI
  const getAQIColor = (aqi) => {
    if (aqi <= 50) return "from-emerald-500 to-teal-500";
    if (aqi <= 100) return "from-yellow-400 to-orange-500";
    return "from-red-500 to-pink-600";
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-12 space-y-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-bold uppercase tracking-widest mb-4">
            <CloudSun size={14} /> Live Updates
          </div>
          <h1 className="text-4xl font-black text-slate-900 dark:text-white">Campus Environment</h1>
        </div>
        <div className="flex items-center gap-2 text-slate-500 bg-white dark:bg-slate-900 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <MapPin size={18} className="text-red-500" />
          <span className="font-semibold">{data.location}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Side: Stats */}
        <div className="lg:col-span-7 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <motion.div whileHover={{ y: -5 }} className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950 flex items-center justify-center text-blue-500 mb-6">
                <Thermometer size={28} />
              </div>
              <p className="text-slate-500 font-bold text-sm uppercase tracking-wider">Temperature</p>
              <div className="flex items-baseline gap-1 mt-2">
                <span className="text-6xl font-black text-slate-900 dark:text-white">{data.temp}</span>
                <span className="text-2xl font-bold text-slate-400">°C</span>
              </div>
            </motion.div>

            <motion.div whileHover={{ y: -5 }} className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950 flex items-center justify-center text-indigo-500 mb-6">
                <Droplets size={28} />
              </div>
              <p className="text-slate-500 font-bold text-sm uppercase tracking-wider">Humidity</p>
              <div className="flex items-baseline gap-1 mt-2">
                <span className="text-6xl font-black text-slate-900 dark:text-white">{data.humidity}</span>
                <span className="text-2xl font-bold text-slate-400">%</span>
              </div>
            </motion.div>
          </div>

          <div className="p-8 rounded-3xl bg-slate-900 text-white relative overflow-hidden group">
            <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
              <div className="text-center md:text-left">
                <h3 className="text-2xl font-bold mb-2 flex items-center gap-2 justify-center md:justify-start">
                  <Smartphone className="text-cyan-400" /> Stay Informed
                </h3>
                <p className="text-slate-400 max-w-sm">
                  Get instant alerts when air quality drops below healthy levels on your campus.
                </p>
                <div className="flex gap-4 mt-6">
                   <button className="bg-white text-slate-900 px-6 py-2 rounded-xl font-bold hover:bg-cyan-50 transition-colors">App Store</button>
                   <button className="border border-slate-700 px-6 py-2 rounded-xl font-bold hover:bg-slate-800 transition-colors">Play Store</button>
                </div>
              </div>
              <div className="hidden md:block">
                 <Wind size={100} className="text-slate-800 opacity-50 rotate-12" />
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: AQI Focus */}
        <div className="lg:col-span-5">
          <div className="h-full flex flex-col bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-2xl shadow-slate-200/50 dark:shadow-none">
            <div className={`p-10 bg-gradient-to-br ${getAQIColor(data.aqi)} text-center relative overflow-hidden`}>
              {/* Background Decor */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl" />
              
              <p className="text-white/80 font-bold text-sm uppercase tracking-[0.2em] mb-4">Air Quality Index</p>
              <motion.h2 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="text-9xl font-black text-white leading-none mb-4"
              >
                {data.aqi}
              </motion.h2>
              <div className="inline-block px-6 py-2 rounded-full bg-white/20 backdrop-blur-md text-white font-black text-xl border border-white/30">
                {data.aqiStatus}
              </div>
            </div>

            <div className="p-8 grow">
              <div className="flex items-start gap-4 p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                <div className="shrink-0 w-10 h-10 rounded-full bg-yellow-500/10 flex items-center justify-center text-yellow-600">
                  <AlertTriangle size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white mb-1">Health Recommendation</h4>
                  <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                    {data.recommendation}
                  </p>
                </div>
              </div>

              <div className="mt-8 pt-8 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-widest">
                <span className="flex items-center gap-1"><Info size={14}/> Sensitive Groups</span>
                <span className="text-yellow-500">Caution advised</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeatherAQI;