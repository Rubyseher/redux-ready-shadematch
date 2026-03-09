// Extract dominant color from an image using canvas sampling
export function extractDominantColor(imageElement: HTMLImageElement): { hex: string; name: string; hsl: [number, number, number] } {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d")!;
  const size = 100;
  canvas.width = size;
  canvas.height = size;
  ctx.drawImage(imageElement, 0, 0, size, size);
  const data = ctx.getImageData(0, 0, size, size).data;

  // Sample pixels, skip very bright/dark (background)
  let rSum = 0, gSum = 0, bSum = 0, count = 0;
  for (let i = 0; i < data.length; i += 16) { // sample every 4th pixel
    const r = data[i], g = data[i + 1], b = data[i + 2], a = data[i + 3];
    if (a < 200) continue;
    const brightness = (r + g + b) / 3;
    if (brightness < 20 || brightness > 240) continue;
    rSum += r; gSum += g; bSum += b; count++;
  }

  if (count === 0) {
    return { hex: "#808080", name: "Gray", hsl: [0, 0, 50] };
  }

  const r = Math.round(rSum / count);
  const g = Math.round(gSum / count);
  const b = Math.round(bSum / count);
  const hex = `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
  const hsl = rgbToHsl(r, g, b);
  const name = getColorName(hsl);

  return { hex, name, hsl };
}

function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
}

function getColorName(hsl: [number, number, number]): string {
  const [h, s, l] = hsl;
  if (l < 15) return "Black";
  if (l > 85 && s < 15) return "White";
  if (s < 12) return l < 50 ? "Dark Gray" : "Light Gray";
  if (l < 20) {
    if (h >= 200 && h <= 260) return "Navy";
    if (h >= 0 && h <= 30) return "Maroon";
    return "Dark";
  }
  if (h < 15 || h >= 345) return l > 60 ? "Pink" : s > 50 ? "Red" : "Brown";
  if (h < 40) return l > 55 ? "Peach" : s > 40 ? "Orange" : "Brown";
  if (h < 70) return l > 55 ? "Yellow" : "Olive";
  if (h < 160) return l > 55 ? "Light Green" : "Green";
  if (h < 200) return l > 55 ? "Cyan" : "Teal";
  if (h < 260) return l > 55 ? "Light Blue" : "Blue";
  if (h < 300) return l > 55 ? "Lavender" : "Purple";
  return l > 55 ? "Pink" : "Magenta";
}

export type ClothType = "shirt" | "t-shirt" | "pants" | "jacket" | "dress" | "skirt" | "hoodie" | "kurta" | "saree";

// Simple aspect-ratio + user-context based cloth type detection
export function detectClothType(img: HTMLImageElement): ClothType {
  const ratio = img.naturalWidth / img.naturalHeight;
  if (ratio > 1.2) return "t-shirt";
  if (ratio > 0.85) return "shirt";
  if (ratio < 0.6) return "pants";
  return "shirt";
}

export interface ColorSuggestion {
  itemType: string;
  colorName: string;
  colorHex: string;
}

export function getColorCombinations(
  clothType: ClothType,
  detectedColor: string,
  gender: "men" | "women"
): ColorSuggestion[] {
  const colorCombos: Record<string, { men: ColorSuggestion[]; women: ColorSuggestion[] }> = {
    White: {
      men: [
        { itemType: "Pants", colorName: "Navy Blue", colorHex: "#1B2A4A" },
        { itemType: "Pants", colorName: "Charcoal Gray", colorHex: "#36454F" },
        { itemType: "Pants", colorName: "Beige", colorHex: "#C8B88A" },
        { itemType: "Shoes", colorName: "White Sneakers", colorHex: "#F5F5F5" },
        { itemType: "Shoes", colorName: "Brown Leather", colorHex: "#8B4513" },
        { itemType: "Shoes", colorName: "Black", colorHex: "#1A1A1A" },
      ],
      women: [
        { itemType: "Pants", colorName: "High-Waist Black", colorHex: "#1A1A1A" },
        { itemType: "Skirt", colorName: "Blush Pink", colorHex: "#DE98AB" },
        { itemType: "Pants", colorName: "Light Blue Denim", colorHex: "#6CA0DC" },
        { itemType: "Shoes", colorName: "Nude Heels", colorHex: "#D2B48C" },
        { itemType: "Shoes", colorName: "White Sneakers", colorHex: "#F5F5F5" },
        { itemType: "Shoes", colorName: "Red Flats", colorHex: "#C41E3A" },
      ],
    },
    Black: {
      men: [
        { itemType: "Pants", colorName: "Dark Gray", colorHex: "#4A4A4A" },
        { itemType: "Pants", colorName: "Khaki", colorHex: "#C3B091" },
        { itemType: "Pants", colorName: "White", colorHex: "#F0F0F0" },
        { itemType: "Shoes", colorName: "Black Formal", colorHex: "#0D0D0D" },
        { itemType: "Shoes", colorName: "White Sneakers", colorHex: "#F5F5F5" },
        { itemType: "Shoes", colorName: "Burgundy", colorHex: "#722F37" },
      ],
      women: [
        { itemType: "Pants", colorName: "White Wide-Leg", colorHex: "#FAFAFA" },
        { itemType: "Skirt", colorName: "Leopard Print", colorHex: "#C19A6B" },
        { itemType: "Pants", colorName: "Red", colorHex: "#C41E3A" },
        { itemType: "Shoes", colorName: "Gold Heels", colorHex: "#CFB53B" },
        { itemType: "Shoes", colorName: "Black Boots", colorHex: "#1A1A1A" },
        { itemType: "Shoes", colorName: "Nude Pumps", colorHex: "#D2B48C" },
      ],
    },
    Blue: {
      men: [
        { itemType: "Pants", colorName: "Beige Chinos", colorHex: "#C8B88A" },
        { itemType: "Pants", colorName: "White", colorHex: "#F0F0F0" },
        { itemType: "Pants", colorName: "Dark Navy", colorHex: "#1B2A4A" },
        { itemType: "Shoes", colorName: "Brown Loafers", colorHex: "#8B4513" },
        { itemType: "Shoes", colorName: "White Sneakers", colorHex: "#F5F5F5" },
        { itemType: "Shoes", colorName: "Tan", colorHex: "#D2B48C" },
      ],
      women: [
        { itemType: "Pants", colorName: "White Skinny", colorHex: "#FAFAFA" },
        { itemType: "Skirt", colorName: "Mustard Yellow", colorHex: "#E1AD01" },
        { itemType: "Pants", colorName: "Coral", colorHex: "#FF7F50" },
        { itemType: "Shoes", colorName: "Nude Sandals", colorHex: "#D2B48C" },
        { itemType: "Shoes", colorName: "White Platforms", colorHex: "#F5F5F5" },
        { itemType: "Shoes", colorName: "Silver", colorHex: "#C0C0C0" },
      ],
    },
    Red: {
      men: [
        { itemType: "Pants", colorName: "Dark Blue Denim", colorHex: "#1B3A5C" },
        { itemType: "Pants", colorName: "Black", colorHex: "#1A1A1A" },
        { itemType: "Pants", colorName: "Charcoal", colorHex: "#36454F" },
        { itemType: "Shoes", colorName: "White Sneakers", colorHex: "#F5F5F5" },
        { itemType: "Shoes", colorName: "Black", colorHex: "#1A1A1A" },
        { itemType: "Shoes", colorName: "Gray", colorHex: "#808080" },
      ],
      women: [
        { itemType: "Pants", colorName: "Black Slim", colorHex: "#1A1A1A" },
        { itemType: "Skirt", colorName: "Black Mini", colorHex: "#1A1A1A" },
        { itemType: "Pants", colorName: "White", colorHex: "#FAFAFA" },
        { itemType: "Shoes", colorName: "Black Heels", colorHex: "#1A1A1A" },
        { itemType: "Shoes", colorName: "Nude Pumps", colorHex: "#D2B48C" },
        { itemType: "Shoes", colorName: "Gold Sandals", colorHex: "#CFB53B" },
      ],
    },
    Green: {
      men: [
        { itemType: "Pants", colorName: "Beige", colorHex: "#C8B88A" },
        { itemType: "Pants", colorName: "Dark Brown", colorHex: "#5C4033" },
        { itemType: "Pants", colorName: "Navy", colorHex: "#1B2A4A" },
        { itemType: "Shoes", colorName: "Brown", colorHex: "#8B4513" },
        { itemType: "Shoes", colorName: "White", colorHex: "#F5F5F5" },
        { itemType: "Shoes", colorName: "Tan", colorHex: "#D2B48C" },
      ],
      women: [
        { itemType: "Pants", colorName: "White", colorHex: "#FAFAFA" },
        { itemType: "Skirt", colorName: "Gold", colorHex: "#CFB53B" },
        { itemType: "Pants", colorName: "Blush Pink", colorHex: "#DE98AB" },
        { itemType: "Shoes", colorName: "Nude", colorHex: "#D2B48C" },
        { itemType: "Shoes", colorName: "Gold Heels", colorHex: "#CFB53B" },
        { itemType: "Shoes", colorName: "Brown Boots", colorHex: "#8B4513" },
      ],
    },
  };

  // Fallback combos
  const fallback: { men: ColorSuggestion[]; women: ColorSuggestion[] } = {
    men: [
      { itemType: "Pants", colorName: "Navy Blue", colorHex: "#1B2A4A" },
      { itemType: "Pants", colorName: "Black", colorHex: "#1A1A1A" },
      { itemType: "Pants", colorName: "Beige", colorHex: "#C8B88A" },
      { itemType: "Shoes", colorName: "White Sneakers", colorHex: "#F5F5F5" },
      { itemType: "Shoes", colorName: "Brown", colorHex: "#8B4513" },
      { itemType: "Shoes", colorName: "Black", colorHex: "#1A1A1A" },
    ],
    women: [
      { itemType: "Pants", colorName: "Black", colorHex: "#1A1A1A" },
      { itemType: "Skirt", colorName: "White", colorHex: "#FAFAFA" },
      { itemType: "Pants", colorName: "Beige", colorHex: "#C8B88A" },
      { itemType: "Shoes", colorName: "Nude", colorHex: "#D2B48C" },
      { itemType: "Shoes", colorName: "Black Heels", colorHex: "#1A1A1A" },
      { itemType: "Shoes", colorName: "White Sneakers", colorHex: "#F5F5F5" },
    ],
  };

  // Map detected color name to our combo keys
  const colorKey = Object.keys(colorCombos).find(
    (k) => detectedColor.toLowerCase().includes(k.toLowerCase())
  );

  const combos = colorKey ? colorCombos[colorKey] : fallback;

  // Adjust item types based on cloth type
  const suggestions = combos[gender].map((s) => {
    if (clothType === "pants" && s.itemType === "Pants") {
      return { ...s, itemType: "Shirt" };
    }
    if (clothType === "dress" || clothType === "saree") {
      if (s.itemType === "Pants" || s.itemType === "Skirt") {
        return { ...s, itemType: "Dupatta / Accessory" };
      }
    }
    return s;
  });

  return suggestions;
}

export function getShoppingLinks(
  colorName: string,
  itemType: string,
  gender: "men" | "women"
): { store: string; url: string; icon: string }[] {
  const genderQuery = gender === "men" ? "men" : "women";
  const query = encodeURIComponent(`${colorName} ${itemType} for ${genderQuery}`);

  return [
    {
      store: "Amazon India",
      url: `https://www.amazon.in/s?k=${query}`,
      icon: "🛒",
    },
    {
      store: "Myntra",
      url: `https://www.myntra.com/${genderQuery}-${itemType.toLowerCase().replace(/\s+/g, "-")}?rawQuery=${query}`,
      icon: "👗",
    },
    {
      store: "Flipkart",
      url: `https://www.flipkart.com/search?q=${query}`,
      icon: "🏪",
    },
  ];
}
