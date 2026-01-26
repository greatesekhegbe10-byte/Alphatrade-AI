
import { MarketPair, Strategy } from './types';

export const ALL_ASSETS: MarketPair[] = [
  // Forex Majors
  { symbol: 'EUR/USD', base: 'EUR', quote: 'USD', price: 1.0845, change: 0.12, category: 'FOREX' },
  { symbol: 'GBP/USD', base: 'GBP', quote: 'USD', price: 1.2632, change: -0.05, category: 'FOREX' },
  { symbol: 'USD/JPY', base: 'USD', quote: 'JPY', price: 150.21, change: 0.45, category: 'FOREX' },
  { symbol: 'AUD/USD', base: 'AUD', quote: 'USD', price: 0.6542, change: -0.21, category: 'FOREX' },
  { symbol: 'USD/CAD', base: 'USD', quote: 'CAD', price: 1.3512, change: 0.08, category: 'FOREX' },
  { symbol: 'USD/CHF', base: 'USD', quote: 'CHF', price: 0.8812, change: 0.04, category: 'FOREX' },
  { symbol: 'NZD/USD', base: 'NZD', quote: 'USD', price: 0.6120, change: -0.10, category: 'FOREX' },
  
  // Crosses & Minors
  { symbol: 'EUR/JPY', base: 'EUR', quote: 'JPY', price: 162.15, change: 0.15, category: 'FOREX' },
  { symbol: 'GBP/JPY', base: 'GBP', quote: 'JPY', price: 189.42, change: 0.18, category: 'FOREX' },
  { symbol: 'EUR/GBP', base: 'EUR', quote: 'GBP', price: 0.8542, change: 0.02, category: 'FOREX' },
  { symbol: 'AUD/JPY', base: 'AUD', quote: 'JPY', price: 98.42, change: 0.12, category: 'FOREX' },
  { symbol: 'GBP/CAD', base: 'GBP', quote: 'CAD', price: 1.7120, change: -0.05, category: 'FOREX' },
  { symbol: 'EUR/AUD', base: 'EUR', quote: 'AUD', price: 1.6542, change: -0.15, category: 'FOREX' },
  { symbol: 'USD/ZAR', base: 'USD', quote: 'ZAR', price: 18.95, change: 0.22, category: 'FOREX' },
  { symbol: 'USD/MXN', base: 'USD', quote: 'MXN', price: 17.02, change: -0.11, category: 'FOREX' },
  { symbol: 'EUR/CHF', base: 'EUR', quote: 'CHF', price: 0.9542, change: -0.03, category: 'FOREX' },
  { symbol: 'CAD/JPY', base: 'CAD', quote: 'JPY', price: 111.12, change: 0.08, category: 'FOREX' },
  { symbol: 'NZD/JPY', base: 'NZD', quote: 'JPY', price: 92.45, change: 0.04, category: 'FOREX' },

  // Indices
  { symbol: 'NAS100', base: 'NAS', quote: 'USD', price: 18230.50, change: 0.85, category: 'INDICES' },
  { symbol: 'US30', base: 'DJI', quote: 'USD', price: 39120.20, change: 0.42, category: 'INDICES' },
  { symbol: 'GER40', base: 'DAX', quote: 'EUR', price: 17850.10, change: -0.15, category: 'INDICES' },
  { symbol: 'SPX500', base: 'SPX', quote: 'USD', price: 5120.40, change: 0.25, category: 'INDICES' },

  // Commodities
  { symbol: 'XAU/USD', base: 'XAU', quote: 'USD', price: 2320.15, change: 1.20, category: 'COMMODITIES' },
  { symbol: 'WTI/USD', base: 'WTI', quote: 'USD', price: 78.42, change: -0.45, category: 'COMMODITIES' },
  { symbol: 'XAG/USD', base: 'XAG', quote: 'USD', price: 28.15, change: 0.85, category: 'COMMODITIES' },

  // Crypto
  { symbol: 'BTC/USD', base: 'BTC', quote: 'USD', price: 62450, change: 2.45, category: 'CRYPTO' },
  { symbol: 'ETH/USD', base: 'ETH', quote: 'USD', price: 3450, change: 1.85, category: 'CRYPTO' },
  { symbol: 'SOL/USD', base: 'SOL', quote: 'USD', price: 145, change: 3.12, category: 'CRYPTO' },
];

export const FOREX_PAIRS = ALL_ASSETS.filter(p => p.category === 'FOREX');

export const TOP_MT5_BROKERS = [
  "Exness", 
  "XM Global", 
  "IC Markets", 
  "Pepperstone", 
  "FBS", 
  "HotForex", 
  "Deriv MT5", 
  "Vantage Markets", 
  "Oanda"
];

export const TOP_BINARY_BROKERS = [
  "Pocket Option", 
  "Quotex", 
  "IQ Option", 
  "Deriv / Binary.com", 
  "Olymp Trade", 
  "ExpertOption", 
  "Binomo", 
  "Spectre.ai"
];

export const AI_STRATEGIES: Strategy[] = [
  { id: 'london_break', name: 'London Breakout AI', description: 'Early volume shifts in the London opening range.', riskProfile: 'BALANCED', winRate: 72, drawdown: 4.2, stabilityScore: 88, type: 'FOREX', logicType: 'AI' },
  { id: 'binary_m5_scalp', name: 'Binary M5 Scalper AI', description: '5-minute binary expiry with momentum divergence.', riskProfile: 'AGGRESSIVE', winRate: 68, drawdown: 12.5, stabilityScore: 65, type: 'BINARY', logicType: 'TECHNICAL' },
  { id: 'institutional_smc', name: 'Institutional SMC Node', description: 'Smart Money Concepts targeting liquidity pools.', riskProfile: 'CONSERVATIVE', winRate: 84, drawdown: 2.1, stabilityScore: 94, type: 'FOREX', logicType: 'PRICE_ACTION' },
  { id: 'rsi_divergence', name: 'RSI Divergence Engine', description: 'Technical divergence detection between price and momentum.', riskProfile: 'BALANCED', winRate: 75, drawdown: 6.5, stabilityScore: 82, type: 'FOREX', logicType: 'TECHNICAL' },
  { id: 'bb_mean_reversion', name: 'Bollinger Mean Reversion', description: 'Rejection strategies at Bollinger Band extremes.', riskProfile: 'CONSERVATIVE', winRate: 78, drawdown: 3.8, stabilityScore: 90, type: 'FOREX', logicType: 'TECHNICAL' },
];

export const TIMEFRAMES = ['M1', 'M5', 'M15', 'M30', 'H1', 'H4', 'D1'];
