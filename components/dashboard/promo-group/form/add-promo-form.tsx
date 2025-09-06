"use client";

import { Promo } from "@/app/(dashboard)/promo/types";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatDate } from "@/lib/format";
import { Search } from "lucide-react";
import type * as React from "react";
import type { FieldPath, FieldValues, UseFormReturn } from "react-hook-form";

interface AddPromoFormProps<T extends FieldValues>
  extends Omit<React.ComponentPropsWithRef<"form">, "onSubmit"> {
  children: React.ReactNode;
  form: UseFormReturn<T>;
  onSubmit: (data: T) => void;
  promos: Promo[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export function AddPromoForm<T extends FieldValues>({
  form,
  onSubmit,
  children,
  promos,
  searchQuery,
  onSearchChange,
}: AddPromoFormProps<T>) {
  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-4"
      >
        {/* Search Input */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Search Promos</label>
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by promo name or code..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>

        {/* Promo Selection */}
        <FormField
          control={form.control}
          name={"promoId" as FieldPath<T>}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Select Promo</FormLabel>
              <FormControl>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue 
                      placeholder={
                        promos.length === 0 
                          ? "No promos available" 
                          : "Select a promo"
                      } 
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {promos.map((promo) => (
                      <SelectItem key={promo.id} value={promo.id}>
                        <div className="flex flex-col items-start">
                          <div className="font-medium">{promo.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {promo.code} • {formatDate(new Date(promo.start_date))} - {formatDate(new Date(promo.end_date))}
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Show message when no promos available */}
        {promos.length === 0 && (
          <div className="text-sm text-muted-foreground text-center py-4">
            {searchQuery 
              ? "No promos found matching your search." 
              : "All available promos have been added to this group."
            }
          </div>
        )}

        {children}
      </form>
    </Form>
  );
}