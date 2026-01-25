
import { MarketPair, NewsEvent, Strategy } from './types';

export const FOREX_PAIRS: MarketPair[] = [
  // Majors
  { symbol: 'EUR/USD', base: 'EUR', quote: 'USD', price: 1.0845, change: 0.12 },
  { symbol: 'GBP/USD', base: 'GBP', quote: 'USD', price: 1.2632, change: -0.05 },
  { symbol: 'USD/JPY', base: 'USD', quote: 'JPY', price: 150.21, change: 0.45 },
  { symbol: 'AUD/USD', base: 'AUD', quote: 'USD', price: 0.6542, change: -0.21 },
  { symbol: 'USD/CAD', base: 'USD', quote: 'CAD', price: 1.3512, change: 0.08 },
  { symbol: 'USD/CHF', base: 'USD', quote: 'CHF', price: 0.8812, change: 0.04 },
  { symbol: 'NZD/USD', base: 'NZD', quote: 'USD', price: 0.6120, change: -0.10 },
  
  // Minors / Crosses
  { symbol: 'EUR/JPY', base: 'EUR', quote: 'JPY', price: 162.88, change: 0.32 },
  { symbol: 'GBP/JPY', base: 'GBP', quote: 'JPY', price: 190.45, change: 0.15 },
  { symbol: 'EUR/GBP', base: 'EUR', quote: 'GBP', price: 0.8582, change: 0.02 },
  { symbol: 'AUD/JPY', base: 'AUD', quote: 'JPY', price: 98.45, change: 0.11 },
  { symbol: 'EUR/AUD', base: 'EUR', quote: 'AUD', price: 1.6575, change: 0.05 },
  { symbol: 'GBP/CHF', base: 'GBP', quote: 'CHF', price: 1.1120, change: -0.08 },
  { symbol: 'CAD/JPY', base: 'CAD', quote: 'JPY', price: 111.15, change: 0.25 },
  { symbol: 'EUR/CAD', base: 'EUR', quote: 'CAD', price: 1.4650, change: -0.02 },
  { symbol: 'GBP/AUD', base: 'GBP', quote: 'AUD', price: 1.9310, change: 0.18 },
  { symbol: 'NZD/JPY', base: 'NZD', quote: 'JPY', price: 92.12, change: 0.05 },
  { symbol: 'AUD/CAD', base: 'AUD', quote: 'CAD', price: 0.8840, change: -0.15 },
  
  // Commodities/Metals
  { symbol: 'XAU/USD', base: 'XAU', quote: 'USD', price: 2024.15, change: 1.20 },
  { symbol: 'XAG/USD', base: 'XAG', quote: 'USD', price: 23.45, change: 0.85 },
  { symbol: 'WTI/USD', base: 'WTI', quote: 'USD', price: 78.42, change: -0.45 },
  { symbol: 'XPT/USD', base: 'XPT', quote: 'USD', price: 890.50, change: 0.30 },
  
  // Exotics
  { symbol: 'USD/ZAR', base: 'USD', quote: 'ZAR', price: 19.12, change: 0.55 },
  { symbol: 'USD/MXN', base: 'USD', quote: 'MXN', price: 17.05, change: -0.12 },
  { symbol: 'USD/SGD', base: 'USD', quote: 'SGD', price: 1.3450, change: 0.02 },
  { symbol: 'USD/TRY', base: 'USD', quote: 'TRY', price: 31.25, change: 0.75 },
  { symbol: 'USD/NOK', base: 'USD', quote: 'NOK', price: 10.55, change: 0.10 },
  { symbol: 'USD/SEK', base: 'USD', quote: 'SEK', price: 10.35, change: -0.05 },
  { symbol: 'USD/HKD', base: 'USD', quote: 'HKD', price: 7.82, change: 0.01 },
  
  // Crypto
  { symbol: 'BTC/USD', base: 'BTC', quote: 'USD', price: 62450, change: 2.45 },
  { symbol: 'ETH/USD', base: 'ETH', quote: 'USD', price: 3450, change: 1.85 },
  { symbol: 'SOL/USD', base: 'SOL', quote: 'USD', price: 145.20, change: 4.12 },
  { symbol: 'BNB/USD', base: 'BNB', quote: 'USD', price: 590.30, change: 1.10 },
];

export const TIMEFRAMES = ['M1', 'M5', 'M15', 'M30', 'H1', 'H4', 'D1'];

export const MOCK_NEWS: NewsEvent[] = [
  { id: '1', time: '14:30', currency: 'USD', event: 'CPI m/m', impact: 'HIGH' },
  { id: '2', time: '16:00', currency: 'GBP', event: 'GDP Output', impact: 'MEDIUM' },
  { id: '3', time: '20:15', currency: 'EUR', event: 'ECB President Speaks', impact: 'HIGH' },
];

export const AI_STRATEGIES: Strategy[] = [
  { id: 'london_break', name: 'London Breakout AI', description: 'Captures early volume shifts in the London session opening range.', riskProfile: 'BALANCED', winRate: 72, type: 'FOREX' },
  { id: 'binary_m5_scalp', name: 'Binary M5 Scalper AI', description: 'Optimized for 5-minute expiry binary options using momentum divergence.', riskProfile: 'AGGRESSIVE', winRate: 68, type: 'BINARY' },
  { id: 'cons_swing', name: 'Conservative Swing AI', description: 'Long-term trend following with strict confirmation logic.', riskProfile: 'CONSERVATIVE', winRate: 84, type: 'FOREX' },
];

export const INDICATORS = [
  { id: 'ema', name: 'EMA (20/50)', active: true },
  { id: 'rsi', name: 'RSI', active: true },
  { id: 'bb', name: 'Bollinger Bands', active: false },
  { id: 'macd', name: 'MACD', active: false },
];
