import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Wind, Thermometer, Droplets, MapPin, AlertTriangle, ShieldCheck } from 'lucide-react';

const WeatherAQI = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  useEffect(() => {
    // Simulate API fetch
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
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin text-cyan-500"><Wind size={48} /></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Campus Environment</h1>
        <p className="text-slate-600 dark:text-slate-400">Real-time weather and air quality monitoring.</p>
      </div>

      <div className="glass-panel p-8 rounded-3xl border border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2 text-slate-500 mb-8 border-b border-slate-200 dark:border-slate-700 pb-4">
          <MapPin size={20} />
          <span className="font-medium text-lg">{data.location}</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Environment Stats */}
          <div className="space-y-6">
            <div className="flex items-center gap-6 p-6 rounded-2xl bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20">
              <Thermometer size={48} className="text-blue-500" />
              <div>
                <p className="text-sm text-slate-500 font-medium uppercase tracking-wider mb-1">Temperature</p>
                <div className="flex items-end">
                  <span className="text-5xl font-bold text-slate-900 dark:text-white">{data.temp}</span>
                  <span className="text-xl text-slate-500 mb-1 ml-1">°C</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-6 p-6 rounded-2xl bg-gradient-to-br from-indigo-500/10 to-blue-500/10 border border-indigo-500/20">
              <Droplets size={48} className="text-indigo-500" />
              <div>
                <p className="text-sm text-slate-500 font-medium uppercase tracking-wider mb-1">Humidity</p>
                <div className="flex items-end">
                  <span className="text-5xl font-bold text-slate-900 dark:text-white">{data.humidity}</span>
                  <span className="text-xl text-slate-500 mb-1 ml-1">%</span>
                </div>
              </div>
            </div>
          </div>

          {/* AQI Stats */}
          <div className="flex flex-col h-full">
            <div className="flex-grow flex flex-col items-center justify-center p-8 rounded-t-2xl bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border-x border-t border-yellow-500/20 relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-500 via-yellow-500 to-red-500"></div>
              
              <p className="text-sm text-slate-500 font-medium uppercase tracking-wider mb-4">Air Quality Index</p>
              <motion.div 
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-8xl font-black text-slate-900 dark:text-white mb-2"
              >
                {data.aqi}
              </motion.div>
              <div className="px-4 py-1.5 rounded-full bg-yellow-500/20 text-yellow-700 dark:text-yellow-400 font-bold border border-yellow-500/30">
                {data.aqiStatus}
              </div>
            </div>
            
            <div className="p-6 rounded-b-2xl bg-slate-50 dark:bg-slate-800 border-x border-b border-slate-200 dark:border-slate-700">
              <h4 className="font-semibold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                <AlertTriangle size={18} className="text-yellow-500" /> Recommendation
              </h4>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                {data.recommendation}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeatherAQI;
