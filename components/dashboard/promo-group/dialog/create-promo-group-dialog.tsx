"use client";

import { createPromoGroup } from "@/app/(dashboard)/promo-group/actions";
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
import { PromoGroupForm } from "../form/promo-group-form";

export const createPromoGroupSchema = z.object({
  name: z.string().min(1, "Group name is required"),
  // Add members and promos fields as needed
});

export type CreatePromoGroupSchemaType = z.infer<typeof createPromoGroupSchema>;

const CreatePromoGroupDialog = () => {
  const [open, setOpen] = React.useState(false);
  const [isPending, startTransition] = React.useTransition();

  const form = useForm<CreatePromoGroupSchemaType>({
    resolver: zodResolver(createPromoGroupSchema),
    defaultValues: {
      name: "",
      // Add default values for members and promos if needed
    },
  });

  function onSubmit(input: CreatePromoGroupSchemaType) {
    startTransition(async () => {
      const { success } = await createPromoGroup(input);

      if (!success) {
        toast.error("Failed to create promo group");
        return;
      }

      form.reset();
      setOpen(false);
      toast.success("Promo group created successfully");
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus />
          Add Promo Group
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Add Promo Group</DialogTitle>
          <DialogDescription>
            Fill in the details below to add a new promo group
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
              Add
            </Button>
          </DialogFooter>
        </PromoGroupForm>
      </DialogContent>
    </Dialog>
  );
};

export default CreatePromoGroupDialog;
