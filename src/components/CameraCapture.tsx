import { useRef, useState, useCallback } from "react";
import { Camera, X, CameraOff } from "lucide-react";

interface CameraCaptureProps {
  onCapture: (img: HTMLImageElement) => void;
}

export default function CameraCapture({ onCapture }: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);

  const startCamera = useCallback(async () => {
    setError(null);
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      setStream(mediaStream);
      setIsOpen(true);
      // Attach stream after state update
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          videoRef.current.play();
        }
      }, 100);
    } catch {
      setError("Camera access denied. Please allow camera permissions.");
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((t) => t.stop());
      setStream(null);
    }
    setIsOpen(false);
  }, [stream]);

  const capturePhoto = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(video, 0, 0);

    const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      onCapture(img);
      stopCamera();
    };
    img.src = dataUrl;
  }, [onCapture, stopCamera]);

  if (error) {
    return (
      <button
        onClick={() => setError(null)}
        className="flex items-center gap-2 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-xs text-destructive transition-colors hover:bg-destructive/10"
      >
        <CameraOff className="h-4 w-4" />
        {error}
      </button>
    );
  }

  if (!isOpen) {
    return (
      <button
        onClick={startCamera}
        className="flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-3 text-sm font-medium text-foreground shadow-sm transition-all hover:border-primary/40 hover:shadow-md"
      >
        <Camera className="h-4 w-4 text-primary" />
        Use Camera
      </button>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-2xl border-2 border-primary bg-card shadow-xl">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="w-full rounded-t-xl"
      />
      <canvas ref={canvasRef} className="hidden" />

      {/* Controls */}
      <div className="flex items-center justify-center gap-4 bg-card p-4">
        <button
          onClick={stopCamera}
          className="rounded-full bg-muted p-3 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
          aria-label="Close camera"
        >
          <X className="h-5 w-5" />
        </button>
        <button
          onClick={capturePhoto}
          className="rounded-full bg-primary p-4 text-primary-foreground shadow-lg shadow-primary/30 transition-all hover:scale-105 hover:shadow-xl"
          aria-label="Take photo"
        >
          <Camera className="h-6 w-6" />
        </button>
        <div className="w-11" /> {/* Spacer for centering */}
      </div>
    </div>
  );
}
