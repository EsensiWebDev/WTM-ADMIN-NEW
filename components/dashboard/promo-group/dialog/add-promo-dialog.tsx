"use client";

import { addPromoGroupPromos } from "@/app/(dashboard)/promo-group/actions";
import { getUnassignedPromos } from "@/app/(dashboard)/promo-group/fetch";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
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
  FormMessage,
} from "@/components/ui/form";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, ChevronsUpDown, Loader, PlusCircle } from "lucide-react";
import React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";

export const addPromoSchema = z.object({
  promo_id: z.string().min(1, "Promo is required"),
});

export type AddPromoSchemaType = z.infer<typeof addPromoSchema>;

interface AddPromoDialogProps {
  promoGroupId: string;
}

const AddPromoDialog = ({ promoGroupId }: AddPromoDialogProps) => {
  const queryClient = useQueryClient();
  const [open, setOpen] = React.useState(false);
  const [openPopover, setOpenPopover] = React.useState(false);
  const [isPending, startTransition] = React.useTransition();

  const form = useForm<AddPromoSchemaType>({
    resolver: zodResolver(addPromoSchema),
    defaultValues: {
      promo_id: "",
    },
  });

  const {
    data: promoOptions,
    isLoading: isLoadingPromoOptions,
    // isError: isErrorPromoOptions,
  } = useQuery({
    queryKey: ["promo-options", promoGroupId],
    queryFn: async () => {
      if (!promoGroupId) return [];
      return getUnassignedPromos(promoGroupId);
    },
    enabled: !!promoGroupId,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 2,
  });

  async function onSubmit(input: AddPromoSchemaType) {
    startTransition(async () => {
      const { success } = await addPromoGroupPromos({
        ...input,
        promo_group_id: promoGroupId,
      });

      if (!success) {
        toast.error("Failed to add promo");
        return;
      }
      queryClient.invalidateQueries({
        queryKey: ["promo-options", promoGroupId],
      });
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
              name="promo_id"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <Popover open={openPopover} onOpenChange={setOpenPopover}>
                    <PopoverTrigger asChild>
                      <FormControl>
                        {isLoadingPromoOptions ? (
                          <div className="flex items-center">
                            <LoadingSpinner className="mr-2 h-4 w-4" />
                            Loading promo...
                          </div>
                        ) : (
                          <Button
                            variant="outline"
                            role="combobox"
                            className={cn(
                              "w-full justify-between",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value
                              ? promoOptions?.find(
                                  (option) => option.value === field.value
                                )?.label
                              : "Select promo"}
                            <ChevronsUpDown className="opacity-50" />
                          </Button>
                        )}
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="p-0 w-[var(--radix-popover-trigger-width)] max-w-[var(--radix-popover-content-available-width)]">
                      <Command>
                        <CommandInput
                          placeholder="Search promo..."
                          className="h-9"
                        />
                        <CommandList>
                          <CommandEmpty>No promo found.</CommandEmpty>
                          <CommandGroup>
                            {promoOptions?.map((option) => (
                              <CommandItem
                                value={option.label}
                                key={option.value}
                                keywords={[option.label]}
                                onSelect={() => {
                                  form.setValue("promo_id", option.value);
                                  setOpenPopover(false);
                                }}
                              >
                                {option.label}
                                <Check
                                  className={cn(
                                    "ml-auto",
                                    option.value === field.value
                                      ? "opacity-100"
                                      : "opacity-0"
                                  )}
                                />
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
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
