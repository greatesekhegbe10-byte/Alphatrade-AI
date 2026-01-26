
import React, { useState } from 'react';
import { 
  ShieldCheck, Lock, Activity, Cpu, 
  Zap, LogOut, Fingerprint, HeartPulse, Radiation, BarChart3, Settings2
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
  const [activeTab, setActiveTab] = useState<'SYSTEM' | 'STRATEGY'>('SYSTEM');
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [passcode, setPasscode] = useState('');
  const [error, setError] = useState('');

  const handleInitialAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    // Fix: authService.login returns AuthResponse, not User. Accessing res.user.role.
    const res = await authService.login(email, pass);
    if (res && res.user.role === 'ADMIN') {
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
        <div className="w-full max-w-md bg-[#0a0a0a] border border-blue-900/30 p-10 rounded-3xl shadow-2xl space-y-8">
          <div className="text-center space-y-2">
            <Lock size={40} className="mx-auto text-blue-500 mb-2" />
            <h2 className="text-2xl font-black tracking-tighter text-white uppercase">Terminal Control Gate</h2>
          </div>
          <form onSubmit={handleInitialAuth} className="space-y-4">
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Node ID" className="w-full bg-[#050505] border border-blue-900/20 p-4 rounded-xl text-white outline-none focus:border-blue-500 transition-all text-sm font-bold" />
            <input type="password" required value={pass} onChange={(e) => setPass(e.target.value)} placeholder="Passphrase" className="w-full bg-[#050505] border border-blue-900/20 p-4 rounded-xl text-white outline-none focus:border-blue-500 transition-all text-sm font-bold" />
            {error && <p className="text-red-500 text-[10px] font-black text-center uppercase tracking-widest">{error}</p>}
            <button type="submit" className="w-full bg-blue-700 hover:bg-blue-600 py-4 rounded-xl font-black text-white transition-all text-xs uppercase tracking-[0.2em] shadow-lg shadow-blue-700/20">Authenticate</button>
          </form>
          <button onClick={onExit} className="w-full text-center text-gray-700 text-[10px] hover:text-white transition-all font-black uppercase tracking-widest">Cancel</button>
        </div>
      </div>
    );
  }

  if (elevatedStep === 'PASSCODE') {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-[#0a0a0a] border border-red-900/30 p-10 rounded-3xl shadow-2xl space-y-8">
          <div className="text-center space-y-2">
            <Fingerprint size={48} className="mx-auto text-red-500 mb-2" />
            <h2 className="text-2xl font-black tracking-tighter text-white uppercase">2FA Challenge Required</h2>
          </div>
          <form onSubmit={handlePasscodeAuth} className="space-y-6">
            <input type="password" required value={passcode} onChange={(e) => setPasscode(e.target.value)} placeholder="000000" className="w-full bg-[#050505] border border-red-900/20 p-5 rounded-xl text-center text-4xl tracking-widest text-red-500 outline-none font-black" autoFocus />
            {error && <p className="text-red-500 text-[10px] font-black text-center uppercase tracking-widest">{error}</p>}
            <button type="submit" className="w-full bg-red-700 hover:bg-red-600 py-4 rounded-xl font-black text-white transition-all text-xs uppercase tracking-[0.2em] shadow-lg shadow-red-700/20">Finalize Node Auth</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-gray-300 flex flex-col">
      <header className="h-20 border-b border-white/5 bg-[#0a0a0a] flex items-center justify-between px-10 shrink-0 shadow-2xl">
        <div className="flex items-center gap-12">
          <div className="flex items-center gap-4">
            <ShieldCheck className="text-blue-500" size={32} />
            <h1 className="font-black text-white tracking-tighter text-2xl uppercase">Alpha Command</h1>
          </div>
          <div className="flex bg-[#050505] p-1 rounded-2xl border border-white/5">
            <button onClick={() => setActiveTab('SYSTEM')} className={`px-6 py-2.5 rounded-xl text-[10px] font-black tracking-widest transition-all ${activeTab === 'SYSTEM' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:text-white'}`}>SYSTEM NODE</button>
            <button onClick={() => setActiveTab('STRATEGY')} className={`px-6 py-2.5 rounded-xl text-[10px] font-black tracking-widest transition-all ${activeTab === 'STRATEGY' ? 'bg-purple-600 text-white' : 'text-gray-600 hover:text-white'}`}>STRATEGY HEALTH</button>
          </div>
        </div>
        <div className="flex items-center gap-6">
           <button 
             onClick={() => onUpdateSystem({ killSwitchActive: !systemState.killSwitchActive })}
             className={`px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase transition-all flex items-center gap-2 border ${systemState.killSwitchActive ? 'bg-red-600 text-white border-red-500' : 'bg-red-500/10 text-red-500 border-red-500/20 hover:bg-red-500/20'}`}
           >
             <Radiation size={16}/> {systemState.killSwitchActive ? 'Disengage Kill-Switch' : 'System Kill-Switch'}
           </button>
           <button onClick={onExit} className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-xl text-gray-600 hover:text-red-500 border border-white/5 font-black text-[10px] uppercase">
            <LogOut size={16} /> Exit Terminal
          </button>
        </div>
      </header>

      <main className="flex-1 p-10 overflow-y-auto custom-scrollbar">
        {activeTab === 'SYSTEM' ? (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
            <div className="lg:col-span-3 space-y-10">
               <section className="bg-[#0a0a0a] border border-white/5 rounded-[40px] p-10 space-y-10 shadow-2xl">
                  <h3 className="text-xl font-black text-white uppercase tracking-tighter flex items-center gap-3">
                    <Cpu size={24} className="text-blue-500" /> Infrastructure Node Control
                  </h3>
                  <div className="grid grid-cols-2 gap-10">
                    <div className="space-y-8">
                       <div className="space-y-3">
                          <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest flex justify-between">
                             <span>AI Confidence Threshold</span>
                             <span className="text-blue-500">{systemState.confidenceThreshold}%</span>
                          </label>
                          <input type="range" min="50" max="95" value={systemState.confidenceThreshold} onChange={(e) => onUpdateSystem({ confidenceThreshold: parseInt(e.target.value) })} className="w-full h-2 bg-[#050505] rounded-lg appearance-none cursor-pointer accent-blue-500" />
                       </div>
                       
                       <div className="space-y-4">
                          {['aiModulesEnabled', 'forexSignalsEnabled', 'binarySignalsEnabled'].map(mod => (
                            <div key={mod} className="flex items-center justify-between p-5 bg-[#050505] rounded-[32px] border border-white/5">
                              <span className="text-[10px] font-black text-gray-500 uppercase">{mod.replace(/([A-Z])/g, ' $1')}</span>
                              <button onClick={() => onUpdateSystem({ [mod]: !systemState[mod as keyof SystemState] })} className={`w-14 h-7 rounded-full relative transition-all ${systemState[mod as keyof SystemState] ? 'bg-blue-600' : 'bg-gray-800'}`}>
                                <div className={`absolute top-1 size-5 bg-white rounded-full transition-all ${systemState[mod as keyof SystemState] ? 'left-8' : 'left-1'}`} />
                              </button>
                            </div>
                          ))}
                       </div>
                    </div>

                    <div className="bg-[#050505] p-10 rounded-[40px] border border-white/5 space-y-8 shadow-inner">
                       <p className="text-[10px] font-black text-gray-600 uppercase flex items-center gap-2 tracking-widest"><Activity size={14}/> Network Telemetry</p>
                       <div className="space-y-6">
                          <div className="flex justify-between items-end border-b border-white/5 pb-3">
                             <span className="text-[10px] text-gray-700 font-black uppercase">Internal Latency</span>
                             <span className="text-emerald-500 font-black text-2xl mono">8.2ms</span>
                          </div>
                          <div className="flex justify-between items-end border-b border-white/5 pb-3">
                             <span className="text-[10px] text-gray-700 font-black uppercase">Signal Discard Rate</span>
                             <span className="text-red-500 font-black text-2xl mono">12.5%</span>
                          </div>
                          <div className="flex justify-between items-end">
                             <span className="text-[10px] text-gray-700 font-black uppercase">Live Terminals</span>
                             <span className="text-white font-black text-2xl mono">1,402</span>
                          </div>
                       </div>
                    </div>
                  </div>
               </section>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 animate-in fade-in slide-in-from-right-10 duration-500">
             {AI_STRATEGIES.map((s) => (
               <div key={s.id} className="bg-[#0a0a0a] border border-white/5 p-8 rounded-[40px] space-y-8 shadow-2xl relative overflow-hidden group hover:border-purple-500/30 transition-all">
                  <div className="flex justify-between items-start relative z-10">
                     <div className="space-y-1">
                        <h4 className="text-lg font-black text-white tracking-tighter uppercase">{s.name}</h4>
                        <p className="text-[9px] text-gray-600 font-black uppercase tracking-widest">{s.type} NODE</p>
                     </div>
                     <div className={`p-4 rounded-3xl ${s.stabilityScore > 80 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'}`}>
                        <HeartPulse size={24} />
                     </div>
                  </div>

                  <div className="space-y-4 relative z-10">
                     <div className="flex justify-between text-[10px] font-black uppercase">
                        <span className="text-gray-700 tracking-widest">Stability Node Score</span>
                        <span className={s.stabilityScore > 80 ? 'text-emerald-500' : 'text-amber-500'}>{s.stabilityScore}%</span>
                     </div>
                     <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <div className={`h-full ${s.stabilityScore > 80 ? 'bg-emerald-500' : 'bg-amber-500'}`} style={{ width: `${s.stabilityScore}%` }} />
                     </div>
                     <div className="grid grid-cols-2 gap-4 pt-4">
                        <div className="p-5 bg-white/5 rounded-3xl text-center space-y-1">
                           <p className="text-[8px] text-gray-600 font-black uppercase tracking-widest">Live WR</p>
                           <p className="text-2xl font-black text-white">{s.winRate}%</p>
                        </div>
                        <div className="p-5 bg-white/5 rounded-3xl text-center space-y-1">
                           <p className="text-[8px] text-gray-600 font-black uppercase tracking-widest">Drawdown</p>
                           <p className="text-2xl font-black text-red-500">{s.drawdown}%</p>
                        </div>
                     </div>
                  </div>

                  <button className="w-full py-4 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all flex items-center justify-center gap-2">
                     <Settings2 size={14}/> Node Recalibration
                  </button>
               </div>
             ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminPortal;
