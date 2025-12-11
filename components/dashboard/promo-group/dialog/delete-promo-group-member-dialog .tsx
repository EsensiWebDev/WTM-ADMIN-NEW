"use client";

import { removePromoGroupMembers } from "@/app/(dashboard)/promo-group/actions";
import { PromoGroupMembers } from "@/app/(dashboard)/promo-group/types";
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

interface DeletePromoGroupMemberDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  member: PromoGroupMembers | null;
  showTrigger?: boolean;
  onSuccess?: () => void;
  promoGroupId: string;
}

const DeletePromoGroupMemberDialog = ({
  open,
  onOpenChange,
  member,
  showTrigger = true,
  onSuccess,
  promoGroupId,
}: DeletePromoGroupMemberDialogProps) => {
  const [isPending, startTransition] = React.useTransition();

  if (!!!member) return;

  const handleDelete = () => {
    startTransition(async () => {
      const { success, message } = await removePromoGroupMembers({
        promo_group_id: Number(promoGroupId),
        member_id: Number(member.id),
      });
      if (!success) {
        toast.error(message || "Failed to remove member");
        return;
      }

      toast.success(message || "Member removed successfully");

      onOpenChange(false);
      onSuccess?.();
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Remove Promo Group Member
          </DialogTitle>
          <DialogDescription>
            Are you sure you want to remove <strong>{member?.name}</strong>
            <br />
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

export default DeletePromoGroupMemberDialog;
