
import React, { useMemo, useRef, useEffect, useState } from 'react';
/* Removed missing Drawing and DrawingType imports from ../types */
import { Candle, Timeframe, Signal, MarketRegime } from '../types';
import { MousePointer2, TrendingUp, Minus, Hash, Trash2, Compass, AlertCircle } from 'lucide-react';
import { TIMEFRAMES } from '../constants';

interface Props {
  candles: Candle[];
  symbol: string;
  timeframe: Timeframe;
  onTimeframeChange: (tf: Timeframe) => void;
  signals: Signal[];
}

const CandleChart: React.FC<Props> = ({ candles, symbol, timeframe, onTimeframeChange, signals }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 400 });
  /* Updated state type to use local literal union as DrawingType is missing in types.ts */
  const [activeTool, setActiveTool] = useState<'TRENDLINE' | 'HLINE' | 'SELECT'>('SELECT');

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
  const padding = { top: 60, bottom: 40, left: 10, right: 60 };

  const { minPrice, maxPrice, priceRange } = useMemo(() => {
    if (candles.length === 0) return { minPrice: 0, maxPrice: 100, priceRange: 100 };
    const allPrices = candles.flatMap(c => [c.high, c.low]);
    const min = Math.min(...allPrices);
    const max = Math.max(...allPrices);
    return { minPrice: min - (max - min) * 0.1, maxPrice: max + (max - min) * 0.1, priceRange: (max - min) * 1.2 };
  }, [candles]);

  const getY = (price: number) => {
    return height - padding.bottom - ((price - minPrice) / priceRange) * (height - padding.top - padding.bottom);
  };

  const candleWidth = (width - padding.left - padding.right) / Math.max(1, candles.length);
  const lastSignal = signals.find(s => s.pair === symbol);
  const currentRegime: MarketRegime = lastSignal?.regime || 'RANGING';

  return (
    <div ref={containerRef} className="w-full h-full bg-[#0b0e11] relative overflow-hidden select-none border border-white/5">
      {/* HUD Regime Overlay */}
      <div className="absolute top-4 right-4 z-20 flex items-center gap-3 bg-[#161a1e]/80 backdrop-blur px-4 py-2 rounded-2xl border border-white/5 shadow-2xl">
        <Compass size={16} className={`${currentRegime === 'TRENDING' ? 'text-emerald-500' : 'text-blue-500'} animate-pulse`} />
        <div>
          <p className="text-[8px] font-black text-gray-600 uppercase tracking-widest leading-none">Market Regime</p>
          <p className={`text-[10px] font-black uppercase ${currentRegime === 'TRENDING' ? 'text-emerald-500' : 'text-blue-500'}`}>{currentRegime}</p>
        </div>
      </div>

      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 flex bg-[#161a1e] p-1 rounded-xl border border-white/5 shadow-xl">
        {TIMEFRAMES.map(tf => (
          <button 
            key={tf}
            onClick={() => onTimeframeChange(tf as Timeframe)}
            className={`px-3 py-1 rounded-lg text-[10px] font-black transition-all ${timeframe === tf ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}
          >
            {tf}
          </button>
        ))}
      </div>

      {/* Toolbar */}
      <div className="absolute top-16 left-4 z-20 flex flex-col gap-1 bg-[#161a1e] p-1.5 rounded-lg border border-white/5 shadow-xl">
        <button onClick={() => setActiveTool('SELECT')} className={`p-2 rounded hover:bg-white/5 ${activeTool === 'SELECT' ? 'text-blue-500' : 'text-gray-500'}`}><MousePointer2 size={16}/></button>
        <button onClick={() => setActiveTool('TRENDLINE')} className={`p-2 rounded hover:bg-white/5 ${activeTool === 'TRENDLINE' ? 'text-blue-500' : 'text-gray-500'}`}><TrendingUp size={16}/></button>
        <button onClick={() => setActiveTool('HLINE')} className={`p-2 rounded hover:bg-white/5 ${activeTool === 'HLINE' ? 'text-blue-500' : 'text-gray-500'}`}><Minus size={16}/></button>
      </div>

      <svg width={width} height={height} className="chart-svg cursor-crosshair">
        {/* Grid */}
        {[0, 0.2, 0.4, 0.6, 0.8, 1].map((p, i) => {
          const price = minPrice + p * priceRange;
          const y = getY(price);
          return (
            <React.Fragment key={i}>
              <line x1={0} y1={y} x2={width - padding.right} y2={y} stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
              <text x={width - 55} y={y + 4} fill="#474d57" fontSize="9" className="mono">{price.toFixed(4)}</text>
            </React.Fragment>
          );
        })}

        {/* Candles */}
        {candles.map((candle, i) => {
          const x = padding.left + i * candleWidth;
          const isBull = candle.close >= candle.open;
          const color = isBull ? '#0ecb81' : '#f6465d';
          const wickX = x + candleWidth / 2;
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
            </g>
          );
        })}

        {/* Signals */}
        {signals.filter(s => s.pair === symbol && s.type !== 'WAIT').map(s => {
          const x = width - padding.right - 40;
          const y = getY(s.entry);
          const isUp = s.type === 'BUY' || s.type === 'CALL';
          return (
            <g key={s.id}>
               <path 
                 d={isUp ? "M-6,6 L0,-6 L6,6 Z" : "M-6,-6 L0,6 L6,-6 Z"} 
                 transform={`translate(${x}, ${isUp ? y + 25 : y - 25})`}
                 fill={isUp ? "#0ecb81" : "#f6465d"}
               />
               <text x={x + 10} y={isUp ? y + 29 : y - 21} fill={isUp ? "#0ecb81" : "#f6465d"} fontSize="8" fontWeight="black" className="uppercase tracking-widest">
                 {s.type}
               </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};

export default CandleChart;
