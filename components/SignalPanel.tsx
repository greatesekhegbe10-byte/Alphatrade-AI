
import React, { useState } from 'react';
import { Signal, BrokerAccount, UserSettings } from '../types';
import { 
  Zap, Target, ShieldAlert, Calculator, AlertTriangle, 
  ChevronDown, ChevronUp, Fingerprint, Activity,
  ShieldCheck, ExternalLink, Settings2, Copy, Check
} from 'lucide-react';
import { AI_STRATEGIES } from '../constants';

interface Props {
  signals: Signal[];
  activeType: 'FOREX' | 'BINARY';
  broker?: BrokerAccount;
  settings?: UserSettings;
  onMarkTrade?: (signal: Signal) => void;
  onSelectStrategy?: (sId: string) => void;
  activeStrategyId?: string;
}

const SignalPanel: React.FC<Props> = ({ signals, activeType, broker, settings, onMarkTrade, onSelectStrategy, activeStrategyId }) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  
  const filtered = signals.filter(s => s.marketType === activeType);
  const currentStrategy = AI_STRATEGIES.find(s => s.id === activeStrategyId);

  const calculateLot = (entry: number, sl: number) => {
    if (!broker || !settings || !settings.autoLot) return '0.10';
    const pips = Math.abs(entry - sl) * 10000;
    if (pips === 0) return '0.10';
    const riskAmount = (broker.balance * settings.riskPercent) / 100;
    return (riskAmount / (pips * 10)).toFixed(2);
  };

  const copySignal = (s: Signal) => {
    const text = s.marketType === 'FOREX' 
      ? `🚀 ALPHA SIGNAL\nPAIR: ${s.pair}\nTYPE: ${s.type}\nENTRY: ${s.entry.toFixed(5)}\nSL: ${s.sl?.toFixed(5)}\nTP: ${s.tp?.toFixed(5)}\nRISK: ${settings?.riskPercent}%\nTF: ${s.timeframe}`
      : `🚀 BINARY SIGNAL\nPAIR: ${s.pair}\nTYPE: ${s.type}\nENTRY: ${s.entry.toFixed(5)}\nEXPIRY: ${s.expiry}\nTF: ${s.timeframe}\nCONF: ${s.confidence}`;
    
    navigator.clipboard.writeText(text);
    setCopiedId(s.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="flex flex-col h-full bg-[#161a1e] border-l border-[#1e2329]">
      <div className="p-4 border-b border-[#1e2329] space-y-3">
        <div className="flex justify-between items-center">
          <h3 className="font-bold flex items-center gap-2">
            <Zap className="text-yellow-400 size-4" /> Pro Intel
          </h3>
          <div className="flex gap-1.5">
             {['LOW', 'MEDIUM', 'HIGH'].map(conf => (
               <div key={conf} className={`size-2 rounded-full ${conf === 'HIGH' ? 'bg-green-500' : conf === 'MEDIUM' ? 'bg-yellow-500' : 'bg-gray-600'}`} />
             ))}
          </div>
        </div>
        <div className="relative">
           <select 
              value={activeStrategyId} 
              onChange={(e) => onSelectStrategy?.(e.target.value)}
              className="w-full bg-[#0b0e11] border border-[#2b2f36] p-2 rounded-lg text-[10px] font-black text-gray-400 appearance-none outline-none"
           >
              {AI_STRATEGIES.filter(s => s.type === activeType).map(s => (
                <option key={s.id} value={s.id}>{s.name} ({s.winRate}%)</option>
              ))}
           </select>
           <Settings2 size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-600 pointer-events-none" />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {filtered.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-gray-600 italic gap-4">
            <Activity className="size-10 opacity-10 animate-pulse" />
            <p className="text-[10px] uppercase font-black tracking-widest text-center">Awaiting Multi-Timeframe Confirmation...</p>
          </div>
        ) : (
          filtered.map((s) => (
            <div key={s.id} className="bg-[#1e2329] rounded-xl border border-[#2b2f36] overflow-hidden group shadow-2xl">
              <div 
                className={`px-3 py-2 flex justify-between items-center cursor-pointer ${s.type.includes('BUY') || s.type === 'CALL' ? 'bg-green-500/5' : 'bg-red-500/5'}`}
                onClick={() => setExpandedId(expandedId === s.id ? null : s.id)}
              >
                <div className="flex items-center gap-2">
                  <span className="font-black text-xs">{s.pair}</span>
                  <span className={`text-[8px] font-black px-1.5 py-0.5 rounded uppercase ${s.type.includes('BUY') || s.type === 'CALL' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                    {s.type}
                  </span>
                  <span className="text-[9px] text-gray-600 font-bold">{s.timeframe}</span>
                </div>
                <div className="flex items-center gap-2">
                   <button 
                     onClick={(e) => { e.stopPropagation(); copySignal(s); }}
                     className="p-1 hover:text-blue-500 transition-colors"
                   >
                     {copiedId === s.id ? <Check size={12} className="text-green-500" /> : <Copy size={12} />}
                   </button>
                   {expandedId === s.id ? <ChevronUp size={14}/> : <ChevronDown size={14}/>}
                </div>
              </div>

              <div className="p-3 space-y-3">
                <div className="grid grid-cols-2 gap-2 text-[10px]">
                  <div className="p-2 bg-[#0b0e11] rounded-lg border border-[#2b2f36]">
                    <p className="text-gray-600 text-[8px] font-black uppercase">Target Entry</p>
                    <p className="font-black text-gray-200 mono">{s.entry.toFixed(5)}</p>
                  </div>
                  <div className="p-2 bg-[#0b0e11] rounded-lg border border-[#2b2f36]">
                    <p className="text-gray-600 text-[8px] font-black uppercase">Confidence</p>
                    <p className={`font-black uppercase ${s.confidence === 'HIGH' ? 'text-green-400' : 'text-yellow-400'}`}>{s.confidence}</p>
                  </div>
                </div>

                {expandedId === s.id && (
                  <div className="space-y-3 pt-2 border-t border-[#2b2f36] animate-in fade-in slide-in-from-top-1">
                    <div className="grid grid-cols-2 gap-2 text-[9px]">
                       <div className="space-y-1">
                          <p className="text-gray-600 font-black uppercase">Target Pips</p>
                          <p className="text-blue-400 font-black">{Math.floor(Math.random()*100)} Pips</p>
                       </div>
                       <div className="space-y-1">
                          <p className="text-gray-600 font-black uppercase">RRR</p>
                          <p className="text-emerald-400 font-black">1:2.4</p>
                       </div>
                    </div>
                    <div className="space-y-2 bg-[#0b0e11] p-3 rounded-xl border border-white/5">
                      <p className="text-[9px] text-gray-500 font-bold uppercase flex items-center gap-1"><Fingerprint size={10}/> Logic Breakdown</p>
                      <p className="text-[10px] text-gray-400 leading-relaxed italic">"{s.reasoning}"</p>
                      <div className="pt-2 space-y-1">
                         <div className="flex justify-between text-[8px] uppercase font-black"><span className="text-gray-600">Structure</span><span className="text-blue-400">{s.breakdown.structure}</span></div>
                         <div className="flex justify-between text-[8px] uppercase font-black"><span className="text-gray-600">Risk</span><span className="text-red-400">{s.breakdown.manipulationRisk}</span></div>
                      </div>
                    </div>
                  </div>
                )}
                
                <button 
                  onClick={() => window.open('https://pocketoption.com', '_blank')}
                  className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-[10px] font-black flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-600/10"
                >
                  <ExternalLink size={12}/> EXECUTE TRADE
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default SignalPanel;
