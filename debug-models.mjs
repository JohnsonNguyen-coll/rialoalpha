import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

async function run() {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
    try {
        const models = await genAI.listModels();
        console.log("AVAILABLE MODELS:");
        models.models.forEach((m) => {
            console.log(`- ${m.name}`);
        });
    } catch (error) {
        console.error("Error listing models:", error);
    }
}

run();
