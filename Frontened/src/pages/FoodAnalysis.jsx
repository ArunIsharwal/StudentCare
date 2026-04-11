import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Image as ImageIcon, Upload, Loader2, Sparkles, CheckCircle2, Apple, Utensils } from 'lucide-react';

const FoodAnalysis = () => {
  const [image, setImage] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(URL.createObjectURL(file));
      setImageFile(file);
      setResult(null);
      setError(null);
    }
  };

  const analyzeFood = async () => {
    if (!imageFile) return;

    setIsAnalyzing(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', imageFile);

      const response = await fetch('http://127.0.0.1:8001/api/food/analyze', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to analyze the image');
      }

      const data = await response.json();
      
      setResult({
        name: data.food || "Unknown Food",
        calories: data.calories || 0,
        nutrition: {
          protein: { value: data.protein || 0, unit: "g", percent: Math.min(100, (data.protein || 0) * 1.5) },
          carbs: { value: data.carbs || 0, unit: "g", percent: Math.min(100, (data.carbs || 0) * 1.5) },
          fat: { value: data.fat || 0, unit: "g", percent: Math.min(100, (data.fat || 0) * 2) }
        },
        healthScore: data.confidence ? Math.round(data.confidence * 100) : 85,
        suggestions: [
          "Estimated based on AI image recognition.",
          "Results are intended for guidance only.",
          "Maintain a balanced diet for best health."
        ]
      });
    } catch (err) {
      console.error(err);
      setError('An error occurred during analysis. Make sure the backend is running.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    
    <div className="min-h-screen w-full bg-slate-50 dark:bg-slate-950 py-12 px-4 flex flex-col items-center">
      <div className="max-w-5xl w-full space-y-10">
        
        {/* Header Section */}
        <header className="text-center space-y-4">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 text-sm font-bold uppercase tracking-wider"
          >
            <Apple size={16} /> Nutrition Intelligence
          </motion.div>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight">AI Food Analyzer</h1>
          <p className="text-slate-600 dark:text-slate-400 max-w-xl mx-auto text-lg">
            Snap a photo of your meal to instantly get nutritional insights and healthy suggestions.
          </p>
        </header>

        <main className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          
          {/* Upload Section */}
          <div className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none min-h-[500px] flex flex-col">
            <AnimatePresence mode="wait">
              {image ? (
                <motion.div 
                  key="preview"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="w-full flex flex-col h-full space-y-6"
                >
                  <div className="relative aspect-square md:aspect-auto md:h-80 rounded-3xl overflow-hidden group">
                    <img src={image} alt="Food" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors" />
                    <button 
                      onClick={() => {setImage(null); setImageFile(null); setResult(null); setError(null);}}
                      className="absolute top-4 right-4 bg-white dark:bg-slate-800 text-slate-900 dark:text-white p-3 rounded-2xl shadow-xl hover:scale-110 transition-transform"
                      title="Clear Image"
                    >
                      <Upload size={20} />
                    </button>
                  </div>
                  
                  {error && (
                    <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800/50 rounded-xl text-sm font-medium text-center">
                      {error}
                    </div>
                  )}
                  <button 
                    onClick={analyzeFood}
                    disabled={isAnalyzing}
                    className="mt-auto w-full py-5 flex items-center justify-center gap-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-bold text-lg hover:opacity-90 transition-all disabled:opacity-50"
                  >
                    {isAnalyzing ? (
                      <><Loader2 className="animate-spin" /> Deep Scanning...</>
                    ) : (
                      <><Sparkles className="text-yellow-500" /> Get Nutritional Breakdown</>
                    )}
                  </button>
                </motion.div>
              ) : (
                <motion.div 
                  key="upload"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center h-full py-12 text-center"
                >
                  <div className="w-24 h-24 bg-blue-50 dark:bg-blue-900/20 rounded-3xl flex items-center justify-center text-blue-500 mb-8 rotate-3">
                    <Camera size={44} />
                  </div>
                  <h3 className="text-2xl font-bold mb-3">Upload your meal</h3>
                  <p className="text-slate-500 dark:text-slate-400 mb-10 max-w-xs text-sm leading-relaxed">
                    Our AI identifies ingredients, portions, and calories from a single photo.
                  </p>
                  
                  <div className="flex flex-col sm:flex-row gap-4 w-full px-4">
                    <label className="flex-1 cursor-pointer px-6 py-4 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-2xl font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-all flex items-center justify-center gap-2">
                      <ImageIcon size={20} /> Gallery
                      <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                    </label>
                    <label className="flex-1 cursor-pointer px-6 py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25">
                      <Camera size={20} /> Take Photo
                      <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handleImageUpload} />
                    </label>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Results Section */}
          <div className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none min-h-[500px]">
             <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-100 dark:border-slate-800">
                <h3 className="text-xl font-bold flex items-center gap-2 italic">
                  <Utensils className="text-blue-500" size={22} /> Food Report
                </h3>
                {result && (
                  <div className="bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 px-4 py-1.5 rounded-xl text-sm font-black border border-emerald-100 dark:border-emerald-800">
                    {result.healthScore}/100 SCORE
                  </div>
                )}
             </div>

            {isAnalyzing ? (
              <div className="h-full flex flex-col items-center justify-center py-20 space-y-6">
                <div className="relative">
                   <Loader2 className="w-16 h-16 animate-spin text-blue-500" />
                   <Sparkles className="absolute -top-2 -right-2 text-yellow-500 animate-bounce" />
                </div>
                <div className="text-center">
                  <p className="font-bold text-slate-800 dark:text-white">AI is Thinking...</p>
                  <p className="text-sm text-slate-500">Estimating portion sizes and macros</p>
                </div>
              </div>
            ) : result ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
                <div>
                  <h4 className="text-3xl font-black text-slate-900 dark:text-white">{result.name}</h4>
                  <p className="text-blue-600 dark:text-blue-400 text-xl font-bold">{result.calories} Calories</p>
                </div>

                <div className="space-y-5">
                  <h5 className="text-xs font-black text-slate-400 uppercase tracking-widest">Macronutrients Breakdown</h5>
                  {Object.entries(result.nutrition).map(([key, data]) => (
                    <div key={key} className="space-y-2">
                      <div className="flex justify-between text-sm font-bold capitalize">
                        <span>{key}</span>
                        <span className="text-slate-500">{data.value}{data.unit}</span>
                      </div>
                      <div className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }} 
                          animate={{ width: `${data.percent}%` }}
                          className={`h-full rounded-full ${
                            key === 'protein' ? 'bg-emerald-500' : 
                            key === 'carbs' ? 'bg-blue-500' : 'bg-orange-500'
                          }`}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-3xl border border-slate-100 dark:border-slate-700">
                  <h5 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Smart Suggestions</h5>
                  <ul className="space-y-3">
                    {result.suggestions.map((suggestion, idx) => (
                      <li key={idx} className="flex items-start gap-3 text-slate-700 dark:text-slate-300">
                        <CheckCircle2 size={20} className="text-emerald-500 shrink-0 mt-0.5" />
                        <span className="text-sm font-medium leading-relaxed">{suggestion}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button 
                  onClick={() => {setImage(null); setImageFile(null); setResult(null); setError(null);}}
                  className="w-full py-4 mt-8 flex items-center justify-center gap-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-2xl font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-all border border-slate-200 dark:border-slate-700"
                >
                  <Camera size={18} /> Analyze Another Meal
                </button>
              </motion.div>
            ) : (
              <div className="h-64 flex flex-col items-center justify-center text-slate-400 text-center space-y-4">
                <Utensils size={48} className="opacity-20" />
                <p className="max-w-[200px] text-sm font-medium leading-relaxed">
                  Upload a photo on the left to generate your health report.
                </p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default FoodAnalysis;