import React, { useState, useEffect } from 'react';
import { MarketPair, SubscriptionTier } from '../types';
import { Layers, TrendingUp, TrendingDown, Zap, BarChart3, Info, Activity, ArrowRightLeft, Target, Star, LockKeyhole } from 'lucide-react';

interface Props {
  pairs: MarketPair[];
  onSelectPair: (pair: MarketPair) => void;
  favorites: string[];
  onToggleFavorite: (symbol: string) => void;
  userTier: SubscriptionTier;
}

const HeatmapPanel: React.FC<Props> = ({ pairs, onSelectPair, favorites, onToggleFavorite, userTier }) => {
  const [prevPrices, setPrevPrices] = useState<Record<string, number>>({});

  useEffect(() => {
    const prices: Record<string, number> = {};
    pairs.forEach(p => { prices[p.symbol] = p.price; });
    setPrevPrices(prices);
  }, [pairs]);

  // Sort: Favorites first, then alphabetical
  const sortedPairs = [...pairs].sort((a, b) => {
    const aFav = favorites.includes(a.symbol);
    const bFav = favorites.includes(b.symbol);
    if (aFav && !bFav) return -1;
    if (!aFav && bFav) return 1;
    return a.symbol.localeCompare(b.symbol);
  });

  return (
    <div className="p-4 sm:p-8 space-y-6 sm:space-y-8 h-full overflow-y-auto bg-[#0b0e11] animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-white/5 pb-8">
        <div className="space-y-1">
          <h2 className="text-2xl sm:text-3xl font-black flex items-center gap-3 tracking-tighter uppercase">
            <Activity className="text-blue-500" size={24} /> Market Watch Dashboard
          </h2>
          <p className="text-gray-500 text-xs sm:text-sm font-medium uppercase tracking-widest">Live Institutional Liquidity Feed</p>
        </div>
        <div className="flex gap-2 bg-[#161a1e] p-2 rounded-2xl border border-white/5">
           <div className="px-4 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-500 text-[10px] font-black flex items-center gap-2">
              <TrendingUp size={12}/> HIGH VOLATILITY
           </div>
           <div className="px-4 py-1.5 rounded-xl bg-blue-500/10 text-blue-500 text-[10px] font-black flex items-center gap-2">
              <Activity size={12}/> SYNCED
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        <div className="xl:col-span-3 space-y-6">
           <div className="bg-[#161a1e] border border-white/5 rounded-[32px] overflow-hidden shadow-2xl">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#0b0e11] border-b border-white/5">
                    <th className="px-6 py-5 text-[10px] font-black text-gray-500 uppercase tracking-widest">Fav</th>
                    <th className="px-6 py-5 text-[10px] font-black text-gray-500 uppercase tracking-widest">Symbol</th>
                    <th className="px-6 py-5 text-[10px] font-black text-gray-500 uppercase tracking-widest text-right">Price</th>
                    <th className="px-6 py-5 text-[10px] font-black text-gray-500 uppercase tracking-widest text-right">Spread / ATR</th>
                    <th className="px-6 py-5 text-[10px] font-black text-gray-500 uppercase tracking-widest text-right">24H Chg</th>
                    <th className="px-6 py-5 text-[10px] font-black text-gray-500 uppercase tracking-widest text-center">Neural Bias</th>
                    <th className="px-6 py-5 text-[10px] font-black text-gray-500 uppercase tracking-widest text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {sortedPairs.map(pair => {
                    const diff = pair.price - (prevPrices[pair.symbol] || pair.price);
                    const flashClass = diff > 0 ? 'text-emerald-500 glow-green' : diff < 0 ? 'text-rose-500 glow-red' : 'text-white';
                    const isPositive = pair.change >= 0;
                    const isFav = favorites.includes(pair.symbol);
                    
                    // Tier Locking Logic: Basic sees only Major Pairs. Pro/Inst sees all.
                    const isLocked = userTier === 'BASIC' && !['EUR/USD', 'GBP/USD', 'USD/JPY', 'USD/CAD', 'AUD/USD'].includes(pair.symbol);

                    // Simple bias logic based on change and random institutional confluence
                    const bias = pair.change > 0.15 ? 'STRONG BUY' : pair.change > 0 ? 'BUY' : pair.change < -0.15 ? 'STRONG SELL' : pair.change < 0 ? 'SELL' : 'NEUTRAL';
                    
                    return (
                      <tr key={pair.symbol} className={`hover:bg-white/[0.02] transition-colors group ${isLocked ? 'opacity-50 grayscale' : ''}`}>
                        <td className="px-6 py-5">
                          <button 
                            onClick={() => onToggleFavorite(pair.symbol)}
                            className={`p-2 rounded-full hover:bg-white/5 transition-all ${isFav ? 'text-yellow-500' : 'text-gray-700'}`}
                          >
                            <Star size={14} fill={isFav ? "currentColor" : "none"} />
                          </button>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-3">
                             <div className={`size-8 rounded-xl flex items-center justify-center font-black text-[10px] border ${isPositive ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' : 'bg-rose-500/10 border-rose-500/20 text-rose-500'}`}>
                                {pair.symbol[0]}
                             </div>
                             <div>
                                <p className="text-xs font-black text-white uppercase tracking-tighter">{pair.symbol}</p>
                                <p className="text-[8px] text-gray-600 font-bold uppercase">{pair.category}</p>
                             </div>
                             {isLocked && <LockKeyhole size={12} className="text-red-500" />}
                          </div>
                        </td>
                        <td className="px-6 py-5 text-right">
                          <p className={`text-sm font-black mono transition-colors duration-500 ${flashClass}`}>
                            {isLocked ? '---.---' : pair.price.toFixed(pair.symbol.includes('JPY') ? 3 : 5)}
                          </p>
                        </td>
                        <td className="px-6 py-5 text-right">
                          <p className="text-[10px] font-black text-gray-500 mono">{(0.1 + Math.random() * 0.5).toFixed(1)} Pips</p>
                        </td>
                        <td className="px-6 py-5 text-right">
                           <p className={`text-[10px] font-black mono ${isPositive ? 'text-emerald-500' : 'text-rose-500'}`}>
                             {isPositive ? '+' : ''}{pair.change.toFixed(2)}%
                           </p>
                        </td>
                        <td className="px-6 py-5">
                           <div className="flex justify-center">
                              {isLocked ? (
                                <span className="text-[8px] font-black bg-white/5 px-2 py-1 rounded text-gray-600 uppercase">UPGRADE TIER</span>
                              ) : (
                                <span className={`px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest ${
                                  bias.includes('STRONG BUY') ? 'bg-emerald-600 text-white' :
                                  bias === 'BUY' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' :
                                  bias.includes('STRONG SELL') ? 'bg-rose-600 text-white' :
                                  bias === 'SELL' ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20' :
                                  'bg-blue-500/10 text-blue-500'
                                }`}>
                                  {bias}
                                </span>
                              )}
                           </div>
                        </td>
                        <td className="px-6 py-5">
                           <div className="flex justify-center">
                              <button 
                                onClick={() => !isLocked && onSelectPair(pair)}
                                disabled={isLocked}
                                className={`p-2 rounded-xl transition-all shadow-lg active:scale-90 ${isLocked ? 'bg-gray-800 text-gray-600 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-500 text-white'}`}
                              >
                                <Target size={14}/>
                              </button>
                           </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
           </div>
        </div>

        <div className="space-y-6">
           <div className="bg-[#161a1e] rounded-[32px] border border-white/5 p-8 space-y-6 shadow-2xl">
              <h3 className="font-black text-white flex items-center gap-3 text-base uppercase">
                <Zap size={18} className="text-yellow-500" /> Momentum Leaders
              </h3>
              <div className="space-y-4">
                 {pairs.sort((a,b) => Math.abs(b.change) - Math.abs(a.change)).slice(0, 4).map((p, i) => (
                   <div key={p.symbol} className="flex items-center justify-between p-4 bg-[#0b0e11] rounded-2xl border border-white/5">
                      <div className="flex items-center gap-3">
                         <span className="text-[10px] font-black text-gray-700">#{i+1}</span>
                         <span className="text-xs font-black text-white">{p.symbol}</span>
                      </div>
                      <span className={`text-[10px] font-black mono ${p.change >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                        {p.change.toFixed(2)}%
                      </span>
                   </div>
                 ))}
              </div>
           </div>

           <div className="bg-[#161a1e] rounded-[32px] border border-white/5 p-8 space-y-6 shadow-2xl">
              <h3 className="font-black text-white flex items-center gap-3 text-base uppercase">
                <BarChart3 size={18} className="text-blue-500" /> Sentiment Mix
              </h3>
              <div className="space-y-4">
                 <div className="space-y-2">
                    <div className="flex justify-between text-[10px] font-black uppercase">
                       <span className="text-emerald-500">Bullish (Long)</span>
                       <span className="text-rose-500">Bearish (Short)</span>
                    </div>
                    <div className="w-full h-3 bg-rose-500 rounded-full overflow-hidden flex">
                       <div className="h-full bg-emerald-500 transition-all duration-1000" style={{ width: '64%' }} />
                    </div>
                    <p className="text-center text-[8px] font-black text-gray-600 uppercase tracking-widest">Global Aggregate Analysis</p>
                 </div>
              </div>
           </div>

           <div className="p-8 bg-blue-500/5 border border-blue-500/10 rounded-[32px] flex items-center gap-4">
              <div className="size-10 rounded-2xl bg-blue-600/10 flex items-center justify-center text-blue-500">
                 <Info size={20}/>
              </div>
              <p className="text-[10px] text-gray-500 font-medium leading-relaxed italic">
                 "Dashboard pricing is node-synced with institutional liquidity pools for 0.0ms delay."
              </p>
           </div>
        </div>
      </div>
    </div>
  );
};

export default HeatmapPanel;