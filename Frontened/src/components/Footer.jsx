import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const quickLinks = [
  { name: "Daily Snapshot", path: "/snapshot" },
  { name: "Food Analysis", path: "/food" },
  { name: "Campus Environment", path: "/environment" },
];

const Footer = () => {
  return (
    <footer className="mt-auto bg-slate-950 text-white">
      {/* 1. The High-Clarity Image Section */}
      <section className="relative h-[250px] md:h-[350px] w-full overflow-hidden border-b border-slate-800">
        <img 
          src="/earth-banner.png" 
          alt="Earth Horizon" 
          className="w-full h-full object-cover object-center"
        />
        {/* Soft overlay to blend the image into the dark footer below */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />
        
        {/* Floating Text on the image */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
          <motion.h2 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-3xl md:text-5xl font-black tracking-tighter"
          >
            GLOBAL AWARENESS. <br/> <span className="text-blue-400">PERSONAL CARE.</span>
          </motion.h2>
        </div>
      </section>

      {/* 2. The Navigation Section (Solid background for clarity) */}
      <section className="max-w-7xl mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-4 gap-12 text-sm">
        <div className="space-y-4">
          <div className="text-2xl font-black flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-blue-500" /> StudentCare
          </div>
          <p className="text-slate-400 leading-relaxed">
            Your health companion for the university journey.
          </p>
        </div>

        <div>
          <h5 className="font-bold mb-6 text-slate-500 uppercase tracking-widest text-xs">Navigation</h5>
          <ul className="space-y-4">
            {quickLinks.map((link) => (
              <li key={link.name}>
                <Link to={link.path} className="text-slate-300 hover:text-blue-400 transition-colors">
                  {link.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h5 className="font-bold mb-6 text-slate-500 uppercase tracking-widest text-xs">Connect</h5>
          <ul className="space-y-4 text-slate-300">
            <li className="hover:text-white cursor-pointer transition-colors">Twitter</li>
            <li className="hover:text-white cursor-pointer transition-colors">LinkedIn</li>
          </ul>
        </div>

        <div>
          <h5 className="font-bold mb-6 text-slate-500 uppercase tracking-widest text-xs">Contact</h5>
          <div className="text-slate-300 space-y-2">
            <p>Wellness Center, Sector 10</p>
            <p className="text-blue-400 font-medium">help@studentcare.edu</p>
          </div>
        </div>
      </section>

      {/* 3. The Bottom Bar */}
      <section className="border-t border-slate-900 px-6 py-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] tracking-[0.2em] text-slate-500 uppercase">
          <p>© {new Date().getFullYear()} StudentCare Systems</p>
          <div className="flex gap-8">
            <span className="hover:text-slate-300 cursor-pointer">Privacy</span>
            <span className="hover:text-slate-300 cursor-pointer">Terms</span>
          </div>
        </div>
      </section>
    </footer>
  );
};

export default Footer;