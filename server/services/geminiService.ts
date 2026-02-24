import { GoogleGenAI, Type } from "@google/genai";
import { Candle, Signal, MarketType, TradingPersonality, ValidationResult, LiveSituation, Timeframe, CandlestickPattern, NewsEvent, TechnicalIndicators } from "../../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

const cleanJsonString = (text: string | undefined): string => {
  if (!text) return "{}";
  let cleaned = text.trim();
  // Remove markdown code blocks if present
  cleaned = cleaned.replace(/```json/gi, '').replace(/```/g, '');
  // Remove single-line comments
  cleaned = cleaned.replace(/\/\/.*$/gm, '');
  // Remove multi-line comments
  cleaned = cleaned.replace(/\/\*[\s\S]*?\*\//g, '');
  
  const firstBrace = cleaned.indexOf('{');
  const lastBrace = cleaned.lastIndexOf('}');
  
  if (firstBrace !== -1 && lastBrace !== -1) {
    cleaned = cleaned.substring(firstBrace, lastBrace + 1);
  } else {
    // If no braces, check if it's an array
    const firstBracket = cleaned.indexOf('[');
    const lastBracket = cleaned.lastIndexOf(']');
    if (firstBracket !== -1 && lastBracket !== -1) {
      cleaned = cleaned.substring(firstBracket, lastBracket + 1);
    } else {
      return "{}";
    }
  }
  
  // Fix trailing commas
  cleaned = cleaned.replace(/,\s*}/g, '}');
  cleaned = cleaned.replace(/,\s*]/g, ']');
  return cleaned;
};

export const analyzeMarket = async (
  pair: string,
  candles: Candle[],
  marketType: MarketType,
  timeframe: Timeframe,
  patterns: CandlestickPattern[],
  news: NewsEvent | undefined,
  personality: TradingPersonality = 'BALANCED',
  accountBalance: number = 1000,
  riskPercent: number = 1,
  indicators?: TechnicalIndicators
): Promise<Partial<Signal>> => {
  try {
    // Ensure candles are sorted by time
    const sortedCandles = [...candles].sort((a, b) => a.time - b.time);
    const last50 = sortedCandles.slice(-50);
    
    const prompt = `Act as an Elite Tier-1 Hedge Fund Quantitative Analyst and Master Price Action Trader.
Your goal is to provide a high-probability trading signal for ${pair} on the ${timeframe} timeframe.

MARKET CONTEXT:
- Pair: ${pair}
- Timeframe: ${timeframe}
- Market Type: ${marketType}
- Account Balance: $${accountBalance}
- Risk per Trade: ${riskPercent}%
- Trading Personality: ${personality}

TECHNICAL DATA (Last 50 Candles):
${JSON.stringify(last50)}

TECHNICAL INDICATORS (SMA, RSI, MACD, BB, ATR):
${JSON.stringify(indicators || "Calculating indicators...")}

DETECTED CANDLESTICK PATTERNS:
${JSON.stringify(patterns.slice(-5))}

FUNDAMENTAL CONTEXT (Next News Event):
${JSON.stringify(news || "No high-impact news expected soon.")}

ANALYSIS REQUIREMENTS:
1. PRICE ACTION: Identify key Support/Resistance levels, Order Blocks, and Fair Value Gaps (FVG).
2. TREND: Determine the primary and secondary trend using market structure (HH/HL or LH/LL).
3. INDICATORS: Synthesize RSI (overbought/oversold/divergence), MACD (momentum shifts), and Moving Averages (20, 50, 200).
4. RISK MANAGEMENT:
   - For Standard Forex: Calculate exact Entry, Stop Loss (SL), and Take Profit (TP). 
   - Lot Size calculation: (Balance * Risk%) / (SL distance in pips * Pip Value).
   - Minimum Lot Size is 0.01. Never return 0.
   - For Binary Options: Provide CALL/PUT and Expiry time (e.g., "5m", "15m"). SL/TP are not required for Binary.
5. CONFLUENCE: Only issue BUY/SELL if at least 3 confluence factors align. Otherwise, return WAIT.

OUTPUT FORMAT:
Return a strictly valid JSON object following the provided schema.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.1-pro-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            type: { type: Type.STRING, enum: ['BUY', 'SELL', 'WAIT', 'CALL', 'PUT'] },
            entry: { type: Type.NUMBER },
            tp: { type: Type.NUMBER },
            sl: { type: Type.NUMBER },
            pips: { type: Type.NUMBER },
            lotSize: { type: Type.NUMBER },
            rr: { type: Type.STRING, description: "Risk to Reward ratio (e.g. 1:2)" },
            session: { type: Type.STRING, description: "Current trading session (London, NY, Tokyo, Sydney)" },
            trend: { type: Type.STRING, enum: ['BULLISH', 'BEARISH', 'NEUTRAL', 'SIDEWAYS'] },
            pattern: { type: Type.STRING, description: "Primary pattern identified" },
            confidence: { type: Type.NUMBER, description: "Confidence score 0-100" },
            riskLevel: { type: Type.STRING, enum: ['LOW', 'MEDIUM', 'HIGH'] },
            regime: { type: Type.STRING, enum: ['TRENDING', 'RANGING', 'CHOPPY', 'HIGH_VOLATILITY', 'LOW_LIQUIDITY'] },
            reasoning: { type: Type.STRING, description: "Detailed institutional reasoning" },
            breakdown: {
              type: Type.OBJECT,
              properties: {
                indicators: { type: Type.STRING },
                structure: { type: Type.STRING },
                manipulationRisk: { type: Type.STRING },
                manipulationScore: { type: Type.NUMBER },
                confluence: { type: Type.ARRAY, items: { type: Type.STRING } }
              },
              required: ["indicators", "structure", "manipulationRisk", "manipulationScore", "confluence"]
            }
          },
          required: ["type", "entry", "tp", "sl", "pips", "lotSize", "rr", "confidence", "reasoning", "regime", "trend"]
        }
      }
    });

    const cleanText = cleanJsonString(response.text);
    const result = JSON.parse(cleanText);
    
    // Signature generation on backend
    const signature = Buffer.from(`${Date.now()}-${pair}-${Math.random()}`).toString('base64').slice(0, 16);

    return { 
      ...result,
      id: Math.random().toString(36).substr(2, 9),
      hash: Buffer.from(`${pair}-${result.type}-${Date.now()}`).toString('base64').slice(0, 16).toUpperCase(),
      signature: signature,
      pair: pair,
      marketType: marketType,
      timeframe: timeframe,
      timestamp: Date.now()
    };
  } catch (error: any) {
    console.error("[GEMINI_SERVICE] Neural Node Desync:", error.message);
    return { 
      type: 'WAIT', 
      reasoning: "Calibrating institutional liquidity data and synchronizing with market nodes...",
      confidence: 0,
      trend: 'NEUTRAL',
      regime: 'LOW_LIQUIDITY'
    };
  }
};

export const getMarketSituationHUD = async (
  pair: string,
  candles: Candle[]
): Promise<LiveSituation> => {
  try {
    const sortedCandles = [...candles].sort((a, b) => a.time - b.time);
    const last20 = sortedCandles.slice(-20);

    const prompt = `Provide an Institutional SIT-REP (Situation Report) for ${pair}. 
Assess immediate Market Structure, Liquidity Zones, and News Bias. 

DATA: ${JSON.stringify(last20)}

Return a strictly valid JSON object.`;
    
    const response = await ai.models.generateContent({
      model: "gemini-3.1-pro-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            sentiment: { type: Type.STRING, enum: ["BULLISH", "BEARISH", "NEUTRAL"] },
            shortSummary: { type: Type.STRING },
            volatility: { type: Type.STRING, enum: ["LOW", "MEDIUM", "HIGH"] },
            keyLevel: { type: Type.NUMBER },
            newsBias: { type: Type.STRING, enum: ["HIGH_RISK", "BULLISH", "BEARISH", "NEUTRAL"] },
            nextNewsEvent: { type: Type.STRING },
            marketRegime: { type: Type.STRING, enum: ['TRENDING', 'RANGING', 'CHOPPY', 'HIGH_VOLATILITY', 'LOW_LIQUIDITY'] }
          },
          required: ["sentiment", "shortSummary", "volatility", "newsBias", "marketRegime"]
        }
      }
    });

    const cleanText = cleanJsonString(response.text);
    return JSON.parse(cleanText) as LiveSituation;
  } catch (error: any) {
    console.error("[GEMINI_SERVICE] HUD Error:", error.message);
    return { 
      sentiment: 'NEUTRAL', 
      shortSummary: 'Monitoring institutional liquidity flows and market structure...', 
      volatility: 'MEDIUM',
      newsBias: 'NEUTRAL',
      marketRegime: 'RANGING'
    };
  }
};
