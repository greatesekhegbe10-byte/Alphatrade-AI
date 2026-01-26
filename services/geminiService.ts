
import { GoogleGenAI, Type } from "@google/genai";
import { Candle, Signal, MarketType, TradingPersonality, ValidationResult, LiveSituation } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * ALPHA-CORE ANALYTICS ENGINE v8.0
 * Deep Integration with Institutional Logic (SMC/ICT/Volume Profile)
 */

export const analyzeMarket = async (
  pair: string, 
  candles: Candle[], 
  marketType: MarketType,
  personality: TradingPersonality = 'BALANCED'
): Promise<Partial<Signal>> => {
  try {
    const prompt = `Act as an Elite Tier-1 Hedge Fund Quantitative Analyst. 
      Analyze the market structure for ${pair} (${marketType}).
      
      DATASET (Last 30 Candles): ${JSON.stringify(candles.slice(-30))}
      
      INSTRUCTIONS:
      1. Identify Market Structure (Bullish/Bearish/Neutral).
      2. Locate Liquidity Pools (buy-side/sell-side).
      3. Identify Fair Value Gaps (FVG) or Order Blocks.
      4. Determine highest probability Entry, TP, and SL based on the current ${personality} risk profile.
      5. Evaluate Volume delta and Price Action patterns (Engulfing, Pinbars, MSS).
      
      OUTPUT: High-precision JSON format only.`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            type: { type: Type.STRING, enum: ['BUY', 'SELL', 'CALL', 'PUT', 'WAIT'] },
            entry: { type: Type.NUMBER },
            tp: { type: Type.NUMBER },
            sl: { type: Type.NUMBER },
            pattern: { type: Type.STRING },
            confidence: { type: Type.NUMBER, description: "Confidence score 0-100" },
            riskLevel: { type: Type.STRING, enum: ['LOW', 'MEDIUM', 'HIGH'] },
            regime: { type: Type.STRING, enum: ['TRENDING', 'RANGING', 'CHOPPY'] },
            slippageScore: { type: Type.STRING, enum: ['LOW', 'MEDIUM', 'HIGH'] },
            spreadStatus: { type: Type.STRING, enum: ['STABLE', 'WIDENING', 'VOLATILE'] },
            reasoning: { type: Type.STRING },
            breakdown: {
              type: Type.OBJECT,
              properties: {
                indicators: { type: Type.STRING },
                structure: { type: Type.STRING },
                manipulationRisk: { type: Type.STRING },
                manipulationScore: { type: Type.NUMBER },
                rejectionReason: { type: Type.STRING }
              }
            }
          },
          required: ["type", "entry", "tp", "sl", "confidence", "reasoning"]
        }
      }
    });

    const result = JSON.parse(response.text.trim());
    const hash = btoa(`${pair}-${result.type}-${Date.now()}`).slice(0, 16).toUpperCase();

    return { 
      ...result, 
      id: Math.random().toString(36).substr(2, 9), 
      hash, 
      pair, 
      marketType, 
      timestamp: Date.now(), 
      timeframe: 'M1' 
    };
  } catch (error) {
    console.error("AI Sync Error:", error);
    return { type: 'WAIT', reasoning: "Neural node synchronizing with local liquidity pools..." };
  }
};

export const getMarketSituationHUD = async (
  pair: string,
  candles: Candle[]
): Promise<LiveSituation> => {
  try {
    const prompt = `Analyze the current 'Market Situation' for ${pair}. 
      Recent Data: ${JSON.stringify(candles.slice(-15))}.
      Provide a highly accurate, technical sentiment assessment using institutional terminology.
      Determine if the immediate trend is BULLISH, BEARISH, or NEUTRAL.
      Identify any near-term 'Key Level' (liquidity or order block).
      Respond strictly in JSON.`;
    
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
            keyLevel: { type: Type.NUMBER }
          },
          required: ["sentiment", "shortSummary", "volatility"]
        }
      }
    });

    return JSON.parse(response.text.trim()) as LiveSituation;
  } catch (error) {
    return { 
      sentiment: 'NEUTRAL', 
      shortSummary: 'Analyzing institutional liquidity flows and volume delta...', 
      volatility: 'MEDIUM' 
    };
  }
};

export const getMarketSituation = async (query: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Perform a deep-dive professional institutional analysis for: ${query}. 
        Focus on Smart Money Concepts (SMC), Liquidity Grabs, Break of Structure (BOS), and Change of Character (CHoCH).
        Provide actionable insights for a professional trader.`,
    });
    return response.text;
  } catch (error) {
    return "Analysis terminal currently calibrating. Re-syncing with global exchange data...";
  }
};

export const validateTradeIdea = async (
  pair: string, 
  side: string, 
  entry: number, 
  sl: number, 
  tp: number,
  candles: Candle[]
): Promise<ValidationResult> => {
  try {
    const prompt = `Validate the following trade setup: ${side} ${pair} at ${entry} (Stop: ${sl}, Target: ${tp}). 
      Recent Market Structure: ${JSON.stringify(candles.slice(-12))}.
      Verify accuracy using SMC logic. Determine if this entry is a 'Trap' or 'High Probability'.
      Respond in JSON.`;

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
            verdict: { type: Type.STRING, enum: ["VALID", "RISKY", "INVALID"] },
            alternativeTarget: {
              type: Type.OBJECT,
              properties: { 
                tp: { type: Type.NUMBER }, 
                sl: { type: Type.NUMBER } 
              }
            }
          }
        }
      }
    });

    return JSON.parse(response.text.trim()) as ValidationResult;
  } catch (error) {
    throw new Error("Validation engine failed to initialize.");
  }
};
