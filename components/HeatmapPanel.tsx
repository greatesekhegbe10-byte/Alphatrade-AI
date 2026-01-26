
import React from 'react';
import { MarketPair } from '../types';
import { FOREX_PAIRS } from '../constants';
import { Layers, TrendingUp, TrendingDown, Zap, BarChart3, Info } from 'lucide-react';

interface Props {
  onSelectPair: (pair: MarketPair) => void;
}

const HeatmapPanel: React.FC<Props> = ({ onSelectPair }) => {
  return (
    <div className="p-4 sm:p-8 space-y-6 sm:space-y-8 h-full overflow-y-auto bg-[#0b0e11] animate-in fade-in duration-500">
      <div className="space-y-1">
        <h2 className="text-2xl sm:text-3xl font-black flex items-center gap-3">
          <Layers className="text-blue-500" size={24} /> Market Heatmap
        </h2>
        <p className="text-gray-500 text-xs sm:text-sm">Real-time strength and volatility matrix across all assets.</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
        {FOREX_PAIRS.map(pair => {
          const strength = 50 + (pair.change * 20); // Simulated strength
          const isPositive = pair.change >= 0;
          
          return (
            <button 
              key={pair.symbol}
              onClick={() => onSelectPair(pair)}
              className="bg-[#161a1e] border border-[#1e2329] rounded-2xl p-3 sm:p-4 space-y-2 sm:space-y-3 hover:border-blue-500/50 transition-all group active:scale-95 text-left"
            >
              <div className="flex justify-between items-start">
                <span className="text-[10px] sm:text-xs font-black tracking-tighter">{pair.symbol}</span>
                {isPositive ? <TrendingUp size={12} className="text-green-500"/> : <TrendingDown size={12} className="text-red-500"/>}
              </div>
              <div className="space-y-1">
                <p className={`text-base sm:text-lg font-black mono ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
                  {isPositive ? '+' : ''}{pair.change.toFixed(2)}%
                </p>
                <div className="w-full h-1 bg-[#0b0e11] rounded-full overflow-hidden">
                   <div 
                     className={`h-full transition-all duration-1000 ${isPositive ? 'bg-green-500' : 'bg-red-500'}`}
                     style={{ width: `${Math.min(100, Math.abs(strength))}%` }}
                   />
                </div>
              </div>
              <div className="flex justify-between items-center text-[8px] font-black uppercase text-gray-600">
                 <span>Strength</span>
                 <span className={isPositive ? 'text-green-400' : 'text-red-400'}>{strength.toFixed(0)}%</span>
              </div>
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 mt-8 sm:mt-12 pb-8">
        <div className="bg-[#161a1e] rounded-3xl border border-[#1e2329] p-6 sm:p-8 space-y-6">
           <h3 className="font-black text-white flex items-center gap-2 text-base sm:text-lg">
             <Zap size={18} className="text-yellow-500" /> Velocity Alerts
           </h3>
           <div className="space-y-3 sm:space-y-4">
             {[
               { pair: 'XAU/USD', impact: 'HIGH', reason: 'Bullish Momentum Spike detected on H1' },
               { pair: 'GBP/USD', impact: 'MEDIUM', reason: 'Volatility compression near daily pivot' },
               { pair: 'BTC/USD', impact: 'HIGH', reason: 'High volume breakout confirmed' }
             ].map((alert, i) => (
               <div key={i} className="flex items-start gap-4 p-3 sm:p-4 bg-[#0b0e11] rounded-2xl border border-white/5">
                 <div className={`p-2 rounded-lg shrink-0 ${alert.impact === 'HIGH' ? 'bg-red-500/10 text-red-500' : 'bg-yellow-500/10 text-yellow-500'}`}>
                    <Info size={16}/>
                 </div>
                 <div>
                    <p className="text-[10px] font-black uppercase tracking-widest">{alert.pair}</p>
                    <p className="text-[9px] text-gray-600 line-clamp-2">{alert.reason}</p>
                 </div>
               </div>
             ))}
           </div>
        </div>

        <div className="bg-[#161a1e] rounded-3xl border border-[#1e2329] p-6 sm:p-8 space-y-6">
           <h3 className="font-black text-white flex items-center gap-2 text-base sm:text-lg">
             <BarChart3 size={18} className="text-blue-500" /> Correlated Moves
           </h3>
           <div className="space-y-3">
              {[
                { label: 'EURUSD vs GBPUSD', corr: '0.92', status: 'Strongly Positive' },
                { label: 'USDJPY vs XAUUSD', corr: '-0.85', status: 'Inversely' },
                { label: 'AUDUSD vs NZDUSD', corr: '0.95', status: 'Aligned' }
              ].map((c, i) => (
                <div key={i} className="flex justify-between items-center p-3 bg-[#0b0e11] rounded-xl border border-white/5">
                   <span className="text-[9px] sm:text-[10px] font-black text-gray-400">{c.label}</span>
                   <div className="text-right">
                      <p className="text-[10px] font-black text-blue-400">{c.corr}</p>
                      <p className="text-[8px] text-gray-600 uppercase font-bold">{c.status}</p>
                   </div>
                </div>
              ))}
           </div>
        </div>
      </div>
    </div>
  );
};

export default HeatmapPanel;
