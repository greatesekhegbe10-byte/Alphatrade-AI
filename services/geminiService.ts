import { GoogleGenAI, Type } from "@google/genai";
import { Candle, Signal, MarketType, TradingPersonality, ValidationResult, LiveSituation, Timeframe, CandlestickPattern, NewsEvent } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * ALPHA-CORE ANALYTICS ENGINE v10.2
 * Enhanced JSON sanitizer to fix "Unexpected token" syntax errors.
 */

const cleanJsonString = (text: string | undefined): string => {
  if (!text) return "{}";
  
  let cleaned = text.trim();

  // 1. Remove Markdown code blocks
  cleaned = cleaned.replace(/```json/gi, '').replace(/```/g, '');

  // 2. Remove comments (Single line and Multi-line)
  cleaned = cleaned.replace(/\/\/.*$/gm, '');
  cleaned = cleaned.replace(/\/\*[\s\S]*?\*\//g, '');

  // 3. Find valid JSON envelope
  const firstBrace = cleaned.indexOf('{');
  const lastBrace = cleaned.lastIndexOf('}');
  
  if (firstBrace !== -1 && lastBrace !== -1) {
    cleaned = cleaned.substring(firstBrace, lastBrace + 1);
  } else {
    // If no braces, return empty object to prevent crash
    return "{}";
  }

  // 4. Fix Trailing Commas (Common cause of SyntaxError)
  // Replaces ", }" with "}" and ", ]" with "]"
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
  riskPercent: number = 1
): Promise<Partial<Signal>> => {
  try {
    const prompt = `Act as an Elite Tier-1 Hedge Fund Quantitative Analyst.
Analyze ${pair} on the ${timeframe} timeframe.
MARKET DATA (Last 50 Candles): ${JSON.stringify(candles.slice(-50))}
DETECTED PATTERNS: ${JSON.stringify(patterns.slice(-5))}
NEXT NEWS EVENT: ${JSON.stringify(news)}
ACCOUNT CONTEXT: Balance: $${accountBalance}, Risk: ${riskPercent}%
OUTPUT: High-precision JSON with institutional confluence factors.`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            type: { type: Type.STRING, enum: ['BUY', 'SELL', 'WAIT'] },
            entry: { type: Type.NUMBER },
            tp: { type: Type.NUMBER },
            sl: { type: Type.NUMBER },
            pips: { type: Type.NUMBER },
            lotSize: { type: Type.NUMBER },
            rr: { type: Type.STRING },
            session: { type: Type.STRING },
            trend: { type: Type.STRING },
            pattern: { type: Type.STRING },
            confidence: { type: Type.NUMBER },
            riskLevel: { type: Type.STRING, enum: ['LOW', 'MEDIUM', 'HIGH'] },
            regime: { type: Type.STRING, enum: ['TRENDING', 'RANGING', 'CHOPPY', 'HIGH_VOLATILITY', 'LOW_LIQUIDITY'] },
            reasoning: { type: Type.STRING },
            breakdown: {
              type: Type.OBJECT,
              properties: {
                indicators: { type: Type.STRING },
                structure: { type: Type.STRING },
                manipulationRisk: { type: Type.STRING },
                manipulationScore: { type: Type.NUMBER },
                confluence: { type: Type.ARRAY, items: { type: Type.STRING } }
              },
              required: ["indicators", "structure", "manipulationRisk", "manipulationScore"]
            }
          },
          required: ["type", "entry", "tp", "sl", "pips", "lotSize", "rr", "confidence", "reasoning", "regime"]
        }
      }
    });

    const cleanText = cleanJsonString(response.text);
    const result = JSON.parse(cleanText);
    const hash = btoa(`${pair}-${result.type}-${Date.now()}`).slice(0, 16).toUpperCase();

    return { 
      ...result,
      id: Math.random().toString(36).substr(2, 9),
      hash: hash,
      signature: btoa(Date.now().toString()).slice(0, 10),
      pair: pair,
      marketType: marketType,
      timeframe: timeframe,
      timestamp: Date.now()
    };
  } catch (error) {
    console.error("Neural Node Desync:", error);
    return { type: 'WAIT', reasoning: "Calibrating institutional liquidity data..." };
  }
};

export const getMarketSituationHUD = async (
  pair: string,
  candles: Candle[]
): Promise<LiveSituation> => {
  try {
    const prompt = `Institutional SIT-REP for ${pair}. Assess immediate Market Structure and News Bias. Data: ${JSON.stringify(candles.slice(-20))}. Return JSON.`;
    
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
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
  } catch (error) {
    return { 
      sentiment: 'NEUTRAL', 
      shortSummary: 'Monitoring institutional liquidity flows...', 
      volatility: 'MEDIUM',
      newsBias: 'NEUTRAL',
      marketRegime: 'RANGING'
    };
  }
};

export const getMarketSituation = async (query: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: query
    });
    return response.text || "No analysis available from the neural node.";
  } catch (error) {
    console.error("Neural Situation Error:", error);
    return "Neural node offline. Calibration required.";
  }
};

export const validateTradeIdea = async (
  symbol: string,
  side: 'BUY' | 'SELL',
  entry: number,
  sl: number,
  tp: number,
  candles: Candle[]
): Promise<ValidationResult> => {
  try {
    const prompt = `Act as an Institutional Risk Auditor. Validate the following trade setup for ${symbol}: SIDE: ${side} ENTRY: ${entry} SL: ${sl} TP: ${tp} MARKET DATA: ${JSON.stringify(candles.slice(-30))} Return a JSON validation object.`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            accuracy: { type: Type.NUMBER },
            feedback: { type: Type.STRING },
            verdict: { type: Type.STRING, enum: ['VALID', 'RISKY', 'INVALID'] }
          },
          required: ["accuracy", "feedback", "verdict"]
        }
      }
    });

    const cleanText = cleanJsonString(response.text);
    return JSON.parse(cleanText) as ValidationResult;
  } catch (error) {
    console.error("Neural Validation Error:", error);
    return { accuracy: 0, feedback: "Neural handshake failed during validation.", verdict: 'RISKY' };
  }
};

export const getChatResponse = async (userMessage: string): Promise<string> => {
  try {
    const prompt = `System: You are AlphaTrade AI, a highly advanced, institutional-grade trading assistant.
    User: ${userMessage}
    Response (Keep it concise):`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });
    return response.text || "Signal interrupted. Please repeat command.";
  } catch (error) {
    console.error("AI Chat Error:", error);
    return "I am currently re-calibrating my neural nodes. Please try again in a moment.";
  }
};