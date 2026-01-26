
import React, { useState } from 'react';
import { Signal, BrokerAccount, UserSettings } from '../types';
import { 
  Zap, Activity, ShieldAlert, ChevronDown, ChevronUp, Copy, Check, 
  ShieldOff, Brain, BarChart, ExternalLink, Settings2, Target
} from 'lucide-react';
import { AI_STRATEGIES } from '../constants';

interface Props {
  signals: Signal[];
  activeType: string;
  broker: BrokerAccount;
  settings: UserSettings;
  onMarkTrade?: (signal: Signal) => void;
  onSelectStrategy?: (sId: string) => void;
  activeStrategyId?: string;
}

const SignalPanel: React.FC<Props> = ({ signals, activeType, broker, settings, onMarkTrade, onSelectStrategy, activeStrategyId }) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  
  const filtered = signals.filter(s => s.marketType === activeType);
  const isRiskLocked = broker.dailyLoss >= settings.dailyLossLimit;

  return (
    <div className="flex flex-col h-full bg-[#161a1e] border-l border-white/5 overflow-hidden">
      <div className="p-4 border-b border-white/5 space-y-3 shrink-0">
        <div className="flex justify-between items-center">
          <h3 className="font-black text-[10px] uppercase tracking-widest text-gray-500 flex items-center gap-2">
            <BarChart className="text-blue-500 size-4" /> Signal Nodes
          </h3>
          <div className="flex items-center gap-1.5 bg-[#0b0e11] px-2 py-0.5 rounded-lg border border-white/5">
             <div className="size-1.5 bg-green-500 rounded-full animate-pulse" />
             <span className="text-[8px] font-black text-gray-600 uppercase">Online</span>
          </div>
        </div>
        
        {isRiskLocked && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 animate-pulse">
            <ShieldAlert size={16} className="text-red-500 shrink-0" />
            <p className="text-[9px] font-black text-red-500 uppercase leading-none">Risk Lock Active</p>
          </div>
        )}

        <select 
          value={activeStrategyId} 
          onChange={(e) => onSelectStrategy?.(e.target.value)}
          className="w-full bg-[#0b0e11] border border-white/5 p-2.5 rounded-xl text-[10px] font-black text-gray-400 appearance-none outline-none focus:border-blue-500/50"
        >
          {AI_STRATEGIES.map(s => (
            <option key={s.id} value={s.id}>{s.name} ({s.winRate}% WR)</option>
          ))}
        </select>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar pb-10">
        {filtered.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-gray-700 opacity-20 py-10 lg:py-20">
             <Activity className="size-12 mb-2 animate-pulse" />
             <p className="text-[8px] font-black uppercase tracking-widest">Scanning Market Structure...</p>
          </div>
        ) : (
          filtered.map((s) => (
            <div key={s.id} className="bg-[#1e2329] rounded-2xl border border-white/5 overflow-hidden transition-all shadow-xl">
              <div 
                className={`px-4 py-3 flex justify-between items-center cursor-pointer ${s.type === 'WAIT' ? 'bg-gray-500/5' : s.type.includes('BUY') || s.type === 'CALL' ? 'bg-green-500/5' : 'bg-red-500/5'}`}
                onClick={() => setExpandedId(expandedId === s.id ? null : s.id)}
              >
                <div className="flex items-center gap-2 sm:gap-3">
                  <span className="font-black text-[11px] sm:text-xs tracking-tighter text-white whitespace-nowrap">{s.pair}</span>
                  <span className={`text-[7px] sm:text-[8px] font-black px-1.5 sm:px-2 py-0.5 rounded-full uppercase ${s.type === 'WAIT' ? 'bg-gray-800 text-gray-500' : s.type.includes('BUY') || s.type === 'CALL' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                    {s.type}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                   <span className="text-[9px] font-black text-gray-500 uppercase">{s.confidence}%</span>
                   {expandedId === s.id ? <ChevronUp size={14} className="text-gray-500"/> : <ChevronDown size={14} className="text-gray-500"/>}
                </div>
              </div>

              {s.type !== 'WAIT' && (
                <div className="p-3 sm:p-4 space-y-3 sm:space-y-4 bg-[#1e2329]">
                  <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
                    <div className="p-1.5 sm:p-2 bg-[#0b0e11] rounded-lg border border-white/5 text-center">
                      <p className="text-[6px] sm:text-[7px] font-black text-gray-600 uppercase">Entry</p>
                      <p className="text-[9px] sm:text-[10px] font-black text-white mono truncate">{s.entry}</p>
                    </div>
                    <div className="p-1.5 sm:p-2 bg-[#0b0e11] rounded-lg border border-white/5 text-center">
                      <p className="text-[6px] sm:text-[7px] font-black text-emerald-500 uppercase">Target</p>
                      <p className="text-[9px] sm:text-[10px] font-black text-white mono truncate">{s.tp}</p>
                    </div>
                    <div className="p-1.5 sm:p-2 bg-[#0b0e11] rounded-lg border border-white/5 text-center">
                      <p className="text-[6px] sm:text-[7px] font-black text-red-500 uppercase">Stop</p>
                      <p className="text-[9px] sm:text-[10px] font-black text-white mono truncate">{s.sl}</p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                     <button onClick={(e) => { e.stopPropagation(); onMarkTrade?.(s); }} className="flex-1 py-1.5 sm:py-2 bg-[#2b2f36] text-[7px] sm:text-[8px] font-black uppercase rounded-lg border border-white/10 hover:bg-white/10 transition-all">
                        Log
                     </button>
                     <button className="flex-[2] py-1.5 sm:py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-[7px] sm:text-[8px] font-black uppercase tracking-widest flex items-center justify-center gap-1.5 sm:gap-2 shadow-lg transition-all active:scale-95">
                        <ExternalLink size={10}/> Bridge
                     </button>
                  </div>
                  
                  {expandedId === s.id && (
                    <div className="pt-3 border-t border-white/5 space-y-1.5 animate-in fade-in">
                       <p className="text-[7px] sm:text-[8px] font-black text-gray-500 uppercase flex items-center gap-1"><Brain size={10}/> Logic</p>
                       <p className="text-[9px] sm:text-[10px] text-gray-400 italic leading-relaxed">"{s.reasoning}"</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default SignalPanel;
