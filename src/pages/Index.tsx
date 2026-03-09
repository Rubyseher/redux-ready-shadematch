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
import { Sparkles, Lock } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Index() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [gender, setGender] = useState<"men" | "women">("men");
  const [clothType, setClothType] = useState<ClothType | null>(null);
  const [detectedColor, setDetectedColor] = useState<{ name: string; hex: string } | null>(null);
  const [suggestions, setSuggestions] = useState<ColorSuggestion[]>([]);
  const [selectedSuggestion, setSelectedSuggestion] = useState<ColorSuggestion | null>(null);

  const handleImageLoad = useCallback(
    (img: HTMLImageElement) => {
      const color = extractDominantColor(img);
      const type = detectClothType(img);
      setClothType(type);
      setDetectedColor({ name: color.name, hex: color.hex });
      const combos = getColorCombinations(type, color.name, gender);
      setSuggestions(combos);
      setSelectedSuggestion(null);
    },
    [gender]
  );

  const handleGenderChange = useCallback(
    (g: "men" | "women") => {
      setGender(g);
      if (clothType && detectedColor) {
        const combos = getColorCombinations(clothType, detectedColor.name, g);
        setSuggestions(combos);
        setSelectedSuggestion(null);
      }
    },
    [clothType, detectedColor]
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

        {/* Color Suggestions */}
        {suggestions.length > 0 && (
          <section className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
            <h2 className="mb-4 text-lg font-bold text-foreground">
              ✨ Suggested Color Combinations
            </h2>
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

        {/* Footer */}
        <footer className="pb-8 pt-4 text-center text-sm text-muted-foreground">
          Drop an image of your clothing to get personalized color match suggestions
        </footer>
      </main>
    </div>
  );
}
