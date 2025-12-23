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
import { useEffect, useRef, useState } from "react";
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
  const [dirtyMap, setDirtyMap] = useState<Record<string, boolean>>({});
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [lastAddedRoomId, setLastAddedRoomId] = useState<number | null>(null);
  const roomRefs = useRef<Record<string, HTMLDivElement | null>>({});

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
      additional: [], // Will be populated when user adds services
      description: "",
      booking_limit_per_booking: null,
    };

    setRoomList((prev) => [...prev, newRoom]);
    setNewRoomCounter((prev) => prev + 1);
    setLastAddedRoomId(newRoom.id);
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
    // Filter out empty bed types and trim before submission
    const validBedTypes = data.bed_types
      .map((bedType) => bedType.trim())
      .filter((bedType) => bedType.length > 0);
    validBedTypes.forEach((bedType) => {
      formData.append("bed_types", bedType);
    });
    formData.append("is_smoking_room", String(data.is_smoking_room));
    if (data.booking_limit_per_booking !== null && data.booking_limit_per_booking !== undefined) {
      formData.append("booking_limit_per_booking", String(data.booking_limit_per_booking));
    }

    // Process additions - only send new ones (without ID)
    // Filter out empty services and prepare data according to category
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
      // Filter out empty bed types and trim before submission
      const validBedTypes = data.bed_types
        .map((bedType) => bedType.trim())
        .filter((bedType) => bedType.length > 0);
      validBedTypes.forEach((bedType) => {
        formData.append("bed_types", bedType);
      });
      formData.append("is_smoking_room", String(data.is_smoking_room));
      if (data.booking_limit_per_booking !== null && data.booking_limit_per_booking !== undefined) {
        formData.append("booking_limit_per_booking", String(data.booking_limit_per_booking));
      }

      // Process additions
      const unchangedIds = data.unchanged_additions_ids || [];
      const allAdditions = data.additional || [];

      // Filter out unchanged additions and prepare only new/modified ones
      // Also filter out empty services
      const additionsToSend = allAdditions
        .filter((addition) => {
          // Include if it's a new addition (no ID) or modified (not in unchanged list)
          // And it has a non-empty name
          return (
            (addition.id === undefined || !unchangedIds.includes(addition.id)) &&
            addition.name?.trim() !== ""
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

  // Aggregate dirty state from all room cards
  useEffect(() => {
    const anyDirty = Object.values(dirtyMap).some(Boolean);
    setHasUnsavedChanges(anyDirty);

    if (typeof window !== "undefined") {
      (window as any).__hotelRoomsDirty = anyDirty;
    }
  }, [dirtyMap]);

  // Warn on browser/tab close or full reload
  useEffect(() => {
    if (typeof window === "undefined") return;

    const beforeUnloadHandler = (e: BeforeUnloadEvent) => {
      if (!hasUnsavedChanges) return;
      e.preventDefault();
      e.returnValue = "";
    };

    if (hasUnsavedChanges) {
      window.addEventListener("beforeunload", beforeUnloadHandler);
    }

    return () => {
      window.removeEventListener("beforeunload", beforeUnloadHandler);
    };
  }, [hasUnsavedChanges]);

  useEffect(() => {
    setRoomList(rooms || []);
  }, [rooms]);

  // Scroll to the last added room card when it appears
  useEffect(() => {
    if (lastAddedRoomId === null) return;

    const key = String(lastAddedRoomId);
    const node = roomRefs.current[key];

    if (node) {
      node.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [lastAddedRoomId, roomList]);

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
        {([...roomList].sort((a, b) => {
          const nameA = (a.name || "").trim().toLowerCase();
          const nameB = (b.name || "").trim().toLowerCase();

          // Keep unnamed (new) rooms at the bottom
          if (!nameA && !nameB) {
            return Number(a.id) - Number(b.id);
          }
          if (!nameA) return 1;
          if (!nameB) return -1;

          if (nameA < nameB) return -1;
          if (nameA > nameB) return 1;
          return 0;
        })).map((room) => {
          // Use a stable key so the form does not remount while typing
          const roomKey = String(room.id);

          const commonProps = {
            roomId: String(room.id),
            initialPhotos: room.photos || [],
            initialAdditions: room.additional || [],
            defaultValues: {
              name: room.name,
              without_breakfast: room.without_breakfast,
              with_breakfast: room.with_breakfast,
              room_size: room.room_size,
              max_occupancy: room.max_occupancy,
              bed_types: room.bed_types,
              is_smoking_room: room.is_smoking_room,
              booking_limit_per_booking:
                room.booking_limit_per_booking ?? null,
              description: room.description,
              other_preferences: (
                (room as { other_preferences?: OtherPreference[] })
                  .other_preferences ?? []
              ).map((pref: OtherPreference) => ({
                id: pref.id,
                name: pref.name,
              })),
            },
          };

          return (
            <div
              key={roomKey}
              ref={(el) => {
                roomRefs.current[String(room.id)] = el;
              }}
            >
              <RoomCardInput
                {...commonProps}
                {
                  ...(room.id > 0
                    ? {
                        onUpdate: createUpdateHandler(String(room.id)),
                        onRemove,
                        onDirtyChange: (isDirty) =>
                          setDirtyMap((prev) => {
                            const key = String(room.id);
                            if (prev[key] === isDirty) return prev;
                            return {
                              ...prev,
                              [key]: isDirty,
                            };
                          }),
                      } // For existing rooms (positive IDs from database)
                    : {
                        onCreate,
                        onCancelNewRoom: () => handleCancelNewRoom(room.id),
                        onDirtyChange: (isDirty) =>
                          setDirtyMap((prev) => {
                            const key = `temp-${room.id}`;
                            if (prev[key] === isDirty) return prev;
                            return {
                              ...prev,
                              [key]: isDirty,
                            };
                          }),
                      }) // For new rooms (negative temporary IDs)
                }
              />
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default RoomForm;
