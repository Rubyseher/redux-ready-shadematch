import type { ColorSuggestion } from "@/lib/colorAnalysis";

interface ColorSuggestionCardProps {
  suggestion: ColorSuggestion;
  onClick: (suggestion: ColorSuggestion) => void;
  isSelected: boolean;
}

export default function ColorSuggestionCard({ suggestion, onClick, isSelected }: ColorSuggestionCardProps) {
  return (
    <button
      onClick={() => onClick(suggestion)}
      className={`group flex items-center gap-4 rounded-xl border p-4 text-left transition-all duration-200 hover:shadow-md
        ${isSelected
          ? "border-primary bg-primary/5 shadow-md ring-2 ring-primary/30"
          : "border-border hover:border-primary/40"
        }`}
    >
      <div
        className="h-12 w-12 shrink-0 rounded-lg shadow-inner ring-1 ring-border/50"
        style={{ backgroundColor: suggestion.colorHex }}
      />
      <div className="min-w-0">
        <p className="font-medium text-foreground">{suggestion.colorName}</p>
        <p className="text-sm text-muted-foreground">{suggestion.itemType}</p>
      </div>
    </button>
  );
}
