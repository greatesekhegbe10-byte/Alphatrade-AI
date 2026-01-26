
import React, { useState } from 'react';
import { 
  Brain, Send, Loader2, Target, ShieldCheck, 
  MessageSquare, BarChart3, Calculator, TrendingUp, TrendingDown, AlertCircle,
  Zap, Globe, Search, ArrowRight
} from 'lucide-react';
import { getMarketSituation, validateTradeIdea } from '../services/geminiService';
import { Candle, ValidationResult } from '../types';

interface Props {
  candles: Candle[];
  symbol: string;
}

const AnalysisPanel: React.FC<Props> = ({ candles, symbol }) => {
  const [query, setQuery] = useState('');
  const [situation, setSituation] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Validation State
  const [valSide, setValSide] = useState<'BUY' | 'SELL'>('BUY');
  const [valEntry, setValEntry] = useState(0);
  const [valSL, setValSL] = useState(0);
  const [valTP, setValTP] = useState(0);
  const [validation, setValidation] = useState<ValidationResult | null>(null);
  const [isValidating, setIsValidating] = useState(false);

  const handleAskSituation = async () => {
    if (!query) return;
    setIsLoading(true);
    setSituation('');
    const result = await getMarketSituation(query);
    setSituation(result);
    setIsLoading(false);
  };

  const handleValidateTrade = async () => {
    if (valEntry <= 0) return;
    setIsValidating(true);
    setValidation(null);
    try {
      const result = await validateTradeIdea(symbol, valSide, valEntry, valSL, valTP, candles);
      setValidation(result);
    } catch (e) {
      console.error(e);
    }
    setIsValidating(false);
  };

  return (
    <div className="p-4 sm:p-8 space-y-6 sm:space-y-10 h-full overflow-y-auto bg-[#0b0e11] max-w-6xl mx-auto custom-scrollbar animate-in fade-in duration-700 pb-12">
      <div className="space-y-3 border-b border-white/5 pb-6 sm:pb-8">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="p-2 sm:p-3 bg-blue-600/10 rounded-2xl border border-blue-500/20">
            <Brain className="text-blue-500" size={24} sm:size={32} />
          </div>
          <div>
            <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tighter uppercase leading-none">
              Intelligence Lab
            </h2>
            <p className="text-gray-600 text-[8px] sm:text-[10px] font-black uppercase tracking-[0.3em] mt-1">Neural Diagnostics & Analysis</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-10">
        {/* Market Situation Hub */}
        <section className="bg-[#161a1e] border border-white/5 p-5 sm:p-8 rounded-[32px] sm:rounded-[40px] space-y-6 shadow-2xl flex flex-col hover:border-blue-500/20 transition-all duration-500">
          <div className="flex justify-between items-center">
            <h3 className="text-lg sm:text-xl font-black text-white uppercase tracking-tighter flex items-center gap-3">
               <Globe size={20} className="text-blue-500" /> Market Sit-Rep
            </h3>
            <span className="text-[8px] font-black px-2 py-1 bg-blue-500/10 text-blue-500 rounded-lg flex items-center gap-1">
              <Zap size={10}/> LIVE
            </span>
          </div>

          <div className="space-y-4 flex-1 flex flex-col">
             <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-gray-700" size={14} sm:size={16} />
                  <input 
                    value={query} 
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Ask AI: 'Current sentiment for Gold'..." 
                    className="w-full bg-[#0b0e11] border border-white/5 pl-10 sm:pl-12 pr-4 py-3 sm:py-4 rounded-2xl text-[10px] sm:text-xs font-bold focus:border-blue-500 outline-none transition-all placeholder:text-gray-800"
                    onKeyDown={(e) => e.key === 'Enter' && handleAskSituation()}
                  />
                </div>
                <button 
                  onClick={handleAskSituation}
                  disabled={isLoading}
                  className="p-3 sm:p-4 bg-blue-600 hover:bg-blue-500 rounded-2xl text-white transition-all shadow-lg active:scale-95 disabled:opacity-50"
                >
                  {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                </button>
             </div>

             <div className="flex-1 bg-[#0b0e11] p-4 sm:p-6 rounded-3xl border border-white/5 min-h-[250px] sm:min-h-[350px] relative overflow-y-auto">
                {!situation && !isLoading && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center opacity-20 p-6 text-center">
                     <BarChart3 size={40} sm:size={48} />
                     <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest mt-4">Awaiting SIT-REP Query</p>
                  </div>
                )}
                {isLoading ? (
                  <div className="flex flex-col items-center justify-center h-full space-y-3">
                    <div className="size-10 sm:size-12 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
                    <span className="text-[8px] font-black uppercase tracking-[0.2em] animate-pulse">Scanning Data...</span>
                  </div>
                ) : (
                  <div className="prose prose-invert max-w-none">
                    <p className="text-[10px] sm:text-[11px] text-gray-400 leading-relaxed whitespace-pre-wrap">{situation}</p>
                  </div>
                )}
             </div>
          </div>
        </section>

        {/* Trade Idea Validator */}
        <section className="bg-[#161a1e] border border-white/5 p-5 sm:p-8 rounded-[32px] sm:rounded-[40px] space-y-6 shadow-2xl hover:border-purple-500/20 transition-all duration-500">
          <div className="flex justify-between items-center">
            <h3 className="text-lg sm:text-xl font-black text-white uppercase tracking-tighter flex items-center gap-3">
               <Calculator size={20} className="text-purple-500" /> Neural Test
            </h3>
            <span className="text-[8px] font-black px-2 py-1 bg-purple-500/10 text-purple-500 rounded-lg">SYNCED</span>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:gap-4">
             <div className="col-span-2 flex bg-[#0b0e11] p-1 rounded-2xl border border-white/5 shadow-inner">
                <button 
                  onClick={() => setValSide('BUY')} 
                  className={`flex-1 py-2 sm:py-3 rounded-xl text-[9px] sm:text-[10px] font-black transition-all flex items-center justify-center gap-2 ${valSide === 'BUY' ? 'bg-green-600 text-white shadow-xl' : 'text-gray-500 hover:text-gray-300'}`}
                >
                  <TrendingUp size={12}/> BUY
                </button>
                <button 
                  onClick={() => setValSide('SELL')} 
                  className={`flex-1 py-2 sm:py-3 rounded-xl text-[9px] sm:text-[10px] font-black transition-all flex items-center justify-center gap-2 ${valSide === 'SELL' ? 'bg-red-600 text-white shadow-xl' : 'text-gray-500 hover:text-gray-300'}`}
                >
                  <TrendingDown size={12}/> SELL
                </button>
             </div>
             
             <div className="space-y-1.5">
                <label className="text-[8px] font-black text-gray-600 uppercase tracking-widest px-1">Entry</label>
                <input type="number" step="0.0001" value={valEntry} onChange={(e) => setValEntry(Number(e.target.value))} className="w-full bg-[#0b0e11] border border-white/5 p-3 sm:p-4 rounded-xl text-[10px] sm:text-xs font-bold outline-none focus:border-purple-500 transition-all mono" />
             </div>
             <div className="space-y-1.5">
                <label className="text-[8px] font-black text-gray-600 uppercase tracking-widest px-1">TP</label>
                <input type="number" step="0.0001" value={valTP} onChange={(e) => setValTP(Number(e.target.value))} className="w-full bg-[#0b0e11] border border-white/5 p-3 sm:p-4 rounded-xl text-[10px] sm:text-xs font-bold outline-none focus:border-purple-500 transition-all mono" />
             </div>
             <div className="space-y-1.5">
                <label className="text-[8px] font-black text-gray-600 uppercase tracking-widest px-1">SL</label>
                <input type="number" step="0.0001" value={valSL} onChange={(e) => setValSL(Number(e.target.value))} className="w-full bg-[#0b0e11] border border-white/5 p-3 sm:p-4 rounded-xl text-[10px] sm:text-xs font-bold outline-none focus:border-purple-500 transition-all mono" />
             </div>
             <div className="flex items-end">
                <button 
                  onClick={handleValidateTrade}
                  disabled={isValidating || valEntry <= 0}
                  className="w-full bg-purple-600 hover:bg-purple-500 py-3 sm:py-4 rounded-xl text-white text-[9px] sm:text-[10px] font-black uppercase tracking-widest transition-all shadow-xl active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isValidating ? <Loader2 size={14} className="animate-spin" /> : <ShieldCheck size={14} />}
                  Validate
                </button>
             </div>
          </div>

          {validation ? (
            <div className="pt-4 sm:pt-6 border-t border-white/5 space-y-4 sm:space-y-6 animate-in slide-in-from-top-4 duration-500">
               <div className="flex justify-between items-center bg-[#0b0e11] p-4 sm:p-6 rounded-3xl border border-white/5 relative overflow-hidden group">
                  <div className="space-y-1 relative z-10">
                    <p className="text-[8px] sm:text-[9px] font-black text-gray-600 uppercase tracking-widest">Accuracy</p>
                    <p className={`text-3xl sm:text-5xl font-black tracking-tighter ${validation.accuracy > 70 ? 'text-emerald-500' : 'text-amber-500'}`}>{validation.accuracy}%</p>
                  </div>
                  <div className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase relative z-10 ${validation.verdict === 'VALID' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'}`}>
                    {validation.verdict}
                  </div>
               </div>
               <div className="p-4 sm:p-6 bg-purple-500/5 border border-purple-500/20 rounded-3xl relative overflow-hidden">
                  <p className="text-[8px] sm:text-[9px] font-black text-purple-400 uppercase tracking-widest mb-2 flex items-center gap-2"><Target size={12}/> Analysis</p>
                  <p className="text-[10px] sm:text-[11px] text-gray-400 font-medium leading-relaxed italic">"{validation.feedback}"</p>
               </div>
            </div>
          ) : (
             <div className="h-[200px] flex flex-col items-center justify-center text-gray-700 opacity-20 border-2 border-dashed border-white/5 rounded-[32px] sm:rounded-[40px] px-6 text-center">
                <Calculator size={32} sm:size={48}/>
                <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest mt-4">Input Trade Metrics</p>
             </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default AnalysisPanel;
