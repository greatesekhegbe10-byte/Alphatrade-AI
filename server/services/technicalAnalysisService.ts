import { Candle, TechnicalIndicators } from '../../types';

export const calculateSMA = (data: number[], period: number): number => {
  if (data.length < period) return 0;
  const slice = data.slice(-period);
  return slice.reduce((a, b) => a + b, 0) / period;
};

export const calculateRSI = (data: number[], period: number = 14): number => {
  if (data.length <= period) return 50;
  
  let gains = 0;
  let losses = 0;

  for (let i = data.length - period; i < data.length; i++) {
    const diff = data[i] - data[i - 1];
    if (diff >= 0) gains += diff;
    else losses -= diff;
  }

  if (losses === 0) return 100;
  
  const rs = (gains / period) / (losses / period);
  return 100 - (100 / (1 + rs));
};

export const calculateMACD = (data: number[]) => {
  const ema12 = calculateEMA(data, 12);
  const ema26 = calculateEMA(data, 26);
  const macd = ema12 - ema26;
  // Simplified signal line (usually an EMA of the MACD line)
  const signal = macd * 0.9; // Mocking signal for simplicity in this context
  return {
    macd,
    signal,
    histogram: macd - signal
  };
};

export const calculateEMA = (data: number[], period: number): number => {
  if (data.length < period) return data[data.length - 1] || 0;
  const k = 2 / (period + 1);
  let ema = calculateSMA(data.slice(0, period), period);
  for (let i = period; i < data.length; i++) {
    ema = data[i] * k + ema * (1 - k);
  }
  return ema;
};

export const calculateATR = (candles: Candle[], period: number = 14): number => {
  if (candles.length <= period) return 0;
  let trSum = 0;
  for (let i = candles.length - period; i < candles.length; i++) {
    const high = candles[i].high;
    const low = candles[i].low;
    const prevClose = candles[i - 1].close;
    const tr = Math.max(high - low, Math.abs(high - prevClose), Math.abs(low - prevClose));
    trSum += tr;
  }
  return trSum / period;
};

export const getTechnicalAnalysis = (candles: Candle[]): TechnicalIndicators => {
  const closes = candles.map(c => c.close);
  
  const sma20 = calculateSMA(closes, 20);
  const sma50 = calculateSMA(closes, 50);
  const sma200 = calculateSMA(closes, 200);
  const rsi = calculateRSI(closes, 14);
  const macd = calculateMACD(closes);
  
  const stdDev = Math.sqrt(closes.slice(-20).reduce((sq, n) => sq + Math.pow(n - sma20, 2), 0) / 20);
  
  return {
    sma20,
    sma50,
    sma200,
    rsi,
    macd,
    bollingerBands: {
      upper: sma20 + (stdDev * 2),
      middle: sma20,
      lower: sma20 - (stdDev * 2)
    },
    atr: calculateATR(candles, 14)
  };
};
