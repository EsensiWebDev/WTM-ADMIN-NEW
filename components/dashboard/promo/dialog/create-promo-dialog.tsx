"use client";

import { createPromo } from "@/app/(dashboard)/promo/actions";
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
import { PromoForm } from "../form/promo-form";

// Enhanced validation schema with more robust rules and better error messages
export const createPromoSchema = z
  .object({
    description: z
      .string()
      .min(1, "Description is required")
      .max(500, "Description must be less than 500 characters"),
    detail: z.union([z.string(), z.number()]).optional(), // DEPRECATED: Use prices instead
    prices: z
      .record(z.string(), z.number().nonnegative("Price cannot be negative"))
      .refine(
        (prices) => !prices || "IDR" in prices,
        "IDR price is required (mandatory currency)"
      )
      .optional(),
    promo_name: z
      .string()
      .min(1, "Promo name is required")
      .max(100, "Promo name must be less than 100 characters"),
    promo_code: z
      .string()
      .min(1, "Promo code is required")
      .max(50, "Promo code must be less than 50 characters")
      .regex(
        /^[A-Za-z0-9_]+$/,
        "Promo code must contain only letters, numbers, and underscores"
      ),
    promo_type: z.string().min(1, "Promo type is required"),
    room_type_id: z.coerce
      .string({
        invalid_type_error: "Room type is required",
        required_error: "Room type is required",
      })
      .min(1, "Room type is required"),
    total_night: z.coerce
      .number({
        invalid_type_error: "Total night must be a number",
        required_error: "Total night is required",
      })
      .min(1, "Total night must be at least 1")
      .max(365, "Total night cannot exceed 365"),
    start_date: z
      .string()
      .min(1, "Start date is required")
      .refine(
        (date) => !isNaN(Date.parse(date)),
        "Start date must be a valid date"
      ),
    end_date: z
      .string()
      .min(1, "End date is required")
      .refine(
        (date) => !isNaN(Date.parse(date)),
        "End date must be a valid date"
      ),
    hotel_name: z.string().min(1, "Hotel name is required"),
  })
  .refine(
    (data) => {
      const startDate = new Date(data.start_date);
      const endDate = new Date(data.end_date);
      return endDate > startDate;
    },
    {
      message: "End date must be after start date",
      path: ["end_date"],
    }
  )
  .refine(
    (data) => {
      // For fixed price promos (type 2), prices with IDR is required
      if (data.promo_type === "2") {
        return data.prices && "IDR" in data.prices && data.prices.IDR > 0;
      }
      return true;
    },
    {
      message: "IDR price is required for fixed price promos",
      path: ["prices"],
    }
  );

export type CreatePromoSchema = z.infer<typeof createPromoSchema>;

const CreatePromoDialog = () => {
  const [open, setOpen] = React.useState(false);
  const [isPending, startTransition] = React.useTransition();

  const form = useForm<CreatePromoSchema>({
    resolver: zodResolver(createPromoSchema),
    defaultValues: {
      description: "",
      detail: "",
      prices: undefined,
      promo_name: "",
      promo_code: "",
      promo_type: "1",
      room_type_id: "",
      total_night: 1,
      start_date: "",
      end_date: "",
      hotel_name: "",
    },
  });

  function onSubmit(input: CreatePromoSchema) {
    startTransition(async () => {
      const { success, message } = await createPromo(input);

      if (!success) {
        toast.error(message || "Failed to create promo");
        return;
      }

      form.reset();
      setOpen(false);
      toast.success(message || "Promo created successfully");
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus />
          Create Promo
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle>Create Promo</DialogTitle>
          <DialogDescription>
            Fill in the details below to create a new promo
          </DialogDescription>
        </DialogHeader>
        <PromoForm form={form} onSubmit={onSubmit}>
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
        </PromoForm>
      </DialogContent>
    </Dialog>
  );
};

export default CreatePromoDialog;
