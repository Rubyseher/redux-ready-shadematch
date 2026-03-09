interface GenderSelectorProps {
  value: "men" | "women";
  onChange: (gender: "men" | "women") => void;
}

export default function GenderSelector({ value, onChange }: GenderSelectorProps) {
  return (
    <div className="flex items-center gap-2 rounded-xl bg-muted p-1">
      {(["men", "women"] as const).map((g) => (
        <button
          key={g}
          onClick={() => onChange(g)}
          className={`flex-1 rounded-lg px-6 py-2.5 text-sm font-medium capitalize transition-all duration-200 
            ${value === g
              ? "bg-primary text-primary-foreground shadow-md"
              : "text-muted-foreground hover:text-foreground"
            }`}
        >
          {g === "men" ? "👨 Men" : "👩 Women"}
        </button>
      ))}
    </div>
  );
}
