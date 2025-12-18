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
import { type Option } from "@/types/data-table";

export const createSuperAdminSchema = z.object({
  full_name: z.string(),
  email: z.string().email(),
  phone: z
    .string()
    .min(8, "Phone number must be at least 8 characters")
    .max(15, "Phone number must be at most 15 characters"),
  is_active: z.boolean(),
});

export type CreateSuperAdminSchema = z.infer<typeof createSuperAdminSchema>;

interface CreateSuperAdminDialogProps {
  countryOptions?: Option[];
}

const CreateSuperAdminDialog = ({
  countryOptions = [],
}: CreateSuperAdminDialogProps) => {
  const [open, setOpen] = React.useState(false);
  const [isPending, startTransition] = React.useTransition();

  const form = useForm<CreateSuperAdminSchema>({
    resolver: zodResolver(createSuperAdminSchema),
    defaultValues: {
      full_name: "",
      email: "",
      phone: "",
      is_active: true,
    },
  });

  function onSubmit(input: CreateSuperAdminSchema) {
    startTransition(async () => {
      const { success, message } = await createSuperAdmin(input);

      if (!success) {
        toast.error(message ?? "Failed to create super admin");
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
          Add
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Create Super Admin</DialogTitle>
          <DialogDescription>
            Fill in the details below to create a new super admin
          </DialogDescription>
        </DialogHeader>
        <SuperAdminForm
          form={form}
          onSubmit={onSubmit}
          countryOptions={countryOptions}
        >
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
