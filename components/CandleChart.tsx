import React, { useMemo, useRef, useEffect, useState } from 'react';
import { Candle, Timeframe, Signal, LiveSituation, MarketPair, SubscriptionTier } from '../types';
import { Activity, Zap, ChevronDown, Search, LockKeyhole } from 'lucide-react';
import { TIMEFRAMES, BASIC_ACCESS_PAIRS } from '../constants';
import { detectPatterns } from '../services/patternDetectionService';

interface Props {
  candles: Candle[];
  symbol: string;
  timeframe: Timeframe;
  onTimeframeChange: (tf: Timeframe) => void;
  signals: Signal[];
  liveSituation?: LiveSituation;
  assets: MarketPair[];
  onPairChange: (pair: MarketPair) => void;
  userTier?: SubscriptionTier;
}

const CandleChart: React.FC<Props> = ({ 
  candles, 
  symbol, 
  timeframe, 
  onTimeframeChange, 
  signals, 
  liveSituation,
  assets,
  onPairChange,
  userTier = 'BASIC'
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [cursor, setCursor] = useState<{x: number, y: number} | null>(null);
  const [isAssetOpen, setIsAssetOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setDimensions({
          width: entry.contentRect.width,
          height: entry.contentRect.height,
        });
      }
    });

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const { width, height } = dimensions;
  
  // Responsive Padding Calculation
  const isMobile = width < 640;
  const padding = { 
    top: isMobile ? 65 : 70, 
    bottom: 40, 
    left: 10, 
    right: isMobile ? 50 : 80 
  };

  const { minPrice, maxPrice, priceRange } = useMemo(() => {
    if (candles.length === 0) return { minPrice: 0, maxPrice: 100, priceRange: 100 };
    const allPrices = candles.flatMap(c => [c.high, c.low]);
    const min = Math.min(...allPrices);
    const max = Math.max(...allPrices);
    const margin = (max - min) * 0.15;
    return { 
      minPrice: min - margin, 
      maxPrice: max + margin, 
      priceRange: (max - min) + 2 * margin 
    };
  }, [candles]);

  const getY = (price: number) => {
    return height - padding.bottom - ((price - minPrice) / priceRange) * (height - padding.top - padding.bottom);
  };

  const getPriceFromY = (y: number) => {
    const chartHeight = height - padding.top - padding.bottom;
    const priceRatio = (height - padding.bottom - y) / chartHeight;
    return minPrice + (priceRatio * priceRange);
  };

  const candleWidth = (width - padding.left - padding.right) / Math.max(1, candles.length);
  const lastCandle = candles[candles.length - 1];
  const patterns = useMemo(() => detectPatterns(candles), [candles]);

  const filteredAssets = assets.filter(a => a.symbol.toLowerCase().includes(searchTerm.toLowerCase()));

  const handleMouseMove = (e: React.MouseEvent) => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const x = Math.max(padding.left, Math.min(e.clientX - rect.left, width - padding.right));
      const y = Math.max(padding.top, Math.min(e.clientY - rect.top, height - padding.bottom));
      setCursor({ x, y });
    }
  };

  const handleMouseLeave = () => {
    setCursor(null);
  };

  if (width === 0 || height === 0) return <div ref={containerRef} className="w-full h-full bg-[#0b0e11]" />;

  return (
    <div 
      ref={containerRef} 
      className="w-full h-full bg-[#0b0e11] relative overflow-hidden select-none border border-white/5 cursor-crosshair"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* 🟢 TOP HEADER BAR (Responsive: Scrollable on Mobile) */}
      <div className="absolute top-4 left-4 right-4 z-40 flex items-center gap-3 pointer-events-none overflow-x-auto no-scrollbar pr-4">
        
        {/* Pair Selector */}
        <div className="relative pointer-events-auto shrink-0">
          <button 
            onClick={() => setIsAssetOpen(!isAssetOpen)}
            className="flex items-center gap-3 bg-[#161a1e] hover:bg-[#1e2329] border border-white/10 px-4 py-2 rounded-xl shadow-xl transition-all"
          >
            <div className="flex flex-col items-start">
              <div className="flex items-center gap-2">
                <span className="text-sm font-black text-white tracking-tighter">{symbol}</span>
                <ChevronDown size={14} className={`text-gray-500 transition-transform ${isAssetOpen ? 'rotate-180' : ''}`} />
              </div>
              <span className={`text-[9px] font-bold ${lastCandle?.close >= candles[0]?.open ? 'text-emerald-500' : 'text-rose-500'}`}>
                {lastCandle?.close.toFixed(symbol.includes('JPY') ? 3 : 5)}
              </span>
            </div>
          </button>

          {isAssetOpen && (
            <div className="absolute top-full left-0 mt-2 w-72 max-h-80 bg-[#161a1e] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
              <div className="p-3 border-b border-white/5">
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input 
                    autoFocus
                    placeholder="Search pair..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-[#0b0e11] border border-white/10 rounded-lg pl-9 pr-3 py-2 text-xs font-bold text-white outline-none focus:border-blue-500"
                  />
                </div>
              </div>
              <div className="flex-1 overflow-y-auto custom-scrollbar p-1">
                {filteredAssets.map(asset => {
                  const isLocked = userTier === 'BASIC' && !BASIC_ACCESS_PAIRS.includes(asset.symbol);
                  return (
                    <button
                      key={asset.symbol}
                      disabled={isLocked}
                      onClick={() => {
                        if (!isLocked) {
                          onPairChange(asset);
                          setIsAssetOpen(false);
                          setSearchTerm('');
                        }
                      }}
                      className={`w-full flex items-center justify-between p-3 rounded-lg transition-all group ${symbol === asset.symbol ? 'bg-blue-600/10' : ''} ${isLocked ? 'opacity-50 cursor-not-allowed hover:bg-transparent' : 'hover:bg-white/5'}`}
                    >
                      <div className="text-left flex items-center gap-3">
                         <div>
                            <p className={`text-[10px] font-black ${symbol === asset.symbol ? 'text-blue-500' : 'text-gray-300 group-hover:text-white'}`}>{asset.symbol}</p>
                            <p className="text-[8px] text-gray-600 font-bold uppercase">{asset.category}</p>
                         </div>
                         {isLocked && <LockKeyhole size={10} className="text-gray-500" />}
                      </div>
                      <div className="text-right">
                         <p className="text-[10px] font-mono text-gray-400">{asset.price.toFixed(asset.symbol.includes('JPY') ? 3 : 5)}</p>
                         <p className={`text-[8px] font-black ${asset.change >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                           {asset.change >= 0 ? '+' : ''}{asset.change.toFixed(2)}%
                         </p>
                      </div>
                    </button>
                  );
                })}
              </div>
              {userTier === 'BASIC' && (
                <div className="p-3 bg-blue-600/10 border-t border-white/5 text-center">
                  <p className="text-[8px] font-black text-blue-500 uppercase tracking-widest">Upgrade to Unlock 50+ Assets</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Timeframe Selector */}
        <div className="flex bg-[#161a1e] p-1 rounded-2xl border border-white/10 shadow-xl overflow-x-auto no-scrollbar pointer-events-auto shrink-0">
          {TIMEFRAMES.map(tf => (
            <button 
              key={tf}
              onClick={() => onTimeframeChange(tf as Timeframe)}
              className={`px-3 py-1.5 rounded-xl text-[9px] font-black transition-all whitespace-nowrap ${timeframe === tf ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}
            >
              {tf}
            </button>
          ))}
        </div>

        {/* Live HUD (Compact - Hidden on Mobile to save space) */}
        <div className="hidden sm:flex items-center gap-3 ml-auto bg-[#161a1e]/90 backdrop-blur border border-white/10 rounded-2xl px-4 py-2 pointer-events-none shrink-0">
            <Activity size={14} className="text-blue-500 animate-pulse" />
            <div className="flex flex-col items-end">
               <span className={`text-[10px] font-black uppercase tracking-widest ${liveSituation?.sentiment === 'BULLISH' ? 'text-emerald-500' : liveSituation?.sentiment === 'BEARISH' ? 'text-rose-500' : 'text-blue-500'}`}>
                  {liveSituation?.sentiment || 'SCANNING'}
               </span>
               <span className="text-[8px] text-gray-500 font-bold uppercase">{liveSituation?.marketRegime || 'MARKET'}</span>
            </div>
        </div>
      </div>

      {/* Pattern Overlay HUD */}
      {patterns.length > 0 && (
        <div className="absolute bottom-4 right-20 z-30 flex gap-2 pointer-events-none">
          {patterns.slice(-2).map((p, i) => (
            <div key={i} className="bg-white/5 border border-white/10 backdrop-blur px-3 py-1.5 rounded-xl flex items-center gap-2">
               <Zap size={12} className={p.type === 'BULLISH' ? 'text-emerald-500' : p.type === 'BEARISH' ? 'text-rose-500' : 'text-gray-500'} />
               <span className="text-[8px] font-black text-white uppercase tracking-widest">{p.name}</span>
            </div>
          ))}
        </div>
      )}

      <svg width={width} height={height} className="chart-svg">
        {/* Grid and Axis */}
        {[0, 0.2, 0.4, 0.6, 0.8, 1].map((p, i) => {
          const price = minPrice + p * priceRange;
          const y = getY(price);
          return (
            <React.Fragment key={i}>
              <line x1={0} y1={y} x2={width - padding.right} y2={y} stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
              <text x={width - (isMobile ? 45 : 75)} y={y + 4} fill="#474d57" fontSize={isMobile ? "8" : "9"} className="mono">{price.toFixed(symbol.includes('JPY') ? 3 : 5)}</text>
            </React.Fragment>
          );
        })}

        {/* Candles and Pattern Markers */}
        {candles.map((candle, i) => {
          const x = padding.left + i * candleWidth;
          const isBull = candle.close >= candle.open;
          const color = isBull ? '#0ecb81' : '#f6465d';
          const wickX = x + candleWidth / 2;
          
          const pattern = patterns.find(p => p.index === i);

          return (
            <g key={candle.time}>
              <line x1={wickX} y1={getY(candle.high)} x2={wickX} y2={getY(candle.low)} stroke={color} strokeWidth="1" />
              <rect
                x={x + candleWidth * 0.2}
                y={Math.min(getY(candle.open), getY(candle.close))}
                width={Math.max(1, candleWidth * 0.6)}
                height={Math.max(1, Math.abs(getY(candle.open) - getY(candle.close)))}
                fill={color}
                fillOpacity={isBull ? 0.2 : 1}
                stroke={color}
              />
              {pattern && (
                <circle cx={wickX} cy={pattern.type === 'BULLISH' ? getY(candle.low) + 15 : getY(candle.high) - 15} r="3" fill={pattern.type === 'BULLISH' ? '#0ecb81' : '#f6465d'} />
              )}
            </g>
          );
        })}

        {/* Live Price Line */}
        {lastCandle && (
          <g>
            <line 
              x1={0} y1={getY(lastCandle.close)} 
              x2={width - padding.right} y2={getY(lastCandle.close)} 
              stroke="#2563eb" strokeWidth="1" strokeDasharray="4,4" 
            />
            <rect 
              x={width - padding.right} y={getY(lastCandle.close) - 10} 
              width={isMobile ? 50 : 80} height={20} fill="#2563eb" rx="4"
            />
            <text 
              x={width - padding.right + 5} y={getY(lastCandle.close) + 4} 
              fill="#fff" fontSize="10" fontWeight="black" className="mono"
            >
              {lastCandle.close.toFixed(symbol.includes('JPY') ? 3 : 5)}
            </text>
          </g>
        )}

        {/* Crosshair Overlay */}
        {cursor && (
          <g className="pointer-events-none">
             {/* Horizontal Line */}
             <line 
                x1={0} y1={cursor.y} 
                x2={width} y2={cursor.y} 
                stroke="rgba(255,255,255,0.4)" strokeWidth="1" strokeDasharray="3,3" 
             />
             {/* Vertical Line */}
             <line 
                x1={cursor.x} y1={0} 
                x2={cursor.x} y2={height} 
                stroke="rgba(255,255,255,0.4)" strokeWidth="1" strokeDasharray="3,3" 
             />
             
             {/* Price Label */}
             <rect 
               x={width - padding.right} y={cursor.y - 10} 
               width={isMobile ? 50 : 80} height={20} fill="#1e2329" rx="4" stroke="rgba(255,255,255,0.2)"
             />
             <text 
               x={width - padding.right + 5} y={cursor.y + 4} 
               fill="#fff" fontSize="10" fontWeight="bold" className="mono"
             >
               {getPriceFromY(cursor.y).toFixed(symbol.includes('JPY') ? 3 : 5)}
             </text>

             {/* Time Label */}
             <rect 
               x={cursor.x - 30} y={height - padding.bottom} 
               width={60} height={20} fill="#1e2329" rx="4" stroke="rgba(255,255,255,0.2)"
             />
             <text 
               x={cursor.x} y={height - padding.bottom + 14} 
               textAnchor="middle"
               fill="#fff" fontSize="9" fontWeight="bold" className="mono"
             >
               T-{Math.floor((width - padding.right - cursor.x) / candleWidth)}
             </text>
          </g>
        )}
      </svg>
    </div>
  );
};

export default CandleChart;