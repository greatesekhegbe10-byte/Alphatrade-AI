import { MarketPair, Strategy } from './types';

export const BASIC_ACCESS_PAIRS = ['EUR/USD', 'GBP/USD', 'USD/JPY', 'USD/CAD', 'AUD/USD', 'NZD/USD', 'USD/CHF'];

export const ALL_ASSETS: MarketPair[] = [
  // --- FOREX MAJORS (BASIC TIER) ---
  { symbol: 'EUR/USD', base: 'EUR', quote: 'USD', price: 1.0845, change: 0.12, category: 'FOREX' },
  { symbol: 'GBP/USD', base: 'GBP', quote: 'USD', price: 1.2632, change: -0.05, category: 'FOREX' },
  { symbol: 'USD/JPY', base: 'USD', quote: 'JPY', price: 150.21, change: 0.45, category: 'FOREX' },
  { symbol: 'AUD/USD', base: 'AUD', quote: 'USD', price: 0.6542, change: -0.21, category: 'FOREX' },
  { symbol: 'USD/CAD', base: 'USD', quote: 'CAD', price: 1.3512, change: 0.15, category: 'FOREX' },
  { symbol: 'NZD/USD', base: 'NZD', quote: 'USD', price: 0.6120, change: -0.10, category: 'FOREX' },
  { symbol: 'USD/CHF', base: 'USD', quote: 'CHF', price: 0.8845, change: 0.05, category: 'FOREX' },

  // --- FOREX MINORS (PRO TIER) ---
  { symbol: 'EUR/GBP', base: 'EUR', quote: 'GBP', price: 0.8560, change: 0.02, category: 'FOREX' },
  { symbol: 'EUR/JPY', base: 'EUR', quote: 'JPY', price: 163.45, change: 0.65, category: 'FOREX' },
  { symbol: 'GBP/JPY', base: 'GBP', quote: 'JPY', price: 190.12, change: 0.75, category: 'FOREX' },
  { symbol: 'AUD/JPY', base: 'AUD', quote: 'JPY', price: 98.45, change: 0.30, category: 'FOREX' },
  { symbol: 'CHF/JPY', base: 'CHF', quote: 'JPY', price: 169.80, change: 0.25, category: 'FOREX' },
  { symbol: 'EUR/AUD', base: 'EUR', quote: 'AUD', price: 1.6540, change: -0.15, category: 'FOREX' },
  { symbol: 'GBP/AUD', base: 'GBP', quote: 'AUD', price: 1.9320, change: -0.20, category: 'FOREX' },
  { symbol: 'AUD/CAD', base: 'AUD', quote: 'CAD', price: 0.8850, change: 0.10, category: 'FOREX' },
  { symbol: 'CAD/JPY', base: 'CAD', quote: 'JPY', price: 111.20, change: 0.40, category: 'FOREX' },
  { symbol: 'NZD/JPY', base: 'NZD', quote: 'JPY', price: 91.50, change: 0.35, category: 'FOREX' },
  
  // Extended Minors
  { symbol: 'EUR/CAD', base: 'EUR', quote: 'CAD', price: 1.4650, change: 0.18, category: 'FOREX' },
  { symbol: 'EUR/CHF', base: 'EUR', quote: 'CHF', price: 0.9540, change: -0.05, category: 'FOREX' },
  { symbol: 'EUR/NZD', base: 'EUR', quote: 'NZD', price: 1.7820, change: 0.22, category: 'FOREX' },
  { symbol: 'GBP/CAD', base: 'GBP', quote: 'CAD', price: 1.7150, change: 0.12, category: 'FOREX' },
  { symbol: 'GBP/CHF', base: 'GBP', quote: 'CHF', price: 1.1120, change: -0.15, category: 'FOREX' },
  { symbol: 'GBP/NZD', base: 'GBP', quote: 'NZD', price: 2.0850, change: 0.35, category: 'FOREX' },
  { symbol: 'AUD/NZD', base: 'AUD', quote: 'NZD', price: 1.0890, change: 0.05, category: 'FOREX' },
  { symbol: 'AUD/CHF', base: 'AUD', quote: 'CHF', price: 0.5840, change: -0.10, category: 'FOREX' },
  { symbol: 'NZD/CAD', base: 'NZD', quote: 'CAD', price: 0.8240, change: 0.15, category: 'FOREX' },
  { symbol: 'NZD/CHF', base: 'NZD', quote: 'CHF', price: 0.5350, change: -0.05, category: 'FOREX' },
  { symbol: 'CAD/CHF', base: 'CAD', quote: 'CHF', price: 0.6480, change: -0.20, category: 'FOREX' },

  // --- FOREX EXOTICS (INSTITUTIONAL TIER) ---
  { symbol: 'USD/ZAR', base: 'USD', quote: 'ZAR', price: 18.450, change: 0.80, category: 'FOREX' },
  { symbol: 'USD/SGD', base: 'USD', quote: 'SGD', price: 1.3450, change: 0.10, category: 'FOREX' },
  { symbol: 'USD/MXN', base: 'USD', quote: 'MXN', price: 16.750, change: -0.50, category: 'FOREX' },
  { symbol: 'USD/HKD', base: 'USD', quote: 'HKD', price: 7.8250, change: 0.01, category: 'FOREX' },
  { symbol: 'USD/TRY', base: 'USD', quote: 'TRY', price: 32.150, change: 1.50, category: 'FOREX' },
  { symbol: 'USD/NOK', base: 'USD', quote: 'NOK', price: 10.650, change: 0.40, category: 'FOREX' },
  { symbol: 'USD/SEK', base: 'USD', quote: 'SEK', price: 10.550, change: 0.35, category: 'FOREX' },

  // --- CRYPTO (INSTITUTIONAL TIER) ---
  { symbol: 'BTC/USD', base: 'BTC', quote: 'USD', price: 64230.50, change: 2.50, category: 'CRYPTO' },
  { symbol: 'ETH/USD', base: 'ETH', quote: 'USD', price: 3450.20, change: 1.80, category: 'CRYPTO' },
  { symbol: 'SOL/USD', base: 'SOL', quote: 'USD', price: 145.60, change: 4.20, category: 'CRYPTO' },
  { symbol: 'XRP/USD', base: 'XRP', quote: 'USD', price: 0.6205, change: -1.20, category: 'CRYPTO' },
  { symbol: 'BNB/USD', base: 'BNB', quote: 'USD', price: 590.20, change: 1.10, category: 'CRYPTO' },
  { symbol: 'ADA/USD', base: 'ADA', quote: 'USD', price: 0.4560, change: -2.30, category: 'CRYPTO' },
  { symbol: 'DOGE/USD', base: 'DOGE', quote: 'USD', price: 0.1620, change: 5.50, category: 'CRYPTO' },
  { symbol: 'DOT/USD', base: 'DOT', quote: 'USD', price: 7.20, change: 1.50, category: 'CRYPTO' },
  { symbol: 'LINK/USD', base: 'LINK', quote: 'USD', price: 14.50, change: 2.10, category: 'CRYPTO' },
  { symbol: 'LTC/USD', base: 'LTC', quote: 'USD', price: 85.40, change: 0.80, category: 'CRYPTO' },
  { symbol: 'BCH/USD', base: 'BCH', quote: 'USD', price: 450.20, change: 1.20, category: 'CRYPTO' },
  { symbol: 'XLM/USD', base: 'XLM', quote: 'USD', price: 0.110, change: -0.50, category: 'CRYPTO' },
  { symbol: 'UNI/USD', base: 'UNI', quote: 'USD', price: 10.40, change: 3.20, category: 'CRYPTO' },
  { symbol: 'MATIC/USD', base: 'MATIC', quote: 'USD', price: 0.75, change: -1.10, category: 'CRYPTO' },

  // --- INDICES (INSTITUTIONAL TIER) ---
  { symbol: 'US30', base: 'US30', quote: 'USD', price: 39100.00, change: 0.50, category: 'INDICES' },
  { symbol: 'SPX500', base: 'SPX', quote: 'USD', price: 5200.50, change: 0.45, category: 'INDICES' },
  { symbol: 'NAS100', base: 'NAS', quote: 'USD', price: 18100.20, change: 0.80, category: 'INDICES' },
  { symbol: 'GER40', base: 'DAX', quote: 'EUR', price: 18200.50, change: 0.30, category: 'INDICES' },
  { symbol: 'UK100', base: 'UK', quote: 'GBP', price: 7950.00, change: -0.10, category: 'INDICES' },
  { symbol: 'JP225', base: 'JP225', quote: 'JPY', price: 39500.00, change: 0.60, category: 'INDICES' },
  { symbol: 'FRA40', base: 'CAC', quote: 'EUR', price: 8100.50, change: 0.20, category: 'INDICES' },
  { symbol: 'HK50', base: 'HK', quote: 'HKD', price: 16500.00, change: -1.20, category: 'INDICES' },
  { symbol: 'AU200', base: 'AUS', quote: 'AUD', price: 7800.00, change: 0.15, category: 'INDICES' },
  { symbol: 'EU50', base: 'EU', quote: 'EUR', price: 5050.00, change: 0.25, category: 'INDICES' },
  { symbol: 'CN50', base: 'CN', quote: 'CNY', price: 12100.00, change: -0.50, category: 'INDICES' },

  // --- COMMODITIES (PRO TIER) ---
  { symbol: 'XAU/USD', base: 'XAU', quote: 'USD', price: 2350.50, change: 1.20, category: 'COMMODITIES' },
  { symbol: 'XAG/USD', base: 'XAG', quote: 'USD', price: 28.40, change: 2.10, category: 'COMMODITIES' },
  { symbol: 'WTI/USD', base: 'OIL', quote: 'USD', price: 85.20, change: -0.50, category: 'COMMODITIES' },
  { symbol: 'NGAS/USD', base: 'NGAS', quote: 'USD', price: 1.850, change: -1.20, category: 'COMMODITIES' },
  { symbol: 'COPPER', base: 'COPPER', quote: 'USD', price: 4.350, change: 0.90, category: 'COMMODITIES' },
  { symbol: 'PLATINUM', base: 'PLAT', quote: 'USD', price: 980.50, change: 0.60, category: 'COMMODITIES' },
  { symbol: 'PALLADIUM', base: 'PALL', quote: 'USD', price: 1050.00, change: 1.10, category: 'COMMODITIES' }
];

export const TIMEFRAMES = ['M1', 'M5', 'M15', 'M30', 'H1', 'H4', 'D1'];

export const TOP_MT5_BROKERS = ['IC Markets', 'Exness', 'Pepperstone', 'XM Global', 'Deriv', 'Vantage FX', 'Fusion Markets'];
export const TOP_BINARY_BROKERS = ['Pocket Option', 'Quotex', 'Deriv', 'IQ Option', 'Olymp Trade'];

export const AI_STRATEGIES: Strategy[] = [
  { id: 'smc_liquidity', name: 'SMC Liquidity Run', description: 'Targets stop-hunts below equal lows/highs.', riskProfile: 'AGGRESSIVE', winRate: 72, drawdown: 12, stabilityScore: 85, type: 'FOREX', logicType: 'PRICE_ACTION' },
  { id: 'ict_silver_bullet', name: 'ICT Silver Bullet', description: 'Fair Value Gap (FVG) entries during Killzones.', riskProfile: 'BALANCED', winRate: 68, drawdown: 8, stabilityScore: 90, type: 'FOREX', logicType: 'PRICE_ACTION' },
  { id: 'rsi_divergence', name: 'Neural Divergence', description: 'AI-filtered RSI divergence on key levels.', riskProfile: 'CONSERVATIVE', winRate: 65, drawdown: 5, stabilityScore: 95, type: 'FOREX', logicType: 'TECHNICAL' },
  { id: 'bb_mean_reversion', name: 'Bollinger Reversion', description: 'Statistical mean reversion during consolidation.', riskProfile: 'BALANCED', winRate: 60, drawdown: 10, stabilityScore: 80, type: 'FOREX', logicType: 'TECHNICAL' },
  { id: 'trend_continuation', name: 'Trend Flow v4', description: 'Moving average crossover with volume profile.', riskProfile: 'BALANCED', winRate: 58, drawdown: 15, stabilityScore: 75, type: 'FOREX', logicType: 'TECHNICAL' }
];

export const FOREX_PAIRS = ALL_ASSETS.filter(a => a.category === 'FOREX').map(a => a.symbol);