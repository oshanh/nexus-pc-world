import { GoogleGenAI, Type } from '@google/genai';
import type { BuildRecommendation, BuildPreferences } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const recommendationSchema = {
    type: Type.OBJECT,
    properties: {
        cpu: { type: Type.OBJECT, properties: { name: { type: Type.STRING }, reason: { type: Type.STRING }, price: { type: Type.NUMBER } }, required: ["name", "reason", "price"]},
        gpu: { type: Type.OBJECT, properties: { name: { type: Type.STRING }, reason: { type: Type.STRING }, price: { type: Type.STRING } }, required: ["name", "reason", "price"]},
        ram: { type: Type.OBJECT, properties: { name: { type: Type.STRING }, reason: { type: 'STRING' }, price: { type: Type.STRING } }, required: ["name", "reason", "price"]},
        storage: { type: Type.OBJECT, properties: { name: { type: Type.STRING }, reason: { type: 'STRING' }, price: { type: Type.STRING } }, required: ["name", "reason", "price"]},
        motherboard: { type: Type.OBJECT, properties: { name: { type: Type.STRING }, reason: { type: 'STRING' }, price: { type: Type.STRING } }, required: ["name", "reason", "price"]},
        psu: { type: Type.OBJECT, properties: { name: { type: Type.STRING }, reason: { type: 'STRING' }, price: { type: Type.STRING } }, required: ["name", "reason", "price"]},
        case: { type: Type.OBJECT, properties: { name: { type: Type.STRING }, reason: { type: 'STRING' }, price: { type: Type.STRING } }, required: ["name", "reason", "price"]},
        cooler: { type: Type.OBJECT, properties: { name: { type: Type.STRING }, reason: { type: 'STRING' }, price: { type: Type.STRING } }, required: ["name", "reason", "price"]},
        summary: { type: Type.STRING },
    },
    required: ["cpu", "gpu", "ram", "storage", "motherboard", "psu", "case", "cooler", "summary"]
};

export const getPCBuildRecommendation = async (
    useCase: string, 
    budget: string,
    preferences: BuildPreferences
): Promise<BuildRecommendation> => {
    const prompt = `You are an expert PC builder. The user has specified their core components and preferences.
Your task is to create a compatible and balanced PC build list, including estimated prices.

User's Choices:
- Primary Use Case: "${useCase}"
- Budget: "${budget}" in Sri Lankan Rupees (LKR)
- Selected CPU: "${preferences.cpuModel}"
- Selected GPU: "${preferences.gpuModel}"
- Selected Motherboard: "${preferences.motherboardModel}"
- Selected RAM Capacity: "${preferences.ramCapacity}"
- Selected Case: "${preferences.caseModel}"
- Selected Cooler: "${preferences.coolerModel}"

Instructions:
1.  You MUST use the exact CPU, GPU, Motherboard, RAM capacity, Case, and Cooler the user selected. Do not change them.
2.  Your primary role is to select the REMAINING components: Storage (SSD), and Power Supply (PSU).
3.  Storage: Recommend a fast NVMe SSD with a reasonable capacity for the use case (e.g., at least 1TB for gaming).
4.  PSU: Select a high-quality power supply with enough wattage for the selected CPU and GPU, leaving some headroom.
5.  RAM: For the 'name' field, suggest a specific RAM kit (e.g., G.Skill Trident Z5 32GB DDR5-6000 CL30) that matches the user's selected capacity.
6.  Motherboard: The 'reason' should explain why the user's chosen motherboard is a good fit for the build (considering the CPU, budget, etc.).
7.  All your component choices (Storage, PSU) must be mindful of the user's total budget.
8.  For EACH component (CPU, GPU, RAM, etc.), you MUST provide an estimated 'price' in Sri Lankan Rupees as an integer value (e.g., 1049700). Do not include currency symbols or commas. This is a mandatory field.
9.  Provide your response as a JSON object that adheres to the provided schema.
10. The 'reason' for each component should be a brief explanation of why it's a good choice for this specific build.
11. The 'summary' should be a short, encouraging paragraph about the build's capabilities based on the selected components and budget.`;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: recommendationSchema,
            },
        });
        
        const jsonText = response.text.trim();
        const result = JSON.parse(jsonText);
        return result as BuildRecommendation;

    } catch (error) {
        console.error("Error fetching PC build recommendation:", error);
        throw new Error("Failed to get a recommendation from AI. The model may be unavailable or the request failed.");
    }
};