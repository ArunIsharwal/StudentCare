import { useState } from 'react';
import { motion } from 'framer-motion';
import { Camera, Image as ImageIcon, Upload, Loader2, Sparkles, CheckCircle2 } from 'lucide-react';

const FoodAnalysis = () => {
  const [image, setImage] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState(null);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(URL.createObjectURL(file));
      setResult(null);
    }
  };

  const analyzeFood = () => {
    setIsAnalyzing(true);
    // Simulate AI analysis delay
    setTimeout(() => {
      setIsAnalyzing(false);
      setResult({
        name: "Grilled Chicken Salad",
        calories: 320,
        nutrition: {
          protein: "35g",
          carbs: "12g",
          fat: "15g"
        },
        healthScore: 95,
        suggestions: [
          "Great source of lean protein!",
          "Consider adding a light vinaigrette instead of creamy dressing.",
          "Perfect post-workout meal."
        ]
      });
    }, 2000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">AI Food Analyzer</h1>
        <p className="text-slate-600 dark:text-slate-400">Snap a photo of your meal to instantly get nutritional insights.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Upload Section */}
        <div className="glass-panel p-8 rounded-3xl border border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center min-h-[400px]">
          {image ? (
            <div className="w-full h-full flex flex-col items-center gap-6">
              <div className="relative w-full h-64 rounded-2xl overflow-hidden shadow-lg">
                <img src={image} alt="Food" className="w-full h-full object-cover" />
                <button 
                  onClick={() => {setImage(null); setResult(null);}}
                  className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full backdrop-blur-sm transition-colors"
                >
                  <Upload size={16} />
                </button>
              </div>
              <button 
                onClick={analyzeFood}
                disabled={isAnalyzing}
                className="w-full py-4 flex items-center justify-center gap-2 bg-gradient-to-r from-health-green to-health-blue text-white rounded-xl font-medium hover:shadow-lg hover:shadow-health-green/30 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isAnalyzing ? (
                  <><Loader2 className="animate-spin" /> Analyzing...</>
                ) : (
                  <><Sparkles /> Analyze Nutrition</>
                )}
              </button>
            </div>
          ) : (
            <div className="text-center w-full">
              <div className="w-24 h-24 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
                <Camera size={40} className="text-slate-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Upload Food Photo</h3>
              <p className="text-slate-500 mb-8 text-sm">Take a picture or upload an existing photo of your meal.</p>
              
              <div className="flex justify-center gap-4">
                <label className="cursor-pointer px-6 py-3 bg-health-blue/10 text-health-blue rounded-xl font-medium hover:bg-health-blue/20 transition-colors flex items-center gap-2">
                  <ImageIcon size={20} /> Browse
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                </label>
                <label className="cursor-pointer px-6 py-3 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 transition-colors flex items-center gap-2 shadow-lg shadow-primary-500/30">
                  <Camera size={20} /> Camera
                  <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handleImageUpload} />
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Results Section */}
        <div className="glass-panel p-8 rounded-3xl border border-slate-200 dark:border-slate-800">
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
            <Sparkles className="text-primary-500" /> Analysis Results
          </h3>
          
          {isAnalyzing ? (
            <div className="h-full min-h-[300px] flex flex-col items-center justify-center text-slate-500 space-y-4">
              <Loader2 className="w-12 h-12 animate-spin text-health-blue" />
              <p>Scanning ingredients and calculating nutrition...</p>
            </div>
          ) : result ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-6"
            >
              <div className="flex justify-between items-start pb-4 border-b border-slate-200 dark:border-slate-700">
                <div>
                  <h4 className="text-xl font-bold text-slate-900 dark:text-white">{result.name}</h4>
                  <p className="text-primary-500 font-medium">{result.calories} kcal</p>
                </div>
                <div className="bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 px-3 py-1 rounded-full text-sm font-bold border border-green-200 dark:border-green-800">
                  Score: {result.healthScore}/100
                </div>
              </div>

              <div>
                <h5 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">Macronutrients</h5>
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-xl text-center border border-slate-100 dark:border-slate-700">
                    <p className="text-xs text-slate-500 mb-1">Protein</p>
                    <p className="font-bold text-lg text-slate-900 dark:text-white">{result.nutrition.protein}</p>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-xl text-center border border-slate-100 dark:border-slate-700">
                    <p className="text-xs text-slate-500 mb-1">Carbs</p>
                    <p className="font-bold text-lg text-slate-900 dark:text-white">{result.nutrition.carbs}</p>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-xl text-center border border-slate-100 dark:border-slate-700">
                    <p className="text-xs text-slate-500 mb-1">Fat</p>
                    <p className="font-bold text-lg text-slate-900 dark:text-white">{result.nutrition.fat}</p>
                  </div>
                </div>
              </div>

              <div>
                <h5 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">AI Suggestions</h5>
                <ul className="space-y-2">
                  {result.suggestions.map((suggestion, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-slate-700 dark:text-slate-300">
                      <CheckCircle2 size={18} className="text-health-green shrink-0 mt-0.5" />
                      <span className="text-sm leading-relaxed">{suggestion}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          ) : (
            <div className="h-full min-h-[300px] flex flex-col items-center justify-center text-slate-400">
              <p>Upload a food image to see the breakdown.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FoodAnalysis;
