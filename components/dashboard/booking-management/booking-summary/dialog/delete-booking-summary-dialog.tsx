"use client";

import type { Row } from "@tanstack/react-table";
import { Loader, Trash } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";

import { deleteBooking } from "@/app/(dashboard)/booking-management/booking-summary/actions";
import { BookingSummary } from "@/app/(dashboard)/booking-management/booking-summary/types";
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
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { useMediaQuery } from "@/hooks/use-media-query";

interface DeleteBookingSummaryDialogProps
  extends React.ComponentPropsWithoutRef<typeof Dialog> {
  bookingSummary: Row<BookingSummary>["original"][];
  showTrigger?: boolean;
  onSuccess?: () => void;
}

export function DeleteBookingSummaryDialog({
  bookingSummary,
  showTrigger = true,
  onSuccess,
  ...props
}: DeleteBookingSummaryDialogProps) {
  const [isDeletePending, startDeleteTransition] = React.useTransition();
  const isDesktop = useMediaQuery("(min-width: 640px)");

  function onDelete() {
    startDeleteTransition(async () => {
      const bookingId = bookingSummary[0].booking_id;

      const { success, message } = await deleteBooking(String(bookingId));
      if (!success) {
        toast.error(message || "Failed to delete booking");
        return;
      }

      toast.success(message || "Deleted successfully");

      props.onOpenChange?.(false);
      onSuccess?.();
    });
  }

  if (isDesktop) {
    return (
      <Dialog {...props}>
        {showTrigger ? (
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <Trash className="mr-2 size-4" aria-hidden="true" />
              Delete ({bookingSummary.length})
            </Button>
          </DialogTrigger>
        ) : null}
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Are you absolutely sure?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete your{" "}
              <span className="font-medium">{bookingSummary.length}</span>
              {bookingSummary.length === 1 ? " booking" : " bookings"} from our
              servers.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:space-x-0">
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button
              aria-label="Delete selected rows"
              variant="destructive"
              onClick={onDelete}
              disabled={isDeletePending}
            >
              {isDeletePending && (
                <Loader
                  className="mr-2 size-4 animate-spin"
                  aria-hidden="true"
                />
              )}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer {...props}>
      {showTrigger ? (
        <DrawerTrigger asChild>
          <Button variant="outline" size="sm">
            <Trash className="mr-2 size-4" aria-hidden="true" />
            Delete ({bookingSummary.length})
          </Button>
        </DrawerTrigger>
      ) : null}
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Are you absolutely sure?</DrawerTitle>
          <DrawerDescription>
            This action cannot be undone. This will permanently delete your{" "}
            <span className="font-medium">{bookingSummary.length}</span>
            {bookingSummary.length === 1 ? " booking" : " bookings"} from our
            servers.
          </DrawerDescription>
        </DrawerHeader>
        <DrawerFooter className="gap-2 sm:space-x-0">
          <DrawerClose asChild>
            <Button variant="outline">Cancel</Button>
          </DrawerClose>
          <Button
            aria-label="Delete selected rows"
            variant="destructive"
            onClick={onDelete}
            disabled={isDeletePending}
          >
            {isDeletePending && (
              <Loader className="mr-2 size-4 animate-spin" aria-hidden="true" />
            )}
            Delete
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
