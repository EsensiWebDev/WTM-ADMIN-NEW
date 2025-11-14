"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
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
import { Separator } from "@/components/ui/separator";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  IconArrowAutofitWidth,
  IconBed,
  IconFriends,
} from "@tabler/icons-react";
import { Cigarette, Eye, EyeOff, PlusCircle, Trash2 } from "lucide-react";
import { useCallback, useTransition } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";
import { ImageUpload } from "./image-upload";

// Define the Zod schema for room data validation
const withoutBreakfastSchema = z.object({
  is_show: z.boolean(),
  price: z.number().min(0, "Price must be a positive number"),
});

const withBreakfastSchema = z.object({
  is_show: z.boolean(),
  pax: z.number().int().min(1, "Pax must be at least 1"),
  price: z.number().min(0, "Price must be a positive number"),
});

const additionalSchema = z.object({
  name: z.string().min(1, "Additional name is required"),
  price: z.number().min(0, "Price must be a positive number"),
});

export const roomFormSchema = z.object({
  // hotel_id: z.number().int().positive("Hotel ID is required"),
  name: z.string().min(1, "Room name is required"),
  photos: z
    .array(z.instanceof(File))
    .min(1, "At least one photo is required")
    .max(10, "Maximum 10 images allowed")
    .refine(
      (files) => files.every((file) => file.size <= 2 * 1024 * 1024),
      "Each image must be less than 2MB"
    ),
  without_breakfast: withoutBreakfastSchema,
  with_breakfast: withBreakfastSchema,
  room_size: z
    .number()
    .min(0, "Room size must be a positive number")
    .optional(),
  max_occupancy: z.number().int().min(1, "Max occupancy must be at least 1"),
  bed_types: z.array(z.string()).min(1, "At least one bed type is required"),
  is_smoking_room: z.boolean(),
  additional: z.array(additionalSchema).optional(),
  description: z.string().optional(),
});

export type RoomFormValues = z.infer<typeof roomFormSchema>;
export type WithoutBreakfast = z.infer<typeof withoutBreakfastSchema>;
export type WithBreakfast = z.infer<typeof withBreakfastSchema>;
export type Additional = z.infer<typeof additionalSchema>;

interface RoomCardInputProps {
  roomId?: string;
  defaultValues?: Partial<RoomFormValues>;
  onUpdate?: (room: RoomFormValues) => void;
  onRemove?: (id: string) => void;
  onCreate?: (data: RoomFormValues) => void;
}

export function RoomCardInput({
  roomId,
  defaultValues,
  onUpdate,
  onRemove,
  onCreate,
}: RoomCardInputProps) {
  const [isPending, startTransition] = useTransition();

  const form = useForm<RoomFormValues>({
    resolver: zodResolver(roomFormSchema),
    defaultValues: {
      // hotel_id: defaultValues?.hotel_id || 0,
      name: defaultValues?.name || "",
      photos: [],
      without_breakfast: defaultValues?.without_breakfast || {
        is_show: true,
        price: 0,
      },
      with_breakfast: defaultValues?.with_breakfast || {
        is_show: true,
        pax: 2,
        price: 0,
      },
      room_size: defaultValues?.room_size || 0,
      max_occupancy: defaultValues?.max_occupancy || 1,
      bed_types: defaultValues?.bed_types || [""],
      is_smoking_room: defaultValues?.is_smoking_room || false,
      additional: defaultValues?.additional || [],
      description: defaultValues?.description || "",
    },
  });

  const {
    fields: additionalFields,
    append: appendAdditional,
    remove: removeAdditional,
  } = useFieldArray({
    control: form.control,
    name: "additional",
  });

  // Handle bed types as a regular form field since useFieldArray doesn't work with it
  const bedTypes = form.watch("bed_types") || [];

  const updateBedType = useCallback(
    (index: number, value: string) => {
      const newBedTypes = [...bedTypes];
      newBedTypes[index] = value;
      form.setValue("bed_types", newBedTypes);
    },
    [bedTypes, form]
  );

  const removeBedType = useCallback(
    (index: number) => {
      const newBedTypes = bedTypes.filter((_, i) => i !== index);
      form.setValue("bed_types", newBedTypes);
    },
    [bedTypes, form]
  );

  // Handle image uploads from ImageUpload component
  const handleImageChange = useCallback(
    (newImages: { file?: File }[]) => {
      // Extract File objects for form validation
      const files = newImages
        .filter((img): img is { file: File } => img.file !== undefined) // Type guard to ensure file exists
        .map((img) => img.file);
      form.setValue("photos", files);
    },
    [form]
  );

  const handleAddAdditional = useCallback(() => {
    appendAdditional({ name: "", price: 0 });
  }, [appendAdditional]);

  // Handle form submission
  const handleSubmit = useCallback(
    async (data: RoomFormValues) => {
      startTransition(async () => {
        if (onCreate) {
          onCreate(data);
        } else if (onUpdate) {
          onUpdate(data);
        } else {
          // Default behavior - show a toast
          toast.success("Room data saved successfully!");
        }
      });
    },
    [onCreate, onUpdate]
  );

  // Toggle visibility for without breakfast option
  const toggleWithoutBreakfastVisibility = useCallback(() => {
    const current = form.getValues("without_breakfast");

    form.setValue("without_breakfast", {
      ...current,
      is_show: !current.is_show,
    });
  }, [form]);

  // Toggle visibility for with breakfast option
  const toggleWithBreakfastVisibility = useCallback(() => {
    const current = form.getValues("with_breakfast");
    form.setValue("with_breakfast", {
      ...current,
      is_show: !current.is_show,
    });
  }, [form]);

  const isWithoutBreakfast = form.watch("without_breakfast");
  const isWithBreakfast = form.watch("with_breakfast");

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
        <Card className="grid grid-cols-1 rounded px-4 py-6 lg:grid-cols-10 lg:px-6">
          <div className="col-span-full flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 flex-1">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormControl>
                      <Input
                        id="room-name"
                        placeholder="Enter room name"
                        className="bg-gray-200"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {onRemove && roomId && (
                <Button
                  type="button"
                  size="icon"
                  variant="destructive"
                  disabled={isPending}
                  onClick={() => {
                    startTransition(async () => {
                      onRemove(roomId);
                    });
                  }}
                >
                  <Trash2 className="size-4" />
                </Button>
              )}
            </div>
          </div>
          <div className="col-span-full grid grid-cols-1 gap-6 lg:col-span-4">
            <FormField
              control={form.control}
              name="photos"
              render={() => (
                <FormItem>
                  <FormControl>
                    <ImageUpload
                      // @ts-ignore TODO: fix this
                      initialImages={defaultValues?.photos || []}
                      onImagesChange={handleImageChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="col-span-full mt-6 flex flex-col lg:col-span-6 lg:mt-0">
            <div className="flex h-full flex-col space-y-2">
              <div>
                <h3 className="text-lg font-semibold">Room Options</h3>

                {/* Without Breakfast Option */}
                <div className="space-y-3">
                  <div
                    className={`flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center`}
                  >
                    <div
                      className={`flex w-full flex-1 items-start justify-between py-4 sm:items-center`}
                    >
                      <div>
                        <h4 className="font-medium">Without Breakfast</h4>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          <FormField
                            control={form.control}
                            name="without_breakfast.price"
                            render={({ field }) => (
                              <FormItem>
                                <FormControl>
                                  <Input
                                    type="number"
                                    className="bg-gray-200 pl-10"
                                    placeholder="Rp"
                                    {...field}
                                    value={field.value || ""}
                                    onChange={(e) =>
                                      field.onChange(
                                        e.target.value
                                          ? Number(e.target.value)
                                          : 0
                                      )
                                    }
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold">
                            Rp
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant={"ghost"}
                        type="button"
                        size={"icon"}
                        onClick={toggleWithoutBreakfastVisibility}
                      >
                        {isWithoutBreakfast.is_show ? (
                          <Eye className="size-4" />
                        ) : (
                          <EyeOff className="size-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* With Breakfast Option */}
                <div className="space-y-3">
                  <div
                    className={`flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center`}
                  >
                    <div
                      className={`flex w-full flex-1 items-start justify-between py-4 sm:items-center`}
                    >
                      <div>
                        <h4 className="font-medium">With Breakfast</h4>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          <FormField
                            control={form.control}
                            name={`with_breakfast.price`}
                            render={({ field }) => (
                              <FormItem>
                                <FormControl>
                                  <Input
                                    type="number"
                                    className="bg-gray-200 pl-10"
                                    placeholder="Rp"
                                    {...field}
                                    value={field.value || ""}
                                    onChange={(e) =>
                                      field.onChange(
                                        e.target.value
                                          ? Number(e.target.value)
                                          : 0
                                      )
                                    }
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold">
                            Rp
                          </span>
                        </div>
                        <FormField
                          control={form.control}
                          name={`with_breakfast.pax`}
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Input
                                  type="number"
                                  className="bg-gray-200 w-20"
                                  placeholder="Pax"
                                  {...field}
                                  value={field.value || ""}
                                  onChange={(e) =>
                                    field.onChange(
                                      e.target.value
                                        ? Number(e.target.value)
                                        : 1
                                    )
                                  }
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant={"ghost"}
                        type="button"
                        size={"icon"}
                        onClick={toggleWithBreakfastVisibility}
                      >
                        {isWithBreakfast.is_show ? (
                          <Eye className="size-4" />
                        ) : (
                          <EyeOff className="size-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Additional Services */}
              <div className="space-y-3">
                <h3 className="text-lg font-semibold">Additional Services</h3>
                {additionalFields.map((field, index) => (
                  <div key={field.id} className="flex items-center gap-3">
                    <FormField
                      control={form.control}
                      name={`additional.${index}.name`}
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormControl>
                            <Input
                              className="bg-gray-200"
                              placeholder="Service name"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="relative w-40">
                      <FormField
                        control={form.control}
                        name={`additional.${index}.price`}
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input
                                type="number"
                                className="bg-gray-200 pl-8"
                                placeholder="Price"
                                {...field}
                                value={field.value || ""}
                                onChange={(e) =>
                                  field.onChange(
                                    e.target.value ? Number(e.target.value) : 0
                                  )
                                }
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold">
                        Rp
                      </span>
                    </div>
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      onClick={() => removeAdditional(index)}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                ))}
                <div className="flex justify-end">
                  <Button
                    type="button"
                    className="inline-flex items-center gap-2"
                    onClick={handleAddAdditional}
                  >
                    <PlusCircle className="size-4" /> Add Service
                  </Button>
                </div>
              </div>

              <div className="mt-auto pt-10 lg:pt-4">
                <div className="mb-4 flex flex-wrap gap-4 md:gap-6">
                  {/* Room Size */}
                  <div className="flex items-center gap-2">
                    <IconArrowAutofitWidth className="h-5 w-5" />
                    <div className="relative">
                      <FormField
                        control={form.control}
                        name="room_size"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input
                                type="number"
                                placeholder="0"
                                className="bg-gray-200 w-24 pr-11"
                                {...field}
                                value={field.value || ""}
                                onChange={(e) =>
                                  field.onChange(
                                    e.target.value ? Number(e.target.value) : 0
                                  )
                                }
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm font-semibold">
                        sqm
                      </span>
                    </div>
                  </div>

                  {/* Max Occupancy */}
                  <div className="flex items-center gap-2">
                    <IconFriends className="h-5 w-5" />
                    <div className="relative">
                      <FormField
                        control={form.control}
                        name="max_occupancy"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input
                                type="number"
                                placeholder="0"
                                className="bg-gray-200 w-28"
                                {...field}
                                value={field.value || ""}
                                onChange={(e) =>
                                  field.onChange(
                                    e.target.value ? Number(e.target.value) : 1
                                  )
                                }
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm font-semibold">
                        Guest(s)
                      </span>
                    </div>
                  </div>

                  {/* Smoking Policy */}
                  <div className="flex items-center gap-2">
                    <Cigarette className="h-5 w-5" />
                    <FormField
                      control={form.control}
                      name="is_smoking_room"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Select
                              value={field.value ? "smoking" : "non-smoking"}
                              onValueChange={(value) =>
                                field.onChange(value === "smoking")
                              }
                            >
                              <SelectTrigger className="bg-gray-200 w-32">
                                <SelectValue placeholder="Select smoking" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="non-smoking">
                                  <div className="flex items-center gap-2">
                                    <span>Non Smoking</span>
                                  </div>
                                </SelectItem>
                                <SelectItem value="smoking">
                                  <div className="flex items-center gap-2">
                                    <span>Smoking</span>
                                  </div>
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Bed Types */}
                  <div className="flex items-center gap-2">
                    <IconBed className="h-5 w-5" />
                    <div className="space-y-2">
                      {bedTypes.map((bedType, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <Input
                            placeholder="Bed type"
                            className="bg-gray-200 w-26"
                            value={bedType}
                            onChange={(e) =>
                              updateBedType(index, e.target.value)
                            }
                          />
                          {bedTypes.length > 1 && (
                            <Button
                              type="button"
                              variant="destructive"
                              size="icon"
                              onClick={() => removeBedType(index)}
                            >
                              <Trash2 className="size-4" />
                            </Button>
                          )}
                        </div>
                      ))}
                      {/* <Button
                        type="button"
                        className="inline-flex items-center gap-2"
                        onClick={addBedType}
                      >
                        <PlusCircle className="size-4" /> Add Bed Type
                      </Button> */}
                    </div>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">Description</h3>
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <textarea
                          className="w-full bg-gray-200 p-3 rounded-md"
                          placeholder="Room description"
                          rows={4}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="col-span-full flex justify-end space-x-4 pt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => window.history.back()}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Saving...
                </>
              ) : (
                "Save Room"
              )}
            </Button>
          </div>
        </Card>
      </form>
    </Form>
  );
}
