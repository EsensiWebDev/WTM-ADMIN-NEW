"use client";

import { deletePromo } from "@/app/(dashboard)/promo/actions";
import { Promo } from "@/app/(dashboard)/promo/types";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader } from "lucide-react";
import React from "react";
import { toast } from "sonner";

interface DeletePromoDialogProps {
  promos: Promo[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  showTrigger?: boolean;
}

const DeletePromoDialog = ({
  promos,
  open,
  onOpenChange,
  onSuccess,
  showTrigger = true,
}: DeletePromoDialogProps) => {
  const [isPending, startTransition] = React.useTransition();

  const handleDelete = () => {
    if (promos.length === 0) return;

    startTransition(async () => {
      const deletePromises = promos.map((promo) => deletePromo(promo.id));
      const results = await Promise.all(deletePromises);

      const hasError = results.some((result) => !result.success);

      if (hasError) {
        toast.error("Failed to delete some promos");
        return;
      }

      toast.success(
        promos.length === 1
          ? "Promo deleted successfully"
          : `${promos.length} promos deleted successfully`
      );

      onOpenChange(false);
      onSuccess?.();
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Delete Promo{promos.length > 1 ? "s" : ""}
          </DialogTitle>
          <DialogDescription>
            Are you sure you want to delete{" "}
            {promos.length === 1 ? (
              <>
                <strong>{promos[0]?.name}</strong>?
              </>
            ) : (
              <>
                <strong>{promos.length} promos</strong>?
              </>
            )}{" "}
            This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 pt-2 sm:space-x-0">
          <DialogClose asChild>
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </DialogClose>
          <Button
            variant="destructive"
            disabled={isPending}
            onClick={handleDelete}
          >
            {isPending && <Loader className="animate-spin" />}
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeletePromoDialog;
