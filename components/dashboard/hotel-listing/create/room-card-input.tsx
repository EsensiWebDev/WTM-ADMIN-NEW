"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ConfirmationDialog } from "@/components/confirmation-dialog";
import { cn } from "@/lib/utils";
import {
  Dialog,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
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
import {
  Cigarette,
  Eye,
  EyeOff,
  PlusCircle,
  Trash2,
  Shield,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";
import { ImageUpload } from "./image-upload";
import { MultiCurrencyPriceInput } from "./multi-currency-price-input";

// Define the Zod schema for room data validation
const withoutBreakfastSchema = z.object({
  is_show: z.boolean(),
  price: z
    .number({
      required_error: "Price is required",
      invalid_type_error: "Price must be a valid number",
    })
    .nonnegative("Price cannot be negative")
    .optional(), // DEPRECATED: Keep for backward compatibility
  prices: z
    .record(z.string(), z.number().nonnegative("Price cannot be negative"))
    .refine(
      (prices) => prices && "IDR" in prices,
      "IDR price is required (mandatory currency)"
    )
    .optional(),
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
    .nonnegative("Price cannot be negative")
    .optional(), // DEPRECATED: Keep for backward compatibility
  prices: z
    .record(z.string(), z.number().nonnegative("Price cannot be negative"))
    .refine(
      (prices) => prices && "IDR" in prices,
      "IDR price is required (mandatory currency)"
    )
    .optional(),
});

const additionalSchema = z.object({
  id: z.number().int().optional(), // ID for existing additions
  name: z.string().min(1, "Additional name is required"),
  category: z.enum(["pax", "price"]),
  price: z.number().min(0, "Price must be a positive number").optional(), // DEPRECATED
  prices: z
    .record(z.string(), z.number().nonnegative("Price cannot be negative"))
    .refine(
      (prices) => !prices || "IDR" in prices,
      "IDR price is required (mandatory currency)"
    )
    .optional(),
  pax: z.number().int().positive("Pax must be at least 1").optional(),
  is_required: z.boolean(),
});

const otherPreferenceSchema = z.object({
  id: z.number().int().optional(),
  name: z.string().min(1, "Preference name is required"),
});

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
        required_error: "Room size is required",
        invalid_type_error: "Room size must be a number",
      })
      .positive("Room size is required and must be greater than 0"),
    max_occupancy: z
      .number({
        invalid_type_error: "Max occupancy must be a number",
      })
      .int("Max occupancy must be a whole number")
      .positive("Max occupancy must be at least 1"),
    bed_types: z
      .array(z.string().min(1, "Bed type cannot be empty"))
      .min(1, "At least one bed type is required")
      .refine((bedTypes) => bedTypes.every((type) => type.trim().length > 0), {
        message: "At least one bed type is required",
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
    other_preferences: z.array(otherPreferenceSchema).optional(),
    description: z
      .string({
        required_error: "Description is required",
      })
      .min(1, "Description is required")
      .refine((val) => val.trim().length > 0, "Description cannot be empty"),
    booking_limit_per_booking: z
      .number({
        invalid_type_error: "Booking limit must be a number",
      })
      .int("Booking limit must be a whole number")
      .positive("Booking limit must be at least 1")
      .nullable()
      .optional(), // Maximum number of rooms that can be booked per booking (null/undefined = no limit)
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
      // If without_breakfast is enabled, prices must have IDR > 0
      if (data.without_breakfast.is_show) {
        if (data.without_breakfast.prices && data.without_breakfast.prices.IDR) {
          return data.without_breakfast.prices.IDR > 0;
        }
        // Fallback to deprecated price field
        if (data.without_breakfast.price) {
          return data.without_breakfast.price > 0;
        }
        return false;
      }
      return true;
    },
    {
      message: "IDR price must be greater than 0 when option is enabled",
      path: ["without_breakfast.prices"],
    }
  )
  .refine(
    (data) => {
      // If with_breakfast is enabled, prices must have IDR > 0
      if (data.with_breakfast.is_show) {
        if (data.with_breakfast.prices && data.with_breakfast.prices.IDR) {
          return data.with_breakfast.prices.IDR > 0;
        }
        // Fallback to deprecated price field
        if (data.with_breakfast.price) {
          return data.with_breakfast.price > 0;
        }
        return false;
      }
      return true;
    },
    {
      message: "IDR price must be greater than 0 when option is enabled",
      path: ["with_breakfast.prices"],
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
    price?: number; // DEPRECATED
    prices?: Record<string, number>; // NEW: Multi-currency prices
    pax?: number;
    is_required?: boolean;
    category?: AdditionalServiceCategory;
  }>; // Existing additions with IDs
  onUpdate?: (room: RoomFormValues) => void;
  onRemove?: (id: string) => void;
  onCreate?: (data: RoomFormValues) => void;
  onCancelNewRoom?: () => void;
  onDirtyChange?: (isDirty: boolean) => void;
}

export function RoomCardInput({
  roomId,
  defaultValues,
  initialPhotos = [],
  initialAdditions = [],
  onUpdate,
  onRemove,
  onCreate,
  onCancelNewRoom,
  onDirtyChange,
}: RoomCardInputProps) {
  const [isPending, startTransition] = useTransition();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [preferenceInputError, setPreferenceInputError] = useState<string>("");
  const [bedTypeInputError, setBedTypeInputError] = useState<string>("");
  const [deleteAdditionalIndex, setDeleteAdditionalIndex] =
    useState<number | null>(null);
  const [pendingFormValues, setPendingFormValues] =
    useState<RoomFormValues | null>(null);

  const isNewRoom = !!onCreate && !onUpdate;
  const [isEditing, setIsEditing] = useState(isNewRoom);
  const [isCollapsed, setIsCollapsed] = useState(!isNewRoom);

  // Track original additions with their IDs for comparison
  const [originalAdditions, setOriginalAdditions] = useState(
    initialAdditions.map((addition) => ({
      id: addition.id,
      name: addition.name,
      category: (addition.category || "price") as AdditionalServiceCategory, // Default to "price" for backward compatibility
      price: addition.price,
      prices: addition.prices,
      pax: addition.pax,
      is_required: addition.is_required ?? false,
    }))
  );

  // Store original defaultValues for reset on cancel (for existing rooms only)
  const [originalDefaultValues] = useState<Partial<RoomFormValues> | undefined>(
    () => defaultValues
  );
  const [originalInitialPhotos] = useState<string[]>(() => initialPhotos);
  const [originalInitialAdditions] = useState(() => initialAdditions);

  const form = useForm<RoomFormValues>({
    resolver: zodResolver(roomFormSchema),
    defaultValues: {
      // hotel_id: defaultValues?.hotel_id || 0,
      name: defaultValues?.name || "",
      photos: [],
      unchanged_room_photos: initialPhotos,
      without_breakfast: defaultValues?.without_breakfast
        ? {
            is_show: defaultValues.without_breakfast.is_show ?? true,
            price: defaultValues.without_breakfast.price, // DEPRECATED
            prices: defaultValues.without_breakfast.prices || 
                    (defaultValues.without_breakfast.price ? { IDR: defaultValues.without_breakfast.price } : { IDR: 0 }),
          }
        : {
            is_show: true,
            price: 0,
            prices: { IDR: 0 },
          },
      with_breakfast: defaultValues?.with_breakfast
        ? {
            is_show: defaultValues.with_breakfast.is_show ?? true,
            pax: defaultValues.with_breakfast.pax ?? 2,
            price: defaultValues.with_breakfast.price, // DEPRECATED
            prices: defaultValues.with_breakfast.prices || 
                    (defaultValues.with_breakfast.price ? { IDR: defaultValues.with_breakfast.price } : { IDR: 0 }),
          }
        : {
            is_show: true,
            pax: 2,
            price: 0,
            prices: { IDR: 0 },
          },
      room_size: defaultValues?.room_size && defaultValues.room_size > 0 
        ? defaultValues.room_size 
        : undefined,
      max_occupancy: defaultValues?.max_occupancy || 1,
      bed_types: defaultValues?.bed_types && defaultValues.bed_types.length > 0 
        ? defaultValues.bed_types.filter(bt => bt.trim() !== "")
        : [],
      is_smoking_room: defaultValues?.is_smoking_room || false,
      booking_limit_per_booking: defaultValues?.booking_limit_per_booking ?? null,
      additional:
        (initialAdditions || []).map((addition) => ({
          id: addition.id,
          name: addition.name,
          category: (addition.category || "price") as AdditionalServiceCategory,
          price: addition.price, // DEPRECATED
          prices: addition.prices || (addition.price ? { IDR: addition.price } : { IDR: 0 }),
          pax: addition.pax,
          is_required: addition.is_required ?? false,
        })) as Array<{
          id?: number;
          name: string;
          category: AdditionalServiceCategory;
          price?: number; // DEPRECATED
          prices?: Record<string, number>;
          pax?: number;
          is_required: boolean;
        }>,
      other_preferences:
        (defaultValues?.other_preferences as
          | Array<{ id?: number; name: string }>
          | undefined) || [],
      unchanged_additions_ids:
        initialAdditions.map((addition) => addition.id) || [],
      description: defaultValues?.description || "",
    },
  });

  // Reset form when props change (after successful update)
  useEffect(() => {
    // Do not reset while creating a brand-new room; it wipes user typing
    if (isNewRoom) return;

    const additions = initialAdditions.map((addition) => ({
      id: addition.id,
      name: addition.name,
      category: (addition.category || "price") as AdditionalServiceCategory,
      price: addition.price, // DEPRECATED
      prices: addition.prices || (addition.price ? { IDR: addition.price } : { IDR: 0 }),
      pax: addition.pax,
      is_required: addition.is_required ?? false,
    }));

    setOriginalAdditions(additions);

    form.reset({
      name: defaultValues?.name || "",
      photos: [],
      unchanged_room_photos: initialPhotos,
      without_breakfast: defaultValues?.without_breakfast
        ? {
            is_show: defaultValues.without_breakfast.is_show ?? true,
            price: defaultValues.without_breakfast.price, // DEPRECATED
            prices: defaultValues.without_breakfast.prices || 
                    (defaultValues.without_breakfast.price ? { IDR: defaultValues.without_breakfast.price } : { IDR: 0 }),
          }
        : {
            is_show: true,
            price: 0,
            prices: { IDR: 0 },
          },
      with_breakfast: defaultValues?.with_breakfast
        ? {
            is_show: defaultValues.with_breakfast.is_show ?? true,
            pax: defaultValues.with_breakfast.pax ?? 2,
            price: defaultValues.with_breakfast.price, // DEPRECATED
            prices: defaultValues.with_breakfast.prices || 
                    (defaultValues.with_breakfast.price ? { IDR: defaultValues.with_breakfast.price } : { IDR: 0 }),
          }
        : {
            is_show: true,
            pax: 2,
            price: 0,
            prices: { IDR: 0 },
          },
      room_size: defaultValues?.room_size && defaultValues.room_size > 0 
        ? defaultValues.room_size 
        : undefined,
      max_occupancy: defaultValues?.max_occupancy || 1,
      bed_types: defaultValues?.bed_types && defaultValues.bed_types.length > 0 
        ? defaultValues.bed_types.filter(bt => bt.trim() !== "")
        : [],
      is_smoking_room: defaultValues?.is_smoking_room || false,
      booking_limit_per_booking: defaultValues?.booking_limit_per_booking ?? null,
      additional: additions,
      other_preferences:
        (defaultValues?.other_preferences as
          | Array<{ id?: number; name: string }>
          | undefined) || [],
      unchanged_additions_ids:
        initialAdditions.map((addition) => addition.id) || [],
      description: defaultValues?.description || "",
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultValues, initialPhotos, initialAdditions, isNewRoom]);

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

  // Watch for price changes in additional services to track modifications
  useEffect(() => {
    if (!watchedAdditional || watchedAdditional.length === 0) return;

    watchedAdditional.forEach((addition) => {
      if (addition?.id !== undefined) {
        const originalAddition = originalAdditions.find(
          (a) => a.id === addition.id
        );

        if (originalAddition) {
          // Compare prices object
          const originalPrices = originalAddition.prices || (originalAddition.price ? { IDR: originalAddition.price } : {});
          const currentPrices = addition.prices || (addition.price ? { IDR: addition.price } : {});
          
          // Check if prices have changed by comparing JSON strings
          const pricesChanged = JSON.stringify(originalPrices) !== JSON.stringify(currentPrices);
          
          // Check if other fields have changed
          const otherFieldsChanged = 
            originalAddition.name !== addition.name ||
            originalAddition.price !== addition.price;

          const unchangedIds = form.getValues("unchanged_additions_ids") || [];
          const isModified = pricesChanged || otherFieldsChanged;

          if (isModified && unchangedIds.includes(addition.id)) {
            // Remove from unchanged list if it was modified
            form.setValue(
              "unchanged_additions_ids",
              unchangedIds.filter((id) => id !== addition.id),
              { shouldDirty: false }
            );
          } else if (!isModified && !unchangedIds.includes(addition.id)) {
            // Add back to unchanged list if it matches original
            form.setValue("unchanged_additions_ids", [
              ...unchangedIds,
              addition.id,
            ], { shouldDirty: false });
          }
        }
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watchedAdditional]);

  const {
    fields: otherPreferenceFields,
    append: appendPreference,
    remove: removePreference,
  } = useFieldArray({
    control: form.control,
    name: "other_preferences",
  });

  // Handle bed types as a regular form field since useFieldArray doesn't work with it
  const bedTypes = form.watch("bed_types") || [];

  // Track dirty state and bubble up to parent (guard against loops)
  const { isDirty } = form.formState;
  const lastReportedDirtyRef = useRef<boolean | null>(null);

  useEffect(() => {
    if (!onDirtyChange) return;
    if (lastReportedDirtyRef.current === isDirty) return;
    lastReportedDirtyRef.current = isDirty;
    onDirtyChange(isDirty);
  }, [isDirty, onDirtyChange]);

  // Safety guard: newly added room cards should always be editable
  useEffect(() => {
    if (isNewRoom) {
      // New room cards must always be editable and expanded
      if (!isEditing) setIsEditing(true);
      if (isCollapsed) setIsCollapsed(false);
    }
  }, [isNewRoom, isEditing, isCollapsed]);

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
      // Show helper error when all bed types are removed
      if (newBedTypes.length === 0) {
        setBedTypeInputError("At least one bed type is required");
      }
    },
    [bedTypes, form]
  );

  const addBedType = useCallback((bedTypeName?: string) => {
    if (bedTypeName !== undefined) {
      const trimmedName = bedTypeName.trim();
      if (trimmedName) {
        // Remove any empty/whitespace-only entries before adding the new one
        const cleanedExisting = bedTypes.filter(
          (bt) => bt.trim().length > 0
        );
        const newBedTypes = [...cleanedExisting, trimmedName];
        form.setValue("bed_types", newBedTypes);
        setBedTypeInputError("");
        return true;
      } else {
        setBedTypeInputError("Bed type cannot be empty");
        return false;
      }
    } else {
      // No value provided (shouldn't normally happen) – surface a friendly error
      setBedTypeInputError("Bed type cannot be empty");
      return false;
    }
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
      category: "price" as AdditionalServiceCategory,
      price: 0, // DEPRECATED
      prices: { IDR: 0 },
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
      field: "name" | "price" | "category" | "pax" | "is_required",
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

  // Handle form submission - open confirmation dialog first
  const handleSubmit = useCallback((data: RoomFormValues) => {
    setPendingFormValues(data);
    setIsConfirmDialogOpen(true);
  }, []);

  const handleConfirmSave = useCallback(() => {
    if (!pendingFormValues) return;

    startTransition(async () => {
      try {
        if (onCreate) {
          await onCreate(pendingFormValues);
        } else if (onUpdate) {
          await onUpdate(pendingFormValues);
        } else {
          // Default behavior - show a toast
          toast.success("Room data saved successfully!");
        }
      } finally {
        setIsConfirmDialogOpen(false);
        setPendingFormValues(null);
      }
    });
  }, [onCreate, onUpdate, pendingFormValues]);

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

  const handleCancel = useCallback(() => {
    // For new rooms, remove the card
    if (isNewRoom && onCancelNewRoom) {
      onCancelNewRoom();
      return;
    }

    // For existing rooms, reset to original values and exit edit mode
    const additions = originalInitialAdditions.map((addition) => ({
      id: addition.id,
      name: addition.name,
      category: (addition.category || "price") as AdditionalServiceCategory,
      price: addition.price, // DEPRECATED
      prices: addition.prices || (addition.price ? { IDR: addition.price } : { IDR: 0 }),
      pax: addition.pax,
      is_required: addition.is_required ?? false,
    })) as Array<{
      id?: number;
      name: string;
      category: AdditionalServiceCategory;
      price?: number; // DEPRECATED
      prices?: Record<string, number>;
      pax?: number;
      is_required: boolean;
    }>;

    setOriginalAdditions(
      originalInitialAdditions.map((addition) => ({
        id: addition.id,
        name: addition.name,
        category: (addition.category || "price") as AdditionalServiceCategory,
        price: addition.price,
        prices: addition.prices,
        pax: addition.pax,
        is_required: addition.is_required ?? false,
      }))
    );

    form.reset({
      name: originalDefaultValues?.name || "",
      photos: [],
      unchanged_room_photos: originalInitialPhotos,
      without_breakfast: originalDefaultValues?.without_breakfast
        ? {
            is_show: originalDefaultValues.without_breakfast.is_show ?? true,
            price: originalDefaultValues.without_breakfast.price, // DEPRECATED
            prices: originalDefaultValues.without_breakfast.prices || 
                    (originalDefaultValues.without_breakfast.price ? { IDR: originalDefaultValues.without_breakfast.price } : { IDR: 0 }),
          }
        : {
            is_show: true,
            price: 0,
            prices: { IDR: 0 },
          },
      with_breakfast: originalDefaultValues?.with_breakfast
        ? {
            is_show: originalDefaultValues.with_breakfast.is_show ?? true,
            pax: originalDefaultValues.with_breakfast.pax ?? 2,
            price: originalDefaultValues.with_breakfast.price, // DEPRECATED
            prices: originalDefaultValues.with_breakfast.prices || 
                    (originalDefaultValues.with_breakfast.price ? { IDR: originalDefaultValues.with_breakfast.price } : { IDR: 0 }),
          }
        : {
            is_show: true,
            pax: 2,
            price: 0,
            prices: { IDR: 0 },
          },
      room_size: originalDefaultValues?.room_size || 0,
      max_occupancy: originalDefaultValues?.max_occupancy || 1,
      bed_types: originalDefaultValues?.bed_types && originalDefaultValues.bed_types.length > 0 
        ? originalDefaultValues.bed_types.filter(bt => bt.trim() !== "")
        : [],
      is_smoking_room: originalDefaultValues?.is_smoking_room || false,
      booking_limit_per_booking: originalDefaultValues?.booking_limit_per_booking ?? null,
      additional: additions,
      other_preferences:
        (originalDefaultValues?.other_preferences as
          | Array<{ id?: number; name: string }>
          | undefined) || [],
      unchanged_additions_ids:
        originalInitialAdditions.map((addition) => addition.id) || [],
      description: originalDefaultValues?.description || "",
    });
    setIsEditing(false);
  }, [
    form,
    isNewRoom,
    onCancelNewRoom,
    originalDefaultValues,
    originalInitialAdditions,
    originalInitialPhotos,
    setOriginalAdditions,
  ]);

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
                <>
                  {!isNewRoom && !isEditing && (
                    <Button
                      type="button"
                      variant="outline"
                      className="inline-flex items-center gap-2"
                      onClick={() => {
                        setIsEditing(true);
                        setIsCollapsed(false);
                      }}
                    >
                      Edit Room
                    </Button>
                  )}
                  <Button
                    type="button"
                    variant="destructive"
                    disabled={isPending}
                    className="inline-flex items-center gap-2"
                    onClick={() => setIsDeleteDialogOpen(true)}
                  >
                    <Trash2 className="size-4" />
                    <span className="text-sm font-medium">Delete Room Type</span>
                  </Button>

                  <Dialog
                    open={isDeleteDialogOpen}
                    onOpenChange={setIsDeleteDialogOpen}
                  >
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Delete Room Type</DialogTitle>
                        <DialogDescription>
                          Are you sure you want to delete this room type? This
                          action cannot be undone.
                        </DialogDescription>
                      </DialogHeader>
                      <DialogFooter className="flex flex-row justify-end gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setIsDeleteDialogOpen(false)}
                        >
                          Cancel
                        </Button>
                        <Button
                          type="button"
                          variant="destructive"
                          disabled={isPending}
                          onClick={() => {
                            startTransition(async () => {
                              await onRemove(roomId);
                              setIsDeleteDialogOpen(false);
                            });
                          }}
                        >
                          Yes, delete
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </>
              )}
            </div>
          </div>
          {/* Collapse/expand toggle for existing rooms */}
          {!isNewRoom && (
            <div className="col-span-full flex items-center justify-between pb-2">
              <button
                type="button"
                className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
                onClick={() => setIsCollapsed((prev) => !prev)}
              >
                {isCollapsed ? (
                  <ChevronRight className="mr-1 h-4 w-4" />
                ) : (
                  <ChevronDown className="mr-1 h-4 w-4" />
                )}
                <span>{isCollapsed ? "Show room details" : "Hide room details"}</span>
              </button>
            </div>
          )}

          {!isCollapsed && (
            <>
              <div
                className={cn(
                  "col-span-full grid grid-cols-1 gap-6 lg:col-span-4",
                  // Disable interactions only when editing is off for existing rooms
                  !isEditing && !isNewRoom && "pointer-events-none opacity-60"
                )}
              >
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
              <div
                className={cn(
                  "col-span-full mt-6 flex flex-col lg:col-span-6 lg:mt-0",
                  // Disable interactions only when editing is off for existing rooms
                  !isEditing && !isNewRoom && "pointer-events-none opacity-60"
                )}
              >
                <div className="flex h-full flex-col space-y-2">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Room Options</h3>

                {/* Without Breakfast Option */}
                <div className="rounded-lg border bg-card p-4">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">Without Breakfast</h4>
                      <Button
                        variant={"ghost"}
                        type="button"
                        size={"icon"}
                        onClick={toggleWithoutBreakfastVisibility}
                        className="h-8 w-8"
                      >
                        {isWithoutBreakfast.is_show ? (
                          <Eye className="size-4" />
                        ) : (
                          <EyeOff className="size-4" />
                        )}
                      </Button>
                    </div>
                    <div className="pl-0">
                      <MultiCurrencyPriceInput
                        form={form}
                        fieldName="without_breakfast.prices"
                        label=""
                        required={false}
                      />
                    </div>
                  </div>
                </div>

                {/* With Breakfast Option */}
                <div className="rounded-lg border bg-card p-4">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">With Breakfast</h4>
                      <Button
                        variant={"ghost"}
                        type="button"
                        size={"icon"}
                        onClick={toggleWithBreakfastVisibility}
                        className="h-8 w-8"
                      >
                        {isWithBreakfast.is_show ? (
                          <Eye className="size-4" />
                        ) : (
                          <EyeOff className="size-4" />
                        )}
                      </Button>
                    </div>
                    <div className="space-y-4 pl-0">
                      <MultiCurrencyPriceInput
                        form={form}
                        fieldName="with_breakfast.prices"
                        label=""
                        required={false}
                      />
                      <div className="w-40">
                        <FormField
                          control={form.control}
                          name={`with_breakfast.pax`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm font-medium">Pax</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  className="bg-gray-200"
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
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Additional Services</h3>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="inline-flex items-center gap-2 h-8"
                    onClick={handleAddAdditional}
                  >
                    <PlusCircle className="size-3.5" /> Add Service
                  </Button>
                </div>
                <div className="max-h-[600px] overflow-y-auto pr-2 space-y-2.5">
                  {additionalFields.map((field, index) => {
                    const watchedCategory = form.watch(
                      `additional.${index}.category`
                    ) as AdditionalServiceCategory | undefined;
                    const category = watchedCategory || "price";

                    return (
                      <div
                        key={field.id}
                        className="rounded-lg border bg-card p-4 space-y-4"
                      >
                        <div className="grid grid-cols-[1fr_auto] gap-2 items-start">
                          <div className="grid grid-cols-1 md:grid-cols-[1fr_140px] gap-2">
                            <FormField
                              control={form.control}
                              name={`additional.${index}.name`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-xs font-medium">Service Name</FormLabel>
                                  <FormControl>
                                    <Input
                                      className="bg-gray-200 h-8 text-sm"
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
                                  <FormMessage className="text-xs" />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name={`additional.${index}.category`}
                              render={({ field }) => {
                                // Ensure category is always set to a valid value
                                const categoryValue = field.value || "price";
                                
                                return (
                                  <FormItem>
                                    <FormLabel className="text-xs font-medium">Category</FormLabel>
                                    <Select
                                      value={categoryValue}
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
                                        <SelectTrigger className="bg-gray-200 h-8 text-sm">
                                          <SelectValue placeholder="Category" />
                                        </SelectTrigger>
                                      </FormControl>
                                      <SelectContent>
                                        <SelectItem value="price">Price</SelectItem>
                                        <SelectItem value="pax">Pax</SelectItem>
                                      </SelectContent>
                                    </Select>
                                    <FormMessage className="text-xs" />
                                  </FormItem>
                                );
                              }}
                            />
                          </div>
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            onClick={() => setDeleteAdditionalIndex(index)}
                            className="shrink-0 h-7 w-7 mt-6"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-2 items-end">
                          {category === "price" ? (
                            <div className="md:col-span-1">
                              <MultiCurrencyPriceInput
                                form={form}
                                fieldName={`additional.${index}.prices` as any}
                                label=""
                                required={false}
                              />
                            </div>
                          ) : (
                            <div className="w-full md:w-32">
                              <FormField
                                control={form.control}
                                name={`additional.${index}.pax`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel className="text-xs font-medium">Pax</FormLabel>
                                    <FormControl>
                                      <Input
                                        type="number"
                                        className="bg-gray-200 h-8 text-sm"
                                        placeholder="Pax"
                                        {...field}
                                        value={field.value || ""}
                                        onChange={(e) => {
                                          const value = e.target.value
                                            ? Number(e.target.value)
                                            : undefined;
                                          field.onChange(value);
                                          handleAdditionChange(
                                            index,
                                            "pax",
                                            value || 1
                                          );
                                        }}
                                      />
                                    </FormControl>
                                    <FormMessage className="text-xs" />
                                  </FormItem>
                                )}
                              />
                            </div>
                          )}
                          <div className="flex items-center justify-end md:justify-start">
                            <FormField
                              control={form.control}
                              name={`additional.${index}.is_required`}
                              render={({ field }) => (
                                <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                                  <FormControl>
                                    <Switch
                                      checked={field.value || false}
                                      onCheckedChange={(checked) => {
                                        field.onChange(checked);
                                        handleAdditionChange(
                                          index,
                                          "is_required",
                                          checked as boolean
                                        );
                                      }}
                                    />
                                  </FormControl>
                                  <Label className="text-xs font-normal cursor-pointer">
                                    Required
                                  </Label>
                                </FormItem>
                              )}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  {additionalFields.length === 0 && (
                    <div className="text-center py-8 text-sm text-muted-foreground border border-dashed rounded-lg">
                      No additional services added yet. Click "Add Service" to get started.
                    </div>
                  )}
                </div>
                
                {/* Delete Additional Service Confirmation Dialog */}
                <Dialog
                  open={deleteAdditionalIndex !== null}
                  onOpenChange={(open) => {
                    if (!open) setDeleteAdditionalIndex(null);
                  }}
                >
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Delete Additional Service</DialogTitle>
                      <DialogDescription>
                        Are you sure you want to delete this additional service? This action cannot be undone.
                        {deleteAdditionalIndex !== null && watchedAdditional && watchedAdditional[deleteAdditionalIndex]?.name && (
                          <span className="block mt-1 font-medium text-foreground">
                            Service: "{watchedAdditional[deleteAdditionalIndex].name}"
                          </span>
                        )}
                      </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="flex flex-row justify-end gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setDeleteAdditionalIndex(null)}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="button"
                        variant="destructive"
                        disabled={isPending}
                        onClick={() => {
                          if (deleteAdditionalIndex !== null) {
                            handleRemoveAdditional(deleteAdditionalIndex);
                            setDeleteAdditionalIndex(null);
                          }
                        }}
                      >
                        Yes, delete
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>

              {/* Other Preferences */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Other Preferences</h3>
                <div className="rounded-lg border bg-card p-4">
                  <div className="space-y-3">
                    {/* Add new preference input */}
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center gap-2">
                        <FormField
                          control={form.control}
                          name="other_preferences"
                          render={() => (
                            <FormItem className="flex-1">
                              <FormControl>
                                <Input
                                  className={`bg-gray-200 h-9 ${
                                    preferenceInputError
                                      ? "border-destructive focus-visible:ring-destructive"
                                      : ""
                                  }`}
                                  placeholder="Enter preference name and press Enter (e.g., High Floor, Sea View)"
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                      e.preventDefault();
                                      const input = e.currentTarget;
                                      const value = input.value.trim();
                                      if (value) {
                                        appendPreference({ name: value });
                                        input.value = "";
                                        setPreferenceInputError("");
                                      } else {
                                        setPreferenceInputError(
                                          "Preference name cannot be empty"
                                        );
                                      }
                                    }
                                  }}
                                  onChange={() => {
                                    if (preferenceInputError) {
                                      setPreferenceInputError("");
                                    }
                                  }}
                                />
                              </FormControl>
                              {preferenceInputError && (
                                <p className="text-sm text-destructive mt-1">
                                  {preferenceInputError}
                                </p>
                              )}
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <Button
                          type="button"
                          className="inline-flex items-center gap-2 shrink-0 h-9"
                          variant="outline"
                          onClick={() => {
                            const input = document.querySelector<HTMLInputElement>(
                              'input[placeholder*="Enter preference name"]'
                            );
                            if (!input) return;
                            
                            const value = input.value.trim();
                            if (value) {
                              appendPreference({ name: value });
                              input.value = "";
                              setPreferenceInputError("");
                            } else {
                              setPreferenceInputError(
                                "Preference name cannot be empty"
                              );
                            }
                          }}
                        >
                          <PlusCircle className="size-4" /> Add
                        </Button>
                      </div>
                    </div>
                    
                    {/* Display existing preferences as tags */}
                    {otherPreferenceFields.length > 0 && (
                      <div className="flex flex-wrap gap-2 pt-2 border-t">
                        {otherPreferenceFields.map((field, index) => (
                          <FormField
                            key={field.id}
                            control={form.control}
                            name={`other_preferences.${index}.name`}
                            render={({ field }) => (
                              <FormItem>
                                <div className="flex items-center gap-1.5 bg-secondary/50 hover:bg-secondary px-3 py-1.5 rounded-md border">
                                  <span className="text-sm">{field.value || "Untitled"}</span>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => removePreference(index)}
                                    className="h-5 w-5 shrink-0 hover:bg-destructive hover:text-destructive-foreground"
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </div>
                                <FormControl>
                                  <input type="hidden" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Bed Types */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Bed Type</h3>
                <div className="rounded-lg border bg-card p-4">
                  <div className="space-y-3">
                    {/* Add new bed type input */}
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center gap-2">
                        <FormField
                          control={form.control}
                          name="bed_types"
                          render={() => (
                            <FormItem className="flex-1">
                              <FormControl>
                                <Input
                                  className={`bg-gray-200 h-9 ${
                                    bedTypeInputError
                                      ? "border-destructive focus-visible:ring-destructive"
                                      : ""
                                  }`}
                                  placeholder="Enter bed type and press Enter (e.g., King Size, Queen Size)"
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                      e.preventDefault();
                                      const input = e.currentTarget;
                                      const value = input.value.trim();
                                      if (value) {
                                        addBedType(value);
                                        input.value = "";
                                        setBedTypeInputError("");
                                      } else {
                                        setBedTypeInputError(
                                          "Bed type cannot be empty"
                                        );
                                      }
                                    }
                                  }}
                                  onChange={() => {
                                    if (bedTypeInputError) {
                                      setBedTypeInputError("");
                                    }
                                  }}
                                />
                              </FormControl>
                              {bedTypeInputError && (
                                <p className="text-sm text-destructive mt-1">
                                  {bedTypeInputError}
                                </p>
                              )}
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <Button
                          type="button"
                          className="inline-flex items-center gap-2 shrink-0 h-9"
                          variant="outline"
                          onClick={() => {
                            const input = document.querySelector<HTMLInputElement>(
                              'input[placeholder*="Enter bed type"]'
                            );
                            if (!input) return;
                            
                            const value = input.value.trim();
                            if (value) {
                              addBedType(value);
                              input.value = "";
                              setBedTypeInputError("");
                            } else {
                              setBedTypeInputError(
                                "Bed type cannot be empty"
                              );
                            }
                          }}
                        >
                          <PlusCircle className="size-4" /> Add
                        </Button>
                      </div>
                    </div>
                    
                    {/* Display existing bed types as chips */}
                    {bedTypes.length > 0 && bedTypes.some(bt => bt.trim() !== "") && (
                      <div className="flex flex-wrap gap-2 pt-2 border-t">
                        {bedTypes.map((bedType, index) => {
                          if (bedType.trim() === "") return null;
                          return (
                            <div
                              key={index}
                              className="flex items-center gap-1.5 bg-secondary/50 hover:bg-secondary px-3 py-1.5 rounded-md border"
                            >
                              <span className="text-sm">{bedType}</span>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => removeBedType(index)}
                                className="h-5 w-5 shrink-0 hover:bg-destructive hover:text-destructive-foreground"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          );
                        })}
                      </div>
                    )}
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

              {/* Booking Limit Per Booking */}
              <div className="space-y-4">
                <div className="rounded-lg border bg-card p-4">
                  <FormField
                    control={form.control}
                    name="booking_limit_per_booking"
                    render={({ field }) => {
                      const isLimitEnabled = field.value !== null && field.value !== undefined;
                      
                      return (
                        <FormItem>
                          <div className="flex flex-row items-center justify-between space-y-0">
                            <div className="space-y-0.5 flex-1">
                              <div className="flex items-center gap-2">
                                <Shield className="h-5 w-5 text-muted-foreground" />
                                <FormLabel className="text-base font-semibold">
                                  Booking Limit Per Booking
                                </FormLabel>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                Set maximum number of rooms agents can book per booking
                              </p>
                            </div>
                            <FormControl>
                              <Switch
                                checked={isLimitEnabled}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    // Enable limit with default value of 10
                                    field.onChange(10);
                                  } else {
                                    // Disable limit
                                    field.onChange(null);
                                  }
                                }}
                              />
                            </FormControl>
                          </div>
                          
                          {isLimitEnabled && (
                            <div className="mt-4 pt-4 border-t">
                              <FormLabel className="text-sm font-medium mb-2 block">
                                Maximum Rooms
                              </FormLabel>
                              <div className="relative">
                                <FormControl>
                                  <Input
                                    type="number"
                                    placeholder="Enter limit"
                                    className="bg-gray-200 w-32 pr-20"
                                    value={field.value ?? ""}
                                    min={1}
                                    onChange={(e) => {
                                      const value = e.target.value;
                                      if (value === "") {
                                        field.onChange(null);
                                      } else {
                                        const numValue = Number(value);
                                        if (numValue > 0) {
                                          field.onChange(numValue);
                                        }
                                      }
                                    }}
                                  />
                                </FormControl>
                                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm font-semibold whitespace-nowrap">
                                  Room(s)
                                </span>
                              </div>
                              <p className="text-xs text-muted-foreground mt-2">
                                Agents will not be able to book more than this number of rooms per booking
                              </p>
                            </div>
                          )}
                          
                          <FormMessage className="mt-2" />
                        </FormItem>
                      );
                    }}
                  />
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
                                  placeholder="Room size"
                                  className="bg-gray-200 w-24 pr-11"
                                  {...field}
                                  value={field.value || ""}
                                  onChange={(e) => {
                                    const value = e.target.value;
                                    if (value === "" || value === null || value === undefined) {
                                      field.onChange(undefined);
                                    } else {
                                      const numValue = Number(value);
                                      field.onChange(isNaN(numValue) ? undefined : numValue);
                                    }
                                  }}
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
                                  className="bg-gray-200 w-32 pr-20"
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
                        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm font-semibold whitespace-nowrap">
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
                </div>
              </div>

              {/* Description */}
              <div className="space-y-4">
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
        </>
      )}

      {/* Form Actions */}
      <div className="col-span-full flex justify-end space-x-4 pt-6">
        <Button
          type="button"
          variant="outline"
          disabled={!isEditing}
          onClick={() => setIsCancelDialogOpen(true)}
        >
          Cancel
        </Button>
        <Dialog
          open={isCancelDialogOpen}
          onOpenChange={setIsCancelDialogOpen}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {isNewRoom ? "Discard New Room Type" : "Discard Changes"}
              </DialogTitle>
              <DialogDescription>
                {isNewRoom
                  ? "Are you sure you want to cancel and remove this new room type? All unsaved data for this room will be lost."
                  : "Are you sure you want to cancel your changes to this room type? All unsaved changes will be lost."}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex flex-row justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsCancelDialogOpen(false)}
              >
                Go back
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={() => {
                  handleCancel();
                  setIsCancelDialogOpen(false);
                }}
              >
                Yes, discard
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        <Button type="submit" disabled={isPending || !isEditing}>
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
      <ConfirmationDialog
        open={isConfirmDialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            setIsConfirmDialogOpen(false);
            setPendingFormValues(null);
          }
        }}
        onConfirm={handleConfirmSave}
        onCancel={() => {
          setIsConfirmDialogOpen(false);
          setPendingFormValues(null);
        }}
        isLoading={isPending}
        title={isNewRoom ? "Create Room Type" : "Update Room Type"}
        description={
          isNewRoom
            ? "Are you sure you want to create this new room type with the provided configuration?"
            : "Are you sure you want to save the changes to this room type?"
        }
      />
        </Card>
      </form>
    </Form>
  );
}
