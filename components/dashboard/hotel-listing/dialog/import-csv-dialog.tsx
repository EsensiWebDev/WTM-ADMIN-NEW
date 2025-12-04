"use client";

import { importHotelsFromCsv } from "@/app/(dashboard)/hotel-listing/actions";
import { downloadCsvTemplate } from "@/app/(dashboard)/hotel-listing/fetch";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { IconCloudDownload, IconCloudUpload } from "@tabler/icons-react";
import { FileText, FileUp, Upload } from "lucide-react";
import React from "react";
import { toast } from "sonner";

const ImportCsvDialog = () => {
  const [open, setOpen] = React.useState(false);
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
  const [isPending, startTransition] = React.useTransition();
  const [isDragOver, setIsDragOver] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Prevent default drag behaviors on the document
  React.useEffect(() => {
    const preventDefaults = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
    };

    const handleDragEnter = (e: DragEvent) => {
      preventDefaults(e);
    };

    const handleDragOver = (e: DragEvent) => {
      preventDefaults(e);
    };

    const handleDrop = (e: DragEvent) => {
      preventDefaults(e);
    };

    document.addEventListener("dragenter", handleDragEnter);
    document.addEventListener("dragover", handleDragOver);
    document.addEventListener("drop", handleDrop);

    return () => {
      document.removeEventListener("dragenter", handleDragEnter);
      document.removeEventListener("dragover", handleDragOver);
      document.removeEventListener("drop", handleDrop);
    };
  }, []);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      validateAndSetFile(file);
    }
  };

  const validateAndSetFile = (file: File) => {
    if (file.type !== "text/csv" && !file.name.endsWith(".csv")) {
      toast.error("Please select a valid CSV file");
      return;
    }

    // Check file size (limit to 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size must be less than 10MB");
      return;
    }

    setSelectedFile(file);
    toast.success(`File "${file.name}" selected successfully`);
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragOver(false);

    const files = Array.from(event.dataTransfer.files);
    if (files.length === 0) {
      toast.error("No files detected");
      return;
    }

    if (files.length > 1) {
      toast.error("Please select only one CSV file");
      return;
    }

    validateAndSetFile(files[0]);
  };

  const handleDropAreaClick = () => {
    fileInputRef.current?.click();
  };

  const handleImport = () => {
    if (!selectedFile) {
      toast.error("Please select a CSV file to import");
      return;
    }

    startTransition(async () => {
      try {
        // Call the server action with the file object
        const result = await importHotelsFromCsv(selectedFile);

        if (result.success) {
          toast.success(result.message);
        } else {
          toast.error(result.error || "Failed to import CSV file");
        }

        setSelectedFile(null);
        setOpen(false);

        // Reset file input
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      } catch (error) {
        console.error("Error importing CSV file:", error);
        toast.error("Failed to import CSV file");
      }
    });
  };

  const downloadTemplate = async () => {
    try {
      toast.info("Preparing template download...");

      const result = await downloadCsvTemplate();

      if (result.status !== 200 || !result.data) {
        toast.error(result.error || "Failed to download template");
        return;
      }

      // Create a blob from the response data
      const blob = new Blob([result.data], { type: "text/csv;charset=utf-8;" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "hotel_listing_template.csv";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast.success("Template downloaded successfully");
    } catch (error) {
      console.error("Error downloading template:", error);
      toast.error("Failed to download template");
    }
  };

  const resetDialog = () => {
    setSelectedFile(null);
    setIsDragOver(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(newOpen) => {
        setOpen(newOpen);
        if (!newOpen) {
          resetDialog();
        }
      }}
    >
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="border-primary">
          <IconCloudUpload />
          Import CSV
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Import Hotels from CSV</DialogTitle>
          <DialogDescription>
            Upload a CSV file to import multiple hotel listings at once
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Instructions Section */}
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium mb-2">Instructions</h4>
              <Alert className="bg-white pt-2">
                <AlertDescription className="text-sm">
                  <ul className="list-disc list-inside space-y-1 mt-2">
                    <li>
                      Column separator:
                      <TextExample>;</TextExample>
                    </li>
                    <li>
                      Facilities: comma-separated list (e.g.,
                      <TextExample>WiFi,Pool,Gym</TextExample>)
                    </li>
                    <li>
                      Nearby places: format
                      <TextExample>
                        PlaceName,Distance|PlaceName,Distance
                      </TextExample>
                      (e.g.,
                      <TextExample>
                        Mall Ambassador,0.5|Kuningan City,1.2
                      </TextExample>
                      )
                    </li>
                  </ul>
                </AlertDescription>
              </Alert>
            </div>

            {/* Template Download */}
            <div>
              <h4 className="text-sm font-medium mb-2">Download Template</h4>
              <Button onClick={downloadTemplate}>
                <IconCloudDownload className="h-4 w-4 mr-2" />
                Download CSV Template
              </Button>
            </div>
          </div>

          <Separator />

          {/* File Upload Section */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="csv-file" className="text-sm font-medium">
                Upload CSV File
              </Label>

              {/* Drag and Drop Area */}
              <div
                className={`mt-2 border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200 cursor-pointer ${
                  isDragOver
                    ? "border-primary bg-primary/5 scale-[1.02]"
                    : selectedFile
                    ? "border-green-500 bg-green-50 dark:bg-green-950/20"
                    : "border-gray-300 hover:border-gray-400 dark:border-gray-600 dark:hover:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={handleDropAreaClick}
              >
                <div className="flex flex-col items-center justify-center space-y-3">
                  {selectedFile ? (
                    <>
                      <div className="flex items-center justify-center w-16 h-16 bg-green-100 dark:bg-green-950/30 rounded-full">
                        <FileText className="h-8 w-8 text-green-600" />
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-medium text-green-700 dark:text-green-400">
                          File Selected
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {selectedFile.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {(selectedFile.size / 1024).toFixed(1)} KB
                        </p>
                      </div>
                      <p className="text-xs text-gray-500">
                        Click to choose a different file
                      </p>
                    </>
                  ) : (
                    <>
                      <div
                        className={`flex items-center justify-center w-16 h-16 rounded-full transition-colors ${
                          isDragOver
                            ? "bg-primary/10 text-primary"
                            : "bg-gray-100 dark:bg-gray-800 text-gray-400"
                        }`}
                      >
                        <Upload className="h-8 w-8" />
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-medium">
                          {isDragOver
                            ? "Drop your CSV file here"
                            : "Drag and drop your CSV file here"}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          or click to browse files
                        </p>
                      </div>
                      <div className="flex items-center space-x-4 text-xs text-gray-400">
                        <span>CSV files only</span>
                        <span>•</span>
                        <span>Max 10MB</span>
                      </div>
                    </>
                  )}
                </div>

                {/* Hidden file input */}
                <Input
                  ref={fileInputRef}
                  id="csv-file"
                  type="file"
                  accept=".csv"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 pt-4 sm:space-x-0">
          <DialogClose asChild>
            <Button type="button" className="bg-white" variant="outline">
              Cancel
            </Button>
          </DialogClose>
          <Button onClick={handleImport} disabled={!selectedFile || isPending}>
            {isPending ? (
              <>
                <FileUp className="h-4 w-4 animate-pulse" />
                Importing...
              </>
            ) : (
              <>
                <IconCloudUpload />
                Import CSV
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export const TextExample = ({ children }: { children: React.ReactNode }) => {
  return (
    <code className="text-xs bg-muted px-1 py-0.5 rounded">{children}</code>
  );
};

export default ImportCsvDialog;
