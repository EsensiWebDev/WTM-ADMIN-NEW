"use client";

import { editSuperAdmin } from "@/app/(dashboard)/account/user-management/super-admin/actions";
import { SuperAdmin } from "@/app/(dashboard)/account/user-management/super-admin/types";
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
import { SuperAdminForm } from "../form/super-admin-form";
import { type Option } from "@/types/data-table";

export const editSuperAdminSchema = z.object({
  full_name: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  is_active: z.boolean().optional(),
  username: z.string(),
});

export type EditSuperAdminSchema = z.infer<typeof editSuperAdminSchema>;

interface EditSuperAdminDialogProps
  extends React.ComponentPropsWithRef<typeof Dialog> {
  superAdmin: SuperAdmin | null;
  countryOptions?: Option[];
}

const EditSuperAdminDialog = ({
  superAdmin,
  countryOptions,
  ...props
}: EditSuperAdminDialogProps) => {
  const [isPending, startTransition] = React.useTransition();

  const form = useForm<EditSuperAdminSchema>({
    resolver: zodResolver(editSuperAdminSchema),
    defaultValues: {
      full_name: superAdmin?.name ?? "",
      email: superAdmin?.email,
      phone: superAdmin?.phone_number,
      username: superAdmin?.username || "",
      is_active: superAdmin?.status === "Active" ? true : false,
    },
  });

  function onSubmit(input: EditSuperAdminSchema) {
    startTransition(async () => {
      if (!superAdmin) return;
      const { success, message } = await editSuperAdmin({
        id: superAdmin.id,
        ...input,
      });
      if (!success) {
        toast.error(message ?? "Failed to edit super admin");
        return;
      }
      form.reset(input);
      props.onOpenChange?.(false);
      toast.success(message || "Super Admin edited");
    });
  }

  return (
    <Dialog {...props}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Edit Super Admin</DialogTitle>
          <DialogDescription>
            Edit details below and save the changes
          </DialogDescription>
        </DialogHeader>
        <SuperAdminForm<EditSuperAdminSchema>
          form={form}
          onSubmit={onSubmit}
          isEdit={true}
          countryOptions={countryOptions}
        >
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
        </SuperAdminForm>
      </DialogContent>
    </Dialog>
  );
};

export default EditSuperAdminDialog;
