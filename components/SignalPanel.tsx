
import React, { useState } from 'react';
import { Signal, BrokerAccount, UserSettings } from '../types';
import { 
  Zap, Activity, ShieldAlert, ChevronDown, ChevronUp, 
  Brain, BarChart, ExternalLink, Target,
  Info, ShieldCheck, TrendingUp, Fingerprint, Lock, Copy, Check
} from 'lucide-react';

interface Props {
  signals: Signal[];
  activeType: string;
  broker: BrokerAccount;
  settings: UserSettings;
  onMarkTrade?: (signal: Signal) => void;
}

const SignalPanel: React.FC<Props> = ({ signals, activeType, broker, settings, onMarkTrade }) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  
  const filtered = signals.filter(s => s.marketType === activeType);

  const copyToClipboard = (s: Signal) => {
    const text = `
PAIR: ${s.pair}
TYPE: ${s.type}
ENTRY: ${s.entry}
STOP LOSS: ${s.sl}
TAKE PROFIT: ${s.tp}

PIPS: ${s.pips}
RISK: ${settings.riskPercent}%
LOT SIZE: ${s.lotSize}
RISK-REWARD: ${s.rr}

TIMEFRAME: ${s.timeframe}
SESSION: ${s.session || 'Active'}
TREND: ${s.trend || 'Strong'}
CONFIDENCE: ${s.confidence >= 80 ? 'HIGH' : s.confidence >= 60 ? 'MEDIUM' : 'LOW'}
    `.trim();
    
    navigator.clipboard.writeText(text);
    setCopiedId(s.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="flex flex-col h-full bg-[#161a1e] border-l border-white/5 overflow-hidden select-none">
      <div className="p-6 border-b border-white/5 space-y-4 bg-[#0b0e11]/50">
        <div className="flex justify-between items-center">
          <h3 className="font-black text-[10px] uppercase tracking-[0.2em] text-gray-500 flex items-center gap-2">
            <BarChart className="text-blue-500 size-4" /> Signal Intelligence
          </h3>
          <div className="flex items-center gap-1.5 bg-[#0b0e11] px-3 py-1 rounded-full border border-white/5">
             <div className="size-2 bg-green-500 rounded-full animate-pulse" />
             <span className="text-[8px] font-black text-gray-500 uppercase tracking-widest">Live Node</span>
          </div>
        </div>

        <div className="p-4 bg-amber-500/5 border border-amber-500/10 rounded-2xl">
           <p className="text-[8px] font-bold text-amber-500 uppercase flex items-center gap-2 leading-none">
             <Info size={12}/> Institutional Risk Warning
           </p>
           <p className="text-[9px] text-gray-600 mt-2 leading-relaxed italic">Signals are node-locked and verified for ${broker.balance} USD balance nodes.</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar pb-10">
        {filtered.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-gray-700 opacity-20 py-20 text-center space-y-4">
             <Fingerprint className="size-16 animate-pulse" />
             <p className="text-[10px] font-black uppercase tracking-widest">Scanning Market Structure</p>
          </div>
        ) : (
          filtered.map((s) => (
            <div key={s.id} className={`bg-[#1e2329] rounded-[32px] border transition-all shadow-xl overflow-hidden ${expandedId === s.id ? 'border-blue-500/30' : 'border-white/5'}`}>
              <div 
                className={`px-5 py-4 flex justify-between items-center cursor-pointer ${s.type === 'WAIT' ? 'bg-gray-500/5' : s.type.includes('BUY') ? 'bg-green-500/5' : 'bg-red-500/5'}`}
                onClick={() => setExpandedId(expandedId === s.id ? null : s.id)}
              >
                <div className="flex items-center gap-4">
                  <div className={`size-10 rounded-2xl flex items-center justify-center font-black text-sm border ${s.type.includes('BUY') ? 'bg-green-500/10 border-green-500/20 text-green-500' : 'bg-red-500/10 border-red-500/20 text-red-500'}`}>
                    {s.type[0]}
                  </div>
                  <div>
                    <p className="text-xs font-black text-white uppercase tracking-tighter">{s.pair}</p>
                    <div className="flex items-center gap-2">
                      <span className="text-[8px] font-bold text-gray-600 uppercase tracking-widest">{s.timeframe}</span>
                      <span className="text-[8px] font-bold text-blue-500 uppercase tracking-widest">{s.lotSize} LOTS</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                   <div className="text-right">
                      <p className="text-[10px] font-black text-blue-500">{s.confidence}%</p>
                      <p className="text-[7px] font-black text-gray-700 uppercase">Trust Score</p>
                   </div>
                   {expandedId === s.id ? <ChevronUp size={16} className="text-gray-700"/> : <ChevronDown size={16} className="text-gray-700"/>}
                </div>
              </div>

              {expandedId === s.id && (
                <div className="p-5 space-y-5 bg-[#1e2329] animate-in slide-in-from-top-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[10px] font-black text-gray-500 uppercase">Institutional Signal</span>
                    <button 
                      onClick={(e) => { e.stopPropagation(); copyToClipboard(s); }}
                      className="flex items-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-xl text-[9px] font-black text-white uppercase transition-all"
                    >
                      {copiedId === s.id ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                      {copiedId === s.id ? 'Copied' : 'Copy Signal'}
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-4 bg-[#0b0e11] rounded-2xl border border-white/5">
                      <p className="text-[7px] font-black text-gray-700 uppercase mb-1">Entry Range</p>
                      <p className="text-sm font-black text-white mono">{s.entry}</p>
                    </div>
                    <div className="p-4 bg-[#0b0e11] rounded-2xl border border-white/5">
                      <p className="text-[7px] font-black text-gray-700 uppercase mb-1">Risk Reward</p>
                      <p className="text-sm font-black text-blue-500 mono">{s.rr}</p>
                    </div>
                    <div className="p-4 bg-[#0b0e11] rounded-2xl border border-emerald-500/10">
                      <p className="text-[7px] font-black text-emerald-500 uppercase mb-1">Take Profit</p>
                      <p className="text-sm font-black text-white mono">{s.tp}</p>
                    </div>
                    <div className="p-4 bg-[#0b0e11] rounded-2xl border border-rose-500/10">
                      <p className="text-[7px] font-black text-rose-500 uppercase mb-1">Stop Loss</p>
                      <p className="text-sm font-black text-white mono">{s.sl}</p>
                    </div>
                  </div>

                  <div className="bg-[#0b0e11] p-4 rounded-2xl border border-white/5 space-y-2">
                     <p className="text-[8px] font-black text-blue-500 uppercase tracking-widest flex items-center gap-2">
                       <Brain size={12}/> Analysis Verdict
                     </p>
                     <p className="text-[10px] text-gray-500 font-medium leading-relaxed italic">
                       "{s.reasoning}"
                     </p>
                  </div>

                  <div className="flex gap-3">
                     <button 
                       onClick={() => onMarkTrade?.(s)}
                       className="flex-1 py-3 bg-[#2b2f36] hover:bg-[#32363e] text-[9px] font-black uppercase rounded-2xl border border-white/5 transition-all"
                     >
                       Journal
                     </button>
                     <button className="flex-[2] py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-xl">
                       <Target size={14}/> Execute Trade
                     </button>
                  </div>
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
