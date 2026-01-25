
export type MarketType = 'FOREX' | 'BINARY';
export type Timeframe = 'M1' | 'M5' | 'M15' | 'M30' | 'H1' | 'H4' | 'D1';

export interface Candle {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface Signal {
  id: string;
  pair: string;
  type: 'BUY' | 'SELL' | 'CALL' | 'PUT';
  marketType: MarketType;
  entry: number;
  tp?: number;
  sl?: number;
  expiry?: string;
  timeframe: Timeframe;
  pattern: string;
  confidence: 'LOW' | 'MEDIUM' | 'HIGH';
  timestamp: number;
  reasoning: string;
  lotSize?: number;
  riskAmount?: number;
  strategyId?: string;
  pips?: number;
  rrr?: string;
  breakdown: {
    indicators: string;
    structure: string;
    manipulationRisk: string;
  };
}

export interface NewsEvent {
  id: string;
  time: string;
  currency: string;
  event: string;
  impact: 'LOW' | 'MEDIUM' | 'HIGH';
}

export interface MarketPair {
  symbol: string;
  base: string;
  quote: string;
  price: number;
  change: number;
  enabled?: boolean;
}

export type DrawingType = 'TRENDLINE' | 'HLINE' | 'FIBONACCI';

export interface Drawing {
  id: string;
  type: DrawingType;
  points: { x: number; y: number; price: number; time: number }[];
  color: string;
}

export interface OpenTrade {
  id: string;
  pair: string;
  type: 'BUY' | 'SELL' | 'CALL' | 'PUT';
  entry: number;
  currentPrice: number;
  amount: number;
  timestamp: number;
  marketType: MarketType;
  status: 'OPEN' | 'CLOSED';
  pnl: number;
}

export interface BrokerAccount {
  connected: boolean;
  platform: 'MT5' | 'BINARY_COM' | 'POCKET_OPTION' | 'NONE';
  balance: number;
  equity: number;
  leverage: number;
  currency: string;
  accountNumber: string;
  payoutPercent?: number;
  spread?: number;
}

export type TradingPersonality = 'CONSERVATIVE' | 'BALANCED' | 'AGGRESSIVE';
export type LearningMode = 'BEGINNER' | 'PRO';

export interface UserSettings {
  riskPercent: number;
  preferredSessions: string[];
  theme: 'DARK' | 'LIGHT';
  notifications: boolean;
  autoLot: boolean;
  personality: TradingPersonality;
  learningMode: LearningMode;
  webhookUrl?: string;
}

export type UserRole = 'USER' | 'ADMIN';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  verified: boolean;
  joinedAt: number;
}

export interface SystemState {
  aiModulesEnabled: boolean;
  forexSignalsEnabled: boolean;
  binarySignalsEnabled: boolean;
  activeAnnouncements: string[];
  maintenanceMode: boolean;
  confidenceThreshold: number; // 0-100
  remoteEAControl: boolean;
}

export interface JournalEntry {
  id: string;
  timestamp: number;
  pair: string;
  type: string;
  result: 'WIN' | 'LOSS' | 'BE';
  pnl: number;
  emotion: 'CALM' | 'ANXIOUS' | 'GREEDY' | 'FOMO';
  aiFeedback: string;
  screenshot?: string;
}

export interface SessionBias {
  london: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  newyork: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  asian: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
}

export interface EAStatus {
  connected: boolean;
  version: string;
  lastHeartbeat: number;
  terminalId: string;
}

export interface Strategy {
  id: string;
  name: string;
  description: string;
  riskProfile: TradingPersonality;
  winRate: number;
  type: MarketType;
}
