"use client";

import { editPromoGroup } from "@/app/(dashboard)/promo-group/actions";
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
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader } from "lucide-react";
import React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";
import { PromoGroupForm } from "../form/promo-group-form";

export const editPromoGroupSchema = z.object({
  name: z.string().min(1, "Group name is required"),
  // Add members and promos fields as needed
});

export type EditPromoGroupSchemaType = z.infer<typeof editPromoGroupSchema>;

interface EditPromoGroupDialogProps {
  promoGroup: PromoGroup | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const EditPromoGroupDialog = ({
  promoGroup,
  open,
  onOpenChange,
}: EditPromoGroupDialogProps) => {
  const [isPending, startTransition] = React.useTransition();

  const form = useForm<EditPromoGroupSchemaType>({
    resolver: zodResolver(editPromoGroupSchema),
    defaultValues: promoGroup || {
      name: "",
      // Add default values for members and promos if needed
    },
  });

  // Update form values when promo changes
  React.useEffect(() => {
    if (promoGroup) {
      form.reset({
        name: promoGroup.name,
        // Add reset values for members and promos if needed
      });
    }
  }, [promoGroup, form]);

  function onSubmit(input: EditPromoGroupSchemaType) {
    startTransition(async () => {
      if (!promoGroup) return;

      const { success } = await editPromoGroup({
        id: promoGroup.id,
        members: [],
        promos: [],
        ...input,
      });

      if (!success) {
        toast.error("Failed to update promo group");
        return;
      }

      form.reset();
      onOpenChange(false);
      toast.success("Promo group updated successfully");
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Edit Promo Group</DialogTitle>
          <DialogDescription>
            Update the details below to modify the promo group
          </DialogDescription>
        </DialogHeader>
        <PromoGroupForm form={form} onSubmit={onSubmit}>
          <DialogFooter className="gap-2 pt-2 sm:space-x-0">
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <Button disabled={isPending}>
              {isPending && <Loader className="animate-spin" />}
              Save
            </Button>
          </DialogFooter>
        </PromoGroupForm>
      </DialogContent>
    </Dialog>
  );
};

export default EditPromoGroupDialog;
