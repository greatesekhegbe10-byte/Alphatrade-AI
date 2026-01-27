
// ALPHA-TRADE GLOBAL TYPES - PRO EXTENSION v2.0

export type MarketType = 'FOREX' | 'BINARY' | 'INDICES' | 'COMMODITIES' | 'CRYPTO';
export type Timeframe = 'M1' | 'M5' | 'M15' | 'M30' | 'H1' | 'H4' | 'D1';
export type MarketRegime = 'TRENDING' | 'RANGING' | 'CHOPPY' | 'HIGH_VOLATILITY' | 'LOW_LIQUIDITY';

export interface MarketPair {
  symbol: string;
  base: string;
  quote: string;
  price: number;
  change: number;
  category: MarketType;
}

export interface Candle {
  time: number; open: number; high: number; low: number; close: number; volume: number;
}

export interface CandlestickPattern {
  name: string;
  type: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  confidence: number;
  index: number; // index of the candle in the array
}

export type ManipulationType = 'STOP_HUNT' | 'FAKE_BREAKOUT' | 'VOLUME_SPIKE' | 'NEWS_WHIPSAW' | 'CLEAR';

export interface NewsEvent {
  id: string;
  title: string;
  impact: 'LOW' | 'MEDIUM' | 'HIGH';
  time: number;
  currency: string;
  actual?: string;
  forecast?: string;
  previous?: string;
}

export interface LiveSituation {
  sentiment: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  shortSummary: string;
  volatility: 'LOW' | 'MEDIUM' | 'HIGH';
  keyLevel?: number;
  newsBias?: 'HIGH_RISK' | 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  nextNewsEvent?: string;
  marketRegime: MarketRegime;
}

export type TradingPersonality = 'BALANCED' | 'CONSERVATIVE' | 'AGGRESSIVE';
export type LearningMode = 'BEGINNER' | 'PRO';

export interface Strategy {
  id: string;
  name: string;
  description: string;
  riskProfile: TradingPersonality;
  winRate: number;
  drawdown: number;
  stabilityScore: number;
  type: MarketType;
  logicType: 'PRICE_ACTION' | 'AI' | 'TECHNICAL';
  active?: boolean;
}

export interface ValidationResult {
  accuracy: number;
  feedback: string;
  verdict: 'VALID' | 'RISKY' | 'INVALID';
}

export interface Signal {
  id: string;
  hash: string;
  signature: string; 
  pair: string;
  type: 'BUY' | 'SELL' | 'CALL' | 'PUT' | 'WAIT';
  marketType: MarketType;
  entry: number;
  tp: number;
  sl: number;
  pips: number;
  lotSize: number;
  rr: string;
  expiry?: string;
  timeframe: Timeframe;
  pattern: string;
  confidence: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  timestamp: number;
  reasoning: string;
  regime: MarketRegime;
  session: string;
  trend: string;
  breakdown: {
    indicators: string;
    structure: string;
    manipulationRisk: string;
    manipulationType?: ManipulationType;
    manipulationScore: number; 
    rejectionReason?: string;
    confluence?: string[];
  };
}

export type PaymentGateway = 'PAYSTACK' | 'FLUTTERWAVE';
export type SubscriptionTier = 'BASIC' | 'PRO' | 'INSTITUTIONAL';

export interface ChatMessage {
  id: string;
  sender: 'USER' | 'SUPPORT' | 'AI';
  text: string;
  timestamp: number;
}

// Added SubscriptionDetails interface
export interface SubscriptionDetails {
  tier: SubscriptionTier;
  isActive: boolean;
  startDate: number;
  expiryDate: number;
  autoRenew?: boolean;
}

// Added AuthResponse interface
export interface AuthResponse {
  user: User;
  token: string;
}

export interface User {
  id: string; 
  email: string; 
  name: string;
  role: 'USER' | 'ADMIN'; 
  verified: boolean; 
  joinedAt: number; 
  tier: SubscriptionTier;
  hardwareId: string;
  acceptedLegal: boolean;
  watchlist: string[];
  subscription?: SubscriptionDetails;
}

export interface SystemState {
  aiModulesEnabled: boolean; 
  forexSignalsEnabled: boolean; 
  binarySignalsEnabled: boolean;
  confidenceThreshold: number; 
  maintenanceMode: boolean;
  killSwitchActive: boolean; 
  remoteEAControl?: boolean;
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

export interface BrokerAccount {
  connected: boolean;
  platform: string;
  brokerName: string;
  balance: number;
  equity: number;
  leverage: number;
  currency: string;
  accountNumber: string;
  dailyLoss: number;
  eaConnected?: boolean;
  spread: number;
  latency: number;
}

export interface Transaction {
  id: string;
  userId: string;
  userEmail: string;
  amount: number;
  currency: string;
  gateway: PaymentGateway;
  reference: string;
  status: 'SUCCESS' | 'PENDING' | 'FAILED';
  tier: SubscriptionTier;
  timestamp: number;
  verifiedAt?: number;
  // Added verificationSource property
  verificationSource?: string;
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
  trades: any[];
}
