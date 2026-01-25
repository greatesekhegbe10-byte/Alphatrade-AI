
import React, { useMemo, useRef, useEffect, useState } from 'react';
import { Candle, Drawing, DrawingType, Timeframe, Signal } from '../types';
import { MousePointer2, TrendingUp, Minus, Hash, Trash2, Clock, AlertCircle } from 'lucide-react';
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
  const [drawings, setDrawings] = useState<Drawing[]>([]);
  const [activeTool, setActiveTool] = useState<DrawingType | 'SELECT'>('SELECT');
  const [currentDrawing, setCurrentDrawing] = useState<Drawing | null>(null);

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

  const getPrice = (y: number) => {
    const relativeY = height - padding.bottom - y;
    return minPrice + (relativeY / (height - padding.top - padding.bottom)) * priceRange;
  };

  const candleWidth = (width - padding.left - padding.right) / Math.max(1, candles.length);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (activeTool === 'SELECT') return;
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const price = getPrice(y);
    const newDrawing: Drawing = {
      id: Math.random().toString(36).substr(2, 9),
      type: activeTool,
      points: [{ x, y, price, time: Date.now() }],
      color: '#3b82f6',
    };
    setCurrentDrawing(newDrawing);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!currentDrawing) return;
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const price = getPrice(y);
    setCurrentDrawing({
      ...currentDrawing,
      points: [currentDrawing.points[0], { x, y, price, time: Date.now() }],
    });
  };

  const handleMouseUp = () => {
    if (currentDrawing) {
      setDrawings([...drawings, currentDrawing]);
      setCurrentDrawing(null);
      setActiveTool('SELECT');
    }
  };

  return (
    <div 
      ref={containerRef} 
      className="w-full h-full bg-[#0b0e11] relative overflow-hidden select-none border border-[#1e2329]"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      {/* Timeframe Selector */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 flex bg-[#161a1e] p-1 rounded-xl border border-[#2b2f36] shadow-2xl">
        {(TIMEFRAMES as Timeframe[]).map(tf => (
          <button 
            key={tf}
            onClick={() => onTimeframeChange(tf)}
            className={`px-3 py-1 rounded-lg text-[10px] font-black transition-all ${timeframe === tf ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}
          >
            {tf}
          </button>
        ))}
      </div>

      {/* Floating Toolbar */}
      <div className="absolute top-16 left-4 z-20 flex flex-col gap-1 bg-[#161a1e] p-1.5 rounded-lg border border-[#2b2f36] shadow-xl">
        <button onClick={() => setActiveTool('SELECT')} className={`p-2 rounded hover:bg-[#2b2f36] ${activeTool === 'SELECT' ? 'text-blue-500 bg-blue-500/10' : 'text-gray-400'}`}><MousePointer2 size={16}/></button>
        <button onClick={() => setActiveTool('TRENDLINE')} className={`p-2 rounded hover:bg-[#2b2f36] ${activeTool === 'TRENDLINE' ? 'text-blue-500 bg-blue-500/10' : 'text-gray-400'}`}><TrendingUp size={16}/></button>
        <button onClick={() => setActiveTool('HLINE')} className={`p-2 rounded hover:bg-[#2b2f36] ${activeTool === 'HLINE' ? 'text-blue-500 bg-blue-500/10' : 'text-gray-400'}`}><Minus size={16}/></button>
        <button onClick={() => setActiveTool('FIBONACCI')} className={`p-2 rounded hover:bg-[#2b2f36] ${activeTool === 'FIBONACCI' ? 'text-blue-500 bg-blue-500/10' : 'text-gray-400'}`}><Hash size={16}/></button>
        <div className="h-px bg-[#2b2f36] my-1" />
        <button onClick={() => setDrawings([])} className="p-2 rounded hover:bg-red-500/10 text-gray-400 hover:text-red-500"><Trash2 size={16}/></button>
      </div>

      <div className="absolute top-4 left-4 z-10 pointer-events-none">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <span className="text-yellow-400">{symbol}</span>
          <span className="text-sm font-normal text-gray-500">REAL-TIME BRIDGE ACTIVE</span>
        </h2>
      </div>

      {/* News Overlay */}
      <div className="absolute top-16 right-4 z-10 flex flex-col gap-2">
         <div className="bg-red-500/10 border border-red-500/30 px-3 py-1.5 rounded-lg flex items-center gap-2 animate-pulse">
            <AlertCircle size={14} className="text-red-500" />
            <span className="text-[10px] font-black text-red-500 uppercase tracking-widest">High Impact: USD CPI (14:30)</span>
         </div>
      </div>

      <svg width={width} height={height} className="chart-svg cursor-crosshair">
        {/* Price Grid */}
        {[0, 0.2, 0.4, 0.6, 0.8, 1].map((p, i) => {
          const price = minPrice + p * priceRange;
          const y = getY(price);
          return (
            <React.Fragment key={i}>
              <line x1={0} y1={y} x2={width - padding.right} y2={y} stroke="#1e2329" strokeWidth="1" />
              <text x={width - 55} y={y + 4} fill="#848e9c" fontSize="9" className="mono">
                {price.toFixed(4)}
              </text>
            </React.Fragment>
          );
        })}

        {/* Signal Markers */}
        {signals.filter(s => s.pair === symbol).map((s, i) => {
          const x = width - padding.right - 50; // Mock latest x
          const y = getY(s.entry);
          const isUp = s.type === 'BUY' || s.type === 'CALL';
          return (
            <g key={s.id}>
               <path 
                 d={isUp ? "M-8,8 L0,-8 L8,8 Z" : "M-8,-8 L0,8 L8,-8 Z"} 
                 transform={`translate(${x}, ${isUp ? y + 20 : y - 20})`}
                 fill={isUp ? "#0ecb81" : "#f6465d"}
               />
               <text x={x + 12} y={isUp ? y + 24 : y - 16} fill={isUp ? "#0ecb81" : "#f6465d"} fontSize="9" fontWeight="bold">
                 {s.type} @ {s.pattern}
               </text>
            </g>
          );
        })}

        {/* Candles */}
        {candles.map((candle, i) => {
          const x = padding.left + i * candleWidth;
          const isBull = candle.close >= candle.open;
          const color = isBull ? '#0ecb81' : '#f6465d';
          const wickX = x + candleWidth / 2;
          const yOpen = getY(candle.open);
          const yClose = getY(candle.close);
          const yHigh = getY(candle.high);
          const yLow = getY(candle.low);
          return (
            <g key={candle.time}>
              <line x1={wickX} y1={yHigh} x2={wickX} y2={yLow} stroke={color} strokeWidth="1" />
              <rect
                x={x + candleWidth * 0.2}
                y={Math.min(yOpen, yClose)}
                width={Math.max(1, candleWidth * 0.6)}
                height={Math.max(1, Math.abs(yOpen - yClose))}
                fill={isBull ? color : color}
                fillOpacity={isBull ? 0.3 : 1}
                stroke={color}
              />
            </g>
          );
        })}

        {/* Live Price Tracker */}
        {candles.length > 0 && (
          <g>
            <line x1={0} y1={getY(candles[candles.length - 1].close)} x2={width - padding.right} y2={getY(candles[candles.length - 1].close)} stroke="#848e9c" strokeDasharray="3 3" />
            <rect x={width - 60} y={getY(candles[candles.length - 1].close) - 9} width={58} height={18} fill="#2b2f36" rx="2" />
            <text x={width - 55} y={getY(candles[candles.length - 1].close) + 4} fill="#eaecef" fontSize="10" className="mono">{candles[candles.length - 1].close.toFixed(4)}</text>
          </g>
        )}
      </svg>
    </div>
  );
};

export default CandleChart;
