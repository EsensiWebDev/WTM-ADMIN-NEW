"use client";

import { getRoomTypeOptionsByHotelId } from "@/app/(dashboard)/promo/fetch";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useFormattedCurrencyInput } from "@/lib/currency";
import { cn } from "@/lib/utils";
import { getHotelOptions } from "@/server/general";
import { MultiCurrencyPriceInput } from "@/components/dashboard/hotel-listing/create/multi-currency-price-input";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import * as React from "react";
import type { FieldPath, FieldValues, UseFormReturn } from "react-hook-form";

interface PromoFormProps<T extends FieldValues>
  extends Omit<React.ComponentPropsWithRef<"form">, "onSubmit"> {
  children: React.ReactNode;
  form: UseFormReturn<T>;
  onSubmit: (data: T) => void;
  isEdit?: boolean;
}

export function PromoForm<T extends FieldValues>({
  form,
  onSubmit,
  children,
  isEdit = false,
}: PromoFormProps<T>) {
  const {
    data: hotelOptions,
    isLoading: isLoadingHotels,
    isError: isErrorHotels,
  } = useQuery({
    queryKey: ["hotels-options"],
    queryFn: getHotelOptions,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 2,
  });

  // Get selected hotel ID/name
  const selectedHotelId = form.watch("hotel_name" as FieldPath<T>);

  // Fetch room types based on selected hotel
  const {
    data: roomTypeOptions,
    isLoading: isLoadingRoomTypes,
    isError: isErrorRoomTypes,
  } = useQuery({
    queryKey: ["room-type-options", selectedHotelId],
    queryFn: async () => {
      if (!selectedHotelId) return [];
      return getRoomTypeOptionsByHotelId(selectedHotelId);
    },
    enabled: !!selectedHotelId,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 2,
  });

  // Get selected room type ID
  const selectedRoomTypeId = form.watch("room_type_id" as FieldPath<T>);
  
  // Watch promo type to handle prices field
  const promoType = form.watch("promo_type" as FieldPath<T>);

  // Handle promo type changes - clear prices when switching away from fixed price (type 2)
  React.useEffect(() => {
    if (promoType !== "2") {
      // Clear prices when not using fixed price promo
      const currentPrices = form.getValues("prices" as FieldPath<T>);
      if (currentPrices && Object.keys(currentPrices as Record<string, number>).length > 0) {
        form.setValue("prices" as FieldPath<T>, undefined as any);
      }
    } else {
      // Initialize prices for fixed price promo if not set
      const currentPrices = form.getValues("prices" as FieldPath<T>) as Record<string, number> | undefined;
      if (!currentPrices || Object.keys(currentPrices).length === 0) {
        form.setValue("prices" as FieldPath<T>, { IDR: 0 } as any);
      } else if (!currentPrices.IDR && currentPrices.IDR !== 0) {
        // Ensure IDR exists
        form.setValue("prices" as FieldPath<T>, { ...currentPrices, IDR: 0 } as any);
      }
    }
  }, [promoType, form]);

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-6"
      >
        {/* Fourth Row: Hotel Name, Room Type, Bed Type, Nights */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name={"hotel_name" as FieldPath<T>}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Hotel Name</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  disabled={isLoadingHotels || isEdit}
                >
                  <FormControl>
                    <SelectTrigger className="w-full">
                      {isLoadingHotels ? (
                        <div className="flex items-center">
                          <LoadingSpinner className="mr-2 h-4 w-4" />
                          Loading hotels...
                        </div>
                      ) : (
                        <SelectValue placeholder="Select hotel" />
                      )}
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {isLoadingHotels ? (
                      <SelectItem value="loading" disabled>
                        Loading hotels...
                      </SelectItem>
                    ) : isErrorHotels ? (
                      <SelectItem value="error" disabled>
                        Failed to load hotels
                      </SelectItem>
                    ) : hotelOptions && hotelOptions.length > 0 ? (
                      hotelOptions.map((hotel) => (
                        <SelectItem key={hotel.value} value={hotel.value}>
                          {hotel.label}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="no-hotels" disabled>
                        No hotels available
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name={"room_type_id" as FieldPath<T>}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Room Type</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value}
                  disabled={isLoadingRoomTypes || !selectedHotelId || isEdit}
                >
                  <FormControl>
                    <SelectTrigger className="w-full">
                      {isLoadingRoomTypes && selectedHotelId ? (
                        <div className="flex items-center">
                          <LoadingSpinner className="mr-2 h-4 w-4" />
                          Loading room types...
                        </div>
                      ) : (
                        <SelectValue placeholder="Select room type" />
                      )}
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {isLoadingRoomTypes && selectedHotelId ? (
                      <SelectItem value="loading" disabled>
                        Loading room types...
                      </SelectItem>
                    ) : isErrorRoomTypes ? (
                      <SelectItem value="error" disabled>
                        Failed to load room types
                      </SelectItem>
                    ) : roomTypeOptions && roomTypeOptions.length > 0 ? (
                      roomTypeOptions.map((roomType) => (
                        <SelectItem
                          key={roomType.value}
                          value={String(roomType.value)}
                        >
                          {roomType.label}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="no-room-types" disabled>
                        {selectedHotelId
                          ? "No room types available"
                          : "Select a hotel first"}
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name={"total_night" as FieldPath<T>}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nights</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min="1"
                    placeholder="Enter nights"
                    {...field}
                    onChange={(e) =>
                      field.onChange(parseInt(e.target.value) || 1)
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* First Row: Promo Name, Promo Type, Extra Input Based on Promo Type */}
        <div className={`grid grid-cols-1 ${form.watch("promo_type" as FieldPath<T>) === "2" ? "md:grid-cols-1" : "md:grid-cols-3"} gap-4`}>
          <FormField
            control={form.control}
            name={"promo_name" as FieldPath<T>}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Promo Name</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter promo name"
                    disabled={isEdit}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name={"promo_type" as FieldPath<T>}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Promo Type</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value || "discount"}
                >
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select promo type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="1">Discount</SelectItem>
                    <SelectItem value="2">Fixed Price</SelectItem>
                    <SelectItem value="3">Room Upgrade</SelectItem>
                    <SelectItem value="4">Benefits</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          {/* Extra Input Based on Promo Type */}
          {(form.watch("promo_type" as FieldPath<T>) || "1") === "1" && (
            <FormField
              control={form.control}
              name={"detail" as FieldPath<T>}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Discount Percentage (%)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      placeholder="Enter percentage"
                      {...field}
                      onChange={(e) =>
                        field.onChange(parseFloat(e.target.value) || 0)
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
          {form.watch("promo_type" as FieldPath<T>) === "2" && (
            <div className="col-span-1 md:col-span-3">
              <MultiCurrencyPriceInput
                form={form}
                fieldName={"prices" as FieldPath<T>}
                label="Fixed Price (Multi-Currency)"
                required={true}
              />
              {/* Keep detail field for backward compatibility, but hide it */}
              <FormField
                control={form.control}
                name={"detail" as FieldPath<T>}
                render={() => <></>}
              />
            </div>
          )}
          {form.watch("promo_type" as FieldPath<T>) === "3" && (
            <FormField
              control={form.control}
              name={"detail" as FieldPath<T>}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Room Upgrade To</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select room type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {isLoadingRoomTypes && selectedHotelId ? (
                        <SelectItem value="loading" disabled>
                          Loading room types...
                        </SelectItem>
                      ) : isErrorRoomTypes ? (
                        <SelectItem value="error" disabled>
                          Failed to load room types
                        </SelectItem>
                      ) : roomTypeOptions && roomTypeOptions.length > 0 ? (
                        roomTypeOptions.map((roomType) => (
                          <SelectItem
                            key={roomType.value}
                            value={String(roomType.value)}
                            disabled={roomType.value === selectedRoomTypeId}
                          >
                            {roomType.label}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="no-room-types" disabled>
                          {selectedHotelId
                            ? "No room types available"
                            : "Select a hotel first"}
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
          {form.watch("promo_type" as FieldPath<T>) === "4" && (
            <FormField
              control={form.control}
              name={"detail" as FieldPath<T>}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Benefits</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter benefits" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
        </div>

        {/* Second Row: Promo Code, Description */}
        <FormField
          control={form.control}
          name={"promo_code" as FieldPath<T>}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Promo Code</FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter promo code"
                  {...field}
                  disabled={isEdit}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name={"description" as FieldPath<T>}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  rows={3}
                  className="resize-none max-h-16"
                  placeholder="Enter promo description"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Third Row: Start Date, End Date */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name={"start_date" as FieldPath<T>}
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Start Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>Pick a start date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value ? new Date(field.value) : undefined}
                      onSelect={(date: Date | undefined) =>
                        field.onChange(date ? date.toISOString() : "")
                      }
                      disabled={(date: Date) =>
                        date < new Date(new Date().setHours(0, 0, 0, 0))
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name={"end_date" as FieldPath<T>}
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>End Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>Pick an end date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value ? new Date(field.value) : undefined}
                      onSelect={(date: Date | undefined) =>
                        field.onChange(date ? date.toISOString() : "")
                      }
                      disabled={(date: Date) => {
                        const startDate = form.getValues(
                          "start_date" as FieldPath<T>
                        );
                        if (startDate) {
                          return date <= new Date(startDate);
                        }
                        return date < new Date(new Date().setHours(0, 0, 0, 0));
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Fifth Row: Active Status */}
        {/* <div className="grid grid-cols-1">
          <FormField
            control={form.control}
            name={"is_active" as FieldPath<T>}
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Active Status</FormLabel>
                  <div className="text-sm text-muted-foreground">
                    Enable or disable this promo
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
        </div> */}
        {children}
      </form>
    </Form>
  );
}
