"use client";

import { createSupport } from "@/app/(dashboard)/account/user-management/support/actions";
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
import { SupportForm } from "../form/support-form";

export const createSupportSchema = z.object({
  name: z.string(),
  email: z.string().email(),
  phone: z.string(),
  status: z.boolean(),
});

export type CreateSupportSchema = z.infer<typeof createSupportSchema>;

const CreateSupportDialog = () => {
  const [open, setOpen] = React.useState(false);
  const [isPending, startTransition] = React.useTransition();

  const form = useForm<CreateSupportSchema>({
    resolver: zodResolver(createSupportSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      status: true,
    },
  });

  function onSubmit(input: CreateSupportSchema) {
    startTransition(async () => {
      const { success, message } = await createSupport(input);
      if (!success) {
        toast.error("Failed to create support");
        return;
      }
      form.reset();
      setOpen(false);
      toast.success(message || "Support created");
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus />
          New Support
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Create Support</DialogTitle>
          <DialogDescription>
            Fill in the details below to create a new support
          </DialogDescription>
        </DialogHeader>
        <SupportForm form={form} onSubmit={onSubmit}>
          <DialogFooter className="gap-2 pt-2 sm:space-x-0">
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <Button disabled={isPending} type="submit">
              {isPending && <Loader className="animate-spin" />}
              Create
            </Button>
          </DialogFooter>
        </SupportForm>
      </DialogContent>
    </Dialog>
  );
};

export default CreateSupportDialog;
