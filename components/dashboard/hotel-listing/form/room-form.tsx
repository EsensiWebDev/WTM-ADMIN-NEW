"use client";

import {
  createHotelRoomType,
  removeHotelRoomType,
  updateHotelRoomType,
} from "@/app/(dashboard)/hotel-listing/actions";
import { RoomDetail } from "@/app/(dashboard)/hotel-listing/types";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { RoomCardInput, RoomFormValues } from "../create/room-card-input";

const RoomForm = ({
  hotelId,
  rooms,
}: {
  hotelId: string;
  rooms?: RoomDetail[];
}) => {
  // State to manage the list of rooms
  const [roomList, setRoomList] = useState<RoomDetail[]>(rooms || []);
  const [newRoomCounter, setNewRoomCounter] = useState(0);

  const addNewRoom = () => {
    // Create a new empty room object with a temporary ID
    const newRoom: RoomDetail = {
      id: -(newRoomCounter + 1), // Use negative IDs for new rooms
      name: "",
      photos: [],
      without_breakfast: { price: 0, is_show: true },
      with_breakfast: { price: 0, pax: 2, is_show: true },
      room_size: 0,
      max_occupancy: 2,
      bed_types: [""],
      is_smoking_room: false,
      additional: [],
      description: "",
    };

    setRoomList([...roomList, newRoom]);
    setNewRoomCounter(newRoomCounter + 1);
  };

  const onCreate = async (data: RoomFormValues) => {
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

    const { success, message } = await createHotelRoomType(formData);

    if (!success) {
      toast.error(message || "Failed to create room type");
      return;
    }

    toast.success(message || "Room type created");
  };

  const onRemove = async (roomId: string) => {
    const { success, message } = await removeHotelRoomType(roomId, hotelId);

    if (!success) {
      toast.error(message || "Failed to remove room type");
      return;
    }

    // Update local state to remove the deleted room from the UI
    setRoomList((prevRoomList) =>
      prevRoomList.filter((room) => String(room.id) !== roomId)
    );

    toast.success(message || "Room type removed");
  };

  // Create a wrapper function that includes roomId for the update operation
  const createUpdateHandler = (roomId: string) => (data: RoomFormValues) => {
    const formData = new FormData();
    // formData.append("hotel_id", hotelId);
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

    toast.promise(updateHotelRoomType(roomId, formData), {
      loading: "Updating room type...",
      success: ({ message }) => message,
      error: ({ message }) => message,
    });
  };

  useEffect(() => {
    setRoomList(rooms || []);
  }, [rooms]);

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
        {roomList.length === 0 && <p>No rooms found.</p>}
        {roomList.map((room) => (
          <RoomCardInput
            key={room.id}
            roomId={String(room.id)}
            defaultValues={{
              name: room.name,
              // @ts-ignore TODO: fix this
              photos: room.photos || [],
              without_breakfast: room.without_breakfast,
              with_breakfast: room.with_breakfast,
              room_size: room.room_size,
              max_occupancy: room.max_occupancy,
              bed_types: room.bed_types,
              is_smoking_room: room.is_smoking_room,
              additional: room.additional?.map((item) => ({
                name: item.name,
                price: item.price,
              })),
              description: room.description,
            }}
            {
              ...(room.id > 0
                ? { onUpdate: createUpdateHandler(String(room.id)), onRemove } // For existing rooms (positive IDs from database)
                : { onCreate }) // For new rooms (negative temporary IDs)
            }
          />
        ))}
      </div>
    </section>
  );
};

export default RoomForm;
