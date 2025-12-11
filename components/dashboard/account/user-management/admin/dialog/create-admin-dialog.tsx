"use client";

import { createAdmin } from "@/app/(dashboard)/account/user-management/admin/actions";
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
import { AdminForm } from "../form/admin-form";
import { type Option } from "@/types/data-table";

export const createAdminSchema = z.object({
  full_name: z.string(),
  email: z.string().email(),
  phone: z.string(),
  is_active: z.boolean(),
});

export type CreateAdminSchema = z.infer<typeof createAdminSchema>;

interface CreateAdminDialogProps {
  countryOptions?: Option[];
}

const CreateAdminDialog = ({ countryOptions = [] }: CreateAdminDialogProps) => {
  const [open, setOpen] = React.useState(false);
  const [isPending, startTransition] = React.useTransition();

  const form = useForm<CreateAdminSchema>({
    resolver: zodResolver(createAdminSchema),
    defaultValues: {
      full_name: "",
      email: "",
      phone: "",
      is_active: true,
    },
  });

  function onSubmit(input: CreateAdminSchema) {
    startTransition(async () => {
      const { success, message } = await createAdmin(input);
      if (!success) {
        toast.error(message ?? "Failed to create admin");
        return;
      }
      form.reset();
      setOpen(false);
      toast.success(message || "Admin created");
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
          <DialogTitle>Create Admin</DialogTitle>
          <DialogDescription>
            Fill in the details below to create a new admin
          </DialogDescription>
        </DialogHeader>
        <AdminForm
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
        </AdminForm>
      </DialogContent>
    </Dialog>
  );
};

export default CreateAdminDialog;
