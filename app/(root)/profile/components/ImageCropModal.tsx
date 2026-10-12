"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { ZoomIn, ZoomOut, RotateCcw, Loader2 } from "lucide-react";

interface ImageCropModalProps {
  open: boolean;
  imageSrc: string | null;
  onClose: () => void;
  onConfirm: (croppedFile: File) => void;
  isUploading?: boolean;
}

const CROP_CONTAINER_SIZE = 300; // Display container size (300px)
const OUTPUT_SIZE = 400; // Output image size (400x400px)

export function ImageCropModal({
  open,
  imageSrc,
  onClose,
  onConfirm,
  isUploading = false,
}: ImageCropModalProps) {
  const [zoom, setZoom] = useState<number>(1);
  const [position, setPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const [imageSize, setImageSize] = useState<{ width: number; height: number }>({ width: 0, height: 0 });

  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  // Reset positioning whenever a new image is loaded
  useEffect(() => {
    if (open && imageSrc) {
      setZoom(1);
      setPosition({ x: 0, y: 0 });
    }
  }, [open, imageSrc]);

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const { naturalWidth, naturalHeight } = e.currentTarget;
    setImageSize({ width: naturalWidth, height: naturalHeight });
    setZoom(1);
    setPosition({ x: 0, y: 0 });
  };

  // Drag handling
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    dragStartRef.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    };
  };

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging) return;
      setPosition({
        x: e.clientX - dragStartRef.current.x,
        y: e.clientY - dragStartRef.current.y,
      });
    },
    [isDragging],
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Touch drag handling
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      setIsDragging(true);
      dragStartRef.current = {
        x: touch.clientX - position.x,
        y: touch.clientY - position.y,
      };
    }
  };

  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (!isDragging || e.touches.length !== 1) return;
      const touch = e.touches[0];
      setPosition({
        x: touch.clientX - dragStartRef.current.x,
        y: touch.clientY - dragStartRef.current.y,
      });
    },
    [isDragging],
  );

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
      window.addEventListener("touchmove", handleTouchMove);
      window.addEventListener("touchend", handleTouchEnd);
    }
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, [isDragging, handleMouseMove, handleMouseUp, handleTouchMove, handleTouchEnd]);

  // Wheel zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 0.08 : -0.08;
    setZoom((prev) => Math.min(3, Math.max(0.8, Number((prev + zoomFactor).toFixed(2)))));
  };

  const handleReset = () => {
    setZoom(1);
    setPosition({ x: 0, y: 0 });
  };

  // Crop & generate 400x400 output canvas
  const handleCropAndSave = () => {
    if (!imageRef.current || !imageSize.width || !imageSize.height) return;

    const img = imageRef.current;
    const canvas = document.createElement("canvas");
    canvas.width = OUTPUT_SIZE;
    canvas.height = OUTPUT_SIZE;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Calculate displayed dimensions inside the 300px container
    const aspect = imageSize.width / imageSize.height;
    let baseWidth = CROP_CONTAINER_SIZE;
    let baseHeight = CROP_CONTAINER_SIZE;

    if (aspect > 1) {
      baseWidth = CROP_CONTAINER_SIZE * aspect;
    } else {
      baseHeight = CROP_CONTAINER_SIZE / aspect;
    }

    const currentWidth = baseWidth * zoom;
    const currentHeight = baseHeight * zoom;

    // Scaling ratio from display viewport (300px) to output canvas (400px)
    const scaleRatio = OUTPUT_SIZE / CROP_CONTAINER_SIZE;

    // Center point coordinates in output canvas
    const destCenterX = OUTPUT_SIZE / 2;
    const destCenterY = OUTPUT_SIZE / 2;

    const destX = destCenterX - (currentWidth * scaleRatio) / 2 + position.x * scaleRatio;
    const destY = destCenterY - (currentHeight * scaleRatio) / 2 + position.y * scaleRatio;
    const destW = currentWidth * scaleRatio;
    const destH = currentHeight * scaleRatio;

    // Draw high quality image
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(img, destX, destY, destW, destH);

    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        const croppedFile = new File([blob], "avatar.webp", { type: "image/webp" });
        onConfirm(croppedFile);
      },
      "image/webp",
      0.95,
    );
  };

  return (
    <Dialog open={open} onOpenChange={(val) => !val && !isUploading && onClose()}>
      <DialogContent className="sm:max-w-[420px] p-6 gap-5">
        <DialogHeader>
          <DialogTitle className="text-base font-semibold">Adjust & Crop Profile Photo</DialogTitle>
          <p className="text-xs text-muted-foreground">
            Drag to center and use the slider to zoom. The photo will be resized to a crisp 400×400 avatar.
          </p>
        </DialogHeader>

        {/* Viewport Cropper Area */}
        <div className="flex flex-col items-center justify-center">
          <div
            ref={containerRef}
            onWheel={handleWheel}
            onMouseDown={handleMouseDown}
            onTouchStart={handleTouchStart}
            style={{ width: CROP_CONTAINER_SIZE, height: CROP_CONTAINER_SIZE }}
            className={`relative overflow-hidden rounded-xl bg-black select-none ${
              isDragging ? "cursor-grabbing" : "cursor-grab"
            }`}
          >
            {/* The Image being transformed */}
            {imageSrc && (
              <img
                ref={imageRef}
                src={imageSrc}
                alt="Crop preview"
                draggable={false}
                onLoad={handleImageLoad}
                style={{
                  transform: `translate(${position.x}px, ${position.y}px) scale(${zoom})`,
                  transformOrigin: "center center",
                  transition: isDragging ? "none" : "transform 0.05s ease-out",
                }}
                className="absolute inset-0 m-auto max-h-full max-w-full object-contain pointer-events-none"
              />
            )}

            {/* Circular Vignette Overlay */}
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              {/* Outer shadow to highlight circle */}
              <div
                style={{ width: CROP_CONTAINER_SIZE - 20, height: CROP_CONTAINER_SIZE - 20 }}
                className="rounded-full ring-[999px] ring-black/70 border-2 border-white/80 shadow-inner"
              />
            </div>
          </div>
        </div>

        {/* Zoom & Reset Controls */}
        <div className="space-y-3 pt-1">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setZoom((z) => Math.max(0.8, Number((z - 0.1).toFixed(2))))}
              className="p-1 rounded text-muted-foreground hover:text-foreground cursor-pointer"
              title="Zoom out"
            >
              <ZoomOut className="size-4" />
            </button>

            <Slider
              value={[zoom]}
              min={0.8}
              max={3}
              step={0.05}
              onValueChange={(vals) => setZoom(vals[0] ?? 1)}
              className="flex-1"
            />

            <button
              type="button"
              onClick={() => setZoom((z) => Math.min(3, Number((z + 0.1).toFixed(2))))}
              className="p-1 rounded text-muted-foreground hover:text-foreground cursor-pointer"
              title="Zoom in"
            >
              <ZoomIn className="size-4" />
            </button>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleReset}
              className="h-8 px-2 text-xs text-muted-foreground gap-1 cursor-pointer"
              title="Reset position"
            >
              <RotateCcw className="size-3" />
              Reset
            </Button>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isUploading}
            className="text-xs cursor-pointer"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleCropAndSave}
            disabled={isUploading}
            className="text-xs font-medium cursor-pointer"
          >
            {isUploading ? (
              <>
                <Loader2 className="size-3.5 animate-spin mr-1.5" />
                Uploading...
              </>
            ) : (
              "Apply & Upload"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

