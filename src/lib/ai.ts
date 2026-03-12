import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = process.env.GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(API_KEY);

// Use a function to get the model to allow for easy fallback/retry
async function getModel(modelName: string) {
    return genAI.getGenerativeModel({ model: modelName });
}

export interface MarketAnalysisInput {
    id: string;
    token: string;
    currentPrice: number;
    high24h: number;
    dropPercentage: number;
    targetDrop: number;
}

export interface AIAnalysisResult {
    id: string;
    decision: string;
    advice: string;
}

export async function getAIReasoning(inputs: MarketAnalysisInput[]): Promise<AIAnalysisResult[]> {
    if (inputs.length === 0) return [];

    const prompt = `
    You are Rialo, a professional crypto trading agent. 
    Analyze the following market data for multiple assets and decide whether to execute simulated trades.
    Even if targets are reached, look for "red flags" (e.g., drop too fast/deep).

    Assets to analyze:
    ${inputs.map(input => `- [ID: ${input.id}] ${input.token}: Price $${input.currentPrice}, 24h High $${input.high24h}, Drop ${input.dropPercentage.toFixed(2)}%, Target -${input.targetDrop}%`).join('\n')}

    Output rules:
    - Return an ARRAY of JSON objects.
    - Each object must have: "id" (the ID provided), "decision" ("EXECUTE", "WAIT", "MONITOR"), and "advice" (short English explanation, max 20 words, friendly/playful tone).
    - Be concise and professional.

    Example Format: [ { "id": "...", "decision": "...", "advice": "..." }, ... ]
    `;

    const isKeyInvalid = !API_KEY || API_KEY === 'your_api_key_here';

    if (isKeyInvalid) {
        return inputs.map(input => {
            if (input.dropPercentage >= input.targetDrop) {
                return { id: input.id, decision: "EXECUTE", advice: "Target reached! The dip looks juicy, I'm executing the buy signal now." };
            }
            return { id: input.id, decision: "MONITOR", advice: "Watching the waves. Price is still hovering, no major moves yet." };
        });
    }

    const modelsToTry = [
        "gemini-1.5-flash",
        "gemini-1.5-flash-latest",
        "gemini-2.0-flash",
        "gemini-1.5-flash-8b",
        "gemini-1.5-pro"
    ];

    for (const modelId of modelsToTry) {
        try {
            const model = await getModel(modelId);
            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();

            const jsonMatch = text.match(/\[.*\]/s);
            if (jsonMatch) {
                const parsed = JSON.parse(jsonMatch[0]);
                if (Array.isArray(parsed)) return parsed;
            }
        } catch (error: any) {
            const errorMsg = error?.message || String(error);
            const status = error?.status;
            if (status === 429 || errorMsg.includes('429') || status === 404 || errorMsg.includes('404')) continue;
            console.error(`AI Error with ${modelId}:`, errorMsg);
        }
    }

    // FINAL FALLBACK
    return inputs.map(input => {
        if (input.dropPercentage >= input.targetDrop) {
            return {
                id: input.id,
                decision: "EXECUTE",
                advice: "AI is busy, but target reached! Moving to backup logic: executing buy signal."
            };
        }
        return {
            id: input.id,
            decision: "MONITOR",
            advice: `AI is resting, using backup logic to watch the price (${input.dropPercentage.toFixed(1)}%).`
        };
    });
}
