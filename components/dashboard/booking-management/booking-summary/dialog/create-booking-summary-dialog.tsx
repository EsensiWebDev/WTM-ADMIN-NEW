"use client";

import { createBooking } from "@/app/(dashboard)/booking-management/booking-summary/actions";
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
import { BookingSummaryForm } from "../form/booking-summary-form";

export const createBookingSummarySchema = z.object({
  guest_name: z.string(),
  agent_name: z.string(),
  agent_company: z.string(),
  group_promo: z.string(),
  booking_id: z.string(),
  booking_status: z.enum(["confirmed", "rejected", "in review"]),
  payment_status: z.enum(["paid", "unpaid"]),
  promo_id: z.string(),
});

export type CreateBookingSummarySchema = z.infer<
  typeof createBookingSummarySchema
>;

const CreateBookingSummaryDialog = () => {
  const [open, setOpen] = React.useState(false);
  const [isPending, startTransition] = React.useTransition();

  const form = useForm<CreateBookingSummarySchema>({
    resolver: zodResolver(createBookingSummarySchema),
    defaultValues: {
      guest_name: "",
      agent_name: "",
      agent_company: "",
      group_promo: "",
      booking_id: "",
      booking_status: "confirmed",
      payment_status: "paid",
      promo_id: "",
    },
  });

  function onSubmit(input: CreateBookingSummarySchema) {
    startTransition(async () => {
      const { success } = await createBooking(input);

      if (!success) {
        toast.error("Failed to create booking");
        return;
      }

      form.reset();
      setOpen(false);
      toast.success("Booking created");
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus />
          New Booking
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Create Booking</DialogTitle>
          <DialogDescription>
            Fill in the details below to create a new booking
          </DialogDescription>
        </DialogHeader>
        <BookingSummaryForm form={form} onSubmit={onSubmit}>
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
        </BookingSummaryForm>
      </DialogContent>
    </Dialog>
  );
};

export default CreateBookingSummaryDialog;
