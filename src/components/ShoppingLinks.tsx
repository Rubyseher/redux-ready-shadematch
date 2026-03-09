import { getShoppingLinks } from "@/lib/colorAnalysis";
import type { ColorSuggestion } from "@/lib/colorAnalysis";
import { ExternalLink } from "lucide-react";

interface ShoppingLinksProps {
  suggestion: ColorSuggestion;
  gender: "men" | "women";
}

export default function ShoppingLinks({ suggestion, gender }: ShoppingLinksProps) {
  const links = getShoppingLinks(suggestion.colorName, suggestion.itemType, gender);

  return (
    <div className="glass-card rounded-2xl p-6">
      <div className="mb-4 flex items-center gap-3">
        <div
          className="h-8 w-8 rounded-lg ring-1 ring-border/50"
          style={{ backgroundColor: suggestion.colorHex }}
        />
        <div>
          <h3 className="font-semibold text-foreground">
            Shop {suggestion.colorName} {suggestion.itemType}
          </h3>
          <p className="text-sm text-muted-foreground">
            Find the perfect match on these stores
          </p>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {links.map((link) => (
          <a
            key={link.store}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 rounded-xl border border-border bg-card p-4 transition-all duration-200 hover:border-primary/40 hover:shadow-md hover:-translate-y-0.5"
          >
            <span className="text-2xl">{link.icon}</span>
            <div className="min-w-0 flex-1">
              <p className="font-medium text-foreground">{link.store}</p>
              <p className="truncate text-xs text-muted-foreground">Search results →</p>
            </div>
            <ExternalLink className="h-4 w-4 shrink-0 text-muted-foreground" />
          </a>
        ))}
      </div>
    </div>
  );
}
