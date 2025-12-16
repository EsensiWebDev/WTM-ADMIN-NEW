"use client";

import { Currency } from "@/app/(dashboard)/currency/types";
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
import { Loader } from "lucide-react";
import React from "react";
import { toast } from "sonner";
import { editCurrency } from "@/app/(dashboard)/currency/actions";
import { useQueryClient } from "@tanstack/react-query";

interface DeleteCurrencyDialogProps {
  currencies: Currency[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  showTrigger?: boolean;
}

const DeleteCurrencyDialog = ({
  currencies,
  open,
  onOpenChange,
  onSuccess,
  showTrigger = true,
}: DeleteCurrencyDialogProps) => {
  const [isPending, startTransition] = React.useTransition();
  const queryClient = useQueryClient();

  const handleDelete = () => {
    if (currencies.length === 0) return;

    startTransition(async () => {
      // Instead of deleting, we'll deactivate the currency
      const deactivatePromises = currencies.map((currency) =>
        editCurrency({
          id: currency.id,
          name: currency.name,
          symbol: currency.symbol,
          is_active: false,
        })
      );
      const results = await Promise.all(deactivatePromises);

      const hasError = results.some((result) => !result.success);

      if (hasError) {
        toast.error("Failed to deactivate some currencies");
        return;
      }

      toast.success(
        currencies.length === 1
          ? "Currency deactivated successfully"
          : `${currencies.length} currencies deactivated successfully`
      );

      queryClient.invalidateQueries({ queryKey: ["currencies"] });
      onOpenChange(false);
      onSuccess?.();
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Deactivate Currency{currencies.length > 1 ? "ies" : ""}
          </DialogTitle>
          <DialogDescription>
            Are you sure you want to deactivate{" "}
            {currencies.length === 1 ? (
              <>
                <strong>{currencies[0]?.code} - {currencies[0]?.name}</strong>?
              </>
            ) : (
              <>
                <strong>{currencies.length} currencies</strong>?
              </>
            )}{" "}
            Deactivated currencies will not be available for use in new prices or
            bookings, but existing bookings will retain their currency.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 pt-2 sm:space-x-0">
          <DialogClose asChild>
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </DialogClose>
          <Button
            variant="destructive"
            disabled={isPending}
            onClick={handleDelete}
          >
            {isPending && <Loader className="mr-2 h-4 w-4 animate-spin" />}
            Deactivate
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteCurrencyDialog;

