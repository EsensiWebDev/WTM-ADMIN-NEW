"use client";

import { editCurrency } from "@/app/(dashboard)/currency/actions";
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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Switch } from "@/components/ui/switch";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { Loader } from "lucide-react";
import React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";

export const editCurrencySchema = z.object({
  name: z
    .string()
    .min(1, "Currency name is required")
    .max(100, "Currency name must be less than 100 characters"),
  symbol: z
    .string()
    .min(1, "Currency symbol is required")
    .max(10, "Currency symbol must be less than 10 characters"),
  is_active: z.boolean(),
});

export type EditCurrencySchema = z.infer<typeof editCurrencySchema>;

interface EditCurrencyDialogProps {
  currency: Currency | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isLoading: boolean;
  isError: boolean;
}

const EditCurrencyDialog = ({
  currency,
  open,
  onOpenChange,
  isLoading,
  isError,
}: EditCurrencyDialogProps) => {
  const [isPending, startTransition] = React.useTransition();
  const queryClient = useQueryClient();

  const form = useForm<EditCurrencySchema>({
    resolver: zodResolver(editCurrencySchema),
    defaultValues: {
      name: "",
      symbol: "",
      is_active: true,
    },
  });

  React.useEffect(() => {
    if (open && currency) {
      // Prevent editing IDR currency - close dialog immediately
      if (currency.code === "IDR") {
        toast.error("IDR currency cannot be edited");
        onOpenChange(false);
        return;
      }

      // Reset form with currency data when dialog opens and currency is available
      if (currency.name !== undefined || currency.symbol !== undefined) {
        form.reset({
          name: currency.name ?? "",
          symbol: currency.symbol ?? "",
          is_active: currency.is_active ?? true,
        }, {
          keepErrors: false,
          keepDirty: false,
          keepIsSubmitted: false,
          keepTouched: false,
          keepIsValid: false,
          keepSubmitCount: false,
        });
      }
    }
  }, [open, currency, form, onOpenChange]);

  const onSubmit = (data: EditCurrencySchema) => {
    if (!currency) return;

    // Prevent editing IDR currency
    if (currency.code === "IDR") {
      toast.error("IDR currency cannot be edited");
      return;
    }

    // Validate currency ID
    if (!currency.id) {
      toast.error("Invalid currency ID");
      return;
    }

    startTransition(async () => {
      const result = await editCurrency({
        ...data,
        id: String(currency.id),
      });

      if (result.success) {
        toast.success(result.message);
        queryClient.invalidateQueries({ queryKey: ["currencies"] });
        queryClient.invalidateQueries({ queryKey: ["currency-details"] });
        onOpenChange(false);
      } else {
        toast.error(result.message);
      }
    });
  };

  if (isLoading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <div className="flex items-center justify-center py-8">
            <LoadingSpinner className="h-8 w-8" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (isError || !currency) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Error</DialogTitle>
            <DialogDescription>
              Failed to load currency details. Please try again.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange} key={currency?.id}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Currency</DialogTitle>
          <DialogDescription>
            Update currency information. Currency code cannot be changed.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Currency Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="US Dollar" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="symbol"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Currency Symbol *</FormLabel>
                  <FormControl>
                    <Input placeholder="$" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="rounded-lg border p-4">
              <div className="space-y-2">
                <FormLabel>Currency Code</FormLabel>
                <Input
                  value={currency?.code || ""}
                  disabled
                  className="bg-gray-100 font-mono font-semibold"
                />
                <p className="text-sm text-muted-foreground">
                  Currency code cannot be changed after creation.
                </p>
              </div>
            </div>
            <FormField
              control={form.control}
              name="is_active"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Active Status</FormLabel>
                    <div className="text-sm text-muted-foreground">
                      Enable or disable this currency
                    </div>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <DialogFooter className="gap-2 pt-2 sm:space-x-0">
              <DialogClose asChild>
                <Button type="button" variant="outline" disabled={isPending}>
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit" disabled={isPending}>
                {isPending && <Loader className="mr-2 h-4 w-4 animate-spin" />}
                Update
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default EditCurrencyDialog;

