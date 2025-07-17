"use client";

import { editPromo } from "@/app/(dashboard)/promo/actions";
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
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader } from "lucide-react";
import React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";
import { PromoForm } from "../form/promo-form";

export const editPromoSchema = z.object({
  code: z.string().min(1, "Promo code is required"),
  name: z.string().min(1, "Promo name is required"),
  duration: z.number().min(1, "Duration must be at least 1 day"),
  start_date: z.string().min(1, "Start date is required"),
  end_date: z.string().min(1, "End date is required"),
  status: z.boolean(),
});

export type EditPromoSchema = z.infer<typeof editPromoSchema>;

interface EditPromoDialogProps {
  promo: Promo | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const EditPromoDialog = ({
  promo,
  open,
  onOpenChange,
}: EditPromoDialogProps) => {
  const [isPending, startTransition] = React.useTransition();

  const form = useForm<EditPromoSchema>({
    resolver: zodResolver(editPromoSchema),
    defaultValues: {
      code: promo?.code || "",
      name: promo?.name || "",
      duration: promo?.duration || 1,
      start_date: promo?.start_date || "",
      end_date: promo?.end_date || "",
      status: promo?.status || true,
    },
  });

  // Update form values when promo changes
  React.useEffect(() => {
    if (promo) {
      form.reset({
        code: promo.code,
        name: promo.name,
        duration: promo.duration,
        start_date: promo.start_date,
        end_date: promo.end_date,
        status: promo.status,
      });
    }
  }, [promo, form]);

  function onSubmit(input: EditPromoSchema) {
    if (!promo) return;

    startTransition(async () => {
      const { success } = await editPromo({ ...input, id: promo.id });

      if (!success) {
        toast.error("Failed to update promo");
        return;
      }

      form.reset();
      onOpenChange(false);
      toast.success("Promo updated successfully");
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Edit Promo</DialogTitle>
          <DialogDescription>
            Update the details below to modify the promo
          </DialogDescription>
        </DialogHeader>
        <PromoForm form={form} onSubmit={onSubmit}>
          <DialogFooter className="gap-2 pt-2 sm:space-x-0">
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <Button disabled={isPending}>
              {isPending && <Loader className="animate-spin" />}
              Update
            </Button>
          </DialogFooter>
        </PromoForm>
      </DialogContent>
    </Dialog>
  );
};

export default EditPromoDialog;
