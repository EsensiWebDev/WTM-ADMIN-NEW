"use client";

import { createHotelNew } from "@/app/(dashboard)/hotel-listing/actions";
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
import { useRouter } from "next/navigation";
import { useCallback, useState, useTransition } from "react";
import { useForm, UseFormReturn } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";
import { ImageFile, ImageUpload } from "../create/image-upload";

// Define the Zod schema according to specifications
export const createHotelFormSchema = z.object({
  name: z.string().min(1, "Hotel name is required"),
  photos: z
    .array(z.instanceof(File))
    .min(1, "At least one photo is required")
    .max(10, "Maximum 10 images allowed")
    .refine(
      (files) => files.every((file) => file.size <= 2 * 1024 * 1024),
      "Each image must be less than 2MB"
    ),
  sub_district: z.string().min(1, "Sub district is required"),
  district: z.string().min(1, "District is required"),
  province: z.string().min(1, "Province is required"),
  email: z.string().email("Please enter a valid email address"),
  description: z.string().min(1, "Description is required"),
  rating: z.number().int().optional(),
  nearby_places: z
    .array(
      z.object({
        distance: z.number().positive("Distance must be a positive number"),
        name: z.string().min(1, "Place name is required"),
      })
    )
    .min(1, "At least one nearby place is required"),
  facilities: z
    .array(
      z
        .string()
        .min(1, "Facility name cannot be empty")
        .refine((val) => val.trim().length > 0, "Facility name cannot be empty")
    )
    .min(1, "At least one facility is required"),
  social_medias: z
    .array(
      z.object({
        platform: z.enum(["instagram", "tiktok", "website"], {
          required_error: "Platform is required",
        }),
        // Store raw string, validate with custom logic so instagram/tiktok can be optional
        link: z.string().trim(),
      })
    )
    .superRefine((socials, ctx) => {
      // Require website entry with non-empty link
      const websiteIndex = socials.findIndex(
        (s) => s.platform === "website"
      );
      if (
        websiteIndex === -1 ||
        !socials[websiteIndex].link ||
        socials[websiteIndex].link.trim().length === 0
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Website link is required",
          path: [
            websiteIndex === -1 ? socials.length : websiteIndex,
            "link",
          ],
        });
      }

      // Validate any non-empty link as a proper URL
      socials.forEach((social, index) => {
        const value = social.link?.trim();
        if (!value) {
          // Empty is allowed for non-website platforms
          return;
        }

        try {
          // eslint-disable-next-line no-new
          new URL(value);
        } catch {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Please enter a valid URL",
            path: [index, "link"],
          });
        }
      });
    }),
});

export type CreateHotelFormValues = z.infer<typeof createHotelFormSchema>;

const NewHotelForm = () => {
  const [isPending, startTransition] = useTransition();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const form = useForm<CreateHotelFormValues>({
    resolver: zodResolver(createHotelFormSchema),
    defaultValues: {
      name: "",
      photos: [],
      sub_district: "",
      district: "",
      province: "",
      email: "",
      description: "",
      rating: 0,
      nearby_places: [],
      facilities: [],
      social_medias: [
        { link: "", platform: "instagram" },
        { link: "", platform: "tiktok" },
        { link: "", platform: "website" },
      ],
    },
  });

  // Handle image uploads from ImageUpload component
  const handleImageChange = useCallback(
    (newImages: ImageFile[]) => {
      // Extract File objects for form validation
      const files = newImages
        .filter((img) => img.file) // Only include newly uploaded files, not existing ones
        .map((img) => img.file) as File[];
      form.setValue("photos", files);
    },
    [form]
  );

  const handleNearbyUpdate = useCallback(
    (index: number, place: { name: string; distance: string }) => {
      const currentNearbyPlaces = form.getValues("nearby_places") || [];
      const updatedNearbyPlaces = [...currentNearbyPlaces];

      // Parse distance as float, default to 0 if invalid
      const distance = place.distance ? parseFloat(place.distance) : 0;

      updatedNearbyPlaces[index] = {
        name: place.name,
        distance: isNaN(distance) ? 0 : distance,
      };
      form.setValue("nearby_places", updatedNearbyPlaces);
    },
    [form]
  );

  const handleNearbyRemove = useCallback(
    (index: number) => {
      const currentNearbyPlaces = form.getValues("nearby_places") || [];
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
      { name: "", distance: 0 },
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
    async (data: CreateHotelFormValues) => {
      // Prevent duplicate submissions
      if (isSubmitting || isPending) {
        return;
      }

      setIsSubmitting(true);
      startTransition(async () => {
        try {
          // Prepare FormData object
          const formData = new FormData();

          formData.append("name", data.name);
          data.photos.forEach((photo) => {
            formData.append("photos", photo);
          });
          formData.append("sub_district", data.sub_district);
          formData.append("district", data.district);
          formData.append("province", data.province);
          formData.append("email", data.email);
          if (data.description) formData.append("description", data.description);
          if (data.rating) formData.append("rating", String(data.rating));
          formData.append("nearby_places", JSON.stringify(data.nearby_places));
          data.facilities?.forEach((facility) => {
            formData.append("facilities", facility);
          });
          formData.append("social_medias", JSON.stringify(data.social_medias));

          const result = await createHotelNew(formData);
          if (!result.success) {
            toast.error(
              result.message || "An unexpected error occurred. Please try again."
            );
            return;
          }

          form.reset();
          if (result.data)
            router.push(`/hotel-listing/${result.data.hotel_id}/edit`);
          toast.success(result.message || "Hotel created successfully!");
        } catch (error) {
          console.error("Error creating hotel:", error);
          toast.error(
            error instanceof Error
              ? error.message
              : "An unexpected error occurred. Please try again."
          );
        } finally {
          setIsSubmitting(false);
        }
      });
    },
    [form, isSubmitting, isPending, router]
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
                <Button type="submit" disabled={isPending || isSubmitting}>
                  {isPending || isSubmitting ? (
                    <>
                      <Loader className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create Hotel"
                  )}
                </Button>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Edit existing images or upload new ones. Existing images are
              marked with a blue badge.
            </p>
          </div>
          <FormField
            control={form.control}
            name="photos"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <ImageUpload
                    onImagesChange={handleImageChange}
                    maxImages={10}
                    maxSizeMB={2}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
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
                <p className="text-xs text-muted-foreground">
                  Website link is required. Social media links are optional, but if filled,
                  they must be valid URLs (for example, https://instagram.com/your-hotel).
                </p>
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
                        {/* Instagram validation error */}
                        {(() => {
                          const socialErrors =
                            form.formState.errors.social_medias as
                              | { link?: { message?: string } }[]
                              | undefined;
                          const instagramIndex =
                            field.value?.findIndex(
                              (social) => social.platform === "instagram"
                            ) ?? -1;
                          const instagramError =
                            instagramIndex >= 0
                              ? socialErrors?.[instagramIndex]?.link
                              : undefined;
                          return instagramError ? (
                            <p className="text-destructive text-sm mt-1">
                              {instagramError.message}
                            </p>
                          ) : null;
                        })()}
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
                        {/* TikTok validation error */}
                        {(() => {
                          const socialErrors =
                            form.formState.errors.social_medias as
                              | { link?: { message?: string } }[]
                              | undefined;
                          const tiktokIndex =
                            field.value?.findIndex(
                              (social) => social.platform === "tiktok"
                            ) ?? -1;
                          const tiktokError =
                            tiktokIndex >= 0
                              ? socialErrors?.[tiktokIndex]?.link
                              : undefined;
                          return tiktokError ? (
                            <p className="text-destructive text-sm mt-1">
                              {tiktokError.message}
                            </p>
                          ) : null;
                        })()}
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
                        {/* Website validation error */}
                        {(() => {
                          const socialErrors =
                            form.formState.errors.social_medias as
                              | { link?: { message?: string } }[]
                              | undefined;
                          const websiteIndex =
                            field.value?.findIndex(
                              (social) => social.platform === "website"
                            ) ?? -1;
                          const websiteError =
                            websiteIndex >= 0
                              ? socialErrors?.[websiteIndex]?.link
                              : undefined;
                          return websiteError ? (
                            <p className="text-destructive text-sm mt-1">
                              {websiteError.message}
                            </p>
                          ) : null;
                        })()}
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
              <FormField
                control={form.control}
                name="nearby_places"
                render={() => (
                  <FormItem>
                    <FormControl>
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
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Facilities */}
            <div className="flex flex-col gap-3">
              <h2 className="text-lg font-bold">Main Facilities</h2>
              <FormField
                control={form.control}
                name="facilities"
                render={() => (
                  <FormItem>
                    <FormControl>
                      <div className="space-y-3">
                        {form.watch("facilities")?.map((facility, index) => (
                          <FacilityItem
                            key={index}
                            facility={facility || ""}
                            index={index}
                            onUpdate={handleFacilityUpdate}
                            onRemove={handleFacilityRemove}
                            form={form}
                          />
                        ))}
                        <div className="flex justify-end">
                          <Button type="button" onClick={handleFacilityAdd}>
                            <PlusCircle className="size-4" /> Add List
                          </Button>
                        </div>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        </section>
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
  form: UseFormReturn<CreateHotelFormValues>;
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
      <div className="w-20">
        <div className="relative">
          <Input
            type="number"
            step="0.1"
            min="0"
            className="bg-gray-200 pr-8 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
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
  form,
}: {
  facility: string;
  index: number;
  onUpdate: (index: number, value: string) => void;
  onRemove: (index: number) => void;
  form: UseFormReturn<CreateHotelFormValues>;
}) => {
  const facilityError = form.formState.errors?.facilities?.[index];

  return (
    <div className="flex flex-col gap-1">
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
      {facilityError && (
        <p className="text-destructive text-sm">{facilityError.message}</p>
      )}
    </div>
  );
};

export default NewHotelForm;
