import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Activity, ShieldCheck, ArrowRight, Database, 
  ChevronRight, Zap, Lock, Users, Globe, Command,
  Terminal, Server
} from 'lucide-react';

export const AdminLandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [isMounted, setIsMounted] = useState(false);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setIsMounted(true), 150);
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      clearTimeout(timer);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const fadeUp = (delay: string) => `transition-all duration-1000 ease-out ${isMounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'} ${delay}`;

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 font-sans selection:bg-emerald-500 selection:text-white overflow-x-hidden">
      
      {/* --- AMBIENT BACKGROUND --- */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#10b98110_1px,transparent_1px),linear-gradient(to_bottom,#10b98110_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-20" />
        <div 
          className="absolute top-[-20%] left-[-10%] w-[50rem] h-[50rem] bg-emerald-900/20 rounded-full blur-[150px]"
          style={{ transform: `translateY(${scrollY * 0.15}px)` }}
        />
        <div 
          className="absolute bottom-[-10%] right-[-10%] w-[50rem] h-[50rem] bg-cyan-900/20 rounded-full blur-[150px]"
          style={{ transform: `translateY(-${scrollY * 0.1}px)` }}
        />
      </div>

      {/* --- STICKY GLASS NAVBAR --- */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-700 ${scrollY > 20 ? 'bg-[#020617]/80 backdrop-blur-xl border-b border-white/5 py-4 shadow-2xl' : 'bg-transparent py-6'}`}>
        <div className={`flex justify-between items-center px-6 md:px-12 max-w-7xl mx-auto transition-opacity duration-1000 ${isMounted ? 'opacity-100' : 'opacity-0'}`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.3)] border border-white/20">
              <span className="text-slate-950 font-black text-xl tracking-tighter">KF</span>
            </div>
            <span className="text-xl font-bold tracking-tight text-white hidden sm:block">
              Kisan<span className="text-emerald-400">Flow</span> Admin
            </span>
          </div>
          <button 
            onClick={() => navigate('/login')}
            className="group relative px-6 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-sm font-bold text-white transition-all overflow-hidden backdrop-blur-md"
          >
            <span className="relative z-10 flex items-center gap-2">
              System Login <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </span>
          </button>
        </div>
      </nav>

      {/* --- CINEMATIC HERO SECTION --- */}
      <main className="relative z-20 pt-40 pb-20 px-6 md:px-12 max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16 min-h-[90vh]">
        
        {/* Left Column: Typography */}
        <div className="flex-1 space-y-8 w-full z-10">
          <h1 className={`text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-black leading-[1.05] tracking-tight text-white ${fadeUp('delay-100')}`}>
            Procurement, <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-cyan-300 to-teal-500 drop-shadow-lg">
              Re-engineered.
            </span>
          </h1>
          
          <p className={`text-lg lg:text-xl text-slate-400 leading-relaxed max-w-xl font-medium ${fadeUp('delay-200')}`}>
            Deploy the world's first AI-driven, volume-based capacity lock system. Eradicate yard bottlenecks and automate dynamic load balancing in milliseconds.
          </p>
          
          <div className={`pt-6 flex flex-wrap gap-4 ${fadeUp('delay-300')}`}>
            <button 
              onClick={() => navigate('/login')}
              className="group relative inline-flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 font-extrabold text-lg rounded-2xl shadow-[0_0_30px_rgba(16,185,129,0.3)] hover:shadow-[0_0_40px_rgba(16,185,129,0.5)] transition-all hover:-translate-y-1 active:translate-y-0"
            >
              Access Command Center
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button 
              onClick={() => window.scrollTo({ top: 800, behavior: 'smooth' })}
              className="px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl font-bold text-white transition-all backdrop-blur-md"
            >
              Explore Architecture
            </button>
          </div>
        </div>

        {/* Right Column: RICH CSS DATA VISUALIZER */}
        <div className={`flex-1 relative w-full h-[450px] lg:h-[600px] ${fadeUp('delay-[400ms]')}`}>
          <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/20 via-transparent to-cyan-500/10 rounded-3xl blur-3xl transform rotate-3" />
          
          <div className="relative w-full h-full rounded-3xl border border-white/10 bg-[#020617] overflow-hidden shadow-[0_0_50px_rgba(16,185,129,0.15)] flex items-center justify-center group">
            
            {/* 1. Dynamic Grid Layer */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#10b98110_1px,transparent_1px),linear-gradient(to_bottom,#10b98110_1px,transparent_1px)] bg-[size:2rem_2rem] group-hover:scale-110 transition-transform duration-[3000ms] ease-out" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_50%,transparent_20%,#020617_100%)]" />

            {/* 2. Glowing Plasma Orbs */}
            <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-emerald-500/20 rounded-full blur-[80px] mix-blend-screen animate-pulse" />
            <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-cyan-500/20 rounded-full blur-[80px] mix-blend-screen animate-pulse" style={{ animationDelay: '1s' }} />

            {/* 3. AI Waterfall Bar Chart Simulation */}
            <div className="absolute bottom-0 left-0 w-full h-1/2 flex items-end justify-between px-8 lg:px-16 pb-12 opacity-60 z-10">
              {[45, 75, 40, 95, 60, 30, 85, 55].map((height, i) => (
                <div key={i} className="relative w-6 lg:w-10 group-hover:w-12 transition-all duration-700 flex flex-col justify-end items-center">
                  <div 
                    className={`w-full rounded-t-lg bg-gradient-to-t ${i % 2 === 0 ? 'from-emerald-500/10 to-emerald-400/80 shadow-[0_0_15px_rgba(16,185,129,0.4)]' : 'from-cyan-500/10 to-cyan-400/80 shadow-[0_0_15px_rgba(6,182,212,0.4)]'}`}
                    style={{ height: isMounted ? `${height}%` : '0%', transition: `height 1.5s cubic-bezier(0.4, 0, 0.2, 1) ${i * 100}ms` }}
                  />
                  {/* Floating data dots */}
                  <div className={`absolute -top-4 w-1.5 h-1.5 rounded-full ${i % 2 === 0 ? 'bg-emerald-400' : 'bg-cyan-400'} opacity-0 group-hover:opacity-100 transition-opacity duration-700`} style={{ transitionDelay: `${i * 150}ms` }} />
                </div>
              ))}
            </div>

            {/* 4. Holographic Radar Rings */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
              {/* Outer Ring */}
              <div className="w-[320px] h-[320px] border border-emerald-500/20 rounded-full flex items-center justify-center border-dashed animate-[spin_60s_linear_infinite]">
                 {/* Middle Ring */}
                 <div className="w-[220px] h-[220px] border border-cyan-500/30 rounded-full animate-[spin_40s_linear_infinite_reverse] flex items-center justify-center border-dotted">
                    {/* Core Core */}
                    <div className="w-[100px] h-[100px] bg-slate-900/50 rounded-full backdrop-blur-xl border border-white/10 shadow-[0_0_40px_rgba(16,185,129,0.3)] flex items-center justify-center group-hover:scale-110 transition-transform duration-700">
                       <ShieldCheck className="w-10 h-10 text-emerald-400 opacity-90 animate-pulse" />
                    </div>
                 </div>
              </div>
            </div>
            
            {/* 5. Floating UI Element 1: Status */}
            <div className="absolute top-10 left-[-10px] lg:left-[-30px] bg-[#020617]/95 backdrop-blur-xl border border-white/10 p-5 rounded-2xl shadow-2xl w-64 lg:w-72 transform transition-transform hover:-translate-y-2 duration-500 z-30">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center"><Activity className="w-4 h-4 text-emerald-400" /></div>
                  <div className="text-xs font-bold text-slate-300">System Uplink Active</div>
                </div>
                <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_#10b981]"></span>
              </div>
              <div className="space-y-3">
                <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden"><div className="h-full bg-emerald-500 w-[85%] rounded-full" /></div>
                <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden"><div className="h-full bg-cyan-500 w-[42%] rounded-full" /></div>
                <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden"><div className="h-full bg-emerald-500 w-[95%] rounded-full" /></div>
              </div>
            </div>

            {/* 6. Floating UI Element 2: Capacity */}
            <div className="absolute bottom-12 right-[-10px] lg:right-[-30px] bg-[#020617]/95 backdrop-blur-xl border border-white/10 p-5 rounded-2xl shadow-2xl w-56 lg:w-64 transform transition-transform hover:-translate-y-2 duration-500 z-30">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-teal-500/20 flex items-center justify-center border border-teal-500/30 shadow-[0_0_15px_rgba(20,184,166,0.3)]">
                  <span className="text-teal-400 font-bold text-lg">480</span>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 uppercase tracking-wider font-bold mb-0.5">Physical Limit</div>
                  <div className="text-sm font-bold text-white">Quintals / Hour</div>
                </div>
              </div>
            </div>

            {/* 7. Code Stream Overlay (Simulated Terminal) */}
            <div className="absolute top-4 right-4 text-[8px] md:text-[10px] font-mono text-emerald-500/40 text-right opacity-0 group-hover:opacity-100 transition-opacity duration-1000 hidden md:block z-10">
              <div>INITIALIZING WATERFALL DISPATCHER...</div>
              <div>CONNECTING TO SUPABASE WSS://...</div>
              <div>[200 OK] REALTIME REPLICATION ENABLED</div>
              <div>CALCULATING VOLUME CAPS: 480 Qtl</div>
            </div>

          </div>
        </div>
      </main>

      {/* --- DATA TICKER STRIP --- */}
      <div className="relative z-20 border-y border-white/5 bg-white/[0.02] py-10 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-2 md:grid-cols-4 gap-8 text-center sm:text-left">
          <div className="space-y-1">
            <div className="text-3xl lg:text-4xl font-black text-white">0.4s</div>
            <div className="text-xs text-slate-400 uppercase tracking-widest font-bold">WebSocket Latency</div>
          </div>
          <div className="space-y-1">
            <div className="text-3xl lg:text-4xl font-black text-emerald-400">100%</div>
            <div className="text-xs text-slate-400 uppercase tracking-widest font-bold">Overflow Prevention</div>
          </div>
          <div className="space-y-1">
            <div className="text-3xl lg:text-4xl font-black text-cyan-400">Volumetric</div>
            <div className="text-xs text-slate-400 uppercase tracking-widest font-bold">AI Load Forecasting</div>
          </div>
          <div className="space-y-1">
            <div className="text-3xl lg:text-4xl font-black text-white">256-bit</div>
            <div className="text-xs text-slate-400 uppercase tracking-widest font-bold">State Encryption</div>
          </div>
        </div>
      </div>

      {/* --- HOW IT WORKS WORKFLOW --- */}
      <section className="relative z-20 py-32 px-6 md:px-12 max-w-7xl mx-auto">
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-4">The Volume Waterfall.</h2>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">Traditional systems count heads. We calculate physical grain tonnage to completely eradicate processing bottlenecks.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 relative">
          <div className="hidden md:block absolute top-12 left-1/6 right-1/6 h-0.5 bg-gradient-to-r from-emerald-500/0 via-emerald-500/30 to-emerald-500/0 z-0" />
          
          <div className="relative z-10 bg-slate-900/40 border border-white/10 rounded-3xl p-8 backdrop-blur-sm">
            <div className="w-16 h-16 rounded-2xl bg-[#020617] border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-6 shadow-[0_0_20px_rgba(16,185,129,0.2)]">
              <Globe className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">1. Field Generation</h3>
            <p className="text-slate-400 text-sm leading-relaxed">Farmers input their precise harvest weight via the mobile app. The system immediately captures the incoming load signature.</p>
          </div>

          <div className="relative z-10 bg-slate-900/40 border border-white/10 rounded-3xl p-8 backdrop-blur-sm">
            <div className="w-16 h-16 rounded-2xl bg-[#020617] border border-cyan-500/30 flex items-center justify-center text-cyan-400 mb-6 shadow-[0_0_20px_rgba(6,182,212,0.2)]">
              <Zap className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">2. AI Logic Check</h3>
            <p className="text-slate-400 text-sm leading-relaxed">The algorithm compares incoming Qtl limits against the active infrastructure of the selected Mandi in real-time.</p>
          </div>

          <div className="relative z-10 bg-slate-900/40 border border-white/10 rounded-3xl p-8 backdrop-blur-sm">
            <div className="w-16 h-16 rounded-2xl bg-[#020617] border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-6 shadow-[0_0_20px_rgba(16,185,129,0.2)]">
              <Lock className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">3. Capacity Lock</h3>
            <p className="text-slate-400 text-sm leading-relaxed">If physical limits are breached, the system water-falls the booking to the next available hour, hard-locking overcapacity.</p>
          </div>
        </div>
      </section>

      {/* --- BENTO BOX FEATURES GRID --- */}
      <section className="relative z-20 py-10 px-6 md:px-12 max-w-7xl mx-auto pb-32">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          <div className="md:col-span-2 group relative rounded-3xl bg-slate-900/40 border border-white/10 p-8 md:p-10 overflow-hidden hover:bg-slate-900/60 transition-colors">
            <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl group-hover:bg-emerald-500/20 transition-colors" />
            <div className="relative z-10 h-full flex flex-col justify-between">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-8">
                <Command className="w-7 h-7" />
              </div>
              <div className="max-w-md">
                <h3 className="text-3xl font-bold text-white mb-3">God-Mode Administration.</h3>
                <p className="text-slate-400 leading-relaxed text-base">Centralize your entire operational command. Monitor wait times, verify secure gate passes with internal QR scanners, and trigger emergency infrastructure changes globally.</p>
              </div>
            </div>
          </div>

          <div className="group relative rounded-3xl bg-slate-900/40 border border-white/10 p-8 overflow-hidden hover:bg-slate-900/60 transition-colors flex flex-col justify-between">
            <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-3xl group-hover:bg-cyan-500/20 transition-colors" />
            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mb-8">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white mb-2">Supabase Engine</h3>
              <p className="text-sm text-slate-400 leading-relaxed">Instantaneous web-socket replication syncing the command center directly with the mobile field app.</p>
            </div>
          </div>

          <div className="group relative rounded-3xl bg-slate-900/40 border border-white/10 p-8 overflow-hidden hover:bg-slate-900/60 transition-colors flex flex-col justify-between">
             <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-8">
               <Server className="w-6 h-6" />
             </div>
             <div>
               <h3 className="text-xl font-bold text-white mb-2">Automated Resource AI</h3>
               <p className="text-sm text-slate-400 leading-relaxed">System automatically calculates required labor pools and active counters based on incoming hourly loads.</p>
             </div>
          </div>

          <div className="md:col-span-3 group relative rounded-3xl bg-slate-900/40 border border-white/10 p-8 overflow-hidden hover:bg-slate-900/60 transition-colors flex flex-col justify-between">
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-emerald-500/5 to-cyan-500/5" />
             <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-8">
               <div className="flex-1">
                 <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white mb-6">
                   <Terminal className="w-6 h-6" />
                 </div>
                 <h3 className="text-2xl font-bold text-white mb-2">Secure Mandi Operations</h3>
                 <p className="text-slate-400 max-w-lg">Every transaction is logged in the central registry, ensuring transparent procurement processing from farm to facility without the need for external images or bloated dependencies.</p>
               </div>
             </div>
          </div>

        </div>
      </section>

      {/* --- HUGE FOOTER CTA --- */}
      <footer className="relative z-20 border-t border-white/5 bg-[#020617] pt-24 pb-12 text-center overflow-hidden">
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-full max-w-4xl h-[1px] bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent" />
        
        <div className="max-w-7xl mx-auto px-8 flex flex-col items-center justify-center space-y-8 relative z-10">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center shadow-[0_0_30px_rgba(16,185,129,0.3)]">
             <span className="text-slate-950 font-black text-3xl tracking-tighter">KF</span>
          </div>
          
          <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight">Deploy your infrastructure.</h2>
          
          <button 
            onClick={() => navigate('/login')}
            className="px-10 py-4 bg-white text-slate-950 rounded-full text-base font-extrabold hover:bg-slate-200 transition-all hover:scale-105 shadow-[0_0_20px_rgba(255,255,255,0.2)] mt-4"
          >
            Enter Admin Portal
          </button>

          <div className="mt-16 pt-10 border-t border-white/5 w-full flex flex-col items-center gap-4">
            <p className="text-slate-500 text-sm font-medium">Empowering agricultural logistics with real-time intelligence.</p>
            <div className="px-5 py-2.5 rounded-full bg-white/[0.03] border border-white/10 mt-2 hover:bg-white/[0.05] transition-colors cursor-default">
               <p className="text-[11px] text-slate-400 font-mono font-semibold uppercase tracking-widest">
                 Built by <span className="text-emerald-400 drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]">Code Drifter</span>
               </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};