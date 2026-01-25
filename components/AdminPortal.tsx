
import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, Lock, Activity, Cpu, Globe, AlertTriangle, 
  Zap, Database, LogOut, Terminal, Power, Sliders, 
  RefreshCcw, ShieldAlert, Monitor, Key, Fingerprint
} from 'lucide-react';
import { SystemState } from '../types';
import { authService } from '../services/authService';
import { AI_STRATEGIES } from '../constants';

interface Props {
  systemState: SystemState;
  onUpdateSystem: (updates: Partial<SystemState>) => void;
  onExit: () => void;
}

const AdminPortal: React.FC<Props> = ({ systemState, onUpdateSystem, onExit }) => {
  const [elevatedStep, setElevatedStep] = useState<'LOGIN' | 'PASSCODE' | 'COMMAND'>('LOGIN');
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [passcode, setPasscode] = useState('');
  const [error, setError] = useState('');

  const handleInitialAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const user = await authService.login(email, pass);
    if (user && user.role === 'ADMIN') {
      setElevatedStep('PASSCODE');
    } else {
      setError('Invalid Administrative Credentials.');
    }
  };

  const handlePasscodeAuth = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (authService.verifyAdminPasscode(passcode)) {
      setElevatedStep('COMMAND');
    } else {
      setError('Invalid Access Token.');
      setPasscode('');
    }
  };

  if (elevatedStep === 'LOGIN') {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-[#0a0a0a] border border-blue-900/30 p-10 rounded-2xl shadow-[0_0_50px_rgba(30,58,138,0.2)] space-y-8">
          <div className="text-center space-y-2">
            <Lock size={40} className="mx-auto text-blue-500 mb-2" />
            <h2 className="text-2xl font-black tracking-tighter text-white">ADMINISTRATIVE LOGIN</h2>
            <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Secure Command Node Entrance</p>
          </div>
          <form onSubmit={handleInitialAuth} className="space-y-4">
            <input 
              type="email" required value={email} onChange={(e) => setEmail(e.target.value)} 
              placeholder="Admin Email" 
              className="w-full bg-[#050505] border border-blue-900/20 p-4 rounded-xl text-white outline-none focus:border-blue-500 transition-all" 
            />
            <input 
              type="password" required value={pass} onChange={(e) => setPass(e.target.value)} 
              placeholder="Primary Password" 
              className="w-full bg-[#050505] border border-blue-900/20 p-4 rounded-xl text-white outline-none focus:border-blue-500 transition-all" 
            />
            {error && <p className="text-red-500 text-[10px] font-bold text-center uppercase tracking-widest">{error}</p>}
            <button type="submit" className="w-full bg-blue-700 hover:bg-blue-600 py-4 rounded-xl font-bold text-white transition-all shadow-lg shadow-blue-900/20">ACCESS NODE</button>
          </form>
          <button onClick={onExit} className="w-full text-center text-gray-600 text-xs hover:text-white transition-all">Cancel Access Request</button>
        </div>
      </div>
    );
  }

  if (elevatedStep === 'PASSCODE') {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-[#0a0a0a] border border-red-900/30 p-10 rounded-2xl shadow-[0_0_50px_rgba(153,27,27,0.2)] space-y-8">
          <div className="text-center space-y-2">
            <Fingerprint size={40} className="mx-auto text-red-500 mb-2" />
            <h2 className="text-2xl font-black tracking-tighter text-white">SECONDARY CHALLENGE</h2>
            <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Elevated Verification Required</p>
          </div>
          <form onSubmit={handlePasscodeAuth} className="space-y-6">
            <input 
              type="password" required value={passcode} onChange={(e) => setPasscode(e.target.value)} 
              placeholder="000 000 000" 
              className="w-full bg-[#050505] border border-red-900/20 p-5 rounded-xl text-center text-3xl tracking-widest text-red-500 outline-none focus:border-red-500 transition-all" 
              autoFocus
            />
            {error && <p className="text-red-500 text-[10px] font-bold text-center uppercase tracking-widest">{error}</p>}
            <button type="submit" className="w-full bg-red-700 hover:bg-red-600 py-4 rounded-xl font-bold text-white transition-all">UNLOCH COMMAND PORTAL</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-gray-300 flex flex-col font-sans">
      {/* Admin Header */}
      <header className="h-16 border-b border-white/5 bg-[#0a0a0a] flex items-center justify-between px-8">
        <div className="flex items-center gap-4">
          <ShieldCheck className="text-blue-500" size={24} />
          <div>
            <h1 className="font-black text-white tracking-tight">ALPHATRADE <span className="text-blue-500">ACC</span></h1>
            <p className="text-[8px] font-bold text-gray-500 uppercase tracking-widest -mt-1">Administrative Command Center</p>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 bg-blue-500/10 px-3 py-1.5 rounded-full border border-blue-500/20">
            <div className="size-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-[10px] font-black text-blue-400 uppercase tracking-tighter">System Health: Nominal</span>
          </div>
          <button onClick={onExit} className="flex items-center gap-2 text-gray-500 hover:text-white transition-all">
            <LogOut size={18} />
            <span className="text-xs font-bold uppercase">Terminate Session</span>
          </button>
        </div>
      </header>

      {/* Main Dashboard */}
      <main className="flex-1 p-8 grid grid-cols-1 lg:grid-cols-4 gap-8 overflow-y-auto">
        
        {/* Real-time Status Grid */}
        <div className="lg:col-span-3 space-y-8">
          <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-[#0a0a0a] border border-white/5 p-6 rounded-2xl space-y-4">
               <div className="flex justify-between items-center">
                  <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest">Global Bridges</h3>
                  <Monitor size={16} className="text-blue-500" />
               </div>
               <p className="text-3xl font-black text-white">1,402</p>
               <div className="flex justify-between text-[10px] font-bold">
                  <span className="text-green-500">Active: 1,390</span>
                  <span className="text-red-500">Alerts: 12</span>
               </div>
            </div>
            <div className="bg-[#0a0a0a] border border-white/5 p-6 rounded-2xl space-y-4">
               <div className="flex justify-between items-center">
                  <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest">AI Throughput</h3>
                  <Zap size={16} className="text-yellow-500" />
               </div>
               <p className="text-3xl font-black text-white">842/hr</p>
               <div className="flex justify-between text-[10px] font-bold">
                  <span className="text-blue-400">Avg Conf: 82%</span>
               </div>
            </div>
            <div className="bg-[#0a0a0a] border border-white/5 p-6 rounded-2xl space-y-4">
               <div className="flex justify-between items-center">
                  <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest">Global Latency</h3>
                  <Activity size={16} className="text-emerald-500" />
               </div>
               <p className="text-3xl font-black text-white">14.2ms</p>
               <div className="flex justify-between text-[10px] font-bold">
                  <span className="text-emerald-500">Tier 1 Nodes: Peak</span>
               </div>
            </div>
          </section>

          {/* AI Orchestration Console */}
          <section className="bg-[#0a0a0a] border border-white/5 rounded-2xl overflow-hidden">
            <div className="p-6 border-b border-white/5 flex justify-between items-center">
               <h3 className="font-black text-white flex items-center gap-2">
                 <Cpu size={18} className="text-blue-500" /> AI CORE CALIBRATION
               </h3>
               <div className="flex gap-2">
                  <button className="bg-red-500/10 text-red-500 px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest border border-red-500/20 hover:bg-red-500 hover:text-white transition-all">
                    System Kill Switch
                  </button>
               </div>
            </div>
            <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-12">
               <div className="space-y-6">
                  <div className="space-y-2">
                    <div className="flex justify-between items-end">
                       <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Min Confidence Filter</label>
                       <span className="text-xl font-black text-blue-500">{systemState.confidenceThreshold}%</span>
                    </div>
                    <input 
                       type="range" min="50" max="95" 
                       value={systemState.confidenceThreshold} 
                       onChange={(e) => onUpdateSystem({ confidenceThreshold: parseInt(e.target.value) })}
                       className="w-full h-2 bg-[#050505] rounded-lg appearance-none cursor-pointer accent-blue-500"
                    />
                  </div>

                  <div className="space-y-4 pt-4 border-t border-white/5">
                     <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Active Signal Modules</p>
                     {[
                       { id: 'aiModulesEnabled', label: 'Neural Analysis Engine' },
                       { id: 'forexSignalsEnabled', label: 'FX Liquidity Scanner' },
                       { id: 'binarySignalsEnabled', label: 'Binary Volatility Node' }
                     ].map(mod => (
                        <div key={mod.id} className="flex items-center justify-between p-4 bg-[#050505] rounded-xl border border-white/5">
                           <span className="text-xs font-bold text-gray-400">{mod.label}</span>
                           <button 
                             onClick={() => onUpdateSystem({ [mod.id]: !systemState[mod.id as keyof SystemState] })}
                             className={`w-12 h-6 rounded-full relative transition-all ${systemState[mod.id as keyof SystemState] ? 'bg-blue-600' : 'bg-gray-800'}`}
                           >
                             <div className={`absolute top-1 size-4 bg-white rounded-full transition-all ${systemState[mod.id as keyof SystemState] ? 'left-7' : 'left-1'}`} />
                           </button>
                        </div>
                     ))}
                  </div>
               </div>

               <div className="space-y-6">
                  <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Strategy Marketplace Inventory</p>
                  <div className="space-y-3 overflow-y-auto max-h-80 pr-2">
                     {AI_STRATEGIES.map(s => (
                        <div key={s.id} className="p-4 bg-[#050505] rounded-xl border border-white/5 flex justify-between items-center group hover:border-blue-500/30 transition-all">
                           <div>
                              <p className="text-xs font-bold text-gray-200">{s.name}</p>
                              <p className="text-[9px] text-gray-600 uppercase font-black tracking-tighter">Current ROI Factor: {s.winRate}%</p>
                           </div>
                           <button className="text-gray-600 group-hover:text-blue-500 transition-all">
                              <Sliders size={16} />
                           </button>
                        </div>
                     ))}
                  </div>
               </div>
            </div>
          </section>
        </div>

        {/* System Logs & Broadcast */}
        <div className="space-y-8">
           <section className="bg-[#0a0a0a] border border-white/5 p-6 rounded-2xl space-y-4">
              <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest border-b border-white/5 pb-4 flex items-center gap-2">
                <Database size={14} className="text-blue-500" /> Node Infrastructure
              </h3>
              <div className="space-y-3">
                 <div className="flex justify-between items-center">
                    <span className="text-[10px] text-gray-600 font-bold">API Vault Status</span>
                    <span className="text-[10px] text-green-500 font-black">ENCRYPTED</span>
                 </div>
                 <div className="flex justify-between items-center">
                    <span className="text-[10px] text-gray-600 font-bold">EA Client Sync</span>
                    <span className="text-[10px] text-blue-500 font-black">ACTIVE</span>
                 </div>
                 <button className="w-full mt-4 bg-[#050505] border border-white/10 hover:border-blue-500/30 py-3 rounded-xl text-[10px] font-black text-gray-400 uppercase tracking-widest transition-all">
                    Update All Helper EA
                 </button>
              </div>
           </section>

           <section className="bg-[#0a0a0a] border border-white/5 p-6 rounded-2xl space-y-4">
              <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest border-b border-white/5 pb-4 flex items-center gap-2">
                 <Terminal size={14} className="text-blue-500" /> Command Log
              </h3>
              <div className="space-y-3 h-64 overflow-y-auto pr-2 custom-scrollbar">
                 {[1,2,3,4,5,6].map(i => (
                    <div key={i} className="text-[9px] font-mono text-gray-600 border-l border-blue-500/30 pl-3 py-1">
                       <span className="text-blue-500/50">14:02:{20+i}</span> - NODE_{i*2} connected. Auth verified.
                    </div>
                 ))}
              </div>
           </section>

           <button className="w-full bg-blue-600 hover:bg-blue-500 py-4 rounded-2xl font-black text-white text-xs uppercase tracking-widest transition-all shadow-xl shadow-blue-900/10 flex items-center justify-center gap-2">
              <RefreshCcw size={14} /> REFRESH COMMAND DATA
           </button>
        </div>
      </main>
    </div>
  );
};

export default AdminPortal;
