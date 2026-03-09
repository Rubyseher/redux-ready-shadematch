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
    <div className="glass-card flex items-center gap-6 rounded-2xl p-6">
      <div className="rounded-xl bg-primary/10 p-4">
        <Shirt className="h-8 w-8 text-primary" />
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium text-muted-foreground">Detected Clothing</p>
        <p className="text-xl font-bold text-foreground">
          {clothLabels[clothType] || clothType}
        </p>
      </div>
      <div className="flex items-center gap-3">
        <div
          className="h-10 w-10 rounded-lg shadow-inner ring-1 ring-border/50"
          style={{ backgroundColor: colorHex }}
        />
        <div>
          <p className="text-sm font-medium text-muted-foreground">Color</p>
          <p className="font-semibold text-foreground">{colorName}</p>
        </div>
      </div>
    </div>
  );
}
