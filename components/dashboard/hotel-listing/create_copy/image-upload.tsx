"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Image as ImageIcon, Loader2, Star, Upload, X } from "lucide-react";
import React, { useCallback, useRef, useState } from "react";

export interface ImageFile {
  id: string;
  file?: File; // Optional for existing images
  preview: string;
  isMain: boolean;
  isExisting?: boolean; // Flag to indicate if this is an existing image
}

interface ImageUploadProps {
  onImagesChange: (images: ImageFile[]) => void;
  maxImages?: number;
  acceptedTypes?: string[];
  maxSizeMB?: number;
  initialImages?: string[]; // URLs of existing images for edit mode
}

export function ImageUpload({
  onImagesChange,
  maxImages = 10,
  acceptedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"],
  maxSizeMB = 5,
  initialImages = [],
}: ImageUploadProps) {
  const [images, setImages] = useState<ImageFile[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [error, setError] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize images with existing images when component mounts
  React.useEffect(() => {
    if (initialImages.length > 0 && images.length === 0) {
      const existingImages: ImageFile[] = initialImages.map((url, index) => ({
        id: `existing-${index}`,
        preview: url,
        isMain: index === 0, // First image is main by default
        isExisting: true,
      }));
      setImages(existingImages);
      onImagesChange(existingImages);
    }
  }, [initialImages, images.length, onImagesChange]);

  const validateFile = (file: File): string | null => {
    if (!acceptedTypes.includes(file.type)) {
      return `File type ${
        file.type
      } is not supported. Please use: ${acceptedTypes.join(", ")}`;
    }

    if (file.size > maxSizeMB * 1024 * 1024) {
      return `File size must be less than ${maxSizeMB}MB`;
    }

    return null;
  };

  const addImages = useCallback(
    async (files: FileList | File[]) => {
      const newImages: ImageFile[] = [];
      const fileArray = Array.from(files);

      if (images.length + fileArray.length > maxImages) {
        setError(`Maximum ${maxImages} images allowed`);
        return;
      }

      setIsProcessing(true);
      setError("");

      try {
        for (const file of fileArray) {
          const validationError = validateFile(file);
          if (validationError) {
            setError(validationError);
            continue;
          }

          const id = Math.random().toString(36).substr(2, 9);
          const preview = URL.createObjectURL(file);
          const isMain =
            images.length === 0 && !images.some((img) => img.isMain); // First image becomes main by default if no main exists

          newImages.push({ id, file, preview, isMain, isExisting: false });
        }

        if (newImages.length > 0) {
          const updatedImages = [...images, ...newImages];
          setImages(updatedImages);
          onImagesChange(updatedImages);
        }
      } catch (error) {
        setError("Error processing images. Please try again.");
        console.error("Error processing images:", error);
      } finally {
        setIsProcessing(false);
      }
    },
    [images, maxImages, acceptedTypes, maxSizeMB, onImagesChange]
  );

  const removeImage = useCallback(
    (id: string) => {
      const imageToRemove = images.find((img) => img.id === id);
      if (imageToRemove && imageToRemove.file) {
        // Only clean up object URL for newly uploaded files
        URL.revokeObjectURL(imageToRemove.preview);
      }

      const updatedImages = images.filter((img) => img.id !== id);
      const wasMain = imageToRemove?.isMain;

      // If main image was removed, make the first remaining image the main
      if (wasMain && updatedImages.length > 0) {
        updatedImages[0].isMain = true;
      }

      setImages(updatedImages);
      onImagesChange(updatedImages);
    },
    [images, onImagesChange]
  );

  const setMainImage = useCallback(
    (id: string) => {
      const updatedImages = images.map((img) => ({
        ...img,
        isMain: img.id === id,
      }));

      setImages(updatedImages);
      onImagesChange(updatedImages);
    },
    [images, onImagesChange]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);

      const files = e.dataTransfer.files;
      if (files.length > 0) {
        addImages(files);
      }
    },
    [addImages]
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        addImages(files);
      }
      // Reset input value to allow selecting the same file again
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    },
    [addImages]
  );

  const handleClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  // Cleanup object URLs when component unmounts
  const cleanup = useCallback(() => {
    images.forEach((img) => {
      // Only cleanup object URLs for newly uploaded files
      if (img.file) {
        URL.revokeObjectURL(img.preview);
      }
    });
  }, [images]);

  // Cleanup on unmount
  React.useEffect(() => {
    return () => cleanup();
  }, [cleanup]);

  return (
    <div className="space-y-4">
      {/* Hidden file input - always available for Add More button */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept={acceptedTypes.join(",")}
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Upload Area - Only show when no images or when adding more */}
      {images.length === 0 && (
        <div
          className={cn(
            "relative border-2 border-dashed rounded-lg p-8 text-center transition-colors min-h-[200px]",
            isDragOver
              ? "border-primary bg-primary/5"
              : "border-muted-foreground/25 hover:border-muted-foreground/50"
          )}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="flex flex-col items-center justify-center space-y-3">
            <div className="rounded-full bg-muted p-3">
              {isProcessing ? (
                <Loader2 className="h-6 w-6 text-muted-foreground animate-spin" />
              ) : (
                <ImageIcon className="h-6 w-6 text-muted-foreground" />
              )}
            </div>

            <div className="space-y-2">
              <p className="text-lg font-medium">Upload Hotel Images</p>
              <p className="text-sm text-muted-foreground">
                {isProcessing ? (
                  "Processing images..."
                ) : (
                  <>
                    Drag and drop images here, or{" "}
                    <button
                      type="button"
                      onClick={handleClick}
                      className="text-primary hover:underline font-medium"
                      disabled={isProcessing}
                    >
                      browse files
                    </button>
                  </>
                )}
              </p>
              <p className="text-xs text-muted-foreground">
                Supported formats:{" "}
                {acceptedTypes.map((type) => type.split("/")[1]).join(", ")} •
                Max size: {maxSizeMB}MB • Max images: {maxImages}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md flex items-center gap-2">
          <X className="h-4 w-4" />
          {error}
        </div>
      )}

      {/* Image Preview Grid */}
      {images.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">
              Uploaded Images ({images.length}/{maxImages})
            </h3>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleClick}
                disabled={images.length >= maxImages || isProcessing}
              >
                <Upload className="h-4 w-4" />
                Add More
              </Button>
              {images.length > 0 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setImages([]);
                    onImagesChange([]);
                  }}
                  className="text-muted-foreground hover:text-foreground"
                >
                  Clear All
                </Button>
              )}
            </div>
          </div>

          <div
            className={cn(
              "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 rounded-lg transition-all",
              isDragOver &&
                "bg-primary/5 border-2 border-dashed border-primary p-4"
            )}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            {images.map((image) => (
              <div
                key={image.id}
                className={cn(
                  "group relative aspect-square rounded-lg overflow-hidden border-2 transition-all",
                  image.isMain
                    ? "border-primary ring-2 ring-primary/20"
                    : "border-border hover:border-primary/50"
                )}
              >
                {/* Image Preview */}
                <img
                  src={image.preview}
                  alt="Hotel preview"
                  className="w-full h-full object-cover"
                />

                {/* Existing Image Badge */}
                {image.isExisting && (
                  <div className="absolute top-2 right-2 bg-blue-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                    Existing
                  </div>
                )}

                {/* Overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />

                {/* Main Image Badge */}
                {image.isMain && (
                  <div className="absolute top-2 left-2 bg-primary text-primary-foreground px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                    <Star className="h-3 w-3" />
                    Main
                  </div>
                )}

                {/* Actions */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="flex gap-2">
                    {!image.isMain && (
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => setMainImage(image.id)}
                        className="bg-primary/90 hover:bg-primary text-primary-foreground"
                      >
                        <Star className="h-4 w-4 mr-1" />
                        Set Main
                      </Button>
                    )}
                    <Button
                      type="button"
                      size="sm"
                      variant="destructive"
                      onClick={() => removeImage(image.id)}
                      className="bg-destructive/90 hover:bg-destructive"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Instructions */}
          <div className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-md">
            <p>• The first image will be set as the main image by default</p>
            <p>• Click on any image to set it as the main image</p>
            <p>• Main image will be displayed prominently in hotel listings</p>
            <p>
              • You can still drag and drop additional images onto the grid
              above
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
