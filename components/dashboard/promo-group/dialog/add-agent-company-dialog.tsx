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
import { AddAgentCompanyForm } from "../form/add-agent-company-form";

const addAgentCompanySchema = z.object({
  company: z.string().min(1, "Agent company is required"),
});

type AddAgentCompanySchema = z.infer<typeof addAgentCompanySchema>;

interface AddAgentCompanyDialogProps {
  companyOptions: Option[];
  members: PromoGroupMembers[];
  onAddMany: (members: PromoGroupMembers[]) => void;
}

const AddAgentCompanyDialog = ({
  companyOptions,
  members,
  onAddMany,
}: AddAgentCompanyDialogProps) => {
  const [open, setOpen] = React.useState(false);
  const [isPending, startTransition] = React.useTransition();

  const form = useForm<AddAgentCompanySchema>({
    resolver: zodResolver(addAgentCompanySchema),
    defaultValues: {
      company: "",
    },
  });

  function onSubmit(input: AddAgentCompanySchema) {
    startTransition(async () => {
      const selectedMembers = members.filter(
        (m) => m.company === input.company
      );
      if (selectedMembers.length === 0) {
        toast.error("No members found for the selected company");
        return;
      }
      onAddMany(selectedMembers);
      form.reset();
      setOpen(false);
      toast.success("All members from the company have been added");
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="text-xs">
          <PlusCircle />
          Add Agent Company
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Add Agent Company</DialogTitle>
          <DialogDescription>
            Select a company to add all its members to this promo group
          </DialogDescription>
        </DialogHeader>
        <AddAgentCompanyForm
          form={form}
          onSubmit={onSubmit}
          companyOptions={companyOptions}
          members={members}
        >
          <DialogFooter className="gap-2 pt-2 sm:space-x-0">
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <Button disabled={isPending}>
              {isPending && <Loader className="animate-spin" />}
              Add All Members
            </Button>
          </DialogFooter>
        </AddAgentCompanyForm>
      </DialogContent>
    </Dialog>
  );
};

export default AddAgentCompanyDialog;
