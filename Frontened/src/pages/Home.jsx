import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Brain, Leaf, Wind, CheckCircle2 } from "lucide-react";

const features = [
  {
    title: "Daily Wellness Snapshot",
    description: "Get one clear view of your mood, activity, and health trends without information overload.",
    icon: Brain,
    color: "text-blue-500",
    bg: "bg-blue-50 dark:bg-blue-950/30",
  },
  {
    title: "Food Analysis",
    description: "Upload meal photos and quickly understand calories and nutrition quality in plain language.",
    icon: Leaf,
    color: "text-emerald-500",
    bg: "bg-emerald-50 dark:bg-emerald-950/30",
  },
  {
    title: "Air Quality Guidance",
    description: "See local AQI and weather insights so you can plan outdoor time and study breaks better.",
    icon: Wind,
    color: "text-orange-500",
    bg: "bg-orange-50 dark:bg-orange-950/30",
  },
];

const reviews = [
  {
    name: "Aarav Sharma",
    role: "2nd Year Engineering",
    quote: "StudentCare helped me build better sleep and meal habits during exams without feeling overwhelmed.",
  },
  {
    name: "Neha Verma",
    role: "B.Sc. Computer Science",
    quote: "The dashboard is easy to understand. I can quickly check how I am doing and stay consistent.",
  },
  {
    name: "Rahul Mehta",
    role: "MBA Student",
    quote: "I mostly use the food and air quality features. It is simple, practical, and fits my daily routine.",
  },
];

const Home = () => {
  return (
    <div className="relative overflow-hidden pb-20 text-slate-900 dark:text-white">
      {/* Background Decorative Blurs */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-gradient-to-b from-blue-50/50 to-transparent dark:from-blue-950/20 -z-10" />
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-emerald-500/10 blur-[100px] rounded-full -z-10" />

      {/* Hero Section */}
      <section className="pt-20 px-6 max-w-5xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm text-slate-600 dark:text-slate-300 mb-8"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          Trusted by 1,000+ students
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-5xl md:text-7xl font-extrabold tracking-tight leading-[1.1] mb-6"
        >
          Balance your <span className="text-blue-600 dark:text-blue-400">studies</span> <br />
          with your <span className="text-emerald-500">wellbeing</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed"
        >
          The all-in-one health companion designed specifically for the student lifestyle. Track mood, nutrition, and environment in one simple place.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link
            to="/register"
            className="group inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-bold text-lg transition-all hover:scale-105 active:scale-95 shadow-xl shadow-slate-200 dark:shadow-none"
          >
            Get Started Free <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link
            to="/login"
            className="px-8 py-4 rounded-2xl border-2 border-slate-200 dark:border-slate-800 font-bold text-lg text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            Sign In
          </Link>
        </motion.div>
      </section>

      {/* Features Grid */}
      <section className="mt-32 px-6 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -8 }}
              className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-sm hover:shadow-2xl hover:shadow-blue-500/5 transition-all"
            >
              <div className={`w-14 h-14 rounded-2xl ${feature.bg} ${feature.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                <feature.icon size={28} />
              </div>
              <h3 className="text-2xl font-bold mb-3">{feature.title}</h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed italic">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Reviews Section */}
      <section className="mt-32 px-6 max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div className="max-w-xl">
            <h2 className="text-4xl font-bold tracking-tight mb-4">Built for students, by students</h2>
            <p className="text-slate-600 dark:text-slate-400 text-lg">
              We understand the late-night study sessions and the struggle to eat healthy on campus.
            </p>
          </div>
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-50 dark:bg-emerald-950/30 px-4 py-2 rounded-lg">
            <CheckCircle2 size={20} /> Verified Reviews
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {reviews.map((review) => (
            <div
              key={review.name}
              className="bg-slate-50 dark:bg-slate-800/50 border border-transparent dark:border-slate-800 rounded-3xl p-8 transition-colors hover:bg-white dark:hover:bg-slate-800 hover:border-slate-200 dark:hover:border-slate-700"
            >
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="text-orange-400 text-xl">★</span>
                ))}
              </div>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-lg italic mb-8 leading-relaxed">
                "{review.quote}"
              </p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-bold text-slate-500">
                  {review.name[0]}
                </div>
                <div>
                  <p className="font-bold text-slate-900 dark:text-white">{review.name}</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">{review.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Home;