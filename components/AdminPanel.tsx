
import React, { useState } from 'react';
import { 
  Users, Activity, BarChart, Bell, ShieldCheck, AlertCircle, 
  Lock, Power, Sliders, MessageSquare, Globe, Eye, Zap,
  Monitor, RefreshCcw, ShieldAlert
} from 'lucide-react';
import { SystemState } from '../types';
import { FOREX_PAIRS, AI_STRATEGIES } from '../constants';
import { authService } from '../services/authService';

interface Props {
  systemState: SystemState;
  onUpdateSystem: (updates: Partial<SystemState>) => void;
}

const AdminPanel: React.FC<Props> = ({ systemState, onUpdateSystem }) => {
  const [passcode, setPasscode] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [error, setError] = useState('');

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (authService.verifyAdminPasscode(passcode)) {
      setIsUnlocked(true);
      setError('');
    } else {
      setError('Invalid Access Passcode.');
      setPasscode('');
    }
  };

  if (!isUnlocked) {
    return (
      <div className="h-full flex items-center justify-center bg-[#0b0e11] p-6">
        <form onSubmit={handleUnlock} className="max-w-md w-full bg-[#161a1e] border border-[#1e2329] p-8 rounded-2xl space-y-6 shadow-2xl">
          <div className="text-center space-y-2">
            <Lock size={32} className="mx-auto text-blue-500 mb-4" />
            <h2 className="text-xl font-bold">Control Node Access</h2>
            <p className="text-xs text-gray-500">Production authentication required.</p>
          </div>
          <input 
            type="password" 
            value={passcode} 
            onChange={(e) => setPasscode(e.target.value)} 
            placeholder="Security Passcode" 
            className="w-full bg-[#0b0e11] border border-[#2b2f36] p-4 rounded-xl text-center text-2xl tracking-widest focus:border-blue-500 outline-none" 
            autoFocus
          />
          {error && <p className="text-red-500 text-xs text-center font-bold">{error}</p>}
          <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 py-4 rounded-xl font-bold transition-all">Secure Unlock</button>
        </form>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8 overflow-y-auto h-full bg-[#0b0e11] animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-end">
         <div>
            <h2 className="text-3xl font-black flex items-center gap-3">
              <ShieldCheck className="text-green-500" /> Command Center
            </h2>
            <p className="text-gray-500 text-sm">Real-time system orchestration and AI tuning node.</p>
         </div>
         <div className="flex gap-3">
            <button className="flex items-center gap-2 px-4 py-2 bg-yellow-500/10 text-yellow-500 rounded-lg text-xs font-bold border border-yellow-500/20">
               <ShieldAlert size={14}/> EMERGENCY SHUTDOWN
            </button>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* AI & System Tuning */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-[#161a1e] rounded-2xl border border-[#1e2329] p-8 space-y-8">
            <div className="flex items-center justify-between border-b border-[#1e2329] pb-4">
               <h3 className="font-bold flex items-center gap-2 text-lg">
                 <Zap size={20} className="text-yellow-500" /> AI Logic Calibration
               </h3>
               <span className="text-[10px] font-black bg-blue-500/10 text-blue-500 px-2 py-0.5 rounded-full">ACTIVE NODE</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-black uppercase tracking-widest">
                    <span className="text-gray-500">Confidence Threshold</span>
                    <span className="text-blue-500">{systemState.confidenceThreshold}%</span>
                  </div>
                  <input 
                    type="range" min="50" max="95" 
                    value={systemState.confidenceThreshold} 
                    onChange={(e) => onUpdateSystem({ confidenceThreshold: parseInt(e.target.value) })} 
                    className="w-full h-1.5 bg-[#0b0e11] rounded-lg appearance-none cursor-pointer accent-blue-500" 
                  />
                  <p className="text-[10px] text-gray-600 leading-relaxed italic">Signals below this calculated probability are discarded system-wide.</p>
                </div>

                <div className="space-y-3 pt-4 border-t border-[#1e2329]">
                   <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Global Module Override</p>
                   {[
                    { id: 'aiModulesEnabled', label: 'AI Core Analysis' },
                    { id: 'forexSignalsEnabled', label: 'Forex Signal Node' },
                    { id: 'binarySignalsEnabled', label: 'Binary Signal Node' },
                   ].map(mod => (
                    <div key={mod.id} className="flex items-center justify-between p-3 bg-[#0b0e11] rounded-xl border border-[#1e2329] hover:border-blue-500/30 transition-all group">
                      <span className="text-xs font-bold text-gray-300">{mod.label}</span>
                      <button 
                        onClick={() => onUpdateSystem({ [mod.id]: !systemState[mod.id as keyof SystemState] })} 
                        className={`w-10 h-5 rounded-full relative transition-all ${systemState[mod.id as keyof SystemState] ? 'bg-green-600' : 'bg-[#2b2f36]'}`}
                      >
                        <div className={`absolute top-1 size-3 bg-white rounded-full transition-all ${systemState[mod.id as keyof SystemState] ? 'left-6' : 'left-1'}`} />
                      </button>
                    </div>
                   ))}
                </div>
              </div>

              <div className="space-y-4">
                 <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Strategy Marketplace Status</p>
                 <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
                    {AI_STRATEGIES.map(s => (
                      <div key={s.id} className="p-3 bg-[#0b0e11] rounded-xl border border-[#1e2329] space-y-1">
                         <div className="flex justify-between items-center">
                            <span className="text-xs font-bold text-gray-200">{s.name}</span>
                            <span className="text-[8px] bg-green-500/10 text-green-500 px-1.5 rounded uppercase font-black">Online</span>
                         </div>
                         <p className="text-[9px] text-gray-500">Live Win Rate: <span className="text-blue-400">{s.winRate}%</span></p>
                      </div>
                    ))}
                 </div>
              </div>
            </div>
          </div>

          <div className="bg-[#161a1e] rounded-2xl border border-[#1e2329] p-8">
             <div className="flex items-center justify-between border-b border-[#1e2329] pb-4 mb-6">
                <h3 className="font-bold flex items-center gap-2 text-lg">
                  <Monitor size={20} className="text-blue-500" /> EA Remote Orchestration
                </h3>
             </div>
             <div className="flex items-center justify-between p-4 bg-[#0b0e11] rounded-2xl border border-[#1e2329]">
                <div className="space-y-1">
                   <p className="text-sm font-bold">EA Client Control</p>
                   <p className="text-xs text-gray-500">Allow remote enabling/disabling of local EA bridges.</p>
                </div>
                <button 
                   onClick={() => onUpdateSystem({ remoteEAControl: !systemState.remoteEAControl })} 
                   className={`w-12 h-6 rounded-full relative transition-all ${systemState.remoteEAControl ? 'bg-blue-600' : 'bg-[#2b2f36]'}`}
                >
                   <div className={`absolute top-1 size-4 bg-white rounded-full transition-all ${systemState.remoteEAControl ? 'left-7' : 'left-1'}`} />
                </button>
             </div>
          </div>
        </div>

        {/* Global Broadcast & Logs */}
        <div className="space-y-6">
           <div className="bg-[#161a1e] rounded-2xl border border-[#1e2329] p-6 space-y-4">
              <h3 className="font-bold flex items-center gap-2 text-sm border-b border-[#1e2329] pb-4">
                 <Bell size={16} className="text-yellow-500" /> Push Announcement
              </h3>
              <textarea 
                 placeholder="Message all connected terminals..."
                 className="w-full bg-[#0b0e11] border border-[#1e2329] rounded-xl p-4 text-xs focus:border-blue-500 outline-none h-32"
              />
              <button className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl text-xs transition-all flex items-center justify-center gap-2">
                 <Globe size={14}/> BROADCAST NOW
              </button>
           </div>

           <div className="bg-[#161a1e] rounded-2xl border border-[#1e2329] p-6 space-y-4">
              <h3 className="font-bold flex items-center gap-2 text-sm border-b border-[#1e2329] pb-4">
                 <Activity size={16} className="text-emerald-500" /> Network Health
              </h3>
              <div className="space-y-3">
                 <div className="flex justify-between items-center text-[10px]">
                    <span className="text-gray-500 uppercase font-bold">Active Clients</span>
                    <span className="text-gray-200 mono">1,284</span>
                 </div>
                 <div className="flex justify-between items-center text-[10px]">
                    <span className="text-gray-500 uppercase font-bold">Bridge Latency</span>
                    <span className="text-green-500 mono">~12ms</span>
                 </div>
                 <div className="flex justify-between items-center text-[10px]">
                    <span className="text-gray-500 uppercase font-bold">Signal Discard Rate</span>
                    <span className="text-red-500 mono">14.2%</span>
                 </div>
                 <button className="w-full bg-[#0b0e11] hover:bg-[#1e2329] text-gray-500 py-2 rounded-lg border border-[#1e2329] text-[9px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 mt-2">
                    <RefreshCcw size={10}/> Restart All Nodes
                 </button>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
