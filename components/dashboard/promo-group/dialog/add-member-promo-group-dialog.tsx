"use client";

import { PromoGroupMembers } from "@/app/(dashboard)/promo-group/types";
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
import { Option } from "@/types/data-table";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader, PlusCircle } from "lucide-react";
import React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";
import { AddMemberPromoGroupForm } from "../form/add-member-promo-group-form";

export const addMemberPromoGroupSchema = z.object({
  company: z.string().min(1, "Agent company is required"),
  memberId: z.string().min(1, "Member is required"),
});

export type AddMemberPromoGroupSchemaType = z.infer<
  typeof addMemberPromoGroupSchema
>;

interface AddMemberPromoGroupDialogProps {
  onAdd: (member: PromoGroupMembers) => void;
  companyOptions: Option[];
  members: PromoGroupMembers[];
}

const AddMemberPromoGroupDialog = ({
  onAdd,
  companyOptions,
  members,
}: AddMemberPromoGroupDialogProps) => {
  const [open, setOpen] = React.useState(false);
  const [isPending, startTransition] = React.useTransition();

  const form = useForm<AddMemberPromoGroupSchemaType>({
    resolver: zodResolver(addMemberPromoGroupSchema),
    defaultValues: {
      company: "",
      memberId: "",
    },
  });

  const selectedCompany = form.watch("company");
  const memberOptions = React.useMemo<Option[]>(() => {
    const pool = selectedCompany
      ? members.filter((m) => m.company === selectedCompany)
      : members;
    return pool.map((m) => ({ label: m.name, value: m.id }));
  }, [members, selectedCompany]);

  async function onSubmit(input: AddMemberPromoGroupSchemaType) {
    startTransition(async () => {
      const full = members.find((m) => m.id === input.memberId);
      if (!full) {
        toast.error("Member data unavailable");
        return;
      }
      onAdd(full);
      form.reset();
      setOpen(false);
      toast.success("Member added");
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="text-xs">
          <PlusCircle />
          Add Member
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Add Member To Promo Group</DialogTitle>
          <DialogDescription>
            Choose an agent company to filter members, then pick a member to add
          </DialogDescription>
        </DialogHeader>
        <AddMemberPromoGroupForm
          form={form}
          onSubmit={onSubmit}
          companyOptions={companyOptions}
          memberOptions={memberOptions}
          onCompanyChange={(label) => {
            // reset member selection when company changes
            form.setValue("memberId", "");
          }}
        >
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
        </AddMemberPromoGroupForm>
      </DialogContent>
    </Dialog>
  );
};

export default AddMemberPromoGroupDialog;
