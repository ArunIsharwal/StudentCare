import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { Activity, Apple, Wind, Brain, ChevronUp, Users, MessageSquare, Search, MoreVertical, Flame } from 'lucide-react';

const Dashboard = () => {
  const { user } = useSelector(state => state.auth);
  const { healthScore, caloricIntake, stressLevel } = useSelector(state => state.health);

  // Mock data for admin table
  const studentsList = [
    { id: 1, name: "Alice Johnson", email: "alice.j@university.edu", score: 92, stress: "Low", status: "Healthy" },
    { id: 2, name: "Bob Smith", email: "bob.smith@university.edu", score: 78, stress: "Medium", status: "Needs Review" },
    { id: 3, name: "Charlie Davis", email: "charlie.d@university.edu", score: 85, stress: "Low", status: "Healthy" },
    { id: 4, name: "Diana Prince", email: "diana.p@university.edu", score: 64, stress: "High", status: "At Risk" },
    { id: 5, name: "Evan Wright", email: "evan.w@university.edu", score: 88, stress: "Low", status: "Healthy" },
  ];

  if (user?.role === 'admin') {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
      >
        <div>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-white mb-2">Admin Dashboard</h1>
          <p className="text-slate-500 dark:text-slate-400">Platform overview and student management.</p>
        </div>

        {/* Admin Basic Analytics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 rounded-[2rem] shadow-sm relative overflow-hidden group">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-blue-50 dark:bg-blue-900/30 rounded-2xl text-blue-500">
                <Users size={24} />
              </div>
              <h3 className="font-semibold text-slate-700 dark:text-slate-200">Total Students</h3>
            </div>
            <p className="text-4xl font-bold text-slate-800 dark:text-white">1,248</p>
            <p className="text-sm text-emerald-500 mt-2 flex items-center"><ChevronUp size={16} /> 12% this month</p>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 rounded-[2rem] shadow-sm relative overflow-hidden group">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-emerald-50 dark:bg-emerald-900/30 rounded-2xl text-emerald-500">
                <Activity size={24} />
              </div>
              <h3 className="font-semibold text-slate-700 dark:text-slate-200">Avg Health Score</h3>
            </div>
            <p className="text-4xl font-bold text-slate-800 dark:text-white">82%</p>
            <p className="text-sm text-emerald-500 mt-2 flex items-center"><ChevronUp size={16} /> 4% improvement</p>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 rounded-[2rem] shadow-sm relative overflow-hidden group">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-indigo-50 dark:bg-indigo-900/30 rounded-2xl text-indigo-500">
                <MessageSquare size={24} />
              </div>
              <h3 className="font-semibold text-slate-700 dark:text-slate-200">Active Chat Sessions</h3>
            </div>
            <p className="text-4xl font-bold text-slate-800 dark:text-white">342</p>
            <p className="text-sm text-slate-500 mt-2">Currently online</p>
          </div>
        </div>

        {/* View All Students Data */}
        <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 overflow-hidden shadow-sm">
          <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-4">
            <h3 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <Users size={20} className="text-blue-500" /> All Students Data
            </h3>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Search size={16} />
              </div>
              <input 
                type="text" 
                placeholder="Search students..." 
                className="pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none w-full sm:w-64"
              />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 text-sm uppercase tracking-wider">
                  <th className="px-6 py-4 font-medium">Student Name</th>
                  <th className="px-6 py-4 font-medium">Health Score</th>
                  <th className="px-6 py-4 font-medium">Stress Level</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {studentsList.map((student) => (
                  <tr key={student.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-800 dark:text-white">{student.name}</div>
                      <div className="text-sm text-slate-500">{student.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${student.score >= 80 ? 'bg-emerald-500' : student.score > 70 ? 'bg-amber-500' : 'bg-rose-500'}`}></div>
                        <span className="font-bold text-slate-700 dark:text-slate-300">{student.score}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-700 dark:text-slate-300">
                      {student.stress}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        student.status === 'Healthy' 
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                          : student.status === 'Needs Review'
                          ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                          : 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400'
                      }`}>
                        {student.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-slate-400 hover:text-blue-500 transition-colors">
                        <MoreVertical size={20} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </motion.div>
    );
  }

  // Student Dashboard View
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8 pb-12"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-white mb-2">Hello, {user?.name || 'Student'}!</h1>
          <p className="text-slate-500 dark:text-slate-400">Here's your gentle wellness update for today.</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 rounded-full font-semibold border border-rose-100 dark:border-rose-900/50">
          <Flame size={18} />
          <span>7 Day Streak</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Health Score Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 rounded-[2rem] shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <Activity size={100} />
          </div>
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-blue-50 dark:bg-blue-900/30 rounded-2xl text-blue-500">
              <Activity size={24} />
            </div>
            <h3 className="font-semibold text-slate-700 dark:text-slate-200">Health Score</h3>
          </div>
          <div className="flex items-end gap-2">
            <span className="text-6xl font-bold text-slate-800 dark:text-white">{healthScore}</span>
          </div>
          <p className="text-sm font-medium text-emerald-500 mt-2 flex items-center gap-1">
            <ChevronUp size={16}/> 2% from yesterday
          </p>
        </div>

        {/* Food Intake Summary Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 rounded-[2rem] shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <Apple size={100} />
          </div>
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-emerald-50 dark:bg-emerald-900/30 rounded-2xl text-emerald-500">
              <Apple size={24} />
            </div>
            <h3 className="font-semibold text-slate-700 dark:text-slate-200">Nourishment</h3>
          </div>
          <div className="flex items-end gap-2 text-slate-800 dark:text-white font-bold">
            <span className="text-4xl">{caloricIntake.current}</span>
            <span className="text-slate-400 text-xl font-medium mb-1">/ {caloricIntake.target}</span>
          </div>
          <div className="w-full bg-slate-50 dark:bg-slate-800 rounded-full h-3 mt-5">
            <div className="bg-gradient-to-r from-emerald-400 to-teal-400 h-3 rounded-full" style={{ width: `${(caloricIntake.current/caloricIntake.target)*100}%` }}></div>
          </div>
        </div>

        {/* Air Quality (AQI) Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 rounded-[2rem] shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <Wind size={100} />
          </div>
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-sky-50 dark:bg-sky-900/30 rounded-2xl text-sky-500">
              <Wind size={24} />
            </div>
            <h3 className="font-semibold text-slate-700 dark:text-slate-200">Air Quality</h3>
          </div>
          <div className="flex flex-col">
            <span className="text-5xl font-bold text-slate-800 dark:text-white">45</span>
            <span className="text-sky-500 font-bold my-2">Optimal conditions</span>
            <p className="text-sm text-slate-500 font-medium">Great time for a walk!</p>
          </div>
        </div>

        {/* Stress Level Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 rounded-[2rem] shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <Brain size={100} />
          </div>
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-indigo-50 dark:bg-indigo-900/30 rounded-2xl text-indigo-500">
               <Brain size={24} />
            </div>
            <h3 className="font-semibold text-slate-700 dark:text-slate-200">Stress Level</h3>
          </div>
          <div className="flex flex-col">
            <span className="text-4xl font-bold text-slate-800 dark:text-white">{stressLevel}</span>
            <div className="w-full bg-slate-50 dark:bg-slate-800 rounded-full h-3 mt-4 mb-3">
              <div className="bg-indigo-400 h-3 rounded-full w-1/4"></div>
            </div>
            <p className="text-sm text-slate-500 font-medium">Feeling calm. You're doing absolutely great.</p>
          </div>
        </div>
      </div>

      {/* Replaced Chart with Gentle Daily Insights */}
      <div className="bg-white dark:bg-slate-900 p-8 md:p-10 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm mt-8">
        <h3 className="text-2xl font-bold text-slate-800 dark:text-white mb-8 flex items-center gap-3">
          <Sparkles className="text-blue-500" size={24}/> Weekly Positivity Insights
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
           <div className="bg-blue-50/50 dark:bg-blue-900/10 p-6 rounded-3xl border border-blue-100/50 dark:border-blue-900/30">
               <h4 className="font-bold text-slate-800 dark:text-slate-200 mb-2">Rest & Recovery</h4>
               <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed mb-4">Your sleep hygiene has been exceptional over the last 3 days. This significantly contributes to your low stress levels right now.</p>
               <div className="flex items-center justify-between text-sm">
                 <span className="font-medium text-slate-500">Consistency</span>
                 <span className="font-bold text-blue-600">92%</span>
               </div>
               <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 mt-2">
                 <div className="bg-blue-500 h-2 rounded-full w-[92%]"></div>
               </div>
           </div>
           
           <div className="bg-emerald-50/50 dark:bg-emerald-900/10 p-6 rounded-3xl border border-emerald-100/50 dark:border-emerald-900/30">
               <h4 className="font-bold text-slate-800 dark:text-slate-200 mb-2">Hydration Goals</h4>
               <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed mb-4">You are well on track. Keeping hydrated is letting your mind stay sharp during study sessions today.</p>
               <div className="flex items-center justify-between text-sm">
                 <span className="font-medium text-slate-500">Daily Target</span>
                 <span className="font-bold text-emerald-600">85%</span>
               </div>
               <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 mt-2">
                 <div className="bg-emerald-500 h-2 rounded-full w-[85%]"></div>
               </div>
           </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Dashboard;
