import { GoogleGenerativeAI } from "@google/generative-ai";
import type { ClothType, ColorSuggestion } from "./colorAnalysis";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

let genAI: GoogleGenerativeAI | null = null;

function getGenAI(): GoogleGenerativeAI | null {
  if (!API_KEY || API_KEY === "your_gemini_api_key_here") return null;
  if (!genAI) genAI = new GoogleGenerativeAI(API_KEY);
  return genAI;
}

export async function getAIColorSuggestions(
  clothType: ClothType,
  detectedColor: string,
  gender: "men" | "women"
): Promise<ColorSuggestion[] | null> {
  const ai = getGenAI();
  if (!ai) return null; // fallback to rule-based

  const prompt = `You are a fashion color coordination expert. A user has a ${gender}'s ${clothType} in ${detectedColor} color.

Suggest exactly 6 complementary clothing items they should pair with it. For each suggestion, provide:
- itemType: the type of clothing/accessory (e.g., "Pants", "Shoes", "Skirt", "Belt", "Watch", "Bag")  
- colorName: a descriptive color name (e.g., "Navy Blue", "Blush Pink", "Charcoal Gray")
- colorHex: the exact hex color code

Return ONLY a valid JSON array with no extra text. Example format:
[{"itemType":"Pants","colorName":"Navy Blue","colorHex":"#1B2A4A"},{"itemType":"Shoes","colorName":"White Sneakers","colorHex":"#F5F5F5"}]

Consider current fashion trends, color theory, and seasonal versatility. Mix different item types (bottoms, shoes, accessories).`;

  try {
    const model = ai.getGenerativeModel({ 
      model: "gemini-2.0-flash",
      generationConfig: { maxOutputTokens: 2048, temperature: 0.7 },
    });
    const result = await model.generateContent(prompt);
    const finishReason = result.response.candidates?.[0]?.finishReason;
    if (finishReason === "MAX_TOKENS") {
      console.warn("Gemini output truncated");
      return null;
    }
    const text = result.response.text().trim();
    
    // Extract JSON from response (handle markdown code blocks)
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) return null;

    const parsed = JSON.parse(jsonMatch[0]) as ColorSuggestion[];
    
    // Validate structure
    if (!Array.isArray(parsed) || parsed.length === 0) return null;
    const valid = parsed.every(
      (s) => s.itemType && s.colorName && s.colorHex?.startsWith("#")
    );
    if (!valid) return null;

    return parsed.slice(0, 6);
  } catch (err) {
    console.error("Gemini API error:", err);
    return null; // fallback to rule-based
  }
}

export function isGeminiConfigured(): boolean {
  return !!API_KEY && API_KEY !== "your_gemini_api_key_here";
}
