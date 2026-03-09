import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { subscribeToOutfits, deleteOutfit, type OutfitRecord } from "@/lib/firebase";
import { Trash2, Clock, History } from "lucide-react";
import { toast } from "sonner";

export default function OutfitHistory() {
  const { user } = useAuth();
  const [outfits, setOutfits] = useState<OutfitRecord[]>([]);

  useEffect(() => {
    if (!user) {
      setOutfits([]);
      return;
    }
    const unsubscribe = subscribeToOutfits(user.uid, setOutfits);
    return unsubscribe;
  }, [user]);

  if (!user || outfits.length === 0) return null;

  const handleDelete = async (id: string) => {
    try {
      await deleteOutfit(id);
      toast.success("Outfit removed from history");
    } catch {
      toast.error("Failed to delete outfit");
    }
  };

  return (
    <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-4 flex items-center gap-2">
        <History className="h-5 w-5 text-primary" />
        <h2 className="font-sans text-base font-bold text-foreground sm:text-lg">
          Your Outfit History
        </h2>
        <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
          {outfits.length}
        </span>
      </div>

      <div className="space-y-3">
        {outfits.slice(0, 5).map((outfit) => (
          <div
            key={outfit.id}
            className="flex items-center gap-3 rounded-xl border border-border bg-card p-3 transition-all hover:shadow-sm sm:p-4"
          >
            {/* Detected color swatch */}
            <div
              className="h-10 w-10 shrink-0 rounded-lg ring-1 ring-border/50"
              style={{ backgroundColor: outfit.detectedColorHex }}
            />

            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-foreground">
                {outfit.detectedColor} {outfit.clothType}
              </p>
              <div className="mt-1 flex flex-wrap gap-1">
                {outfit.suggestions.slice(0, 3).map((s, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground"
                  >
                    <span
                      className="inline-block h-2 w-2 rounded-full"
                      style={{ backgroundColor: s.colorHex }}
                    />
                    {s.colorName}
                  </span>
                ))}
                {outfit.suggestions.length > 3 && (
                  <span className="text-[10px] text-muted-foreground">
                    +{outfit.suggestions.length - 3} more
                  </span>
                )}
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-2">
              {outfit.usedAi && (
                <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
                  AI
                </span>
              )}
              <span className="hidden text-[10px] text-muted-foreground sm:flex sm:items-center sm:gap-1">
                <Clock className="h-3 w-3" />
                {outfit.createdAt?.toDate
                  ? new Intl.DateTimeFormat("en", { month: "short", day: "numeric" }).format(outfit.createdAt.toDate())
                  : "Now"}
              </span>
              <button
                onClick={() => outfit.id && handleDelete(outfit.id)}
                className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                aria-label="Delete outfit"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
