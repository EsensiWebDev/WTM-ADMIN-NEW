"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X } from "lucide-react";
import React, { useState, useEffect } from "react";

interface FileInputPreviewProps {
  accept?: string;
  onChange: (file: File | undefined) => void;
  onBlur: () => void;
  value?: File;
  ref: React.Ref<HTMLInputElement>;
  name: string;
  placeholder?: string;
  initialPreview?: string; // URL of existing image
}

export const FileInputPreview = React.forwardRef<
  HTMLInputElement,
  FileInputPreviewProps
>(
  (
    {
      accept = "image/*",
      onChange,
      onBlur,
      value,
      name,
      placeholder = "Choose file",
      initialPreview,
    },
    ref
  ) => {
    const [preview, setPreview] = useState<string | null>(
      initialPreview || null
    );
    const [fileName, setFileName] = useState<string | null>(null);
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    useEffect(() => {
      if (value instanceof File) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setPreview(e.target?.result as string);
          setFileName(value.name);
        };
        reader.readAsDataURL(value);
      } else if (!value && !initialPreview) {
        // Only reset if there's no value and no initialPreview
        setPreview(null);
        setFileName(null);
      }
    }, [value, initialPreview]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      onChange(file || undefined);
    };

    const handleRemove = (e: React.MouseEvent) => {
      e.preventDefault();
      onChange(undefined);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      setPreview(null);
      setFileName(null);
    };

    return (
      <div className="flex flex-col gap-3">
        <Input
          ref={fileInputRef}
          type="file"
          accept={accept}
          name={name}
          onBlur={onBlur}
          onChange={handleFileChange}
          placeholder={placeholder}
        />
        {preview && (
          <div className="flex flex-col gap-3 border rounded-lg p-3">
            <div className="relative">
              <img
                src={preview}
                alt="Preview"
                className="max-h-48 w-full object-contain rounded"
              />
            </div>
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span className="truncate">{fileName}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRemove}
                className="h-6 w-6 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    );
  }
);

FileInputPreview.displayName = "FileInputPreview";
