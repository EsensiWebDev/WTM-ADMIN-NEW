"use client";

import { createHotelRoomType } from "@/app/(dashboard)/hotel-listing/actions";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { RoomCardInput, RoomFormValues } from "../create/room-card-input";

const RoomForm = ({ hotelId }: { hotelId: string }) => {
  const addNewRoom = () => {};
  const removeRoom = (roomId: string) => {};
  const updateRoom = (roomId: string, updatedRoom: any) => {};

  const onSubmit = (data: RoomFormValues) => {
    const formData = new FormData();
    formData.append("hotel_id", hotelId);
    formData.append("name", data.name);
    data.photos.forEach((photo) => {
      formData.append("photos", photo);
    });
    formData.append(
      "without_breakfast",
      JSON.stringify(data.without_breakfast)
    );
    formData.append("with_breakfast", JSON.stringify(data.with_breakfast));
    formData.append("room_size", String(data.room_size));
    formData.append("max_occupancy", String(data.max_occupancy));
    data.bed_types.forEach((bedType) => {
      formData.append("bed_types", bedType);
    });
    formData.append("is_smoking_room", String(data.is_smoking_room));
    formData.append("additional", JSON.stringify(data.additional));
    formData.append("description", data.description || "");

    toast.promise(createHotelRoomType(formData), {
      loading: "Creating room type...",
      success: ({ message }) => message,
      error: ({ message }) => message,
    });
  };

  return (
    <section className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Room Configuration</h2>
        <Button
          type="button"
          onClick={addNewRoom}
          className="inline-flex items-center gap-2"
        >
          Add new room
        </Button>
      </div>

      <div className="space-y-6">
        <RoomCardInput
          onUpdate={(updatedRoom) => updateRoom("test", updatedRoom)}
          onRemove={removeRoom}
          onSubmit={onSubmit}
        />
      </div>
    </section>
  );
};

export default RoomForm;
