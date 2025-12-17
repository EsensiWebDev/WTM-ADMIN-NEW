"use client";

import {
  createHotelRoomType,
  removeHotelRoomType,
  updateHotelRoomType,
} from "@/app/(dashboard)/hotel-listing/actions";
import {
  OtherPreference,
  RoomDetail,
} from "@/app/(dashboard)/hotel-listing/types";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { RoomCardInput, RoomFormValues } from "../create/room-card-input";

const RoomForm = ({
  hotelId,
  rooms,
}: {
  hotelId: string;
  rooms?: RoomDetail[];
}) => {
  const router = useRouter();
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

    // Process additions - only send new ones (without ID)
    const newAdditions = (data.additional || [])
      .filter((addition) => addition.id === undefined)
      .map((addition) => ({
        name: addition.name,
        category: addition.category,
        price: addition.price, // DEPRECATED: Keep for backward compatibility
        prices: addition.prices,
        pax: addition.pax,
        is_required: addition.is_required,
      }));

    formData.append("additional", JSON.stringify(newAdditions));

    // Process other preferences for creation - send only non-empty names
    const otherPreferences =
      (data.other_preferences || [])
        .map((pref) => pref.name.trim())
        .filter((name) => name.length > 0);

    formData.append("other_preferences", JSON.stringify(otherPreferences));
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

  const handleCancelNewRoom = (tempRoomId: number) => {
    setRoomList((prevRoomList) =>
      prevRoomList.filter((room) => room.id !== tempRoomId)
    );
  };

  // Create a wrapper function that includes roomId for the update operation
  const createUpdateHandler =
    (roomId: string) => async (data: RoomFormValues) => {
      const formData = new FormData();
      // formData.append("hotel_id", hotelId);
      formData.append("name", data.name);
      data.photos.forEach((photo) => {
        formData.append("photos", photo);
      });

      // Send unchanged room photos
      if (data.unchanged_room_photos && data.unchanged_room_photos.length > 0) {
        data.unchanged_room_photos.forEach((photo) => {
          formData.append("unchanged_room_photos", photo);
        });
      }

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

      // Process additions
      const unchangedIds = data.unchanged_additions_ids || [];
      const allAdditions = data.additional || [];

      // Filter out unchanged additions and prepare only new/modified ones
      const additionsToSend = allAdditions
        .filter((addition) => {
          // Include if it's a new addition (no ID) or modified (not in unchanged list)
          return (
            addition.id === undefined || !unchangedIds.includes(addition.id)
          );
        })
        .map((addition) => {
          // Remove ID from all new/modified additions - backend treats them equally
          return {
            name: addition.name,
            category: addition.category,
            price: addition.price, // DEPRECATED: Keep for backward compatibility
            prices: addition.prices,
            pax: addition.pax,
            is_required: addition.is_required,
          };
        });

      formData.append("additional", JSON.stringify(additionsToSend));

      // Process other preferences for update
      const otherPreferences = data.other_preferences || [];

      const unchangedPreferenceIds = otherPreferences
        .map((pref) => pref.id)
        .filter((id): id is number => typeof id === "number");

      const newPreferences = otherPreferences
        .filter((pref) => pref.id === undefined && pref.name.trim() !== "")
        .map((pref) => pref.name.trim());

      formData.append("other_preferences", JSON.stringify(newPreferences));

      if (unchangedPreferenceIds.length > 0) {
        unchangedPreferenceIds.forEach((id) => {
          formData.append("unchanged_preference_ids", String(id));
        });
      }

      // Send unchanged addition IDs separately
      if (unchangedIds.length > 0) {
        unchangedIds.forEach((id) => {
          formData.append("unchanged_additions_ids", String(id));
        });
      }

      formData.append("description", data.description || "");

      const result = await updateHotelRoomType(roomId, formData, hotelId);

      if (result.success) {
        toast.success(result.message);
        // Refresh the page to get updated data with all currencies
        router.refresh();
      } else {
        toast.error(result.message);
      }
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
          Add New Room
        </Button>
      </div>

      <div className="space-y-6">
        {roomList.length === 0 && <p>No rooms found.</p>}
        {roomList.map((room) => {
          // Create a unique key that changes when room data changes
          const roomKey = `${room.id}-${room.name}-${
            room.photos?.length || 0
          }-${room.additional?.length || 0}-${room.room_size}`;

          return (
            <RoomCardInput
              key={roomKey}
              roomId={String(room.id)}
              initialPhotos={room.photos || []}
              initialAdditions={room.additional || []}
              defaultValues={{
                name: room.name,
                without_breakfast: room.without_breakfast,
                with_breakfast: room.with_breakfast,
                room_size: room.room_size,
                max_occupancy: room.max_occupancy,
                bed_types: room.bed_types,
                is_smoking_room: room.is_smoking_room,
                description: room.description,
                other_preferences: (
                  (room as { other_preferences?: OtherPreference[] })
                    .other_preferences ?? []
                ).map((pref: OtherPreference) => ({
                  id: pref.id,
                  name: pref.name,
                })),
              }}
              {
                ...(room.id > 0
                  ? { onUpdate: createUpdateHandler(String(room.id)), onRemove } // For existing rooms (positive IDs from database)
                  : {
                      onCreate,
                      onCancelNewRoom: () => handleCancelNewRoom(room.id),
                    }) // For new rooms (negative temporary IDs)
              }
            />
          );
        })}
      </div>
    </section>
  );
};

export default RoomForm;
