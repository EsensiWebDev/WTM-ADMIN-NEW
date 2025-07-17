"use client";

import { deletePromoGroup } from "@/app/(dashboard)/promo-group/actions";
import { PromoGroup } from "@/app/(dashboard)/promo-group/types";
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

interface DeletePromoGroupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  promoGroups: PromoGroup[];
  showTrigger?: boolean;
  onSuccess?: () => void;
}

const DeletePromoGroupDialog = ({
  open,
  onOpenChange,
  promoGroups,
  showTrigger = true,
  onSuccess,
}: DeletePromoGroupDialogProps) => {
  const [isPending, startTransition] = React.useTransition();

  const handleDelete = () => {
    if (promoGroups.length === 0) return;

    startTransition(async () => {
      const deletePromises = promoGroups.map((promoGroup) =>
        deletePromoGroup(promoGroup.id)
      );
      const results = await Promise.all(deletePromises);

      const hasError = results.some((result) => !result.success);

      if (hasError) {
        toast.error("Failed to delete some promo groups");
        return;
      }

      toast.success(
        promoGroups.length === 1
          ? "Promo group deleted successfully"
          : `${promoGroups.length} promo groups deleted successfully`
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
            Delete Promo Group{promoGroups.length > 1 ? "s" : ""}
          </DialogTitle>
          <DialogDescription>
            Are you sure you want to delete{" "}
            {promoGroups.length === 1 ? (
              <>
                <strong>{promoGroups[0]?.name}</strong>?
              </>
            ) : (
              <>
                <strong>{promoGroups.length} promo groups</strong>?
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

export default DeletePromoGroupDialog;
