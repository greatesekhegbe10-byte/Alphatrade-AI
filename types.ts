
export type MarketType = 'FOREX' | 'BINARY' | 'INDICES' | 'COMMODITIES' | 'CRYPTO';
export type Timeframe = 'M1' | 'M5' | 'M15' | 'M30' | 'H1' | 'H4' | 'D1';
export type MarketRegime = 'TRENDING' | 'RANGING' | 'CHOPPY';

export interface Candle {
  time: number; open: number; high: number; low: number; close: number; volume: number;
}

export type ManipulationType = 'STOP_HUNT' | 'FAKE_BREAKOUT' | 'VOLUME_SPIKE' | 'NEWS_WHIPSAW' | 'CLEAR';

export interface LiveSituation {
  sentiment: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  shortSummary: string;
  volatility: 'LOW' | 'MEDIUM' | 'HIGH';
  keyLevel?: number;
}

export interface Signal {
  id: string;
  hash: string;
  pair: string;
  type: 'BUY' | 'SELL' | 'CALL' | 'PUT' | 'WAIT';
  marketType: MarketType;
  entry: number;
  tp: number;
  sl: number;
  expiry?: string;
  timeframe: Timeframe;
  pattern: string;
  confidence: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  timestamp: number;
  reasoning: string;
  regime: MarketRegime;
  slippageScore: 'LOW' | 'MEDIUM' | 'HIGH';
  spreadStatus: 'STABLE' | 'WIDENING' | 'VOLATILE';
  breakdown: {
    indicators: string;
    structure: string;
    manipulationRisk: string;
    manipulationType?: ManipulationType;
    manipulationScore: number; 
    rejectionReason?: string;
  };
}

export interface IndicatorData {
  rsi?: number[];
  sma?: number[];
  ema?: number[];
  macd?: { macd: number[]; signal: number[]; histogram: number[] };
  bollinger?: { upper: number[]; lower: number[]; mid: number[] };
}

export interface BacktestResult {
  totalTrades: number;
  wins: number;
  losses: number;
  winRate: number;
  profitFactor: number;
  netProfit: number;
  maxDrawdown: number;
  equityCurve: number[];
  trades: {
    entryTime: number;
    exitTime: number;
    type: 'BUY' | 'SELL';
    pnl: number;
    result: 'WIN' | 'LOSS';
  }[];
}

export type PaymentGateway = 'PAYSTACK' | 'FLUTTERWAVE';
export type SubscriptionTier = 'BASIC' | 'PRO' | 'INSTITUTIONAL';

export interface Transaction {
  id: string;
  userId: string;
  userEmail: string;
  amount: number;
  currency: string;
  gateway: PaymentGateway;
  reference: string;
  status: 'PENDING' | 'SUCCESS' | 'ERROR';
  tier: SubscriptionTier;
  timestamp: number;
  verificationSource: 'POLLING' | 'WEBHOOK';
  verifiedAt?: number;
}

export interface MarketPair {
  symbol: string; base: string; quote: string; price: number; change: number; category: MarketType;
}

export type BrokerPlatform = 'MT5' | 'POCKET_OPTION' | 'QUOTEX' | 'IQ_OPTION' | 'DERIV' | 'NONE';

export interface BrokerAccount {
  connected: boolean; 
  platform: BrokerPlatform; 
  brokerName: string;
  balance: number; 
  equity: number; 
  leverage: number; 
  currency: string; 
  accountNumber: string; 
  dailyLoss: number;
  consecutiveLosses: number;
  apiKey?: string;
  webhookUrl?: string;
  eaConnected?: boolean;
}

export type TradingPersonality = 'CONSERVATIVE' | 'BALANCED' | 'AGGRESSIVE';
export type LearningMode = 'BEGINNER' | 'PRO';

export interface UserSettings {
  riskPercent: number; 
  dailyLossLimit: number; 
  maxConsecutiveLosses: number;
  personality: TradingPersonality; 
  learningMode: LearningMode;
  toggles: {
    newsFilter: boolean;
    aiConfirmation: boolean;
    sessionFilter: boolean;
    psychologicalGuard: boolean;
    autoLot: boolean;
  };
}

export interface User {
  id: string; 
  email: string; 
  name: string;
  role: 'USER' | 'ADMIN'; 
  verified: boolean; 
  joinedAt: number; 
  tier: SubscriptionTier;
  token?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface SystemState {
  aiModulesEnabled: boolean; 
  forexSignalsEnabled: boolean; 
  binarySignalsEnabled: boolean;
  confidenceThreshold: number; 
  maintenanceMode: boolean;
  rolloutPercentage: number; 
  killSwitchActive: boolean; 
}

export interface JournalEntry {
  id: string; 
  timestamp: number; 
  pair: string; 
  type: string; 
  result: 'WIN' | 'LOSS' | 'BE'; 
  pnl: number; 
  emotion: 'CALM' | 'ANXIOUS' | 'GREEDY' | 'FOMO' | 'REVENGE'; 
  aiFeedback: string;
  signalHash: string;
}

export interface Strategy {
  id: string; 
  name: string; 
  description: string; 
  riskProfile: TradingPersonality; 
  winRate: number; 
  drawdown: number;
  stabilityScore: number; 
  type: MarketType;
  logicType: 'AI' | 'TECHNICAL' | 'PRICE_ACTION' | 'HYBRID';
}

export interface ValidationResult {
  accuracy: number;
  feedback: string;
  alternativeTarget?: { tp: number; sl: number };
  verdict: 'VALID' | 'RISKY' | 'INVALID';
}
