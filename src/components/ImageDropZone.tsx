import { useCallback, useState } from "react";
import { Upload, Image as ImageIcon } from "lucide-react";

interface ImageDropZoneProps {
  onImageLoad: (img: HTMLImageElement, file: File) => void;
}

export default function ImageDropZone({ onImageLoad }: ImageDropZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  const handleFile = useCallback(
    (file: File) => {
      if (!file.type.startsWith("image/")) return;
      const url = URL.createObjectURL(file);
      setPreview(url);
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => onImageLoad(img, file);
      img.src = url;
    },
    [onImageLoad]
  );

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={onDrop}
      onClick={() => {
        const input = document.createElement("input");
        input.type = "file";
        input.accept = "image/*";
        input.onchange = (e) => {
          const file = (e.target as HTMLInputElement).files?.[0];
          if (file) handleFile(file);
        };
        input.click();
      }}
      className={`relative cursor-pointer rounded-2xl border-2 border-dashed transition-all duration-300 
        ${isDragging
          ? "border-primary bg-primary/5 scale-[1.02]"
          : "border-border hover:border-primary/50 hover:bg-muted/50"
        }
        ${preview ? "p-4" : "p-12"}
      `}
    >
      {preview ? (
        <div className="flex flex-col items-center gap-4">
          <img
            src={preview}
            alt="Uploaded clothing"
            className="max-h-72 rounded-xl object-contain shadow-md"
          />
          <p className="text-sm text-muted-foreground">Click or drop another image to replace</p>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-4 text-muted-foreground">
          <div className="rounded-2xl bg-primary/10 p-5">
            <Upload className="h-10 w-10 text-primary" />
          </div>
          <div className="text-center">
            <p className="text-lg font-semibold text-foreground">
              Drop your clothing image here
            </p>
            <p className="mt-1 text-sm">or click to browse · PNG, JPG, WEBP</p>
          </div>
          <div className="mt-2 flex items-center gap-2 rounded-lg bg-muted px-4 py-2 text-xs">
            <ImageIcon className="h-4 w-4" />
            <span>Shirt, T-shirt, Pants, Jacket, Dress, Kurta…</span>
          </div>
        </div>
      )}
    </div>
  );
}
