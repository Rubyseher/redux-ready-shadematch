import { GoogleGenerativeAI } from "@google/generative-ai";
import type { ClothType, ColorSuggestion } from "./colorAnalysis";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const MODEL =
  import.meta.env.VITE_GEMINI_MODEL?.trim() ||
  // Default to cost-efficient model that is currently available on v1beta
  "gemini-2.0-flash-lite";

let genAI: GoogleGenerativeAI | null = null;
const suggestionCache = new Map<string, ColorSuggestion[]>();
let lastRequestAt = 0;
const MIN_REQUEST_GAP_MS = 3000; // basic throttling to avoid hitting RPM hard limits

function getGenAI(): GoogleGenerativeAI | null {
  if (!API_KEY || API_KEY === "your_gemini_api_key_here") return null;
  if (!genAI) genAI = new GoogleGenerativeAI(API_KEY);
  return genAI;
}

async function generateWithRetry(model: ReturnType<GoogleGenerativeAI["getGenerativeModel"]>, prompt: string) {
  const maxRetries = 2;
  for (let i = 0; i <= maxRetries; i++) {
    try {
      return await model.generateContent(prompt);
    } catch (error: any) {
      const status = error?.status ?? error?.cause?.status;
      const message = error?.message?.toLowerCase?.() || "";
      const is429 = status === 429 || message.includes("429") || message.includes("quota") || message.includes("rate");
      if (is429 && i < maxRetries) {
        const delay = Math.pow(2, i) * 1000; // 1s, 2s
        await new Promise((res) => setTimeout(res, delay));
        continue;
      }
      throw error;
    }
  }
}

export async function getAIColorSuggestions(
  clothType: ClothType,
  detectedColor: string,
  gender: "men" | "women"
): Promise<ColorSuggestion[] | null> {
  const ai = getGenAI();
  if (!ai) return null; // fallback to rule-based

  // Cache key to avoid duplicate calls for the same input in one session
  const cacheKey = `${clothType}-${detectedColor}-${gender}`;
  const cached = suggestionCache.get(cacheKey);
  if (cached) return cached;

  // Basic throttle to respect RPM limits
  const now = Date.now();
  if (now - lastRequestAt < MIN_REQUEST_GAP_MS) {
    console.warn("🤖 Throttling Gemini call to avoid rate limits");
    return null;
  }
  lastRequestAt = now;

  const prompt = `You are a fashion color coordination expert. A user has a ${gender}'s ${clothType} in ${detectedColor} color.

Suggest exactly 6 complementary clothing items they should pair with it. For each suggestion, provide:
- itemType: the type of clothing/accessory (e.g., "Pants", "Shoes", "Skirt", "Belt", "Watch", "Bag")  
- colorName: a descriptive color name (e.g., "Navy Blue", "Blush Pink", "Charcoal Gray")
- colorHex: the exact hex color code

Return ONLY a valid JSON array with no extra text. Example format:
[{"itemType":"Pants","colorName":"Navy Blue","colorHex":"#1B2A4A"},{"itemType":"Shoes","colorName":"White Sneakers","colorHex":"#F5F5F5"}]

Consider current fashion trends, color theory, and seasonal versatility. Mix different item types (bottoms, shoes, accessories).`;

  try {
    console.log("🤖 Calling Gemini API with model:", MODEL);
    const model = ai.getGenerativeModel({
      model: MODEL,
      generationConfig: { maxOutputTokens: 4096, temperature: 0.7 },
    });
    const result = await generateWithRetry(model, prompt);
    const finishReason = result.response.candidates?.[0]?.finishReason;
    console.log("🤖 Gemini finish reason:", finishReason);
    
    if (finishReason === "MAX_TOKENS") {
      console.warn("🤖 Gemini output truncated");
      return null;
    }
    const text = result.response.text().trim();
    console.log("🤖 Gemini raw response:", text.slice(0, 200));
    
    // Extract JSON from response (handle markdown code blocks)
    let cleaned = text
      .replace(/```json\s*/gi, "")
      .replace(/```\s*/g, "")
      .trim();
    
    const jsonMatch = cleaned.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      console.error("🤖 No JSON array found in response");
      return null;
    }

    // Clean common JSON issues
    let jsonStr = jsonMatch[0]
      .replace(/,\s*]/g, "]")  // trailing commas
      .replace(/,\s*}/g, "}")
      .replace(/[\x00-\x1F\x7F]/g, ""); // control characters

    const parsed = JSON.parse(jsonStr) as ColorSuggestion[];
    console.log("🤖 Parsed suggestions:", parsed.length);
    
    // Validate structure
    if (!Array.isArray(parsed) || parsed.length === 0) {
      console.error("🤖 Invalid parsed structure");
      return null;
    }
    const valid = parsed.every(
      (s) => s.itemType && s.colorName && s.colorHex?.startsWith("#")
    );
    if (!valid) {
      console.error("🤖 Suggestions failed validation");
      return null;
    }

    const finalSuggestions = parsed.slice(0, 6);
    suggestionCache.set(cacheKey, finalSuggestions);
    console.log("✅ AI suggestions ready!");
    return finalSuggestions;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    const isQuota =
      message.includes("429") ||
      message.toLowerCase().includes("quota") ||
      message.toLowerCase().includes("rate limit");

    const isNotFound =
      message.toLowerCase().includes("not found") ||
      message.toLowerCase().includes("not supported");

    if (isQuota) {
      console.warn("🤖 Gemini quota reached. Falling back to rule-based suggestions.");
      return null;
    }

    if (isNotFound && MODEL !== "gemini-2.0-flash") {
      console.warn("🤖 Gemini model not found. Consider setting VITE_GEMINI_MODEL to gemini-2.0-flash or gemini-2.5-flash-lite.");
      return null;
    }

    console.error("🤖 Gemini API error:", err);
    return null; // fallback to rule-based
  }
}

export function isGeminiConfigured(): boolean {
  return !!API_KEY && API_KEY !== "your_gemini_api_key_here";
}
