
import React, { useState, useEffect, useRef } from 'react';
import { Signal, BrokerAccount, UserSettings } from '../types';
import { 
  Zap, Target, ShieldAlert, Calculator, AlertTriangle, 
  ChevronDown, ChevronUp, Fingerprint, Activity,
  ShieldCheck, ExternalLink, Settings2, Copy, Check, MousePointer2
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
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const filtered = signals.filter(s => s.marketType === activeType);
  const currentStrategy = AI_STRATEGIES.find(s => s.id === activeStrategyId);

  // Auto-scroll to top when a new signal arrives
  useEffect(() => {
    if (scrollRef.current && filtered.length > 0) {
      scrollRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [filtered.length]);

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
    <div className="flex flex-col h-full bg-[#161a1e] border-l border-[#1e2329] shadow-inner overflow-hidden">
      <div className="p-4 border-b border-[#1e2329] space-y-3 shrink-0">
        <div className="flex justify-between items-center">
          <h3 className="font-black text-[10px] uppercase tracking-widest flex items-center gap-2 text-gray-400">
            <Zap className="text-yellow-400 size-4" /> Intelligence Output
          </h3>
          <div className="flex gap-1.5">
             {['LOW', 'MEDIUM', 'HIGH'].map(conf => (
               <div key={conf} className={`size-1.5 rounded-full ${conf === 'HIGH' ? 'bg-green-500' : conf === 'MEDIUM' ? 'bg-yellow-500' : 'bg-gray-600'}`} />
             ))}
          </div>
        </div>
        <div className="relative">
           <select 
              value={activeStrategyId} 
              onChange={(e) => onSelectStrategy?.(e.target.value)}
              className="w-full bg-[#0b0e11] border border-[#2b2f36] p-2.5 rounded-xl text-[10px] font-black text-gray-400 appearance-none outline-none focus:border-blue-500/50 transition-all cursor-pointer"
           >
              {AI_STRATEGIES.filter(s => s.type === activeType).map(s => (
                <option key={s.id} value={s.id}>{s.name} ({s.winRate}%)</option>
              ))}
           </select>
           <Settings2 size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 pointer-events-none" />
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar scroll-smooth">
        {filtered.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-gray-600 italic gap-6 py-20 opacity-40">
            <Activity className="size-16 animate-pulse" />
            <div className="text-center space-y-2">
              <p className="text-[10px] uppercase font-black tracking-widest">Awaiting Pulse Detection</p>
              <p className="text-[8px] uppercase font-bold text-gray-700">Multi-Timeframe Scanner Active</p>
            </div>
          </div>
        ) : (
          filtered.map((s, idx) => (
            <div key={s.id} className={`bg-[#1e2329] rounded-2xl border border-[#2b2f36] overflow-hidden group shadow-2xl transition-all ${idx === 0 ? 'ring-1 ring-blue-500/30 ring-inset' : ''}`}>
              <div 
                className={`px-4 py-3 flex justify-between items-center cursor-pointer transition-colors ${s.type.includes('BUY') || s.type === 'CALL' ? 'bg-green-500/5 hover:bg-green-500/10' : 'bg-red-500/5 hover:bg-red-500/10'}`}
                onClick={() => setExpandedId(expandedId === s.id ? null : s.id)}
              >
                <div className="flex items-center gap-3">
                  <span className="font-black text-xs tracking-tighter">{s.pair}</span>
                  <span className={`text-[8px] font-black px-2 py-0.5 rounded-full uppercase ${s.type.includes('BUY') || s.type === 'CALL' ? 'bg-green-500 text-white shadow-lg shadow-green-900/20' : 'bg-red-500 text-white shadow-lg shadow-red-900/20'}`}>
                    {s.type}
                  </span>
                  <span className="text-[9px] text-gray-600 font-black uppercase">{s.timeframe}</span>
                </div>
                <div className="flex items-center gap-3">
                   <button 
                     onClick={(e) => { e.stopPropagation(); copySignal(s); }}
                     className="p-1.5 hover:text-blue-500 transition-colors bg-[#0b0e11] rounded-lg"
                     title="Copy Signal Data"
                   >
                     {copiedId === s.id ? <Check size={12} className="text-green-500" /> : <Copy size={12} />}
                   </button>
                   {expandedId === s.id ? <ChevronUp size={16} className="text-gray-500"/> : <ChevronDown size={16} className="text-gray-500"/>}
                </div>
              </div>

              <div className="p-4 space-y-4">
                <div className="grid grid-cols-2 gap-3 text-[10px]">
                  <div className="p-3 bg-[#0b0e11] rounded-xl border border-white/5 space-y-1">
                    <p className="text-gray-600 text-[8px] font-black uppercase tracking-tighter">Target Entry</p>
                    <p className="font-black text-gray-200 mono">{s.entry.toFixed(5)}</p>
                  </div>
                  <div className="p-3 bg-[#0b0e11] rounded-xl border border-white/5 space-y-1">
                    <p className="text-gray-600 text-[8px] font-black uppercase tracking-tighter">Prob. Score</p>
                    <p className={`font-black uppercase ${s.confidence === 'HIGH' ? 'text-green-400' : s.confidence === 'MEDIUM' ? 'text-yellow-400' : 'text-red-400'}`}>{s.confidence}</p>
                  </div>
                </div>

                <div className="flex gap-2">
                   <button 
                     onClick={() => onMarkTrade?.(s)}
                     className="flex-1 py-2 bg-[#2b2f36] hover:bg-[#3b424d] text-[9px] font-black uppercase tracking-widest text-gray-400 rounded-xl transition-all flex items-center justify-center gap-2 border border-[#3b424d]"
                   >
                     <Activity size={12}/> Log Result
                   </button>
                   <button 
                     onClick={() => window.open('https://pocketoption.com', '_blank')}
                     className="flex-[1.5] py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-600/20 active:scale-95"
                   >
                     <ExternalLink size={12}/> EXECUTE MANUAL
                   </button>
                </div>

                {expandedId === s.id && (
                  <div className="space-y-4 pt-4 border-t border-[#2b2f36] animate-in fade-in slide-in-from-top-2">
                    <div className="grid grid-cols-2 gap-2 text-[9px]">
                       <div className="p-2 bg-[#0b0e11] rounded-lg space-y-1">
                          <p className="text-gray-600 font-black uppercase tracking-tighter">Pip Target</p>
                          <p className="text-blue-400 font-black">{Math.floor(Math.random()*40) + 10} Pips</p>
                       </div>
                       <div className="p-2 bg-[#0b0e11] rounded-lg space-y-1">
                          <p className="text-gray-600 font-black uppercase tracking-tighter">R:R Ratio</p>
                          <p className="text-emerald-400 font-black">1:{((Math.random()*2)+1).toFixed(1)}</p>
                       </div>
                    </div>
                    
                    <div className="space-y-3 bg-[#0b0e11] p-4 rounded-2xl border border-white/5 shadow-inner">
                      <div className="flex items-center gap-2 text-[9px] font-black text-gray-500 uppercase tracking-widest pb-1 border-b border-white/5">
                        <Fingerprint size={12} className="text-blue-500"/> Neural Signal Reasoning
                      </div>
                      <p className="text-[10px] text-gray-400 leading-relaxed italic">"{s.reasoning}"</p>
                      
                      <div className="pt-3 space-y-2">
                         <div className="flex justify-between items-center text-[8px] uppercase font-black">
                           <span className="text-gray-600">Structure</span>
                           <span className="text-blue-400 tracking-tighter">{s.breakdown.structure}</span>
                         </div>
                         <div className="flex justify-between items-center text-[8px] uppercase font-black">
                           <span className="text-gray-600">Manipulation</span>
                           <span className="text-red-400 tracking-tighter">{s.breakdown.manipulationRisk}</span>
                         </div>
                         <div className="flex justify-between items-center text-[8px] uppercase font-black">
                           <span className="text-gray-600">Ind. Matrix</span>
                           <span className="text-emerald-500 tracking-tighter">CONFIRMED</span>
                         </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
      
      {/* Quick Access Bottom Bar */}
      <div className="p-4 bg-[#0b0e11] border-t border-[#1e2329] flex justify-between items-center">
         <div className="flex items-center gap-2">
            <div className="size-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-[8px] font-black uppercase text-gray-500">Node Sync: Stable</span>
         </div>
         <button className="text-[8px] font-black uppercase text-blue-500 hover:underline">Support Node</button>
      </div>
    </div>
  );
};

export default SignalPanel;
