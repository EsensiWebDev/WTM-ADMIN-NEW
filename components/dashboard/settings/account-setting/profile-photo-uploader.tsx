"use client";

import { updateAccountProfilePhoto } from "@/app/(dashboard)/settings/account-setting/actions";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { Loader2 } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import * as React from "react";
import { toast } from "sonner";

type ProfilePhotoUploaderProps = {
  photoUrl?: string | null;
  fullName?: string | null;
};

const MAX_FILE_SIZE = 1 * 1024 * 1024; // 1MB

export const ProfilePhotoUploader: React.FC<ProfilePhotoUploaderProps> = ({
  photoUrl,
  fullName,
}) => {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
  const [previewDataUrl, setPreviewDataUrl] = React.useState<string | null>(
    null
  );
  const [displayPhotoUrl, setDisplayPhotoUrl] = React.useState<
    string | null | undefined
  >(photoUrl);
  const [isPending, startTransition] = React.useTransition();
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  React.useEffect(() => {
    setDisplayPhotoUrl(photoUrl);
  }, [photoUrl]);

  const initials = React.useMemo(() => {
    if (!fullName) {
      return "CN";
    }
    const parts = fullName.trim().split(/\s+/);
    if (parts.length === 0) {
      return "CN";
    }
    if (parts.length === 1) {
      return parts[0]!.slice(0, 2).toUpperCase();
    }
    const first = parts[0]?.[0] ?? "";
    const last = parts[parts.length - 1]?.[0] ?? "";
    return `${first}${last}`.toUpperCase();
  }, [fullName]);

  const resetSelection = React.useCallback(() => {
    setSelectedFile(null);
    setPreviewDataUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, []);

  const handleOpenChange = React.useCallback(
    (nextOpen: boolean) => {
      setOpen(nextOpen);
      if (!nextOpen) {
        resetSelection();
      }
    },
    [resetSelection]
  );

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file.");
      resetSelection();
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      toast.error("File size exceeds 1MB. Please choose a smaller image.");
      resetSelection();
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      const result = typeof reader.result === "string" ? reader.result : null;
      setPreviewDataUrl(result);
      setSelectedFile(file);
    };

    reader.onerror = () => {
      toast.error("Failed to read the selected file. Please try again.");
      resetSelection();
    };

    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    if (!selectedFile) {
      toast.error("Please select an image to upload.");
      return;
    }

    startTransition(async () => {
      const formData = new FormData();
      formData.append("photo_profile", selectedFile);

      const { success, message } = await updateAccountProfilePhoto(formData);

      if (!success) {
        toast.error(message ?? "Failed to update profile photo.");
        return;
      }

      toast.success(message ?? "Profile photo updated successfully.");
      if (previewDataUrl) {
        setDisplayPhotoUrl(previewDataUrl);
      }
      setOpen(false);
      resetSelection();
      router.refresh();
    });
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <div className="relative">
        <Avatar className="h-36 w-36 rounded-lg">
          <AvatarImage src={displayPhotoUrl ?? ""} alt="Profile" />
          <AvatarFallback className="rounded-lg text-lg">
            {initials}
          </AvatarFallback>
        </Avatar>
        <DialogTrigger asChild>
          <Button
            size="icon"
            className="absolute -bottom-4 -right-4 rounded-full bg-[#2d3e3f] text-white hover:bg-[#223132]"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                stroke="#fff"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M16.474 5.341a2.5 2.5 0 1 1 3.536 3.535M3 17.25V21h3.75l10.607-10.607a2.5 2.5 0 0 0-3.535-3.535L3 17.25Z"
              />
            </svg>
          </Button>
        </DialogTrigger>
      </div>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Update profile photo</DialogTitle>
          <DialogDescription>
            Choose a JPG, PNG, or WEBP image that is no larger than 1MB.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-2">
          <div className="flex justify-center">
            <div className="relative h-40 w-40 overflow-hidden rounded-lg border bg-muted">
              {previewDataUrl || displayPhotoUrl ? (
                <Image
                  src={(previewDataUrl ?? displayPhotoUrl) as string}
                  alt="Selected profile preview"
                  fill
                  sizes="160px"
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-sm text-muted-foreground">
                  No image selected
                </div>
              )}
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="profile-photo-input">Upload image</Label>
            <Input
              ref={fileInputRef}
              id="profile-photo-input"
              type="file"
              accept="image/png,image/jpeg,image/jpg,image/webp"
              onChange={handleFileChange}
            />
            <p className="text-xs text-muted-foreground">
              Maximum size 1MB. Accepted formats: JPG, PNG, WEBP.
            </p>
          </div>
        </div>
        <DialogFooter className="gap-2 sm:space-x-0">
          <DialogClose asChild>
            <Button
              type="button"
              variant="outline"
              disabled={isPending}
              onClick={resetSelection}
            >
              Cancel
            </Button>
          </DialogClose>
          <Button
            type="button"
            onClick={handleSave}
            disabled={isPending || !selectedFile}
          >
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
