"use client";

import { editAdmin } from "@/app/(dashboard)/account/user-management/admin/actions";
import { Admin } from "@/app/(dashboard)/account/user-management/admin/types";
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
import { AdminForm } from "../form/admin-form";
import { type Option } from "@/types/data-table";

export const editAdminSchema = z.object({
  full_name: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  is_active: z.boolean().optional(),
  username: z.string(),
});

export type EditAdminSchema = z.infer<typeof editAdminSchema>;

interface EditAdminDialogProps
  extends React.ComponentPropsWithRef<typeof Dialog> {
  admin: Admin | null;
  countryOptions?: Option[];
}

const EditAdminDialog = ({
  admin,
  countryOptions = [],
  ...props
}: EditAdminDialogProps) => {
  const [isPending, startTransition] = React.useTransition();

  const form = useForm<EditAdminSchema>({
    resolver: zodResolver(editAdminSchema),
    defaultValues: {
      full_name: admin?.name ?? "",
      email: admin?.email,
      phone: admin?.phone_number,
      username: admin?.username || "",
      is_active: admin?.status === "Active" ? true : false,
    },
  });

  function onSubmit(input: EditAdminSchema) {
    startTransition(async () => {
      if (!admin) return;
      const { success, message } = await editAdmin({
        id: admin.id,
        ...input,
      });
      if (!success) {
        toast.error(message ?? "Failed to edit admin");
        return;
      }
      form.reset(input);
      props.onOpenChange?.(false);
      toast.success(message || "Admin edited");
    });
  }

  return (
    <Dialog {...props}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Edit Admin</DialogTitle>
          <DialogDescription>
            Edit details below and save the changes
          </DialogDescription>
        </DialogHeader>
        <AdminForm<EditAdminSchema>
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
        </AdminForm>
      </DialogContent>
    </Dialog>
  );
};

export default EditAdminDialog;
