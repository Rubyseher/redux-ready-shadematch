import { useCallback, useState } from "react";
import { Upload, Image as ImageIcon } from "lucide-react";
import CameraCapture from "./CameraCapture";

interface ImageDropZoneProps {
  onImageLoad: (img: HTMLImageElement) => void;
}

export default function ImageDropZone({ onImageLoad }: ImageDropZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [showCamera, setShowCamera] = useState(false);

  const handleFile = useCallback(
    (file: File) => {
      if (!file.type.startsWith("image/")) return;
      const url = URL.createObjectURL(file);
      setPreview(url);
      setShowCamera(false);
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => onImageLoad(img);
      img.src = url;
    },
    [onImageLoad]
  );

  const handleCameraCapture = useCallback(
    (img: HTMLImageElement) => {
      setPreview(img.src);
      setShowCamera(false);
      onImageLoad(img);
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

  if (showCamera) {
    return <CameraCapture onCapture={handleCameraCapture} />;
  }

  return (
    <div className="space-y-3">
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
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
          ${preview ? "p-3 sm:p-4" : "p-8 sm:p-12"}
        `}
      >
        {preview ? (
          <div className="flex flex-col items-center gap-3 sm:gap-4">
            <img
              src={preview}
              alt="Uploaded clothing"
              className="max-h-56 rounded-xl object-contain shadow-md sm:max-h-72"
            />
            <p className="text-xs text-muted-foreground sm:text-sm">
              Click or drop another image to replace
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 text-muted-foreground sm:gap-4">
            <div className="rounded-xl bg-primary/10 p-4 sm:rounded-2xl sm:p-5">
              <Upload className="h-8 w-8 text-primary sm:h-10 sm:w-10" />
            </div>
            <div className="text-center">
              <p className="text-base font-semibold text-foreground sm:text-lg">
                Drop your clothing image here
              </p>
              <p className="mt-1 text-xs sm:text-sm">or click to browse · PNG, JPG, WEBP</p>
            </div>
            <div className="mt-1 flex items-center gap-2 rounded-lg bg-muted px-3 py-1.5 text-xs sm:mt-2 sm:px-4 sm:py-2">
              <ImageIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span>Shirt, T-shirt, Pants, Jacket, Dress…</span>
            </div>
          </div>
        )}
      </div>

      {/* Camera option */}
      {!preview && (
        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-border" />
          <span className="text-xs text-muted-foreground">or</span>
          <div className="h-px flex-1 bg-border" />
        </div>
      )}
      {!preview && (
        <div className="flex justify-center">
          <CameraCapture onCapture={handleCameraCapture} />
        </div>
      )}
    </div>
  );
}
