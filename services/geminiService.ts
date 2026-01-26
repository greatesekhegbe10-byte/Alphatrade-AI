
import { GoogleGenAI, Type } from "@google/genai";
import { Candle, Signal, MarketType, TradingPersonality, ValidationResult } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeMarket = async (
  pair: string, 
  candles: Candle[], 
  marketType: MarketType,
  personality: TradingPersonality = 'BALANCED'
): Promise<Partial<Signal>> => {
  try {
    const prompt = `Act as an Elite Hedge Fund Quantitative Analyst. Analyze ${pair} (${marketType}).
      Recent 20-candle Data (JSON): ${JSON.stringify(candles.slice(-20))}.
      Provide Entry, SL, TP, Pattern, Confidence, Regime, Reasoning. Respond in JSON.`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            type: { type: Type.STRING },
            entry: { type: Type.NUMBER },
            tp: { type: Type.NUMBER },
            sl: { type: Type.NUMBER },
            pattern: { type: Type.STRING },
            confidence: { type: Type.NUMBER },
            riskLevel: { type: Type.STRING },
            regime: { type: Type.STRING },
            slippageScore: { type: Type.STRING },
            spreadStatus: { type: Type.STRING },
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
          }
        }
      }
    });

    const result = JSON.parse(response.text.trim());
    const hash = btoa(`${pair}-${result.type}-${Date.now()}`).slice(0, 16).toUpperCase();

    return { ...result, id: Math.random().toString(36).substr(2, 9), hash, pair, marketType, timestamp: Date.now(), timeframe: 'M1' };
  } catch (error) {
    console.error("AI Sync Error:", error);
    return { type: 'WAIT' };
  }
};

export const getMarketSituation = async (query: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Provide a professional market analysis regarding: ${query}. Use institutional terminology (Liquidity, SMC, FVG, Volume Profile).`,
    });
    return response.text;
  } catch (error) {
    return "Analysis node currently offline. Re-syncing...";
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
    const prompt = `Validate this trade idea: ${side} ${pair} @ ${entry} (SL: ${sl}, TP: ${tp}). 
      Market Data: ${JSON.stringify(candles.slice(-10))}. 
      Evaluate accuracy probability, provide technical feedback and a final verdict. Respond in JSON.`;

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
            verdict: { type: Type.STRING },
            alternativeTarget: {
              type: Type.OBJECT,
              properties: { tp: { type: Type.NUMBER }, sl: { type: Type.NUMBER } }
            }
          }
        }
      }
    });

    return JSON.parse(response.text.trim()) as ValidationResult;
  } catch (error) {
    throw new Error("Validation node failed.");
  }
};
