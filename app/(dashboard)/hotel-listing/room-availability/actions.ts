"use server";

import { apiCall } from "@/lib/api";
import { revalidatePath } from "next/cache";
import { RoomAvailabilityHotel } from "./types";

export async function updateRoomAvailability(
  month: string,
  input: RoomAvailabilityHotel[]
) {
  const data = input.map(
    ({ available: room_available, room_type_name, ...rest }) => ({
      ...rest,
      room_available,
    })
  );

  // Simulate API call delay
  // await new Promise((resolve) => setTimeout(resolve, 1000));

  // Simulate success response
  // return { success: true, message: `Room availability updated` };

  try {
    const data = input.map(
      ({ available: room_available, room_type_name, ...rest }) => ({
        ...rest,
        room_available,
      })
    );

    const body = {
      month,
      data,
    };

    const response = await apiCall("hotels/room-available", {
      method: "PUT",
      body: JSON.stringify(body),
    });

    if (response.status !== 200) {
      return {
        success: false,
        message: response.message || "Failed to update room availability",
      };
    }

    revalidatePath("/hotel-listing/room-availability", "layout");

    return {
      success: true,
      message: response.message ?? `Updated room availability success`,
    };
  } catch (error) {
    console.error("Error updating room availability:", error);

    // Handle API error responses with specific messages
    if (error && typeof error === "object" && "message" in error) {
      return {
        success: false,
        message: error.message as string,
      };
    }

    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to update room availability",
    };
  }
}
