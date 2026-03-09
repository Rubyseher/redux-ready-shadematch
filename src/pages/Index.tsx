import { useState, useCallback } from "react";
import ImageDropZone from "@/components/ImageDropZone";
import GenderSelector from "@/components/GenderSelector";
import DetectionResult from "@/components/DetectionResult";
import ColorSuggestionCard from "@/components/ColorSuggestionCard";
import ShoppingLinks from "@/components/ShoppingLinks";
import UserMenu from "@/components/UserMenu";
import { useAuth } from "@/contexts/AuthContext";
import {
  extractDominantColor,
  detectClothType,
  getColorCombinations,
  type ClothType,
  type ColorSuggestion,
} from "@/lib/colorAnalysis";
import { getAIColorSuggestions, isGeminiConfigured } from "@/lib/geminiService";
import { Sparkles, Lock, Brain, Cpu } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export default function Index() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [gender, setGender] = useState<"men" | "women">("men");
  const [clothType, setClothType] = useState<ClothType | null>(null);
  const [detectedColor, setDetectedColor] = useState<{ name: string; hex: string } | null>(null);
  const [suggestions, setSuggestions] = useState<ColorSuggestion[]>([]);
  const [selectedSuggestion, setSelectedSuggestion] = useState<ColorSuggestion | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [usedAi, setUsedAi] = useState(false);

  const fetchAISuggestions = useCallback(
    async (type: ClothType, colorName: string, g: "men" | "women") => {
      if (!isGeminiConfigured()) {
        // Fallback to rule-based
        return getColorCombinations(type, colorName, g);
      }

      setIsAiLoading(true);
      try {
        const aiSuggestions = await getAIColorSuggestions(type, colorName, g);
        if (aiSuggestions) {
          setUsedAi(true);
          return aiSuggestions;
        }
      } catch {
        console.error("AI suggestion failed, using fallback");
      } finally {
        setIsAiLoading(false);
      }

      // Fallback
      setUsedAi(false);
      return getColorCombinations(type, colorName, g);
    },
    []
  );

  const handleImageLoad = useCallback(
    async (img: HTMLImageElement) => {
      const color = extractDominantColor(img);
      const type = detectClothType(img);
      setClothType(type);
      setDetectedColor({ name: color.name, hex: color.hex });
      setSelectedSuggestion(null);

      const combos = await fetchAISuggestions(type, color.name, gender);
      setSuggestions(combos);

      if (isGeminiConfigured()) {
        toast.success("AI-powered suggestions ready!", { duration: 2000 });
      }
    },
    [gender, fetchAISuggestions]
  );

  const handleGenderChange = useCallback(
    async (g: "men" | "women") => {
      setGender(g);
      if (clothType && detectedColor) {
        setSelectedSuggestion(null);
        const combos = await fetchAISuggestions(clothType, detectedColor.name, g);
        setSuggestions(combos);
      }
    },
    [clothType, detectedColor, fetchAISuggestions]
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/60 backdrop-blur-lg">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-primary/10 p-2">
              <Sparkles className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-foreground">ShadeMatch</h1>
              <p className="text-xs text-muted-foreground">AI-Powered Outfit Color Matcher</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <GenderSelector value={gender} onChange={handleGenderChange} />
            <UserMenu />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-4xl space-y-8 px-6 py-10">
        {/* Upload Section */}
        <section>
          <ImageDropZone onImageLoad={handleImageLoad} />
        </section>

        {/* Detection Result */}
        {clothType && detectedColor && (
          <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <DetectionResult
              clothType={clothType}
              colorName={detectedColor.name}
              colorHex={detectedColor.hex}
            />
          </section>
        )}

        {/* AI Loading State */}
        {isAiLoading && (
          <section className="animate-in fade-in duration-300">
            <div className="flex items-center justify-center gap-3 rounded-xl border border-primary/20 bg-primary/5 p-6">
              <Brain className="h-5 w-5 animate-pulse text-primary" />
              <p className="text-sm font-medium text-foreground">AI is analyzing your outfit...</p>
            </div>
          </section>
        )}

        {/* Color Suggestions */}
        {suggestions.length > 0 && !isAiLoading && (
          <section className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
            <div className="mb-4 flex items-center gap-2">
              <h2 className="font-sans text-lg font-bold text-foreground">
                ✨ Suggested Color Combinations
              </h2>
              {usedAi ? (
                <span className="flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                  <Brain className="h-3 w-3" /> AI Powered
                </span>
              ) : (
                <span className="flex items-center gap-1 rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                  <Cpu className="h-3 w-3" /> Rule-Based
                </span>
              )}
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {suggestions.map((s, i) => (
                <ColorSuggestionCard
                  key={`${s.colorName}-${s.itemType}-${i}`}
                  suggestion={s}
                  onClick={setSelectedSuggestion}
                  isSelected={
                    selectedSuggestion?.colorName === s.colorName &&
                    selectedSuggestion?.itemType === s.itemType
                  }
                />
              ))}
            </div>
          </section>
        )}

        {/* Shopping Links */}
        {selectedSuggestion && (
          <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <ShoppingLinks suggestion={selectedSuggestion} gender={gender} />
          </section>
        )}

        {/* Save Prompt for non-authenticated users */}
        {selectedSuggestion && !user && (
          <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center gap-3 rounded-xl border border-primary/20 bg-primary/5 p-4">
              <Lock className="h-5 w-5 text-primary" />
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">Save this outfit combo?</p>
                <p className="text-xs text-muted-foreground">Create a free account to save and revisit your matches</p>
              </div>
              <button
                onClick={() => navigate("/auth")}
                className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                Sign Up Free
              </button>
            </div>
          </section>
        )}

        {/* Footer */}
        <footer className="pb-8 pt-4 text-center text-sm text-muted-foreground">
          {isGeminiConfigured()
            ? "Powered by Google Gemini AI • Drop an image to get smart outfit suggestions"
            : "Drop an image of your clothing to get personalized color match suggestions"
          }
        </footer>
      </main>
    </div>
  );
}
