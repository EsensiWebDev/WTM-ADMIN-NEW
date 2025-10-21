"use client";

import { searchPromos } from "@/app/(dashboard)/promo-group/fetch";
import { Promo } from "@/app/(dashboard)/promo/types";
import { AsyncSelect } from "@/components/async-select";
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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { formatDate } from "@/lib/format";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader, PlusCircle } from "lucide-react";
import React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";

export const addPromoSchema = z.object({
  promoId: z.string().min(1, "Promo is required"),
});

export type AddPromoSchemaType = z.infer<typeof addPromoSchema>;

interface AddPromoDialogProps {
  onAdd: (promo: Promo) => void;
  currentPromos: Promo[];
}

const AddPromoDialog = ({ onAdd, currentPromos }: AddPromoDialogProps) => {
  const [open, setOpen] = React.useState(false);
  const [isPending, startTransition] = React.useTransition();

  const form = useForm<AddPromoSchemaType>({
    resolver: zodResolver(addPromoSchema),
    defaultValues: {
      promoId: "",
    },
  });

  // Filter out promos that are already in the current group
  const currentPromoIds = React.useMemo(
    () => new Set((currentPromos || []).map((p) => p.id)),
    [currentPromos]
  );

  // Create async fetcher that filters out current promos
  const promoFetcher = React.useCallback(
    async (query?: string): Promise<Promo[]> => {
      const allPromos = await searchPromos(query);
      return allPromos.data.filter((promo) => !currentPromoIds.has(promo.id));
    },
    [currentPromoIds]
  );

  // Additional filter function for client-side filtering
  const filterFn = React.useCallback((promo: Promo, query: string) => {
    const searchQuery = query.toLowerCase();
    return (
      promo.promo_name.toLowerCase().includes(searchQuery) ||
      promo.promo_code.toLowerCase().includes(searchQuery)
    );
  }, []);

  async function onSubmit(input: AddPromoSchemaType) {
    startTransition(async () => {
      // Fetch the selected promo from the server to ensure we have the latest data
      const allPromos = await searchPromos();
      const selectedPromo = allPromos.data.find(
        (p) => String(p.id) === input.promoId
      );

      if (!selectedPromo) {
        toast.error("Promo data unavailable");
        return;
      }

      onAdd(selectedPromo);
      form.reset();
      setOpen(false);
      toast.success("Promo added to group");
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="text-xs">
          <PlusCircle />
          Add Promo
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Add Promo To Group</DialogTitle>
          <DialogDescription>
            Search and select a promo to add to this promo group
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col gap-4"
          >
            <FormField
              control={form.control}
              name="promoId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Select Promo</FormLabel>
                  <FormControl>
                    <AsyncSelect<Promo>
                      triggerClassName="py-6"
                      fetcher={promoFetcher}
                      preload={false}
                      filterFn={filterFn}
                      renderOption={(promo) => (
                        <div className="flex flex-col items-start">
                          <div className="font-medium">{promo.promo_name}</div>
                          <div className="text-xs text-muted-foreground">
                            {promo.promo_code} •{" "}
                            {formatDate(new Date(promo.promo_start_date))} -{" "}
                            {formatDate(new Date(promo.promo_end_date))}
                          </div>
                        </div>
                      )}
                      getOptionValue={(promo) => String(promo.id)}
                      getDisplayValue={(promo) => (
                        <div className="flex flex-col items-start">
                          <div className="font-medium">{promo.promo_name}</div>
                          <div className="text-xs text-muted-foreground">
                            {promo.promo_code} •{" "}
                            {formatDate(new Date(promo.promo_start_date))} -{" "}
                            {formatDate(new Date(promo.promo_end_date))}
                          </div>
                        </div>
                      )}
                      value={field.value}
                      onChange={field.onChange}
                      label="Promo"
                      placeholder="Select a promo..."
                      width="100%"
                      noResultsMessage="All available promos have been added to this group."
                      notFound={
                        <div className="p-4 text-center text-sm text-muted-foreground">
                          All available promos have been added to this group.
                        </div>
                      }
                      clearable={false}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="gap-2 pt-2 sm:space-x-0">
              <DialogClose asChild>
                <Button type="button" variant="outline" className="bg-white">
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit" disabled={isPending}>
                {isPending && <Loader className="animate-spin" />}
                Add
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default AddPromoDialog;
