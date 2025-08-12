"use client";

import {
  HotelDetail,
  HotelInfoProps,
  ImageFile,
  Room,
} from "@/app/(dashboard)/hotel-listing/create/types";
import { ImageUpload } from "@/components/dashboard/hotel-listing/create/image-upload";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { HotelInfoUpload } from "./info-upload";
import { RoomCardInput } from "./room-card-input";

interface CreateHotelFormProps {
  hotel: HotelDetail;
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

export function CreateHotelForm({ hotel }: CreateHotelFormProps) {
  // Form state
  const [images, setImages] = useState<ImageFile[]>([]);
  const [rooms, setRooms] = useState<Room[]>(hotel.rooms);
  const [hotelInfo, setHotelInfo] = useState<HotelInfoProps>({
    name: hotel.name,
    location: hotel.location,
    rating: hotel.rating,
    description: hotel.description,
    facilities: hotel.facilities,
    nearby: hotel.nearby,
    price: hotel.price,
    isPromoted: hotel.isPromoted || false,
    promoText: hotel.promoText || "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

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
        alert(errors.join("\n"));
        return;
      }

      setIsSubmitting(true);

      try {
        // Prepare form data
        const formData = new FormData();

        // Add images
        images.forEach((image, index) => {
          formData.append("images", image.file);
          if (image.isMain) {
            formData.append("mainImageIndex", index.toString());
          }
        });

        // Add hotel data
        formData.append("hotelInfo", JSON.stringify(hotelInfo));
        formData.append("rooms", JSON.stringify(rooms));

        // Create complete data object
        const completeHotelData = {
          images: images.map((img) => ({
            id: img.id,
            name: img.file.name,
            isMain: img.isMain,
            size: img.file.size,
            type: img.file.type,
          })),
          hotelInfo: {
            ...hotelInfo,
            rating: Number(hotelInfo.rating),
            price: Number(hotelInfo.price),
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
            createdAt: new Date().toISOString(),
          },
        };

        // Log data for debugging
        console.log("=== COMPLETE FORM DATA ===", completeHotelData);

        // TODO: Replace with actual API call
        // const response = await fetch('/api/hotels', {
        //   method: 'POST',
        //   body: formData
        // });

        alert("Hotel created successfully!");
      } catch (error) {
        console.error("Error creating hotel:", error);
        alert("Error creating hotel. Please try again.");
      } finally {
        setIsSubmitting(false);
      }
    },
    [images, rooms, hotelInfo, totalRooms, totalImages]
  );

  const handleCancel = useCallback(() => {
    window.history.back();
  }, []);

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Image Upload Section */}
      <section className="space-y-6">
        <ImageUpload
          onImagesChange={handleImagesChange}
          maxImages={10}
          maxSizeMB={5}
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
        <Button type="submit" disabled={isSubmitting || !formIsValid}>
          {isSubmitting ? "Creating..." : "Create Hotel"}
        </Button>
      </section>
    </form>
  );
}
