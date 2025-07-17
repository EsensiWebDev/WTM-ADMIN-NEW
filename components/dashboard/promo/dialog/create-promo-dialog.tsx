"use client";

import { createPromo } from "@/app/(dashboard)/promo/actions";
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
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader, Plus } from "lucide-react";
import React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";
import { PromoForm } from "../form/promo-form";

export const createPromoSchema = z.object({
  code: z.string().min(1, "Promo code is required"),
  name: z.string().min(1, "Promo name is required"),
  duration: z.number().min(1, "Duration must be at least 1 day"),
  start_date: z.string().min(1, "Start date is required"),
  end_date: z.string().min(1, "End date is required"),
  status: z.boolean(),
});

export type CreatePromoSchema = z.infer<typeof createPromoSchema>;

const CreatePromoDialog = () => {
  const [open, setOpen] = React.useState(false);
  const [isPending, startTransition] = React.useTransition();

  const form = useForm<CreatePromoSchema>({
    resolver: zodResolver(createPromoSchema),
    defaultValues: {
      code: "",
      name: "",
      duration: 1,
      start_date: "",
      end_date: "",
      status: true,
    },
  });

  function onSubmit(input: CreatePromoSchema) {
    startTransition(async () => {
      const { success } = await createPromo(input);

      if (!success) {
        toast.error("Failed to create promo");
        return;
      }

      form.reset();
      setOpen(false);
      toast.success("Promo created successfully");
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus />
          Create Promo
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Create Promo</DialogTitle>
          <DialogDescription>
            Fill in the details below to create a new promo
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
              Create
            </Button>
          </DialogFooter>
        </PromoForm>
      </DialogContent>
    </Dialog>
  );
};

export default CreatePromoDialog;
