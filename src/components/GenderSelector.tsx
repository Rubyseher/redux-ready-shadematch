interface GenderSelectorProps {
  value: "men" | "women";
  onChange: (gender: "men" | "women") => void;
}

export default function GenderSelector({ value, onChange }: GenderSelectorProps) {
  return (
    <div className="grid grid-cols-2 gap-1 rounded-lg bg-muted p-1 w-[100px] sm:gap-2 sm:rounded-xl sm:p-1.5 sm:w-[140px]">
      {(["men", "women"] as const).map((g) => (
        <button
          key={g}
          onClick={() => onChange(g)}
          className={`flex flex-col items-center gap-0.5 rounded-md py-1 text-[10px] font-medium transition-all duration-200 sm:rounded-lg sm:py-2 sm:text-xs
            ${value === g
              ? "bg-primary text-primary-foreground shadow-md"
              : "text-muted-foreground hover:text-foreground"
            }`}
        >
          <span className="text-sm leading-none sm:text-lg">{g === "men" ? "👨" : "👩"}</span>
          <span className="capitalize">{g}</span>
        </button>
      ))}
    </div>
  );
}
