import { useState, useCallback } from "react";
import ImageDropZone from "@/components/ImageDropZone";
import GenderSelector from "@/components/GenderSelector";
import DetectionResult from "@/components/DetectionResult";
import ColorSuggestionCard from "@/components/ColorSuggestionCard";
import ShoppingLinks from "@/components/ShoppingLinks";
import UserMenu from "@/components/UserMenu";
import ThemeToggle from "@/components/ThemeToggle";
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
      <header className="sticky top-0 z-50 border-b border-border/50 bg-card/80 backdrop-blur-lg">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3 sm:px-6 sm:py-4">
          {/* Logo */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="rounded-lg bg-primary/10 p-1.5 sm:rounded-xl sm:p-2">
              <Sparkles className="h-5 w-5 text-primary sm:h-6 sm:w-6" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-foreground sm:text-xl">ShadeMatch</h1>
              <p className="hidden text-xs text-muted-foreground sm:block">AI-Powered Outfit Color Matcher</p>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            <GenderSelector value={gender} onChange={handleGenderChange} />
            <ThemeToggle />
            <UserMenu />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-4xl space-y-6 px-4 py-6 sm:space-y-8 sm:px-6 sm:py-10">
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
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <h2 className="font-sans text-base font-bold text-foreground sm:text-lg">
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
            <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
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
            <div className="flex flex-col gap-3 rounded-xl border border-primary/20 bg-primary/5 p-4 sm:flex-row sm:items-center">
              <Lock className="h-5 w-5 shrink-0 text-primary" />
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
        <footer className="pb-8 pt-4 text-center text-xs text-muted-foreground sm:text-sm">
          {isGeminiConfigured()
            ? "Powered by Google Gemini AI • Drop an image to get smart outfit suggestions"
            : "Drop an image of your clothing to get personalized color match suggestions"
          }
        </footer>
      </main>
    </div>
  );
}
