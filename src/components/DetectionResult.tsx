import { Shirt } from "lucide-react";
import type { ClothType } from "@/lib/colorAnalysis";

interface DetectionResultProps {
  clothType: ClothType;
  colorName: string;
  colorHex: string;
}

const clothLabels: Record<ClothType, string> = {
  shirt: "👔 Shirt",
  "t-shirt": "👕 T-Shirt",
  pants: "👖 Pants",
  jacket: "🧥 Jacket",
  dress: "👗 Dress",
  skirt: "👗 Skirt",
  hoodie: "🧥 Hoodie",
  kurta: "🪷 Kurta",
  saree: "🪷 Saree",
};

export default function DetectionResult({ clothType, colorName, colorHex }: DetectionResultProps) {
  return (
    <div className="glass-card flex flex-col gap-4 rounded-2xl p-4 sm:flex-row sm:items-center sm:gap-6 sm:p-6">
      <div className="flex items-center gap-4 sm:gap-6">
        <div className="rounded-xl bg-primary/10 p-3 sm:p-4">
          <Shirt className="h-6 w-6 text-primary sm:h-8 sm:w-8" />
        </div>
        <div className="flex-1">
          <p className="text-xs font-medium text-muted-foreground sm:text-sm">Detected Clothing</p>
          <p className="text-lg font-bold text-foreground sm:text-xl">
            {clothLabels[clothType] || clothType}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3 border-t border-border/50 pt-3 sm:ml-auto sm:border-t-0 sm:pt-0">
        <div
          className="h-10 w-10 rounded-lg shadow-inner ring-1 ring-border/50"
          style={{ backgroundColor: colorHex }}
        />
        <div>
          <p className="text-xs font-medium text-muted-foreground sm:text-sm">Color</p>
          <p className="font-semibold text-foreground">{colorName}</p>
        </div>
      </div>
    </div>
  );
}
