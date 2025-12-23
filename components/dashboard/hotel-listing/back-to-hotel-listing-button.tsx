"use client";

import { Button } from "@/components/ui/button";
import { ConfirmationDialog } from "@/components/confirmation-dialog";
import { ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useState, useEffect } from "react";

const BackToHotelListingButton = () => {
  const router = useRouter();
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<(() => void) | null>(null);

  const checkUnsavedChanges = useCallback(() => {
    if (typeof window === "undefined") return false;
    const hasUnsavedRooms = (window as any).__hotelRoomsDirty === true;
    const hasUnsavedHotel = (window as any).__hotelHotelDirty === true;
    return hasUnsavedRooms || hasUnsavedHotel;
  }, []);

  const handleClick = useCallback(() => {
    if (checkUnsavedChanges()) {
      setPendingNavigation(() => () => router.push("/hotel-listing"));
      setShowConfirmDialog(true);
    } else {
      router.push("/hotel-listing");
    }
  }, [router, checkUnsavedChanges]);

  const handleConfirm = useCallback(() => {
    setShowConfirmDialog(false);
    if (pendingNavigation) {
      pendingNavigation();
      setPendingNavigation(null);
    }
  }, [pendingNavigation]);

  const handleCancel = useCallback(() => {
    setShowConfirmDialog(false);
    setPendingNavigation(null);
  }, []);

  // Intercept browser back button
  useEffect(() => {
    if (typeof window === "undefined") return;

    let isNavigatingBack = false;
    let hasPushedState = false;

    // Push a state when component mounts to enable popstate detection
    window.history.pushState(null, "", window.location.href);
    hasPushedState = true;

    const handlePopState = () => {
      // If we're already navigating back (confirmed), allow it
      if (isNavigatingBack) {
        return;
      }

      // If there are unsaved changes, intercept the navigation
      if (checkUnsavedChanges()) {
        // Push current state back to prevent navigation
        window.history.pushState(null, "", window.location.href);
        
        setPendingNavigation(() => () => {
          isNavigatingBack = true;
          // Clear the flags before navigating
          if (typeof window !== "undefined") {
            (window as any).__hotelRoomsDirty = false;
            (window as any).__hotelHotelDirty = false;
          }
          // Navigate back using Next.js router
          router.back();
        });
        
        setShowConfirmDialog(true);
      } else {
        // No unsaved changes, allow navigation
        isNavigatingBack = true;
      }
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
      // Clean up: if we pushed a state and component unmounts, we might need to clean it up
      // But be careful not to interfere with normal navigation
    };
  }, [router, checkUnsavedChanges]);

  // Handle beforeunload for page refresh/close
  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (checkUnsavedChanges()) {
        event.preventDefault();
        // Modern browsers ignore custom messages, but we still need to call preventDefault
        event.returnValue = "";
        return "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [checkUnsavedChanges]);

  return (
    <>
      <Button variant={"ghost"} type="button" onClick={handleClick}>
        <ChevronLeft />
        Back
      </Button>
      <ConfirmationDialog
        open={showConfirmDialog}
        onOpenChange={(open) => {
          if (!open) {
            handleCancel();
          }
        }}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
        isLoading={false}
        title="Unsaved Changes"
        description="You have unsaved changes. Are you sure you want to leave this page? Your changes will be lost."
        confirmButtonText="Leave Page"
        confirmButtonVariant="destructive"
      />
    </>
  );
};

export default BackToHotelListingButton;


