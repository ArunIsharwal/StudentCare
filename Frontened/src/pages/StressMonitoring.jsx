import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, UploadCloud, File, AlertTriangle, Calendar, Download, Loader2, ArrowRight } from 'lucide-react';
import axios from 'axios';

const StressMonitoring = () => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [events, setEvents] = useState(null); // Will hold the response array
  const [isDragActive, setIsDragActive] = useState(false);
  const [showJson, setShowJson] = useState(false);
  
  const fileInputRef = useRef(null);

  // Helper properties to handle drag & drop
  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current.click();
  };

  const handleSubmit = async () => {
    if (!file) {
      setError("Please select a file first.");
      return;
    }

    setLoading(true);
    setError('');
    
    // We assume the user wants to start over fresh
    setEvents(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await axios.post("http://127.0.0.1:8001/api/student-wellbeing/stress/upload-calendar", formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      // response.data should be the array event structure specified
      setEvents(response.data);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || "Failed to analyze the schedule. Please check the backend connection and ensure the file is valid.");
    } finally {
      setLoading(false);
    }
  };

  const downloadReport = () => {
    if (!events) return;
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(events, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "stress_monitoring_report.json");
    document.body.appendChild(downloadAnchorNode); // required for firefox
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const getIntensityColor = (intensity) => {
    switch (intensity?.toLowerCase()) {
      case 'high': return 'bg-red-100 text-red-700 border-red-300';
      case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      case 'low': return 'bg-green-100 text-green-700 border-green-300';
      default: return 'bg-slate-100 text-slate-700 border-slate-300';
    }
  };

  const getInsightSummary = () => {
    if (!events || !Array.isArray(events)) return null;
    const totalEvents = events.length;
    const highStressCount = events.filter(e => e.intensity?.toLowerCase() === 'high').length;
    
    let suggestion = '';
    if (highStressCount > 3) {
      suggestion = "You have multiple critical high-intensity deadlines clustered together. Please prioritize planning breaks and tackling assignments incrementally to prevent burnout.";
    } else if (highStressCount > 0) {
      suggestion = "You have a balanced schedule with a few high-stress deadlines. Stay organized and communicate with peers if you feel overwhelmed.";
    } else {
      suggestion = "Your schedule looks well-paced! Maintain your current momentum and use free gaps for extracurricular activities or rest.";
    }

    return { totalEvents, highStressCount, suggestion };
  };

  const summary = events ? getInsightSummary() : null;

  return (
    <div className="max-w-5xl mx-auto px-4 py-12 space-y-10 min-h-[80vh]">
      
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-sm font-bold uppercase tracking-widest mb-2 border border-blue-100 dark:border-blue-800">
          <Brain size={16} /> ML Powered
        </div>
        <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white transition-colors">
          AI Stress Monitoring
        </h1>
        <p className="text-slate-500 max-w-xl mx-auto text-lg">
          Upload your academic calendar to predict stress levels, analyze event intensities, and get personalized planning advice.
        </p>
      </div>

      {/* Main Upload Area */}
      <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none p-8 flex flex-col items-center">
        
        <input 
          type="file" 
          ref={fileInputRef} 
          style={{ display: 'none' }} 
          accept=".pdf,.csv,.json"
          onChange={handleFileChange}
        />

        {/* Drag & Drop Zone */}
        <div 
          className={`w-full max-w-2xl p-10 rounded-3xl border-2 border-dashed transition-all duration-300 flex flex-col items-center justify-center text-center cursor-pointer ${
            isDragActive ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-slate-100 dark:hover:bg-slate-800/80'
          }`}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={triggerFileSelect}
        >
          <div className={`p-4 rounded-full mb-4 ${file ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/50 dark:text-indigo-400' : 'bg-slate-200 text-slate-500 dark:bg-slate-700 dark:text-slate-400'} transition-colors`}>
             {file ? <File size={32} /> : <UploadCloud size={32} />}
          </div>
          
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
            {file ? "File Selected" : "Drag & drop your calendar file"}
          </h3>
          
          <p className="text-sm font-medium text-slate-500">
            {file ? (
               <span className="text-indigo-600 dark:text-indigo-400 font-bold">{file.name}</span>
            ) : (
              "Support for PDF, CSV, and JSON (Max 5MB)"
            )}
          </p>

          {!file && (
             <button className="mt-6 px-6 py-2 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors">
               Browse Files
             </button>
          )}
        </div>

        {/* Action Button */}
        {file && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-8 relative z-10 w-full max-w-2xl">
             <button
               onClick={handleSubmit}
               disabled={loading}
               className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-4 rounded-2xl font-black text-lg flex justify-center items-center gap-3 shadow-lg shadow-blue-500/30 transition-all disabled:opacity-70 disabled:hover:scale-100 hover:scale-[1.02] transform active:scale-95"
             >
               {loading ? (
                  <>
                    <Loader2 size={24} className="animate-spin" />
                    Analyzing schedule...
                  </>
               ) : (
                  <>
                    <Brain size={24} />
                    Analyze Stress Levels
                  </>
               )}
             </button>
          </motion.div>
        )}
      </div>

      {/* Error Message */}
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

      {/* Results Display */}
      <AnimatePresence>
        {events && !loading && (
          <motion.div 
            initial={{ opacity: 0, y: 30 }} 
            animate={{ opacity: 1, y: 0 }} 
            className="space-y-8 pb-10"
          >
            {/* AI Insight Summary Card */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-3xl p-8 shadow-2xl relative overflow-hidden border border-slate-700">
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl -mr-32 -mt-32" />
              <div className="relative z-10 flex flex-col md:flex-row gap-8 items-center">
                <div className="flex-grow space-y-4">
                  <h2 className="text-2xl font-black flex items-center gap-2">
                    <Brain className="text-indigo-400" /> System Diagnostics
                  </h2>
                  <p className="text-slate-300 font-medium leading-relaxed max-w-2xl">
                    {summary?.suggestion}
                  </p>
                </div>
                
                <div className="shrink-0 grid grid-cols-2 gap-4 w-full md:w-auto">
                  <div className="bg-slate-800/80 border border-slate-700 px-6 py-4 rounded-2xl text-center backdrop-blur-sm">
                     <p className="text-4xl font-black text-white">{summary?.totalEvents}</p>
                     <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Total</p>
                  </div>
                  <div className="bg-red-500/10 border border-red-500/20 px-6 py-4 rounded-2xl text-center backdrop-blur-sm">
                     <p className="text-4xl font-black text-red-400">{summary?.highStressCount}</p>
                     <p className="text-xs font-bold text-red-300/80 uppercase tracking-widest mt-1">High Stress</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Header row for Event List */}
            <div className="flex justify-between items-end border-b border-slate-200 dark:border-slate-800 pb-4">
              <h3 className="text-2xl font-black text-slate-900 dark:text-white inline-flex items-center gap-2">
                <Calendar className="text-blue-500" /> Detected Workloads
              </h3>
              <div className="flex items-center gap-2">
                {/* <button 
                  onClick={() => setShowJson(true)} 
                  className="text-sm font-bold text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 transition-colors inline-flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 px-4 py-2 rounded-lg"
                >
                  <File size={16} /> View JSON
                </button> */}
                <button 
                  onClick={downloadReport} 
                  className="text-sm font-bold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors inline-flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 px-4 py-2 rounded-lg"
                >
                  <Download size={16} /> Download Report
                </button>
              </div>
            </div>

            {/* Event List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Array.isArray(events) && events.length > 0 ? events.map((eventItem, idx) => (
                <div 
                  key={idx} 
                  className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
                >
                  <div>
                    <div className="flex justify-between items-start gap-4 mb-4">
                      <h4 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">
                        {eventItem.event}
                      </h4>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider shrink-0 border ${getIntensityColor(eventItem.intensity)}`}>
                        {eventItem.intensity}
                      </span>
                    </div>
                    
                    <div className="space-y-2 mt-4 text-sm font-medium">
                      <div className="flex justify-between text-slate-500 dark:text-slate-400">
                        <span>Event Type:</span>
                        <span className="text-slate-900 dark:text-white capitalize bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">{eventItem.type}</span>
                      </div>
                      <div className="flex justify-between text-slate-500 dark:text-slate-400 pt-1">
                        <span>Timeframe:</span>
                        <span className="text-slate-900 dark:text-white flex items-center gap-1">
                          {eventItem.start_date} <ArrowRight size={12} className="text-slate-400" /> {eventItem.end_date}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )) : (
                 <div className="col-span-1 md:col-span-2 text-center py-10 bg-slate-50 dark:bg-slate-900/50 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 text-slate-500">
                   No specific stressful events parsed from this file.
                 </div>
              )}
            </div>
            
          </motion.div>
        )}
      </AnimatePresence>

      {/* JSON Modal */}
      <AnimatePresence>
          {showJson && (
              <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm"
                  onClick={() => setShowJson(false)}
              >
                  <motion.div 
                      initial={{ scale: 0.95, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.95, opacity: 0 }}
                      onClick={(e) => e.stopPropagation()}
                      className="bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 w-full max-w-3xl max-h-[85vh] flex flex-col shadow-2xl border border-slate-200 dark:border-slate-800"
                  >
                      <div className="flex justify-between items-center mb-4">
                          <h3 className="text-xl font-bold flex items-center gap-2 text-slate-900 dark:text-white">
                              <File size={20} className="text-indigo-500"/> Raw JSON Output
                          </h3>
                          <button 
                              onClick={() => setShowJson(false)}
                              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors font-bold text-slate-500"
                          >
                              ✕
                          </button>
                      </div>
                      <div className="overflow-auto bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex-grow">
                          <pre className="text-sm font-mono text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                              {JSON.stringify(events, null, 2)}
                          </pre>
                      </div>
                  </motion.div>
              </motion.div>
          )}
      </AnimatePresence>

    </div>
  );
};

export default StressMonitoring;
