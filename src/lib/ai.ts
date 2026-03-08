import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = process.env.GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(API_KEY);

// Use a function to get the model to allow for easy fallback/retry
async function getModel(modelName: string) {
    return genAI.getGenerativeModel({ model: modelName });
}

export interface MarketAnalysisInput {
    token: string;
    currentPrice: number;
    high24h: number;
    dropPercentage: number;
    targetDrop: number;
}

export async function getAIReasoning(input: MarketAnalysisInput): Promise<{ decision: string; advice: string }> {
    const prompt = `
    You are a professional crypto trading agent named Rialo.
    Market Data:
    - Asset: ${input.token}
    - Current Price: $${input.currentPrice}
    - 24h High: $${input.high24h}
    - Current Drop: ${input.dropPercentage.toFixed(2)}%
    - User's Target Trigger: ${input.targetDrop}%

    Task:
    Analyze if we should execute a simulated trade now. 
    Even if the target is reached, look for "red flags" (like the drop being too fast or too deep).
    
    Output rules:
    - Return a short 'decision' (e.g., "EXECUTE", "WAIT", "MONITOR").
    - Return a short 'advice' in English explaining the logic (max 20 words).
    - Use a friendly, professional, and slightly playful tone.
    - Keep it concise.

    Format: JSON { "decision": "...", "advice": "..." }
    `;

    const isKeyInvalid = !API_KEY || API_KEY === 'your_api_key_here';

    if (isKeyInvalid) {
        if (input.dropPercentage >= input.targetDrop) {
            return { decision: "EXECUTE", advice: "Target reached! The dip looks juicy, I'm executing the buy signal now." };
        }
        return { decision: "MONITOR", advice: "Watching the waves. Price is still hovering, no major moves yet." };
    }

    // List of models to try in order of preference
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

            const jsonMatch = text.match(/\{.*\}/s);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[0]);
            }
        } catch (error: any) {
            const errorMsg = error?.message || String(error);
            const status = error?.status;

            if (status === 429 || errorMsg.includes('429') || status === 404 || errorMsg.includes('404')) {
                // Don't log too much, just try next
                continue;
            }
            console.error(`AI Error with ${modelId}:`, errorMsg);
        }
    }

    // FINAL FALLBACK: If all AI models fail, use rules-based logic
    if (input.dropPercentage >= input.targetDrop) {
        return {
            decision: "EXECUTE",
            advice: "AI is busy, but target reached! Moving to backup logic: executing buy signal."
        };
    }

    return {
        decision: "MONITOR",
        advice: "AI is resting, using backup logic to watch the price (${input.dropPercentage.toFixed(1)}%)."
    };
}
