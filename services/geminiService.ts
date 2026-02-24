import { Candle, Signal, MarketType, TradingPersonality, ValidationResult, LiveSituation, Timeframe, CandlestickPattern, NewsEvent } from "../types";
import { GoogleGenAI, Type } from "@google/genai";
import { auth } from "../src/firebase";
import { getIdToken } from "firebase/auth";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const cleanJsonString = (str: string) => {
  return str.replace(/```json|```/g, "").trim();
};

const getHeaders = async () => {
  const user = auth.currentUser;
  const headers: HeadersInit = { 'Content-Type': 'application/json' };
  if (user) {
    const token = await getIdToken(user, true);
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
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
    const headers = await getHeaders();
    const response = await fetch('/api/signals/analyze', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        pair,
        candles,
        marketType,
        timeframe,
        patterns,
        news,
        personality,
        accountBalance,
        riskPercent
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Analysis failed');
    }

    return await response.json();
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
    const headers = await getHeaders();
    const response = await fetch('/api/signals/hud', {
      method: 'POST',
      headers,
      body: JSON.stringify({ pair, candles })
    });

    if (!response.ok) throw new Error('HUD update failed');

    return await response.json();
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
      model: "gemini-3.1-pro-preview",
      contents: query,
      config: {
        systemInstruction: "You are AlphaTrade AI, an elite institutional-grade trading assistant. Provide concise, high-precision market analysis."
      }
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
    const prompt = `Act as an Institutional Risk Auditor. Validate the following trade setup for ${symbol}:
SIDE: ${side}
ENTRY: ${entry}
SL: ${sl}
TP: ${tp}

MARKET DATA (Last 30 Candles):
${JSON.stringify(candles.slice(-30))}

Return a strictly valid JSON validation object.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.1-pro-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            accuracy: { type: Type.NUMBER, description: "Confidence score 0-100" },
            feedback: { type: Type.STRING, description: "Detailed auditor feedback" },
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
    Response (Keep it concise and professional):`;

    const response = await ai.models.generateContent({
      model: "gemini-3.1-pro-preview",
      contents: prompt,
    });
    return response.text || "Signal interrupted. Please repeat command.";
  } catch (error) {
    console.error("AI Chat Error:", error);
    return "I am currently re-calibrating my neural nodes. Please try again in a moment.";
  }
};
