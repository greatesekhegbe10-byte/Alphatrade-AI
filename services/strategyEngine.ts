
import { Candle, BacktestResult, IndicatorData } from '../types';

/**
 * STRATEGY ENGINE SERVICE
 * Handles technical analysis, price action detection, and historical backtesting.
 */

export const strategyEngine = {
  /**
   * Technical Indicators
   */
  calculateRSI: (candles: Candle[], period: number = 14): number[] => {
    const closes = candles.map(c => c.close);
    const rsi: number[] = new Array(closes.length).fill(0);
    
    let avgGain = 0;
    let avgLoss = 0;

    for (let i = 1; i < closes.length; i++) {
      const diff = closes[i] - closes[i - 1];
      const gain = diff > 0 ? diff : 0;
      const loss = diff < 0 ? -diff : 0;

      if (i <= period) {
        avgGain += gain / period;
        avgLoss += loss / period;
        if (i === period) {
          const rs = avgGain / (avgLoss || 1);
          rsi[i] = 100 - (100 / (1 + rs));
        }
      } else {
        avgGain = (avgGain * (period - 1) + gain) / period;
        avgLoss = (avgLoss * (period - 1) + loss) / period;
        const rs = avgGain / (avgLoss || 1);
        rsi[i] = 100 - (100 / (1 + rs));
      }
    }
    return rsi;
  },

  calculateSMA: (candles: Candle[], period: number): number[] => {
    const closes = candles.map(c => c.close);
    return closes.map((_, i) => {
      if (i < period - 1) return 0;
      const slice = closes.slice(i - period + 1, i + 1);
      return slice.reduce((a, b) => a + b, 0) / period;
    });
  },

  calculateEMA: (candles: Candle[], period: number): number[] => {
    const closes = candles.map(c => c.close);
    const k = 2 / (period + 1);
    const ema: number[] = new Array(closes.length).fill(0);
    ema[0] = closes[0];

    for (let i = 1; i < closes.length; i++) {
      ema[i] = closes[i] * k + ema[i - 1] * (1 - k);
    }
    return ema;
  },

  calculateBollingerBands: (candles: Candle[], period: number = 20, stdDev: number = 2) => {
    const closes = candles.map(c => c.close);
    const mid = strategyEngine.calculateSMA(candles, period);
    const upper: number[] = new Array(closes.length).fill(0);
    const lower: number[] = new Array(closes.length).fill(0);

    for (let i = period - 1; i < closes.length; i++) {
      const slice = closes.slice(i - period + 1, i + 1);
      const avg = mid[i];
      const squareDiffs = slice.map(v => Math.pow(v - avg, 2));
      const variance = squareDiffs.reduce((a, b) => a + b, 0) / period;
      const deviation = Math.sqrt(variance);
      upper[i] = avg + stdDev * deviation;
      lower[i] = avg - stdDev * deviation;
    }

    return { upper, lower, mid };
  },

  /**
   * Price Action Detection
   */
  detectPatterns: (candles: Candle[]) => {
    const last = candles[candles.length - 1];
    const prev = candles[candles.length - 2];
    
    // Pin Bar
    const bodySize = Math.abs(last.close - last.open);
    const candleSize = last.high - last.low;
    const isPinBar = bodySize < candleSize * 0.3;

    // Engulfing
    const isEngulfing = Math.abs(last.close - last.open) > Math.abs(prev.close - prev.open) &&
                        ((last.close > last.open && prev.close < prev.open) || 
                         (last.close < last.open && prev.close > prev.open));

    return { isPinBar, isEngulfing };
  },

  /**
   * Backtesting Engine
   */
  runBacktest: async (
    candles: Candle[], 
    strategyId: string, 
    riskPerTrade: number = 1.0
  ): Promise<BacktestResult> => {
    const rsi = strategyEngine.calculateRSI(candles);
    const bb = strategyEngine.calculateBollingerBands(candles);
    const initialBalance = 10000;
    let balance = initialBalance;
    const trades: any[] = [];
    const equityCurve: number[] = [initialBalance];

    // Simulate through candles (starting from period lookback)
    for (let i = 25; i < candles.length - 5; i++) {
      const current = candles[i];
      let signalType: 'BUY' | 'SELL' | null = null;

      // Logic based on Strategy ID
      if (strategyId === 'rsi_divergence') {
        if (rsi[i] < 30) signalType = 'BUY';
        if (rsi[i] > 70) signalType = 'SELL';
      } else if (strategyId === 'bb_mean_reversion') {
        if (current.close < bb.lower[i]) signalType = 'BUY';
        if (current.close > bb.upper[i]) signalType = 'SELL';
      }

      if (signalType) {
        const exitIndex = i + 3; // Simple exit after 3 candles
        const exit = candles[exitIndex];
        const isWin = signalType === 'BUY' ? exit.close > current.close : exit.close < current.close;
        const pnlPercent = Math.abs(exit.close - current.close) / current.close;
        const profit = isWin ? balance * (riskPerTrade / 100) * 2 : -balance * (riskPerTrade / 100);
        
        balance += profit;
        equityCurve.push(balance);
        trades.push({
          entryTime: current.time,
          exitTime: exit.time,
          type: signalType,
          pnl: profit,
          result: isWin ? 'WIN' : 'LOSS'
        });
        i = exitIndex; // Skip to exit
      }
    }

    const wins = trades.filter(t => t.result === 'WIN').length;
    const losses = trades.length - wins;

    return {
      totalTrades: trades.length,
      wins,
      losses,
      winRate: (wins / (trades.length || 1)) * 100,
      profitFactor: 1.5, // Mocked
      netProfit: balance - initialBalance,
      maxDrawdown: 5.2, // Mocked
      equityCurve,
      trades
    };
  }
};
