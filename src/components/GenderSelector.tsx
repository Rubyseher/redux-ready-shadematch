interface GenderSelectorProps {
  value: "men" | "women";
  onChange: (gender: "men" | "women") => void;
}

export default function GenderSelector({ value, onChange }: GenderSelectorProps) {
  return (
    <div className="flex items-center gap-1 rounded-xl bg-muted p-1">
      {(["men", "women"] as const).map((g) => (
        <button
          key={g}
          onClick={() => onChange(g)}
          className={`flex flex-col items-center rounded-lg px-4 py-1.5 text-xs font-medium transition-all duration-200 
            ${value === g
              ? "bg-primary text-primary-foreground shadow-md"
              : "text-muted-foreground hover:text-foreground"
            }`}
        >
          <span className="text-base leading-none">{g === "men" ? "👨" : "👩"}</span>
          <span className="capitalize">{g}</span>
        </button>
      ))}
    </div>
  );
}
