import { Candle, CandlestickPattern } from '../../types';

export const detectPatterns = (candles: Candle[]): CandlestickPattern[] => {
  const patterns: CandlestickPattern[] = [];
  if (candles.length < 3) return patterns;

  for (let i = 2; i < candles.length; i++) {
    const c1 = candles[i - 1];
    const c2 = candles[i];
    const c1Body = Math.abs(c1.close - c1.open);
    const c2Body = Math.abs(c2.close - c2.open);
    const c1IsBull = c1.close > c1.open;
    const c2IsBull = c2.close > c2.open;

    if (!c1IsBull && c2IsBull && c2.close > c1.open && c2.open < c1.close && c2Body > c1Body) {
      patterns.push({ name: 'Bullish Engulfing', type: 'BULLISH', confidence: 85, index: i });
    }
    if (c1IsBull && !c2IsBull && c2.close < c1.open && c2.open > c1.close && c2Body > c1Body) {
      patterns.push({ name: 'Bearish Engulfing', type: 'BEARISH', confidence: 85, index: i });
    }
    if (c2Body < (c2.high - c2.low) * 0.1) {
      patterns.push({ name: 'Doji', type: 'NEUTRAL', confidence: 60, index: i });
    }
    const upperWick = c2.high - Math.max(c2.open, c2.close);
    const lowerWick = Math.min(c2.open, c2.close) - c2.low;
    if (lowerWick > c2Body * 2 && upperWick < c2Body * 0.5) {
      patterns.push({ name: 'Hammer / Bullish Pin', type: 'BULLISH', confidence: 75, index: i });
    }
    if (upperWick > c2Body * 2 && lowerWick < c2Body * 0.5) {
      patterns.push({ name: 'Shooting Star / Bearish Pin', type: 'BEARISH', confidence: 75, index: i });
    }
  }
  return patterns;
};
