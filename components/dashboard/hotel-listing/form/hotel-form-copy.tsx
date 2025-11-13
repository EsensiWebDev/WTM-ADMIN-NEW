"use client";

import {
  createHotel,
  updateHotel,
} from "@/app/(dashboard)/hotel-listing/actions";
import {
  HotelDetail,
  HotelInfoProps,
  Room,
} from "@/app/(dashboard)/hotel-listing/create_copy/types";
import {
  ImageFile,
  ImageUpload,
} from "@/components/dashboard/hotel-listing/create_copy/image-upload";
import { Button } from "@/components/ui/button";
import { Loader, PlusCircle } from "lucide-react";
import { useCallback, useMemo, useState, useTransition } from "react";
import { toast } from "sonner";
import { HotelInfoUpload } from "../create_copy/info-upload";
import { RoomCardInput } from "../create_copy/room-card-input";

interface CreateHotelFormProps {
  hotel?: HotelDetail;
}

// Default room template
const createDefaultRoom = (): Room => ({
  id: `room-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
  name: "",
  images: [],
  features: [],
  options: [
    { label: "Without Breakfast", price: 0 },
    { label: "With Breakfast", price: 0 },
  ],
});

// Form validation
const validateForm = (
  images: ImageFile[],
  rooms: Room[],
  hotelInfo: HotelInfoProps
) => {
  const errors: string[] = [];

  if (images.length === 0) errors.push("Please upload at least one image");
  if (rooms.length === 0) errors.push("Please add at least one room");
  if (!hotelInfo.name.trim()) errors.push("Please enter hotel name");
  if (!hotelInfo.location.trim()) errors.push("Please enter hotel location");
  if (!hotelInfo.description.trim())
    errors.push("Please enter hotel description");

  return errors;
};

export function HotelForm({ hotel }: CreateHotelFormProps) {
  // Default empty values for new hotel creation
  const defaultHotelInfo: HotelInfoProps = {
    name: "",
    location: "",
    rating: 0,
    description: "",
    facilities: [],
    nearby: [],
    instagram: "",
    tiktok: "",
    website: "",
  };

  // Form state
  const [images, setImages] = useState<ImageFile[]>([]);
  const [rooms, setRooms] = useState<Room[]>(
    hotel?.rooms || [createDefaultRoom()]
  );
  const [hotelInfo, setHotelInfo] = useState<HotelInfoProps>(
    hotel
      ? {
          name: hotel.name,
          location: hotel.location,
          rating: hotel.rating,
          description: hotel.description,
          facilities: hotel.facilities,
          nearby: hotel.nearby,
          instagram: hotel.instagram || "",
          tiktok: hotel.tiktok || "",
          website: hotel.website || "",
        }
      : defaultHotelInfo
  );

  // Transition state for form submission
  const [isPending, startTransition] = useTransition();

  // Memoized values
  const formIsValid = useMemo(() => {
    return (
      images.length > 0 &&
      rooms.length > 0 &&
      hotelInfo.name.trim() &&
      hotelInfo.location.trim() &&
      hotelInfo.description.trim()
    );
  }, [
    images.length,
    rooms.length,
    hotelInfo.name,
    hotelInfo.location,
    hotelInfo.description,
  ]);

  const totalRooms = useMemo(() => rooms.length, [rooms.length]);
  const totalImages = useMemo(() => images.length, [images.length]);

  // Event handlers
  const handleImagesChange = useCallback((newImages: ImageFile[]) => {
    setImages(newImages);
  }, []);

  const handleHotelInfoChange = useCallback((newHotelInfo: HotelInfoProps) => {
    setHotelInfo(newHotelInfo);
  }, []);

  const addNewRoom = useCallback(() => {
    setRooms((prev) => [...prev, createDefaultRoom()]);
  }, []);

  const removeRoom = useCallback((id: string) => {
    setRooms((prev) => prev.filter((room) => room.id !== id));
  }, []);

  const updateRoom = useCallback((id: string, updatedRoom: Room) => {
    setRooms((prev) =>
      prev.map((room) => (room.id === id ? { ...updatedRoom, id } : room))
    );
  }, []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      // Validate form
      const errors = validateForm(images, rooms, hotelInfo);
      if (errors.length > 0) {
        toast.error(errors.join("\n"));
        return;
      }

      // Confirm submission
      // const confirmed = window.confirm(
      //   `Are you sure you want to create hotel "${hotelInfo.name}" with ${totalRooms} rooms and ${totalImages} images?`
      // );

      // if (!confirmed) {
      //   return;
      // }

      startTransition(async () => {
        try {
          // Prepare form data
          const formData = new FormData();

          // Add images (only newly uploaded files)
          const newImages = images.filter((image) => image.file);
          const existingImages = images.filter((image) => image.isExisting);

          newImages.forEach((image, index) => {
            if (image.file) {
              formData.append("images", image.file);
              if (image.isMain) {
                formData.append("mainImageIndex", index.toString());
              }
            }
          });

          // Add existing images info
          if (existingImages.length > 0) {
            formData.append(
              "existingImages",
              JSON.stringify(
                existingImages.map((img) => ({
                  id: img.id,
                  url: img.preview,
                  isMain: img.isMain,
                }))
              )
            );
          }

          // Add hotel data
          formData.append("hotelInfo", JSON.stringify(hotelInfo));
          formData.append("rooms", JSON.stringify(rooms));

          // Create complete data object for logging
          const completeHotelData = {
            newImages: newImages.map((img) => ({
              id: img.id,
              name: img.file?.name || "unknown",
              isMain: img.isMain,
              size: img.file?.size || 0,
              type: img.file?.type || "unknown",
            })),
            existingImages: existingImages.map((img) => ({
              id: img.id,
              url: img.preview,
              isMain: img.isMain,
            })),
            hotelInfo: {
              ...hotelInfo,
              rating: Number(hotelInfo.rating),
            },
            rooms: rooms.map((room) => ({
              ...room,
              options: room.options.map((option) => ({
                ...option,
                price: Number(option.price),
              })),
            })),
            summary: {
              totalRooms,
              totalImages,
              totalNewImages: newImages.length,
              totalExistingImages: existingImages.length,
              isEdit: !!hotel,
              createdAt: new Date().toISOString(),
            },
          };

          // Log data for debugging
          console.log(
            `=== ${hotel ? "UPDATE" : "CREATE"} HOTEL FORM DATA ===`,
            completeHotelData
          );

          // Call the appropriate action based on mode
          let result;
          if (hotel?.id) {
            // Update existing hotel
            result = await updateHotel(hotel.id, formData);
          } else {
            // Create new hotel
            result = await createHotel(formData);
          }

          const { success, error } = result;

          if (!success) {
            toast.error(
              error || `Failed to ${hotel ? "update" : "create"} hotel`
            );
            return;
          }

          toast.success(
            hotel
              ? "Hotel updated successfully!"
              : "Hotel created successfully!"
          );

          // Reset form only for create mode
          if (!hotel) {
            setImages([]);
            setRooms([createDefaultRoom()]);
            setHotelInfo(defaultHotelInfo);
          }

          // Show success message with more details
          toast.success(
            hotel
              ? `Hotel "${hotelInfo.name}" updated successfully with ${totalRooms} rooms and ${totalImages} images!`
              : `Hotel "${hotelInfo.name}" created successfully with ${totalRooms} rooms and ${totalImages} images!`
          );
        } catch (error) {
          console.error(
            `Error ${hotel ? "updating" : "creating"} hotel:`,
            error
          );
          toast.error(
            `An unexpected error occurred while ${
              hotel ? "updating" : "creating"
            } the hotel. Please try again.`
          );
        }
      });
    },
    [images, rooms, hotelInfo, totalRooms, totalImages, hotel]
  );

  const handleCancel = useCallback(() => {
    window.history.back();
  }, []);

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Image Upload Section */}
      <section className="space-y-6">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold">
            {hotel ? "Hotel Images" : "Upload Hotel Images"}
          </h2>
          {hotel && (
            <p className="text-sm text-muted-foreground">
              Edit existing images or upload new ones. Existing images are
              marked with a blue badge.
            </p>
          )}
        </div>
        <ImageUpload
          onImagesChange={handleImagesChange}
          maxImages={10}
          maxSizeMB={5}
          initialImages={hotel?.images || []}
        />
      </section>

      {/* Hotel Info Section */}
      <section>
        <HotelInfoUpload {...hotelInfo} onChange={handleHotelInfoChange} />
      </section>

      {/* Room Configuration Section */}
      <section className="space-y-8">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Room Configuration</h2>
          <Button
            type="button"
            onClick={addNewRoom}
            className="inline-flex items-center gap-2"
          >
            <PlusCircle className="size-4" />
            Add New Room
          </Button>
        </div>

        {rooms.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
            <p className="text-gray-500 mb-4">No rooms added yet</p>
            <Button
              type="button"
              onClick={addNewRoom}
              variant="outline"
              className="inline-flex items-center gap-2"
            >
              <PlusCircle className="size-4" />
              Add Your First Room
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {rooms.map((room) => (
              <RoomCardInput
                key={room.id}
                {...room}
                onUpdate={(updatedRoom) => updateRoom(room.id, updatedRoom)}
                onRemove={removeRoom}
              />
            ))}
          </div>
        )}
      </section>

      {/* Form Actions */}
      <section className="flex justify-end space-x-4 pt-6 border-t">
        <Button type="button" variant="outline" onClick={handleCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isPending || !formIsValid}>
          {isPending ? (
            <>
              <Loader className="mr-2 h-4 w-4 animate-spin" />
              {hotel ? "Updating..." : "Creating..."}
            </>
          ) : hotel ? (
            "Update Hotel"
          ) : (
            "Create Hotel"
          )}
        </Button>
      </section>
    </form>
  );
}
