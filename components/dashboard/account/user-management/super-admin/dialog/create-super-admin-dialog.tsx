"use client";

import { createSuperAdmin } from "@/app/(dashboard)/account/user-management/super-admin/actions";
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
import { SuperAdminForm } from "../form/super-admin-form";

export const createSuperAdminSchema = z.object({
  name: z.string(),
  email: z.string().email(),
  phone: z.string(),
  status: z.boolean(),
});

export type CreateSuperAdminSchema = z.infer<typeof createSuperAdminSchema>;

const CreateSuperAdminDialog = () => {
  const [open, setOpen] = React.useState(false);
  const [isPending, startTransition] = React.useTransition();

  const form = useForm<CreateSuperAdminSchema>({
    resolver: zodResolver(createSuperAdminSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      status: true,
    },
  });

  function onSubmit(input: CreateSuperAdminSchema) {
    startTransition(async () => {
      const { success, message } = await createSuperAdmin(input);
      if (!success) {
        toast.error("Failed to create super admin");
        return;
      }
      form.reset();
      setOpen(false);
      toast.success(message || "Super Admin created");
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus />
          New Super Admin
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Create Super Admin</DialogTitle>
          <DialogDescription>
            Fill in the details below to create a new super admin
          </DialogDescription>
        </DialogHeader>
        <SuperAdminForm form={form} onSubmit={onSubmit}>
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
        </SuperAdminForm>
      </DialogContent>
    </Dialog>
  );
};

export default CreateSuperAdminDialog;
