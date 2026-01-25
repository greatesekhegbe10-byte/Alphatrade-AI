
import { GoogleGenAI, Type } from "@google/genai";
import { Candle, Signal, MarketType, TradingPersonality } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeMarket = async (
  pair: string, 
  candles: Candle[], 
  marketType: MarketType,
  personality: TradingPersonality = 'BALANCED'
): Promise<Partial<Signal>> => {
  try {
    const prompt = `
      Act as an Elite Hedge Fund Quantitative Analyst. 
      Analyze the ${pair} market for a ${marketType} trading setup.
      Current User Personality: ${personality} (Adjust risk and confirmation strictly based on this).
      
      CRITICAL TASKS:
      1. PRICE ACTION: Detect Candlestick patterns (Pin Bars, Engulfing, Morning/Evening Stars, Tweezer Tops).
      2. MARKET STRUCTURE: Analyze if the market is in a Trend (HH/HL) or Range. Identify Breakouts or Fakeouts.
      3. SMART MONEY CONCEPTS: Identify Order Blocks, Fair Value Gaps (FVG), or Liquidity Sweeps.
      4. RISK: Evaluate spread and manipulation risks at current levels.

      Recent 20-candle OHLC Data (JSON):
      ${JSON.stringify(candles.slice(-20))}

      Respond only in structured JSON. If no clear high-probability setup exists, return a low-confidence SELL or BUY with a warning.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            type: { type: Type.STRING, description: 'BUY, SELL, CALL, or PUT' },
            entry: { type: Type.NUMBER },
            tp: { type: Type.NUMBER },
            sl: { type: Type.NUMBER },
            expiry: { type: Type.STRING, description: 'Expiry duration for binary (e.g. 5m, 15m)' },
            pattern: { type: Type.STRING, description: 'Pattern name found (e.g. Bullish Engulfing)' },
            confidence: { type: Type.STRING, description: 'LOW, MEDIUM, or HIGH' },
            reasoning: { type: Type.STRING, description: '15-word professional trade logic' },
            breakdown: {
              type: Type.OBJECT,
              properties: {
                indicators: { type: Type.STRING, description: 'RSI/MACD status' },
                structure: { type: Type.STRING, description: 'Current trend status' },
                manipulationRisk: { type: Type.STRING, description: 'Manipulation alerts' }
              },
              required: ['indicators', 'structure', 'manipulationRisk']
            }
          },
          required: ['type', 'entry', 'pattern', 'confidence', 'reasoning', 'breakdown']
        }
      }
    });

    const text = response.text.trim();
    const result = JSON.parse(text);
    
    return {
      ...result,
      pair,
      marketType,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: Date.now(),
      timeframe: 'M1'
    };
  } catch (error) {
    console.error("Neural Node Analysis Failure:", error);
    return {};
  }
};
