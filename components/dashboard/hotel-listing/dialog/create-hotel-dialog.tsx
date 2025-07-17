"use client";

import { createHotel } from "@/app/(dashboard)/hotel-listing/actions";
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
import { HotelForm } from "../form/hotel-form";

export const createHotelSchema = z.object({
  name: z.string(),
  email: z.string(),
});

export type CreateHotelSchema = z.infer<typeof createHotelSchema>;

const CreateAgentControlDialog = () => {
  const [open, setOpen] = React.useState(false);
  const [isPending, startTransition] = React.useTransition();

  const form = useForm<CreateHotelSchema>({
    resolver: zodResolver(createHotelSchema),
    defaultValues: {
      name: "",
      email: "",
    },
  });

  function onSubmit(input: CreateHotelSchema) {
    startTransition(async () => {
      const { success } = await createHotel(input);

      if (!success) {
        toast.error("Failed to create hotel");
        return;
      }

      form.reset();
      setOpen(false);
      toast.success("Hotel created");
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus />
          New Hotel
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Create Hotel</DialogTitle>
          <DialogDescription>
            Fill in the details below to create a new hotel
          </DialogDescription>
        </DialogHeader>
        <HotelForm form={form} onSubmit={onSubmit}>
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
        </HotelForm>
      </DialogContent>
    </Dialog>
  );
};

export default CreateAgentControlDialog;
