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
  
  // Forex Crosses & Minors
  { symbol: 'EUR/GBP', base: 'EUR', quote: 'GBP', price: 0.8542, change: 0.02, category: 'FOREX' },
  { symbol: 'EUR/JPY', base: 'EUR', quote: 'JPY', price: 162.15, change: 0.15, category: 'FOREX' },
  { symbol: 'GBP/JPY', base: 'GBP', quote: 'JPY', price: 189.42, change: 0.18, category: 'FOREX' },
  { symbol: 'AUD/JPY', base: 'AUD', quote: 'JPY', price: 98.42, change: 0.12, category: 'FOREX' },
  { symbol: 'EUR/AUD', base: 'EUR', quote: 'AUD', price: 1.6542, change: -0.15, category: 'FOREX' },
  { symbol: 'GBP/AUD', base: 'GBP', quote: 'AUD', price: 1.9120, change: -0.25, category: 'FOREX' },
  { symbol: 'CAD/JPY', base: 'CAD', quote: 'JPY', price: 111.42, change: 0.05, category: 'FOREX' },
  { symbol: 'CHF/JPY', base: 'CHF', quote: 'JPY', price: 170.12, change: 0.10, category: 'FOREX' },
  { symbol: 'NZD/JPY', base: 'NZD', quote: 'JPY', price: 92.45, change: 0.04, category: 'FOREX' },
  { symbol: 'EUR/CHF', base: 'EUR', quote: 'CHF', price: 0.9542, change: -0.03, category: 'FOREX' },
  { symbol: 'GBP/CHF', base: 'GBP', quote: 'CHF', price: 1.1245, change: 0.01, category: 'FOREX' },
  { symbol: 'AUD/NZD', base: 'AUD', quote: 'NZD', price: 1.0712, change: -0.08, category: 'FOREX' },

  // Institutional Secondary Assets
  { symbol: 'XAU/USD', base: 'XAU', quote: 'USD', price: 2320.15, change: 1.20, category: 'COMMODITIES' },
  { symbol: 'NAS100', base: 'NAS', quote: 'USD', price: 18230.50, change: 0.85, category: 'INDICES' },
  { symbol: 'US30', base: 'DJI', quote: 'USD', price: 39120.20, change: 0.42, category: 'INDICES' },
  { symbol: 'XAG/USD', base: 'XAG', quote: 'USD', price: 28.15, change: 0.85, category: 'COMMODITIES' }
];

export const FOREX_PAIRS = ALL_ASSETS.filter(p => p.category === 'FOREX');

export const AI_STRATEGIES: Strategy[] = [
  { id: 'institutional_smc', name: 'Institutional SMC Node', description: 'Smart Money Concepts targeting liquidity pools.', riskProfile: 'CONSERVATIVE', winRate: 84, drawdown: 2.1, stabilityScore: 94, type: 'FOREX', logicType: 'PRICE_ACTION' },
  { id: 'london_break', name: 'London Breakout AI', description: 'Early volume shifts in the London opening range.', riskProfile: 'BALANCED', winRate: 72, drawdown: 4.2, stabilityScore: 88, type: 'FOREX', logicType: 'AI' },
  { id: 'rsi_divergence', name: 'RSI Divergence Engine', description: 'Technical divergence detection between price and momentum.', riskProfile: 'BALANCED', winRate: 75, drawdown: 6.5, stabilityScore: 82, type: 'FOREX', logicType: 'TECHNICAL' },
  { id: 'bb_mean_reversion', name: 'BB Mean Reversion AI', description: 'Mean reversion strategy using Bollinger Bands and RSI.', riskProfile: 'BALANCED', winRate: 70, drawdown: 5.0, stabilityScore: 85, type: 'FOREX', logicType: 'TECHNICAL' }
];

export const TIMEFRAMES = ['M15', 'M30', 'H1', 'H4', 'D1'];

export const TOP_MT5_BROKERS = ['Exness', 'Deriv', 'IC Markets', 'Pepperstone', 'XM'];
export const TOP_BINARY_BROKERS = ['Pocket Option', 'Quotex', 'Deriv (Binary)', 'IQ Option'];