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
import { Switch } from "@/components/ui/switch";
import { useFormattedCurrencyInput } from "@/lib/currency";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ADDITIONAL_SERVICE_CATEGORY_OPTIONS,
  AdditionalServiceCategory,
} from "@/app/(dashboard)/hotel-listing/types";
import {
  IconArrowAutofitWidth,
  IconBed,
  IconFriends,
} from "@tabler/icons-react";
import { Cigarette, Eye, EyeOff, PlusCircle, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState, useTransition } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";
import { ImageUpload } from "./image-upload";
import { useRouter } from "next/navigation";

// Define the Zod schema for room data validation
const withoutBreakfastSchema = z.object({
  is_show: z.boolean(),
  price: z
    .number({
      required_error: "Price is required",
      invalid_type_error: "Price must be a valid number",
    })
    .nonnegative("Price cannot be negative"),
});

const withBreakfastSchema = z.object({
  is_show: z.boolean(),
  pax: z
    .number({
      required_error: "Pax is required",
      invalid_type_error: "Pax must be a valid number",
    })
    .int("Pax must be a whole number")
    .positive("Pax must be at least 1"),
  price: z
    .number({
      required_error: "Price is required",
      invalid_type_error: "Price must be a valid number",
    })
    .nonnegative("Price cannot be negative"),
});

const additionalSchema = z
  .object({
    id: z.number().int().optional(), // ID for existing additions
    name: z.string().min(1, "Additional name is required"),
    category: z.enum(["price", "pax"], {
      required_error: "Category is required",
      invalid_type_error: "Category must be either 'price' or 'pax'",
    }),
    price: z.number().min(0, "Price must be a positive number").optional(),
    pax: z.number().int().positive("Pax must be at least 1").optional(),
    is_required: z.boolean(),
  })
  .refine(
    (data) => {
      // If category is "price", price must be provided and > 0
      if (data.category === "price") {
        return data.price !== undefined && data.price > 0;
      }
      return true;
    },
    {
      message: "Price is required and must be greater than 0 when category is 'price'",
      path: ["price"],
    }
  )
  .refine(
    (data) => {
      // If category is "pax", pax must be provided and >= 1
      if (data.category === "pax") {
        return data.pax !== undefined && data.pax >= 1;
      }
      return true;
    },
    {
      message: "Pax is required and must be at least 1 when category is 'pax'",
      path: ["pax"],
    }
  )
  .refine(
    (data) => {
      // When category is "price", pax should not be set
      if (data.category === "price" && data.pax !== undefined) {
        return false;
      }
      return true;
    },
    {
      message: "Pax should not be set when category is 'price'",
      path: ["pax"],
    }
  )
  .refine(
    (data) => {
      // When category is "pax", price should not be set
      if (data.category === "pax" && data.price !== undefined) {
        return false;
      }
      return true;
    },
    {
      message: "Price should not be set when category is 'pax'",
      path: ["price"],
    }
  );

export const roomFormSchema = z
  .object({
    // hotel_id: z.number().int().positive("Hotel ID is required"),
    name: z.string().min(1, "Room name is required"),
    photos: z
      .array(z.instanceof(File))
      .max(10, "Maximum 10 images allowed")
      .refine(
        (files) => files.every((file) => file.size <= 2 * 1024 * 1024),
        "Each image must be less than 2MB"
      ),
    unchanged_room_photos: z.array(z.string()).optional(),
    without_breakfast: withoutBreakfastSchema,
    with_breakfast: withBreakfastSchema,
    room_size: z
      .number({
        invalid_type_error: "Required",
      })
      .positive("Required"),
    max_occupancy: z
      .number({
        invalid_type_error: "Max occupancy must be a number",
      })
      .int("Max occupancy must be a whole number")
      .positive("Max occupancy must be at least 1"),
    bed_types: z
      .array(z.string().min(1, "Bed type cannot be empty"))
      .min(1, "Required")
      .refine((bedTypes) => bedTypes.every((type) => type.trim().length > 0), {
        message: "Required",
      })
      .refine(
        (bedTypes) => {
          // Check for duplicate bed types (case-insensitive)
          const trimmed = bedTypes.map((bt) => bt.trim().toLowerCase());
          const unique = new Set(trimmed);
          return unique.size === trimmed.length;
        },
        {
          message: "Duplicate bed types are not allowed",
        }
      ),
    is_smoking_room: z.boolean(),
    additional: z.array(additionalSchema).optional(),
    unchanged_additions_ids: z.array(z.number().int()).optional(),
    description: z.string().min(1, "Description is required"),
  })
  .refine(
    (data) => {
      // At least one photo is required (either new or existing)
      const hasNewPhotos = data.photos.length > 0;
      const hasExistingPhotos = (data.unchanged_room_photos?.length || 0) > 0;
      return hasNewPhotos || hasExistingPhotos;
    },
    {
      message: "At least one photo is required",
      path: ["photos"], // Show error on photos field
    }
  )
  .refine(
    (data) => {
      // At least one breakfast option must be enabled (is_show: true)
      return data.without_breakfast.is_show || data.with_breakfast.is_show;
    },
    {
      message: "At least one breakfast option must be enabled",
      path: ["without_breakfast"], // Show error on without_breakfast field
    }
  )
  .refine(
    (data) => {
      // If without_breakfast is enabled, price must be greater than 0
      if (data.without_breakfast.is_show && data.without_breakfast.price <= 0) {
        return false;
      }
      return true;
    },
    {
      message: "Price must be greater than 0 when option is enabled",
      path: ["without_breakfast.price"],
    }
  )
  .refine(
    (data) => {
      // If with_breakfast is enabled, price must be greater than 0
      if (data.with_breakfast.is_show && data.with_breakfast.price <= 0) {
        return false;
      }
      return true;
    },
    {
      message: "Price must be greater than 0 when option is enabled",
      path: ["with_breakfast.price"],
    }
  );

export type RoomFormValues = z.infer<typeof roomFormSchema>;
export type WithoutBreakfast = z.infer<typeof withoutBreakfastSchema>;
export type WithBreakfast = z.infer<typeof withBreakfastSchema>;
export type Additional = z.infer<typeof additionalSchema>;

interface RoomCardInputProps {
  roomId?: string;
  defaultValues?: Partial<RoomFormValues>;
  initialPhotos?: string[]; // URLs of existing room photos for edit mode
  initialAdditions?: Array<{
    id: number;
    name: string;
    category: AdditionalServiceCategory;
    price?: number;
    pax?: number;
    is_required: boolean;
  }>; // Existing additions with IDs
  onUpdate?: (room: RoomFormValues) => void;
  onRemove?: (id: string) => void;
  onCreate?: (data: RoomFormValues) => void;
}

export function RoomCardInput({
  roomId,
  defaultValues,
  initialPhotos = [],
  initialAdditions = [],
  onUpdate,
  onRemove,
  onCreate,
}: RoomCardInputProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  // Track original additions with their IDs for comparison
  const [originalAdditions, setOriginalAdditions] = useState<
    Array<{
      id?: number;
      name: string;
      category: AdditionalServiceCategory;
      price?: number;
      pax?: number;
      is_required: boolean;
    }>
  >(
    initialAdditions.map((addition) => ({
      id: addition.id,
      name: addition.name,
      category: (addition.category || "price") as AdditionalServiceCategory, // Default to "price" for backward compatibility
      price: addition.price,
      pax: addition.pax,
      is_required: addition.is_required ?? false,
    }))
  );

  const form = useForm<RoomFormValues>({
    resolver: zodResolver(roomFormSchema),
    defaultValues: {
      // hotel_id: defaultValues?.hotel_id || 0,
      name: defaultValues?.name || "",
      photos: [],
      unchanged_room_photos: initialPhotos,
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
      additional:
        (initialAdditions || []).map((addition) => ({
          id: addition.id,
          name: addition.name,
          category: (addition.category || "price") as AdditionalServiceCategory, // Default to "price" for backward compatibility
          price: addition.price,
          pax: addition.pax,
          is_required: addition.is_required ?? false,
        })) as Array<{
          id?: number;
          name: string;
          category: AdditionalServiceCategory;
          price?: number;
          pax?: number;
          is_required: boolean;
        }>,
      unchanged_additions_ids:
        initialAdditions.map((addition) => addition.id) || [],
      description: defaultValues?.description || "",
    },
  });

  // Reset form when props change (after successful update)
  useEffect(() => {
    const additions = initialAdditions.map((addition) => ({
      id: addition.id,
      name: addition.name,
      category: (addition.category || "price") as AdditionalServiceCategory, // Default to "price" for backward compatibility
      price: addition.price,
      pax: addition.pax,
      is_required: addition.is_required ?? false,
    })) as Array<{
      id?: number;
      name: string;
      category: AdditionalServiceCategory;
      price?: number;
      pax?: number;
      is_required: boolean;
    }>;

    setOriginalAdditions(additions);

    form.reset({
      name: defaultValues?.name || "",
      photos: [],
      unchanged_room_photos: initialPhotos,
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
      additional: additions,
      unchanged_additions_ids:
        initialAdditions.map((addition) => addition.id) || [],
      description: defaultValues?.description || "",
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultValues, initialPhotos, initialAdditions]);

  const {
    fields: additionalFields,
    append: appendAdditional,
    remove: removeAdditional,
  } = useFieldArray({
    control: form.control,
    name: "additional",
  });

  // Watch all additional fields at once to avoid hooks in map
  const watchedAdditional = form.watch("additional");

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
      // Ensure at least one bed type input remains
      form.setValue("bed_types", newBedTypes.length > 0 ? newBedTypes : [""]);
    },
    [bedTypes, form]
  );

  const addBedType = useCallback(() => {
    form.setValue("bed_types", [...bedTypes, ""]);
  }, [bedTypes, form]);

  // Handle image uploads from ImageUpload component
  const handleImageChange = useCallback(
    (
      newImages: {
        id: string;
        file?: File;
        preview: string;
        isExisting?: boolean;
      }[]
    ) => {
      // Separate new uploads from existing unchanged images
      const newFiles = newImages
        .filter((img) => img.file && !img.isExisting) // Only include newly uploaded files
        .map((img) => img.file) as File[];

      // Map existing images back to their original URLs from initialPhotos
      const unchangedUrls = newImages
        .filter((img) => img.isExisting) // Only include existing images that weren't removed
        .map((img) => {
          // Extract the index from the ID (e.g., 'existing-0' -> 0)
          const indexMatch = img.id.match(/^existing-(\d+)$/);
          if (indexMatch && initialPhotos) {
            const index = parseInt(indexMatch[1], 10);
            // Return the original URL from initialPhotos without modification
            return initialPhotos[index];
          }
          return null;
        })
        .filter((url): url is string => url !== null); // Remove null values

      form.setValue("photos", newFiles);
      form.setValue("unchanged_room_photos", unchangedUrls);
    },
    [form, initialPhotos]
  );

  const handleAddAdditional = useCallback(() => {
    appendAdditional({
      name: "",
      category: "price",
      price: undefined,
      pax: undefined,
      is_required: false,
    }); // New additions don't have ID
  }, [appendAdditional]);

  const handleRemoveAdditional = useCallback(
    (index: number) => {
      const currentAdditions = form.getValues("additional") || [];
      const additionToRemove = currentAdditions[index];

      // If the addition has an ID, remove it from unchanged list
      if (additionToRemove?.id !== undefined) {
        const unchangedIds = form.getValues("unchanged_additions_ids") || [];
        form.setValue(
          "unchanged_additions_ids",
          unchangedIds.filter((id) => id !== additionToRemove.id)
        );
      }

      removeAdditional(index);
    },
    [form, removeAdditional]
  );

  // Track changes to additions
  const handleAdditionChange = useCallback(
    (
      index: number,
      field: "name" | "category" | "price" | "pax" | "is_required",
      value: string | number | boolean
    ) => {
      const currentAdditions = form.getValues("additional") || [];
      const addition = currentAdditions[index];

      // Handle category change - clear the opposite field
      if (field === "category") {
        const category = value as AdditionalServiceCategory;
        const updatedAddition = {
          ...addition,
          category,
          // Clear the opposite field when category changes
          price: category === "price" ? addition.price : undefined,
          pax: category === "pax" ? addition.pax : undefined,
        };
        form.setValue(`additional.${index}`, updatedAddition);
        return;
      }

      // Check if this is an existing addition (has ID)
      if (addition?.id !== undefined) {
        const originalAddition = originalAdditions.find(
          (a) => a.id === addition.id
        );

        // After updating, check if it's modified
        const updatedAddition = {
          ...addition,
          [field]: value,
        };

        const isModified =
          originalAddition &&
          (originalAddition.name !== updatedAddition.name ||
            originalAddition.category !== updatedAddition.category ||
            originalAddition.price !== updatedAddition.price ||
            originalAddition.pax !== updatedAddition.pax ||
            originalAddition.is_required !== updatedAddition.is_required);

        const unchangedIds = form.getValues("unchanged_additions_ids") || [];

        if (isModified) {
          // Remove from unchanged list if it was modified
          form.setValue(
            "unchanged_additions_ids",
            unchangedIds.filter((id) => id !== addition.id)
          );
        } else {
          // Add back to unchanged list if it matches original
          if (!unchangedIds.includes(addition.id)) {
            form.setValue("unchanged_additions_ids", [
              ...unchangedIds,
              addition.id,
            ]);
          }
        }
      }
    },
    [form, originalAdditions]
  );

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
                      initialImages={initialPhotos}
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
                      <div>
                        <div className="flex items-center gap-4">
                          <div className="relative">
                            <FormField
                              control={form.control}
                              name="without_breakfast.price"
                              render={({ field }) => {
                                const {
                                  displayValue,
                                  handleChange,
                                  handleBlur,
                                } = useFormattedCurrencyInput(
                                  field.value,
                                  field.onChange,
                                  "id-ID"
                                );

                                return (
                                  <FormItem>
                                    <FormControl>
                                      <Input
                                        type="text"
                                        className="bg-gray-200 pl-10"
                                        placeholder="0"
                                        value={displayValue}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                      />
                                    </FormControl>
                                  </FormItem>
                                );
                              }}
                            />
                            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold">
                              Rp
                            </span>
                          </div>
                        </div>
                        <FormField
                          control={form.control}
                          name="without_breakfast.price"
                          render={() => (
                            <FormItem>
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
                      <div>
                        <div className="flex items-center gap-4">
                          <div className="relative">
                            <FormField
                              control={form.control}
                              name={`with_breakfast.price`}
                              render={({ field }) => {
                                const {
                                  displayValue,
                                  handleChange,
                                  handleBlur,
                                } = useFormattedCurrencyInput(
                                  field.value,
                                  field.onChange,
                                  "id-ID"
                                );

                                return (
                                  <FormItem>
                                    <FormControl>
                                      <Input
                                        type="text"
                                        className="bg-gray-200 pl-10"
                                        placeholder="0"
                                        value={displayValue}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                      />
                                    </FormControl>
                                  </FormItem>
                                );
                              }}
                            />
                            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold">
                              Rp
                            </span>
                          </div>
                          <div>
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
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name={`with_breakfast.pax`}
                              render={() => (
                                <FormItem>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        </div>
                        <FormField
                          control={form.control}
                          name={`with_breakfast.price`}
                          render={() => (
                            <FormItem>
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

                {/* Breakfast Options Validation Error */}
                <FormField
                  control={form.control}
                  name="without_breakfast"
                  render={() => (
                    <FormItem>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Additional Services */}
              <div className="space-y-3">
                <h3 className="text-lg font-semibold">Additional Services</h3>
                {additionalFields.map((field, index) => {
                  const category = (watchedAdditional?.[index]?.category || "price") as AdditionalServiceCategory;
                  return (
                    <div key={field.id} className="flex items-center gap-3">
                      <FormField
                        control={form.control}
                        name={`additional.${index}.name`}
                        render={({ field }) => (
                          <FormItem className="flex-1 min-w-[200px]">
                            <FormControl>
                              <Input
                                className="bg-gray-200"
                                placeholder="Service name"
                                {...field}
                                onChange={(e) => {
                                  field.onChange(e);
                                  handleAdditionChange(
                                    index,
                                    "name",
                                    e.target.value
                                  );
                                }}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`additional.${index}.category`}
                        render={({ field }) => (
                          <FormItem className="w-32 flex-shrink-0">
                            <Select
                              value={field.value}
                              onValueChange={(value) => {
                                field.onChange(value);
                                handleAdditionChange(
                                  index,
                                  "category",
                                  value
                                );
                              }}
                            >
                              <FormControl>
                                <SelectTrigger className="bg-gray-200">
                                  <SelectValue placeholder="Category" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {ADDITIONAL_SERVICE_CATEGORY_OPTIONS.map(
                                  (option) => (
                                    <SelectItem
                                      key={option.value}
                                      value={option.value}
                                    >
                                      {option.label}
                                    </SelectItem>
                                  )
                                )}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      {/* Price Input - Always rendered but conditionally shown */}
                      <div className={`relative w-44 flex-shrink-0 ${category !== "price" ? "hidden" : ""}`}>
                        <FormField
                          control={form.control}
                          name={`additional.${index}.price`}
                          render={({ field }) => {
                            const {
                              displayValue,
                              handleChange,
                              handleBlur,
                            } = useFormattedCurrencyInput(
                              field.value ?? 0,
                              (numValue) => {
                                field.onChange(numValue);
                                handleAdditionChange(
                                  index,
                                  "price",
                                  numValue
                                );
                              },
                              "id-ID"
                            );

                            return (
                              <FormItem>
                                <FormControl>
                                  <Input
                                    type="text"
                                    className="bg-gray-200 pl-8"
                                    placeholder="0"
                                    value={displayValue}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            );
                          }}
                        />
                        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold">
                          Rp
                        </span>
                      </div>
                      {/* Pax Input - Always rendered but conditionally shown */}
                      <div className={`w-44 flex-shrink-0 ${category !== "pax" ? "hidden" : ""}`}>
                        <FormField
                          control={form.control}
                          name={`additional.${index}.pax`}
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Input
                                  type="number"
                                  className="bg-gray-200"
                                  placeholder="Number of people"
                                  min="1"
                                  value={field.value || ""}
                                  onChange={(e) => {
                                    const value =
                                      e.target.value === ""
                                        ? undefined
                                        : parseInt(e.target.value, 10);
                                    field.onChange(value);
                                    handleAdditionChange(
                                      index,
                                      "pax",
                                      value || 0
                                    );
                                  }}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <div className="flex items-center gap-2 px-2">
                        <FormField
                          control={form.control}
                          name={`additional.${index}.is_required`}
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={(checked) => {
                                    field.onChange(checked);
                                    handleAdditionChange(
                                      index,
                                      "is_required",
                                      checked
                                    );
                                  }}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        <span className="text-sm text-muted-foreground whitespace-nowrap">
                          Required
                        </span>
                      </div>
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        onClick={() => handleRemoveAdditional(index)}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  );
                })}
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
                  <div>
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
                                      e.target.value
                                        ? Number(e.target.value)
                                        : 0
                                    )
                                  }
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm font-semibold">
                          sqm
                        </span>
                      </div>
                    </div>
                    <FormField
                      control={form.control}
                      name="room_size"
                      render={() => (
                        <FormItem>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Max Occupancy */}
                  <div>
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
                                      e.target.value
                                        ? Number(e.target.value)
                                        : 1
                                    )
                                  }
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm font-semibold">
                          Guest(s)
                        </span>
                      </div>
                    </div>
                    <FormField
                      control={form.control}
                      name="max_occupancy"
                      render={() => (
                        <FormItem>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Smoking Policy */}
                  <div>
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
                                <SelectTrigger className="bg-gray-200 w-40">
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
                    <FormField
                      control={form.control}
                      name="is_smoking_room"
                      render={() => (
                        <FormItem>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Bed Types */}
                  <div>
                    <div className="flex items-start gap-2">
                      <IconBed className="h-5 w-5 mt-1" />
                      <div className="flex-1">
                        <FormField
                          control={form.control}
                          name="bed_types"
                          render={() => (
                            <FormItem>
                              <FormControl>
                                <div className="space-y-2">
                                  {bedTypes.map((bedType, index) => (
                                    <div
                                      key={index}
                                      className="flex items-center gap-2"
                                    >
                                      <Input
                                        placeholder="e.g., King Bed, Queen Bed, Twin Bed"
                                        className="bg-gray-200 flex-1 min-w-[200px]"
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
                                          aria-label={`Remove bed type ${index + 1}`}
                                        >
                                          <Trash2 className="size-4" />
                                        </Button>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        <div className="flex justify-end mt-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="inline-flex items-center gap-2"
                            onClick={addBedType}
                          >
                            <PlusCircle className="size-4" /> Add Bed Type
                          </Button>
                        </div>
                      </div>
                    </div>
                    <FormField
                      control={form.control}
                      name="bed_types"
                      render={() => (
                        <FormItem>
                          <FormMessage className="whitespace-pre-line" />
                        </FormItem>
                      )}
                    />
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
              onClick={() => router.push("/hotel-listing")}
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
