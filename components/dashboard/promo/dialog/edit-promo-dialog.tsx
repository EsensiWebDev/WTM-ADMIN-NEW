"use client";

import { editPromo } from "@/app/(dashboard)/promo/actions";
import { PromoDetailId } from "@/app/(dashboard)/promo/types";
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
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { Loader } from "lucide-react";
import React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";
import { PromoForm } from "../form/promo-form";

// Enhanced validation schema with more robust rules and better error messages
export const editPromoSchema = z
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
    room_type_id: z.string().min(1, "Room type is required"),
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
    is_active: z.boolean(),
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

export type EditPromoSchema = z.infer<typeof editPromoSchema>;

interface EditPromoDialogProps {
  promo: PromoDetailId | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isLoading: boolean;
  isError: boolean;
}

const promoDetailConversion = (
  promoType: string,
  promoDetail: PromoDetailId["detail"]
) => {
  if (!promoType) return "";

  switch (promoType) {
    case "1":
      return promoDetail.discount_percentage;
    case "2":
      // For fixed price, prioritize prices.IDR, fallback to fixed_price for backward compatibility
      return promoDetail.prices?.IDR?.toString() || promoDetail.fixed_price?.toString() || "";
    case "3":
      return promoDetail.upgraded_to_id.toString();
    case "4":
      return promoDetail.benefit_note;
    default:
      return "";
  }
};

const EditPromoDialog = ({
  promo,
  open,
  onOpenChange,
  isLoading,
  isError,
}: EditPromoDialogProps) => {
  const queryClient = useQueryClient();
  const [isPending, startTransition] = React.useTransition();

  const form = useForm<EditPromoSchema>({
    resolver: zodResolver(editPromoSchema),
    defaultValues: {
      description: promo?.description || "",
      detail:
        promoDetailConversion(
          String(promo?.promo_type_id),
          promo?.detail as PromoDetailId["detail"]
        ) || "",
      prices: promo?.detail?.prices || (promo?.detail?.fixed_price ? { IDR: promo.detail.fixed_price } : undefined),
      promo_name: promo?.name || "",
      promo_code: promo?.code || "",
      promo_type: String(promo?.promo_type_id) || "1",
      total_night: promo?.promo_room_types[0]?.total_nights || 1,
      start_date: promo?.start_date
        ? new Date(promo.start_date).toISOString()
        : "",
      end_date: promo?.end_date ? new Date(promo.end_date).toISOString() : "",
      is_active: promo?.is_active || true,
      room_type_id: String(promo?.promo_room_types[0]?.room_type_id) || "1",
      hotel_name: String(promo?.promo_room_types[0]?.hotel_id) || "",
    },
  });

  function onSubmit(input: EditPromoSchema) {
    if (!promo) return;

    startTransition(async () => {
      const { success } = await editPromo({ ...input, id: String(promo.id) });

      if (!success) {
        toast.error("Failed to update promo");
        return;
      }

      form.reset();
      onOpenChange(false);
      toast.success("Promo updated successfully");

      queryClient.invalidateQueries({
        queryKey: ["promo-details", String(promo.id)],
        exact: true,
      });
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle>Edit Promo</DialogTitle>
          <DialogDescription>
            Update the details below to modify the promo
          </DialogDescription>
        </DialogHeader>

        {isLoading && (
          <div className="flex items-center">
            <LoadingSpinner className="mr-2 h-4 w-4" />
            Loading promo...
          </div>
        )}

        {isError && (
          <div className="flex items-center">Error load promo...</div>
        )}

        {!isLoading && !isError && (
          <PromoForm form={form} onSubmit={onSubmit} isEdit>
            <DialogFooter className="gap-2 pt-2 sm:space-x-0">
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </DialogClose>
              <Button disabled={isPending}>
                {isPending && <Loader className="animate-spin" />}
                Update
              </Button>
            </DialogFooter>
          </PromoForm>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default EditPromoDialog;
