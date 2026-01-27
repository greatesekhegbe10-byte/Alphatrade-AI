
import React from 'react';
import { Shield, Bell, Moon, Sun, Monitor, Save, User, BookOpen, Brain, Zap, LockKeyhole } from 'lucide-react';
import { UserSettings, TradingPersonality, LearningMode } from '../types';

interface Props {
  settings: UserSettings;
  setSettings: (s: UserSettings) => void;
  canAccessAI?: boolean;
}

const SettingsPanel: React.FC<Props> = ({ settings, setSettings, canAccessAI = false }) => {
  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-8 space-y-8 h-full overflow-y-auto custom-scrollbar animate-in fade-in duration-500 pb-12">
      <div className="space-y-1">
        <h2 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tighter">Terminal Preferences</h2>
        <p className="text-gray-500 text-sm font-medium">Configure neural parameters and interface personality.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Trading Profile */}
        <section className="bg-[#161a1e] p-6 sm:p-8 rounded-[32px] border border-white/5 space-y-6 shadow-2xl">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600/10 rounded-xl text-blue-500">
              <User size={20} />
            </div>
            <h3 className="font-black text-white uppercase tracking-tight">Trading Risk Identity</h3>
          </div>
          <div className="space-y-3">
            {(['CONSERVATIVE', 'BALANCED', 'AGGRESSIVE'] as TradingPersonality[]).map(p => (
              <button 
                key={p}
                onClick={() => setSettings({ ...settings, personality: p })}
                className={`w-full text-left p-4 rounded-2xl border transition-all ${
                  settings.personality === p ? 'bg-blue-600/10 border-blue-500 text-blue-400 shadow-lg' : 'bg-[#0b0e11] border-white/5 text-gray-500 hover:border-white/10'
                }`}
              >
                <p className="text-[10px] font-black uppercase tracking-widest mb-1">{p}</p>
                <p className="text-[9px] font-medium leading-relaxed opacity-60">
                  {p === 'CONSERVATIVE' && "Institutional-grade accuracy. Filters out news volatility and high-spread periods."}
                  {p === 'BALANCED' && "Standard liquidity targeting. Optimal risk-to-reward for standard day trading."}
                  {p === 'AGGRESSIVE' && "High-frequency volatility node. Targets rapid momentum shifts and breakouts."}
                </p>
              </button>
            ))}
          </div>
        </section>

        {/* Guard Modules */}
        <section className="bg-[#161a1e] p-6 sm:p-8 rounded-[32px] border border-white/5 space-y-6 shadow-2xl">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-600/10 rounded-xl text-purple-500">
              <Shield size={20} />
            </div>
            <h3 className="font-black text-white uppercase tracking-tight">Guard Modules</h3>
          </div>
          <div className="space-y-3">
             <div className="flex items-center justify-between p-4 bg-[#0b0e11] rounded-2xl border border-white/5">
                <div className="space-y-1">
                   <p className="text-[10px] font-black text-white uppercase">AI Confirmation</p>
                   {!canAccessAI && <p className="text-[8px] text-red-500 font-black uppercase">Institutional Only</p>}
                </div>
                <button 
                  disabled={!canAccessAI}
                  onClick={() => setSettings({ ...settings, toggles: { ...settings.toggles, aiConfirmation: !settings.toggles.aiConfirmation }})}
                  className={`w-12 h-6 rounded-full relative transition-all ${!canAccessAI ? 'opacity-20 cursor-not-allowed' : ''} ${settings.toggles.aiConfirmation ? 'bg-blue-600' : 'bg-gray-800'}`}
                >
                  <div className={`absolute top-1 size-4 bg-white rounded-full transition-all ${settings.toggles.aiConfirmation ? 'left-7' : 'left-1'}`} />
                  {!canAccessAI && <LockKeyhole size={10} className="absolute inset-0 m-auto text-white/50" />}
                </button>
             </div>
             
             <div className="flex items-center justify-between p-4 bg-[#0b0e11] rounded-2xl border border-white/5">
                <p className="text-[10px] font-black text-white uppercase">News Filter</p>
                <button 
                  onClick={() => setSettings({ ...settings, toggles: { ...settings.toggles, newsFilter: !settings.toggles.newsFilter }})}
                  className={`w-12 h-6 rounded-full relative transition-all ${settings.toggles.newsFilter ? 'bg-blue-600' : 'bg-gray-800'}`}
                >
                  <div className={`absolute top-1 size-4 bg-white rounded-full transition-all ${settings.toggles.newsFilter ? 'left-7' : 'left-1'}`} />
                </button>
             </div>
          </div>
        </section>

        {/* Learning Mode */}
        <section className="bg-[#161a1e] p-6 sm:p-8 rounded-[32px] border border-white/5 space-y-6 shadow-2xl flex flex-col">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-600/10 rounded-xl text-emerald-500">
              <BookOpen size={20} />
            </div>
            <h3 className="font-black text-white uppercase tracking-tight">Interface Complexity</h3>
          </div>
          <div className="flex bg-[#0b0e11] p-1.5 rounded-2xl border border-white/5">
            {(['BEGINNER', 'PRO'] as LearningMode[]).map(m => (
              <button 
                key={m}
                onClick={() => setSettings({ ...settings, learningMode: m })}
                className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                  settings.learningMode === m ? 'bg-blue-600 text-white shadow-xl' : 'text-gray-600 hover:text-white'
                }`}
              >
                {m} MODE
              </button>
            ))}
          </div>
          <div className="flex-1 bg-[#0b0e11] p-5 rounded-2xl border border-white/5 mt-4 space-y-4">
            <div className="flex items-center gap-2 text-blue-500">
               {settings.learningMode === 'BEGINNER' ? <Brain size={16} /> : <Zap size={16} />}
               <span className="text-[10px] font-black uppercase tracking-widest">Architecture Status</span>
            </div>
            <p className="text-[11px] text-gray-500 font-medium leading-relaxed italic">
              {settings.learningMode === 'BEGINNER' 
                ? "Enabling Institutional Guidance: The terminal will now inject technical education, risk logic, and pattern definitions into every signal node." 
                : "Hyper-Minimal Data Node: All educational buffers are cleared. Interface focused on raw numerical data and rapid bridge execution for professionals."}
            </p>
          </div>
        </section>
      </div>

      <div className="flex justify-end pt-4">
        <button className="flex items-center gap-3 px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-2xl transition-all active:scale-95">
          <Save size={18} /> Deploy Preferences
        </button>
      </div>
    </div>
  );
};

export default SettingsPanel;
