"use client";

import { createReport } from "@/app/(dashboard)/report/actions";
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
import { ReportForm } from "../form/report-form";

export const createReportSchema = z.object({
  name: z.string(),
  company: z.string(),
  email: z.string(),
  hotel_name: z.string(),
});

export type CreateReportSchema = z.infer<typeof createReportSchema>;

const CreateReportDialog = () => {
  const [open, setOpen] = React.useState(false);
  const [isPending, startTransition] = React.useTransition();

  const form = useForm<CreateReportSchema>({
    resolver: zodResolver(createReportSchema),
    defaultValues: {
      name: "",
      company: "",
      email: "",
      hotel_name: "",
    },
  });

  function onSubmit(input: CreateReportSchema) {
    startTransition(async () => {
      const { success } = await createReport(input);

      if (!success) {
        toast.error("Failed to create report");
        return;
      }

      form.reset();
      setOpen(false);
      toast.success("Report created");
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus />
          New Report
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Create Report</DialogTitle>
          <DialogDescription>
            Fill in the details below to create a new report
          </DialogDescription>
        </DialogHeader>
        <ReportForm form={form} onSubmit={onSubmit}>
          <DialogFooter className="gap-2 pt-2 sm:space-x-0">
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <Button disabled={isPending}>
              {isPending && <Loader className="animate-spin" />}
              Create
            </Button>
          </DialogFooter>
        </ReportForm>
      </DialogContent>
    </Dialog>
  );
};

export default CreateReportDialog;
