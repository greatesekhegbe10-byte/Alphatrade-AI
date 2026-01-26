
import React, { useState, useEffect } from 'react';
import { 
  FlaskConical, Play, BarChart3, TrendingUp, 
  Settings2, Activity, History, ShieldCheck, 
  ArrowUpRight, AlertCircle, RefreshCw, Cpu
} from 'lucide-react';
import { AI_STRATEGIES } from '../constants';
import { strategyEngine } from '../services/strategyEngine';
import { Candle, BacktestResult, Strategy } from '../types';

interface Props {
  candles: Candle[];
  symbol: string;
}

const StrategyLab: React.FC<Props> = ({ candles, symbol }) => {
  const [selectedStrategy, setSelectedStrategy] = useState<Strategy>(AI_STRATEGIES[3]); // RSI Divergence default
  const [backtestResult, setBacktestResult] = useState<BacktestResult | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [risk, setRisk] = useState(1.0);

  const handleRunBacktest = async () => {
    setIsRunning(true);
    // Add small artificial delay for UX
    await new Promise(resolve => setTimeout(resolve, 800));
    const result = await strategyEngine.runBacktest(candles, selectedStrategy.id, risk);
    setBacktestResult(result);
    setIsRunning(false);
  };

  return (
    <div className="p-4 sm:p-8 space-y-6 sm:space-y-10 h-full overflow-y-auto bg-[#0b0e11] max-w-7xl mx-auto custom-scrollbar animate-in fade-in duration-700 pb-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-white/5 pb-8">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
             <div className="p-3 bg-purple-600/20 rounded-2xl border border-purple-500/20">
               <FlaskConical className="text-purple-500" size={28} />
             </div>
             <div>
               <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tighter uppercase leading-none">Strategy Lab</h2>
               <p className="text-gray-600 text-[10px] font-black uppercase tracking-[0.3em] mt-1">Algorithmic Backtesting Node</p>
             </div>
          </div>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={handleRunBacktest}
            disabled={isRunning}
            className="px-6 py-3 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 shadow-xl shadow-purple-600/20 transition-all active:scale-95"
          >
            {isRunning ? <RefreshCw className="animate-spin" size={16}/> : <Play size={16} />}
            {isRunning ? 'Running Simulation...' : 'Run Simulation'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Strategy Configuration */}
        <section className="bg-[#161a1e] border border-white/5 p-6 sm:p-8 rounded-[40px] space-y-8 shadow-2xl">
          <h3 className="text-lg font-black text-white uppercase tracking-tighter flex items-center gap-3">
            <Settings2 size={20} className="text-purple-500" /> Parameters
          </h3>

          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest px-1">Active Architecture</label>
              <select 
                value={selectedStrategy.id}
                onChange={(e) => setSelectedStrategy(AI_STRATEGIES.find(s => s.id === e.target.value)!)}
                className="w-full bg-[#0b0e11] border border-white/5 p-4 rounded-2xl text-[11px] font-black text-white appearance-none outline-none focus:border-purple-500 transition-all"
              >
                {AI_STRATEGIES.map(s => (
                  <option key={s.id} value={s.id}>{s.name} ({s.logicType})</option>
                ))}
              </select>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-gray-500">
                 <span>Risk Per Trade</span>
                 <span className="text-purple-500">{risk}%</span>
              </div>
              <input 
                type="range" min="0.1" max="5.0" step="0.1"
                value={risk}
                onChange={(e) => setRisk(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-[#0b0e11] rounded-lg appearance-none cursor-pointer accent-purple-500"
              />
            </div>

            <div className="p-6 bg-purple-500/5 border border-purple-500/10 rounded-3xl space-y-4">
               <div className="flex items-center gap-2 text-purple-400">
                  <Cpu size={16} />
                  <span className="text-[10px] font-black uppercase tracking-widest">Logic Info</span>
               </div>
               <p className="text-[11px] text-gray-500 font-medium leading-relaxed">{selectedStrategy.description}</p>
            </div>
          </div>
        </section>

        {/* Backtest Results */}
        <section className="lg:col-span-2 space-y-8">
           {backtestResult ? (
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in zoom-in-95 duration-500">
                <div className="bg-[#161a1e] border border-white/5 p-8 rounded-[40px] space-y-6 shadow-2xl">
                   <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
                     <BarChart3 size={14} className="text-emerald-500" /> Performance Matrix
                   </h4>
                   <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-1">
                         <p className="text-[8px] font-black text-gray-700 uppercase">Total Net</p>
                         <p className={`text-2xl font-black ${backtestResult.netProfit >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                           ${backtestResult.netProfit.toFixed(2)}
                         </p>
                      </div>
                      <div className="space-y-1">
                         <p className="text-[8px] font-black text-gray-700 uppercase">Win Rate</p>
                         <p className="text-2xl font-black text-white">{backtestResult.winRate.toFixed(1)}%</p>
                      </div>
                      <div className="space-y-1">
                         <p className="text-[8px] font-black text-gray-700 uppercase">Total Trades</p>
                         <p className="text-2xl font-black text-white">{backtestResult.totalTrades}</p>
                      </div>
                      <div className="space-y-1">
                         <p className="text-[8px] font-black text-gray-700 uppercase">Drawdown</p>
                         <p className="text-2xl font-black text-red-500">{backtestResult.maxDrawdown}%</p>
                      </div>
                   </div>
                   
                   <div className="pt-6 border-t border-white/5">
                      <div className="flex justify-between items-center mb-4">
                         <span className="text-[9px] font-black text-gray-600 uppercase">Equity Progression</span>
                         <span className="text-[10px] font-black text-blue-500 flex items-center gap-1"><TrendingUp size={12}/> Stabilizing</span>
                      </div>
                      <div className="h-24 flex items-end gap-1">
                        {backtestResult.equityCurve.slice(-20).map((val, i) => (
                          <div key={i} className="flex-1 bg-purple-600/20 border-t-2 border-purple-500 rounded-t-lg" style={{ height: `${(val / 11000) * 100}%` }} />
                        ))}
                      </div>
                   </div>
                </div>

                <div className="bg-[#161a1e] border border-white/5 p-8 rounded-[40px] space-y-6 shadow-2xl flex flex-col">
                   <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
                     <History size={14} className="text-blue-500" /> Trade Ledger
                   </h4>
                   <div className="flex-1 space-y-2 overflow-y-auto max-h-[300px] pr-2 custom-scrollbar">
                      {backtestResult.trades.map((t, i) => (
                        <div key={i} className="flex items-center justify-between p-4 bg-[#0b0e11] rounded-2xl border border-white/5 group hover:border-purple-500/30 transition-all">
                           <div className="flex items-center gap-3">
                              <div className={`p-1.5 rounded-lg ${t.result === 'WIN' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                                 <ArrowUpRight size={14} className={t.type === 'SELL' ? 'rotate-90' : ''} />
                              </div>
                              <div>
                                 <p className="text-[10px] font-black text-white uppercase">{t.type} Node</p>
                                 <p className="text-[8px] text-gray-600 mono">{new Date(t.entryTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                              </div>
                           </div>
                           <div className="text-right">
                              <p className={`text-[11px] font-black mono ${t.pnl >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                                {t.pnl >= 0 ? '+' : ''}{t.pnl.toFixed(2)}
                              </p>
                              <p className="text-[8px] font-black text-gray-700 uppercase">{t.result}</p>
                           </div>
                        </div>
                      ))}
                   </div>
                </div>
             </div>
           ) : (
             <div className="h-full min-h-[400px] flex flex-col items-center justify-center bg-[#161a1e] rounded-[40px] border border-dashed border-white/5 opacity-50 text-center p-12 space-y-4">
                <BarChart3 size={64} className="text-gray-700" />
                <div className="space-y-2">
                   <h4 className="text-xl font-black text-white uppercase tracking-tighter">Awaiting Simulation</h4>
                   <p className="text-[11px] text-gray-600 font-bold uppercase tracking-widest">Select architecture and establish parameters to run backtest.</p>
                </div>
             </div>
           )}

           <div className="bg-[#161a1e] border border-white/5 p-8 rounded-[40px] shadow-2xl space-y-6">
              <h3 className="text-lg font-black text-white uppercase tracking-tighter flex items-center gap-3">
                <Activity size={20} className="text-emerald-500" /> Real-time Pattern Scanner
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                 {[
                   { label: 'RSI Status', val: 'Oversold (24.2)', status: 'BUY_BIAS' },
                   { label: 'Volatility Band', val: 'Compressing', status: 'NEUTRAL' },
                   { label: 'SMC Structure', val: 'HH / HL Established', status: 'BULLISH' },
                 ].map((scan, i) => (
                   <div key={i} className="p-5 bg-[#0b0e11] rounded-3xl border border-white/5 flex flex-col justify-between">
                      <span className="text-[8px] font-black text-gray-700 uppercase tracking-widest">{scan.label}</span>
                      <p className="text-xs font-black text-white mt-1">{scan.val}</p>
                      <div className="mt-4 pt-4 border-t border-white/5 flex justify-between items-center">
                         <span className="text-[8px] font-black text-gray-500 uppercase">Detection</span>
                         <span className="text-[9px] font-black text-emerald-500 uppercase">{scan.status}</span>
                      </div>
                   </div>
                 ))}
              </div>
           </div>
        </section>
      </div>
    </div>
  );
};

export default StrategyLab;
