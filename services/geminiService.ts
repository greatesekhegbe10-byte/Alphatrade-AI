
import { GoogleGenAI, Type } from "@google/genai";
import { Candle, Signal, MarketType, TradingPersonality } from "../types";

// Fix: Directly utilizing process.env.API_KEY for SDK initialization
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeMarket = async (
  pair: string, 
  candles: Candle[], 
  marketType: MarketType,
  personality: TradingPersonality = 'BALANCED'
): Promise<Partial<Signal>> => {
  try {
    const prompt = `
      Act as an Elite Market Analyst. Analyze ${pair} for ${marketType} trading.
      User Profile: ${personality} personality.
      
      Tasks:
      1. Detect reversal/continuation patterns (Pin Bar, Engulfing, etc.)
      2. Analyze market structure (HH/HL or LH/LL)
      3. Identify potential market manipulation (Stop hunts, fake breakouts)
      4. Provide structured reasoning for transparency.

      Recent OHLC Data (JSON):
      ${JSON.stringify(candles.slice(-20))}

      Respond in JSON format.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            type: { type: Type.STRING, description: 'BUY/SELL or CALL/PUT' },
            entry: { type: Type.NUMBER },
            tp: { type: Type.NUMBER },
            sl: { type: Type.NUMBER },
            expiry: { type: Type.STRING },
            pattern: { type: Type.STRING },
            confidence: { type: Type.STRING, description: 'LOW/MEDIUM/HIGH' },
            reasoning: { type: Type.STRING, description: 'Plain English summary' },
            breakdown: {
              type: Type.OBJECT,
              properties: {
                indicators: { type: Type.STRING, description: 'Specific indicator signals detected' },
                structure: { type: Type.STRING, description: 'Market structure analysis' },
                manipulationRisk: { type: Type.STRING, description: 'Flags for stop hunts/fakeouts' }
              },
              required: ['indicators', 'structure', 'manipulationRisk']
            }
          },
          required: ['type', 'entry', 'pattern', 'confidence', 'reasoning', 'breakdown']
        }
      }
    });

    const result = JSON.parse(response.text.trim());
    return {
      ...result,
      pair,
      marketType,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: Date.now(),
      timeframe: 'M1'
    };
  } catch (error) {
    console.error("AI Analysis Error:", error);
    return {};
  }
};
