
import React, { useMemo, useRef, useEffect, useState } from 'react';
import { Candle, Timeframe, Signal, MarketRegime, LiveSituation } from '../types';
import { MousePointer2, TrendingUp, Minus, Compass, Activity, ArrowUp, ArrowDown } from 'lucide-react';
import { TIMEFRAMES } from '../constants';

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

  const candleWidth = (width - padding.left - padding.right) / Math.max(1, candles.length);
  const lastCandle = candles[candles.length - 1];
  const lastSignal = signals.find(s => s.pair === symbol);
  const currentRegime: MarketRegime = lastSignal?.regime || 'RANGING';

  return (
    <div ref={containerRef} className="w-full h-full bg-[#0b0e11] relative overflow-hidden select-none border border-white/5">
      {/* HUD Market Situation Card */}
      <div className="absolute top-4 left-4 z-30 pointer-events-none">
        <div className="bg-[#161a1e]/90 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-2xl flex flex-col gap-3 min-w-[200px]">
          <div className="flex justify-between items-center">
             <div className="flex items-center gap-2">
                <Activity size={16} className="text-blue-500 animate-pulse" />
                <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Neural Terminal</span>
             </div>
             <div className={`size-2 rounded-full animate-pulse ${liveSituation?.sentiment === 'BULLISH' ? 'bg-emerald-500' : liveSituation?.sentiment === 'BEARISH' ? 'bg-rose-500' : 'bg-blue-500'}`} />
          </div>

          <div className="flex items-baseline gap-2">
            <h3 className="text-2xl font-black text-white tracking-tighter">
              {lastCandle?.close.toFixed(symbol.includes('JPY') ? 3 : 5)}
            </h3>
            {lastCandle && (
              <div className={`flex items-center text-[10px] font-bold ${lastCandle.close >= lastCandle.open ? 'text-emerald-500' : 'text-rose-500'}`}>
                {lastCandle.close >= lastCandle.open ? <ArrowUp size={12}/> : <ArrowDown size={12}/>}
                {Math.abs(((lastCandle.close - lastCandle.open) / lastCandle.open) * 100).toFixed(3)}%
              </div>
            )}
          </div>

          <div className="space-y-1">
             <div className={`text-[10px] font-black uppercase tracking-widest ${liveSituation?.sentiment === 'BULLISH' ? 'text-emerald-500' : liveSituation?.sentiment === 'BEARISH' ? 'text-rose-500' : 'text-blue-500'}`}>
                {liveSituation?.sentiment || 'ANALYZING...'}
             </div>
             <p className="text-[9px] text-gray-400 font-medium leading-relaxed max-w-[180px]">
                {liveSituation?.shortSummary || 'Synchronizing with local price action...'}
             </p>
          </div>
        </div>
      </div>

      {/* Regime Indicator */}
      <div className="absolute top-4 right-4 z-20 flex items-center gap-3 bg-[#161a1e]/80 backdrop-blur px-4 py-2 rounded-2xl border border-white/5 shadow-2xl">
        <Compass size={16} className={`${currentRegime === 'TRENDING' ? 'text-emerald-500' : 'text-blue-500'} animate-pulse`} />
        <div>
          <p className="text-[8px] font-black text-gray-600 uppercase tracking-widest leading-none">Regime</p>
          <p className={`text-[10px] font-black uppercase ${currentRegime === 'TRENDING' ? 'text-emerald-500' : 'text-blue-500'}`}>{currentRegime}</p>
        </div>
      </div>

      {/* Timeframe Selector */}
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
      <div className="absolute top-1/2 -translate-y-1/2 left-4 z-20 flex flex-col gap-1 bg-[#161a1e] p-1.5 rounded-lg border border-white/5 shadow-xl">
        <button onClick={() => setActiveTool('SELECT')} className={`p-2 rounded hover:bg-white/5 ${activeTool === 'SELECT' ? 'text-blue-500' : 'text-gray-500'}`} title="Select"><MousePointer2 size={16}/></button>
        <button onClick={() => setActiveTool('TRENDLINE')} className={`p-2 rounded hover:bg-white/5 ${activeTool === 'TRENDLINE' ? 'text-blue-500' : 'text-gray-500'}`} title="Trendline"><TrendingUp size={16}/></button>
        <button onClick={() => setActiveTool('HLINE')} className={`p-2 rounded hover:bg-white/5 ${activeTool === 'HLINE' ? 'text-blue-500' : 'text-gray-500'}`} title="Horizontal Line"><Minus size={16}/></button>
      </div>

      <svg width={width} height={height} className="chart-svg cursor-crosshair">
        <defs>
          <linearGradient id="priceGlow" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#2563eb" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#2563eb" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Grid */}
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

        {/* Live Price Ticker Line */}
        {lastCandle && (
          <g>
            <line 
              x1={0} y1={getY(lastCandle.close)} 
              x2={width - padding.right} y2={getY(lastCandle.close)} 
              stroke="#2563eb" strokeWidth="1" strokeDasharray="4,4" 
              className="animate-pulse"
            />
            <rect 
              x={width - padding.right} y={getY(lastCandle.close) - 10} 
              width={80} height={20} fill="#2563eb" 
            />
            <text 
              x={width - padding.right + 5} y={getY(lastCandle.close) + 4} 
              fill="#fff" fontSize="10" fontWeight="black" className="mono"
            >
              {lastCandle.close.toFixed(symbol.includes('JPY') ? 3 : 5)}
            </text>
          </g>
        )}

        {/* Signals */}
        {signals.filter(s => s.pair === symbol && s.type !== 'WAIT').map(s => {
          const candleIndex = candles.findIndex(c => Math.abs(c.time - s.timestamp) < 60000);
          const x = candleIndex !== -1 ? padding.left + candleIndex * candleWidth + candleWidth/2 : width - padding.right - 40;
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
