import React, { useMemo, useRef, useEffect, useState } from 'react';
import { Candle, Timeframe, Signal, LiveSituation } from '../types';
import { Activity, Zap } from 'lucide-react';
import { TIMEFRAMES } from '../constants';
import { detectPatterns } from '../services/patternDetectionService';

interface Props {
  candles: Candle[];
  symbol: string;
  timeframe: Timeframe;
  onTimeframeChange: (tf: Timeframe) => void;
  signals: Signal[];
  liveSituation?: LiveSituation;
}

const CandleChart: React.FC<Props> = ({ candles, symbol, timeframe, onTimeframeChange, signals, liveSituation }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 400 });
  const [cursor, setCursor] = useState<{x: number, y: number} | null>(null);

  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight,
        });
      }
    };
    window.addEventListener('resize', updateSize);
    updateSize();
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  const { width, height } = dimensions;
  const padding = { top: 60, bottom: 40, left: 10, right: 80 };

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

  return (
    <div 
      ref={containerRef} 
      className="w-full h-full bg-[#0b0e11] relative overflow-hidden select-none border border-white/5 cursor-crosshair"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* HUD Market Situation Card */}
      <div className="absolute top-4 left-4 z-30 pointer-events-none">
        <div className="bg-[#161a1e]/90 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-2xl flex flex-col gap-3 min-w-[220px]">
          <div className="flex justify-between items-center">
             <div className="flex items-center gap-2">
                <Activity size={16} className="text-blue-500 animate-pulse" />
                <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Institutional HUD</span>
             </div>
             <div className={`size-2 rounded-full animate-pulse ${liveSituation?.sentiment === 'BULLISH' ? 'bg-emerald-500' : liveSituation?.sentiment === 'BEARISH' ? 'bg-rose-500' : 'bg-blue-500'}`} />
          </div>

          <div className="flex items-baseline gap-2">
            <h3 className="text-2xl font-black text-white tracking-tighter">
              {lastCandle?.close.toFixed(symbol.includes('JPY') ? 3 : 5)}
            </h3>
          </div>

          <div className="space-y-1 pt-1 border-t border-white/5">
             <div className="flex justify-between items-center">
               <span className="text-[8px] font-black text-gray-600 uppercase">SMC Bias</span>
               <div className={`text-[10px] font-black uppercase tracking-widest ${liveSituation?.sentiment === 'BULLISH' ? 'text-emerald-500' : liveSituation?.sentiment === 'BEARISH' ? 'text-rose-500' : 'text-blue-500'}`}>
                  {liveSituation?.sentiment || 'ANALYZING...'}
               </div>
             </div>
             <div className="flex justify-between items-center">
               <span className="text-[8px] font-black text-gray-600 uppercase">Regime</span>
               <div className="text-[9px] font-black uppercase text-blue-400">
                  {liveSituation?.marketRegime || 'STABLE'}
               </div>
             </div>
          </div>
          
          <p className="text-[9px] text-gray-400 font-medium leading-relaxed max-w-[200px] border-t border-white/5 pt-2 italic">
             "{liveSituation?.shortSummary || 'Aligning structural nodes...'}"
          </p>
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

      {/* Timeframe Selector */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 flex bg-[#161a1e] p-1.5 rounded-2xl border border-white/10 shadow-xl">
        {TIMEFRAMES.map(tf => (
          <button 
            key={tf}
            onClick={() => onTimeframeChange(tf as Timeframe)}
            className={`px-4 py-2 rounded-xl text-[10px] font-black transition-all ${timeframe === tf ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}
          >
            {tf}
          </button>
        ))}
      </div>

      <svg width={width} height={height} className="chart-svg">
        {/* Grid and Axis */}
        {[0, 0.2, 0.4, 0.6, 0.8, 1].map((p, i) => {
          const price = minPrice + p * priceRange;
          const y = getY(price);
          return (
            <React.Fragment key={i}>
              <line x1={0} y1={y} x2={width - padding.right} y2={y} stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
              <text x={width - 75} y={y + 4} fill="#474d57" fontSize="9" className="mono">{price.toFixed(symbol.includes('JPY') ? 3 : 5)}</text>
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
              width={80} height={20} fill="#2563eb" rx="4"
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
               width={80} height={20} fill="#1e2329" rx="4" stroke="rgba(255,255,255,0.2)"
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