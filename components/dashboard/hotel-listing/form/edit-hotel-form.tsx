"use client";

import { updateHotel } from "@/app/(dashboard)/hotel-listing/actions";
import { HotelDetail } from "@/app/(dashboard)/hotel-listing/types";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { StarRating } from "@/components/ui/star-rating";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  IconBrandInstagramFilled,
  IconBrandTiktokFilled,
  IconWorld,
} from "@tabler/icons-react";
import { Loader, MapPin, PlusCircle, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState, useTransition } from "react";
import { useForm, UseFormReturn } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";
import { ImageFile, ImageUpload } from "../create/image-upload";

// Define the Zod schema according to specifications
export const editHotelFormSchema = z.object({
  name: z.string().min(1, "Hotel name is required"),
  photos: z
    .array(z.instanceof(File))
    .max(10, "Maximum 10 images allowed")
    .refine(
      (files) => files.every((file) => file.size <= 2 * 1024 * 1024),
      "Each image must be less than 2MB"
    ),
  unchanged_hotel_photos: z.array(z.string()).optional(),
  sub_district: z.string().min(1, "Sub district is required"),
  district: z.string().min(1, "District is required"),
  province: z.string().min(1, "Province is required"),
  email: z.string().email("Please enter a valid email address"),
  description: z.string().optional(),
  rating: z.number().int().optional(),
  nearby_places: z
    .array(
      z.object({
        distance: z.number().positive("Distance must be a positive number"),
        name: z.string().min(1, "Place name is required"),
        id: z.number().int().optional(), // ID for existing places
      })
    )
    .optional(),
  unchanged_nearby_place_ids: z.array(z.number().int()).optional(),
  facilities: z.array(z.string()).optional(),
  social_medias: z.array(
    z.object({
      link: z.string().min(1, "Link is required"),
      platform: z.string().min(1, "Platform is required"),
    })
  ),
});

export type EditHotelFormValues = z.infer<typeof editHotelFormSchema>;

interface EditHotelFormProps {
  hotel: HotelDetail;
  hotelId: string;
}

const EditHotelForm = ({ hotel, hotelId }: EditHotelFormProps) => {
  const [isPending, startTransition] = useTransition();

  // Track original nearby places with their IDs for comparison
  const [originalNearbyPlaces, setOriginalNearbyPlaces] = useState(
    hotel.nearby_place?.map((place) => ({
      id: place.id,
      name: place.name,
      distance: place.radius,
    })) || []
  );

  const form = useForm<EditHotelFormValues>({
    resolver: zodResolver(editHotelFormSchema),
    defaultValues: {
      name: hotel.name || "",
      photos: [],
      unchanged_hotel_photos: hotel.photos || [],
      sub_district: hotel.sub_district || "",
      district: hotel.city || "",
      province: hotel.province || "",
      email: hotel.email || "",
      description: hotel.description || "",
      rating: hotel.rating || 0,
      nearby_places:
        hotel.nearby_place?.map((place) => ({
          id: place.id,
          name: place.name,
          distance: place.radius,
        })) || [],
      unchanged_nearby_place_ids:
        hotel.nearby_place?.map((place) => place.id) || [],
      facilities: hotel.facilities || [],
      social_medias: hotel.social_media || [
        { link: "", platform: "instagram" },
        { link: "", platform: "tiktok" },
        { link: "", platform: "website" },
      ],
    },
  });

  // Reset form when hotel data changes (after successful update)
  useEffect(() => {
    const nearbyPlaces =
      hotel.nearby_place?.map((place) => ({
        id: place.id,
        name: place.name,
        distance: place.radius,
      })) || [];

    setOriginalNearbyPlaces(nearbyPlaces);

    form.reset({
      name: hotel.name || "",
      photos: [],
      unchanged_hotel_photos: hotel.photos || [],
      sub_district: hotel.sub_district || "",
      district: hotel.city || "",
      province: hotel.province || "",
      email: hotel.email || "",
      description: hotel.description || "",
      rating: hotel.rating || 0,
      nearby_places: nearbyPlaces,
      unchanged_nearby_place_ids:
        hotel.nearby_place?.map((place) => place.id) || [],
      facilities: hotel.facilities || [],
      social_medias: hotel.social_media || [],
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hotel]);

  // Handle image uploads from ImageUpload component
  const handleImageChange = useCallback(
    (newImages: ImageFile[]) => {
      // Separate new uploads from existing unchanged images
      const newFiles = newImages
        .filter((img) => img.file && !img.isExisting) // Only include newly uploaded files
        .map((img) => img.file) as File[];

      // Map existing images back to their original URLs from hotel.photos
      // ImageUpload component creates IDs like 'existing-0', 'existing-1', etc.
      const unchangedUrls = newImages
        .filter((img) => img.isExisting) // Only include existing images that weren't removed
        .map((img) => {
          // Extract the index from the ID (e.g., 'existing-0' -> 0)
          const indexMatch = img.id.match(/^existing-(\d+)$/);
          if (indexMatch && hotel.photos) {
            const index = parseInt(indexMatch[1], 10);
            // Return the original URL from hotel.photos without modification
            return hotel.photos[index];
          }
          return null;
        })
        .filter((url): url is string => url !== null); // Remove null values

      form.setValue("photos", newFiles);
      form.setValue("unchanged_hotel_photos", unchangedUrls);
    },
    [form, hotel.photos]
  );

  const handleNearbyUpdate = useCallback(
    (index: number, place: { name: string; distance: string }) => {
      const currentNearbyPlaces = form.getValues("nearby_places") || [];
      const updatedNearbyPlaces = [...currentNearbyPlaces];

      // Parse distance as float, default to 0 if invalid
      const distance = place.distance ? parseFloat(place.distance) : 0;

      // Check if this is an existing place (has ID)
      const existingPlace = updatedNearbyPlaces[index];
      const placeId = existingPlace?.id;

      // Check if the place was modified
      if (placeId !== undefined) {
        const originalPlace = originalNearbyPlaces.find(
          (p) => p.id === placeId
        );
        const isModified =
          originalPlace &&
          (originalPlace.name !== place.name ||
            originalPlace.distance !== distance);

        if (isModified) {
          // Remove from unchanged list if it was modified
          const unchangedIds =
            form.getValues("unchanged_nearby_place_ids") || [];
          form.setValue(
            "unchanged_nearby_place_ids",
            unchangedIds.filter((id) => id !== placeId)
          );
        } else {
          // Add back to unchanged list if it matches original
          const unchangedIds =
            form.getValues("unchanged_nearby_place_ids") || [];
          if (!unchangedIds.includes(placeId)) {
            form.setValue("unchanged_nearby_place_ids", [
              ...unchangedIds,
              placeId,
            ]);
          }
        }
      }

      updatedNearbyPlaces[index] = {
        name: place.name,
        distance: isNaN(distance) ? 0 : distance,
        id: placeId, // Preserve ID if it exists
      };
      form.setValue("nearby_places", updatedNearbyPlaces);
    },
    [form, originalNearbyPlaces]
  );

  const handleNearbyRemove = useCallback(
    (index: number) => {
      const currentNearbyPlaces = form.getValues("nearby_places") || [];
      const placeToRemove = currentNearbyPlaces[index];

      // If the place has an ID, remove it from unchanged list
      if (placeToRemove?.id !== undefined) {
        const unchangedIds = form.getValues("unchanged_nearby_place_ids") || [];
        form.setValue(
          "unchanged_nearby_place_ids",
          unchangedIds.filter((id) => id !== placeToRemove.id)
        );
      }

      const updatedNearbyPlaces = currentNearbyPlaces.filter(
        (_, i) => i !== index
      );
      form.setValue("nearby_places", updatedNearbyPlaces);
    },
    [form]
  );

  const handleNearbyAdd = useCallback(() => {
    const currentNearbyPlaces = form.getValues("nearby_places") || [];
    form.setValue("nearby_places", [
      ...currentNearbyPlaces,
      { name: "", distance: 0 }, // New places don't have ID
    ]);
  }, [form]);

  const handleFacilityUpdate = useCallback(
    (index: number, value: string) => {
      const currentFacilities = form.getValues("facilities") || [];
      const updatedFacilities = [...currentFacilities];
      updatedFacilities[index] = value;
      form.setValue("facilities", updatedFacilities);
    },
    [form]
  );

  const handleFacilityRemove = useCallback(
    (index: number) => {
      const currentFacilities = form.getValues("facilities") || [];
      const updatedFacilities = currentFacilities.filter((_, i) => i !== index);
      form.setValue("facilities", updatedFacilities);
    },
    [form]
  );

  const handleFacilityAdd = useCallback(() => {
    const currentFacilities = form.getValues("facilities") || [];
    form.setValue("facilities", [...currentFacilities, ""]);
  }, [form]);

  // Handle form submission
  const onSubmit = useCallback(
    async (data: EditHotelFormValues) => {
      startTransition(async () => {
        // Prepare FormData object
        const formData = new FormData();

        formData.append("name", data.name);
        data.photos.forEach((photo) => {
          formData.append("photos", photo);
        });
        if (
          data.unchanged_hotel_photos &&
          data.unchanged_hotel_photos.length > 0
        ) {
          data.unchanged_hotel_photos.forEach((photo) => {
            formData.append("unchanged_hotel_photos", photo);
          });
        }
        formData.append("sub_district", data.sub_district);
        formData.append("district", data.district);
        formData.append("province", data.province);
        formData.append("email", data.email);
        if (data.description) formData.append("description", data.description);
        if (data.rating) formData.append("rating", String(data.rating));

        // Process nearby places
        const unchangedIds = data.unchanged_nearby_place_ids || [];
        const allNearbyPlaces = data.nearby_places || [];

        // Filter out unchanged places and prepare only new/modified ones
        const nearbyPlacesToSend = allNearbyPlaces
          .filter((place) => {
            // Include if it's a new place (no ID) or modified (not in unchanged list)
            return place.id === undefined || !unchangedIds.includes(place.id);
          })
          .map((place) => {
            // Remove ID from all new/modified places - backend treats them equally
            return { name: place.name, distance: place.distance };
          });

        formData.append("nearby_places", JSON.stringify(nearbyPlacesToSend));

        // Send unchanged IDs separately
        if (unchangedIds.length > 0) {
          unchangedIds.forEach((id) => {
            formData.append("unchanged_nearby_place_ids", String(id));
          });
        }

        data.facilities?.forEach((facility) => {
          formData.append("facilities", facility);
        });
        formData.append("social_medias", JSON.stringify(data.social_medias));

        const result = await updateHotel(hotelId, formData);

        if (result.success) {
          toast.success(result.message || "Hotel updated successfully!");
        } else {
          toast.error(
            result.message || "An unexpected error occurred. Please try again."
          );
        }
      });
    },
    [hotelId]
  );

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <section className="space-y-6">
          <div className="space-y-2">
            <div className="flex justify-between">
              <h2 className="text-2xl font-bold">Upload Hotel Images</h2>

              <div className="flex justify-end space-x-4">
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
                      <Loader className="mr-2 h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    "Update Hotel"
                  )}
                </Button>
              </div>
            </div>

            <p className="text-sm text-muted-foreground">
              Edit existing images or upload new ones. Existing images are
              marked with a blue badge.
            </p>
          </div>
          <ImageUpload
            onImagesChange={handleImageChange}
            maxImages={10}
            maxSizeMB={2}
            initialImages={hotel.photos || []}
          />
        </section>

        <section>
          <div className="mb-10 grid grid-cols-1 gap-8 sm:grid-cols-3">
            {/* Rating and Basic Info */}
            <div className="flex flex-col gap-2">
              <FormField
                control={form.control}
                name="rating"
                render={({ field }) => (
                  <FormItem>
                    {/* <FormLabel>Rating</FormLabel> */}
                    <FormControl>
                      <StarRating
                        value={field.value || 0}
                        onChange={(value) => field.onChange(value)}
                        maxStars={5}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    {/* <FormLabel>Hotel Name*</FormLabel> */}
                    <FormControl>
                      <Input
                        placeholder="Enter hotel name"
                        className="bg-gray-200"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex gap-2">
                <FormField
                  control={form.control}
                  name="sub_district"
                  render={({ field }) => (
                    <FormItem>
                      {/* <FormLabel>Sub District*</FormLabel> */}
                      <FormControl>
                        <Input
                          placeholder="Enter sub district"
                          className="bg-gray-200"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="district"
                  render={({ field }) => (
                    <FormItem>
                      {/* <FormLabel>District*</FormLabel> */}
                      <FormControl>
                        <Input
                          placeholder="Enter district"
                          className="bg-gray-200"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="province"
                  render={({ field }) => (
                    <FormItem>
                      {/* <FormLabel>Province*</FormLabel> */}
                      <FormControl>
                        <Input
                          placeholder="Enter province"
                          className="bg-gray-200"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    {/* <FormLabel>Email *</FormLabel> */}
                    <FormControl>
                      <Input
                        type="email"
                        className="bg-gray-200"
                        placeholder="Enter hotel email address"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Hotel Details */}
          <div className="mb-10 grid grid-cols-1 gap-8 sm:grid-cols-3">
            {/* Description & Benefit */}
            <div className="flex flex-col gap-3">
              <h2 className="text-lg font-bold">Description & Benefit</h2>
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Textarea
                        className="h-full bg-gray-200"
                        placeholder="Insert Hotel Description here"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Social Media and Website Links */}
              <div className="flex flex-col gap-3 mt-4">
                <h3 className="text-md font-semibold">
                  Social Media & Website
                </h3>
                <div className="flex items-center gap-2">
                  <div className="bg-primary rounded-full p-1">
                    <IconBrandInstagramFilled className="h-5 w-5 text-white" />
                  </div>
                  <FormField
                    control={form.control}
                    name="social_medias"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormControl>
                          <Input
                            placeholder="Instagram Link"
                            className="bg-gray-200"
                            value={
                              field.value?.find(
                                (social) => social.platform === "instagram"
                              )?.link || ""
                            }
                            onChange={(e) => {
                              const currentSocialMedias = field.value || [];
                              const instagramIndex =
                                currentSocialMedias.findIndex(
                                  (social) => social.platform === "instagram"
                                );

                              if (instagramIndex >= 0) {
                                const updated = [...currentSocialMedias];
                                updated[instagramIndex] = {
                                  ...updated[instagramIndex],
                                  link: e.target.value,
                                };
                                field.onChange(updated);
                              } else {
                                field.onChange([
                                  ...currentSocialMedias,
                                  {
                                    platform: "instagram",
                                    link: e.target.value,
                                  },
                                ]);
                              }
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <div className="bg-primary rounded-full p-1">
                    <IconBrandTiktokFilled className="h-5 w-5 text-white" />
                  </div>
                  <FormField
                    control={form.control}
                    name="social_medias"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormControl>
                          <Input
                            placeholder="TikTok Link"
                            className="bg-gray-200"
                            value={
                              field.value?.find(
                                (social) => social.platform === "tiktok"
                              )?.link || ""
                            }
                            onChange={(e) => {
                              const currentSocialMedias = field.value || [];
                              const tiktokIndex = currentSocialMedias.findIndex(
                                (social) => social.platform === "tiktok"
                              );

                              if (tiktokIndex >= 0) {
                                const updated = [...currentSocialMedias];
                                updated[tiktokIndex] = {
                                  ...updated[tiktokIndex],
                                  link: e.target.value,
                                };
                                field.onChange(updated);
                              } else {
                                field.onChange([
                                  ...currentSocialMedias,
                                  { platform: "tiktok", link: e.target.value },
                                ]);
                              }
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex items-center gap-2">
                  <div className="bg-primary rounded-full p-1">
                    <IconWorld className="h-5 w-5 text-white" />
                  </div>
                  <FormField
                    control={form.control}
                    name="social_medias"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormControl>
                          <Input
                            placeholder="Website Link"
                            className="bg-gray-200"
                            value={
                              field.value?.find(
                                (social) => social.platform === "website"
                              )?.link || ""
                            }
                            onChange={(e) => {
                              const currentSocialMedias = field.value || [];
                              const websiteIndex =
                                currentSocialMedias.findIndex(
                                  (social) => social.platform === "website"
                                );

                              if (websiteIndex >= 0) {
                                const updated = [...currentSocialMedias];
                                updated[websiteIndex] = {
                                  ...updated[websiteIndex],
                                  link: e.target.value,
                                };
                                field.onChange(updated);
                              } else {
                                field.onChange([
                                  ...currentSocialMedias,
                                  { platform: "website", link: e.target.value },
                                ]);
                              }
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </div>

            {/* Nearby Places */}
            <div className="flex flex-col gap-3">
              <h2 className="text-lg font-bold">Near Us</h2>
              <div className="space-y-3">
                {form.watch("nearby_places")?.map((place, index) => (
                  <NearbyPlaceItem
                    key={index}
                    place={{
                      name: place.name || "",
                      distance: place.distance?.toString() || "",
                    }}
                    index={index}
                    onUpdate={handleNearbyUpdate}
                    onRemove={handleNearbyRemove}
                    form={form}
                  />
                ))}
                <div className="flex justify-end">
                  <Button
                    type="button"
                    className="inline-flex items-center gap-2"
                    onClick={handleNearbyAdd}
                  >
                    <PlusCircle className="size-4" /> Add List
                  </Button>
                </div>
              </div>
            </div>

            {/* Facilities */}
            <div className="flex flex-col gap-3">
              <h2 className="text-lg font-bold">Main Facilities</h2>
              <div className="space-y-3">
                {form.watch("facilities")?.map((facility, index) => (
                  <FacilityItem
                    key={index}
                    facility={facility || ""}
                    index={index}
                    onUpdate={handleFacilityUpdate}
                    onRemove={handleFacilityRemove}
                  />
                ))}
                <div className="flex justify-end">
                  <Button type="button" onClick={handleFacilityAdd}>
                    <PlusCircle className="size-4" /> Add List
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Form Actions */}
        <div className="flex justify-end space-x-4 pb-6 border-b"></div>
      </form>
    </Form>
  );
};

// Nearby place item component
const NearbyPlaceItem = ({
  place,
  index,
  onUpdate,
  onRemove,
  form,
}: {
  place: { name: string; distance: string };
  index: number;
  onUpdate: (index: number, place: { name: string; distance: string }) => void;
  onRemove: (index: number) => void;
  form: UseFormReturn<EditHotelFormValues>;
}) => {
  const nameError = form.formState.errors?.nearby_places?.[index]?.name;
  const distanceError = form.formState.errors?.nearby_places?.[index]?.distance;

  return (
    <div className="flex items-start gap-2">
      <MapPin size={16} className="mt-2.5" />
      <div className="flex-1">
        <Input
          className="bg-gray-200"
          placeholder="Location Name"
          value={place.name}
          onChange={(e) => onUpdate(index, { ...place, name: e.target.value })}
        />
        {nameError && (
          <p className="text-destructive text-sm mt-1">{nameError.message}</p>
        )}
      </div>
      <div className="w-24">
        <div className="relative">
          <Input
            type="number"
            step="0.1"
            min="0"
            className="bg-gray-200 pr-8 "
            placeholder="Radius"
            value={place.distance}
            onChange={(e) =>
              onUpdate(index, { ...place, distance: e.target.value })
            }
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground pointer-events-none">
            m
          </span>
        </div>
        {distanceError && (
          <p className="text-destructive text-sm mt-1">
            {distanceError.message}
          </p>
        )}
      </div>
      <Button
        type="button"
        variant="destructive"
        size="icon"
        aria-label={`Remove near place ${index + 1}`}
        onClick={() => onRemove(index)}
        className="mt-0.5"
      >
        <Trash2 className="size-4" />
      </Button>
    </div>
  );
};

// Facility item component
const FacilityItem = ({
  facility,
  index,
  onUpdate,
  onRemove,
}: {
  facility: string;
  index: number;
  onUpdate: (index: number, value: string) => void;
  onRemove: (index: number) => void;
}) => (
  <div className="flex items-center gap-2">
    <Input
      className="bg-gray-200"
      placeholder="Insert Hotel Facilities"
      value={facility}
      onChange={(e) => onUpdate(index, e.target.value)}
    />
    <Button
      type="button"
      variant="destructive"
      size="icon"
      aria-label={`Remove facility ${index + 1}`}
      onClick={() => onRemove(index)}
    >
      <Trash2 className="size-4" />
    </Button>
  </div>
);

export default EditHotelForm;
