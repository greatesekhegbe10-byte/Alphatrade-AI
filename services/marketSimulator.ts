
import { Candle } from '../types';

export const generateInitialCandles = (basePrice: number, count: number = 100): Candle[] => {
  const candles: Candle[] = [];
  let currentPrice = basePrice;
  const now = Date.now();
  const minute = 60000;

  for (let i = count; i > 0; i--) {
    const volatility = currentPrice * 0.001;
    const open = currentPrice;
    const high = open + Math.random() * volatility;
    const low = open - Math.random() * volatility;
    const close = low + Math.random() * (high - low);
    
    candles.push({
      time: now - i * minute,
      open,
      high,
      low,
      close,
      volume: Math.floor(Math.random() * 1000)
    });
    currentPrice = close;
  }
  return candles;
};

export const updateLastCandle = (lastCandle: Candle): Candle => {
  const volatility = lastCandle.close * 0.0001;
  const change = (Math.random() - 0.5) * volatility;
  const newClose = lastCandle.close + change;
  
  return {
    ...lastCandle,
    close: newClose,
    high: Math.max(lastCandle.high, newClose),
    low: Math.min(lastCandle.low, newClose),
  };
};
