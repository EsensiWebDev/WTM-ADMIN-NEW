"use client";

import { editSupport } from "@/app/(dashboard)/account/user-management/support/actions";
import { Support } from "@/app/(dashboard)/account/user-management/support/types";
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
import { SupportForm } from "../form/support-form";
import { type Option } from "@/types/data-table";

export const editSupportSchema = z.object({
  full_name: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  is_active: z.boolean().optional(),
  username: z.string(),
});

export type EditSupportSchema = z.infer<typeof editSupportSchema>;

interface EditSupportDialogProps
  extends React.ComponentPropsWithRef<typeof Dialog> {
  support: Support | null;
  countryOptions?: Option[];
}

const EditSupportDialog = ({
  support,
  countryOptions,
  ...props
}: EditSupportDialogProps) => {
  const [isPending, startTransition] = React.useTransition();

  const form = useForm<EditSupportSchema>({
    resolver: zodResolver(editSupportSchema),
    defaultValues: {
      full_name: support?.name ?? "",
      email: support?.email,
      phone: support?.phone_number,
      username: support?.username || "",
      is_active: support?.status === "Active" ? true : false,
    },
  });

  function onSubmit(input: EditSupportSchema) {
    startTransition(async () => {
      if (!support) return;
      const { success, message } = await editSupport({
        id: support.id,
        ...input,
      });
      if (!success) {
        toast.error(message ?? "Failed to edit support");
        return;
      }
      form.reset(input);
      props.onOpenChange?.(false);
      toast.success(message || "Support edited");
    });
  }

  return (
    <Dialog {...props}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Edit Support</DialogTitle>
          <DialogDescription>
            Edit details below and save the changes
          </DialogDescription>
        </DialogHeader>
        <SupportForm<EditSupportSchema>
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
        </SupportForm>
      </DialogContent>
    </Dialog>
  );
};

export default EditSupportDialog;
