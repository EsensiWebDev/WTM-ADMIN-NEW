"use server";

import { apiCall } from "@/lib/api";
import { revalidatePath } from "next/cache";
import { Hotel, Room } from "./types";

export async function deleteHotel(hotelId: string) {
  try {
    const response = await apiCall(`hotels/${hotelId}`, {
      method: "DELETE",
    });

    if (response.status !== 200) {
      return {
        success: false,
        message: response.message || "Failed to remove hotel",
      };
    }

    revalidatePath("/hotel-listing", "layout");

    return {
      success: true,
      message: response.message || "Hotel has been successfully removed",
    };
  } catch (error) {
    console.error("Error removing hotel:", error);

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
        error instanceof Error ? error.message : "Failed to remove hotel",
    };
  }
}

export async function createHotelNew(
  formData: FormData
): Promise<{ success: boolean; message: string; data?: { hotel_id: number } }> {
  try {
    const response = await apiCall<{ hotel_id: number }>("hotels", {
      method: "POST",
      body: formData,
    });

    if (response.status !== 200) {
      return {
        success: false,
        message: response.message || "Failed to create hotels",
      };
    }

    revalidatePath("/hotel-listing", "layout");

    return {
      success: true,
      message: response.message || "Hotel created",
      data: response.data,
    };
  } catch (error) {
    console.error("Error creating hotel:", error);

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
        error instanceof Error ? error.message : "Failed to create hotel",
    };
  }
}

export async function updateHotel(hotelId: string, formData: FormData) {

  try {
    const response = await apiCall(`hotels/${hotelId}`, {
      method: "PUT",
      body: formData,
    });

    if (response.status !== 200) {
      return {
        success: false,
        message: response.message || "Failed to update hotels",
      };
    }

    revalidatePath(`/hotel-listing/${hotelId}/edit`, "page");
    revalidatePath(`/hotel-listing`, "page");

    return {
      success: true,
      message: response.message || "Hotel updated",
    };
  } catch (error) {
    console.error("Error updating hotel:", error);

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
        error instanceof Error ? error.message : "Failed to update hotel",
    };
  }
}

export async function checkHotelRoomTypes(hotelId: string) {
  try {
    const response = await apiCall<{ id: number; name: string }[]>(
      `/hotels/room-types?hotel_id=${hotelId}`
    );

    if (response.status === 200 && Array.isArray(response.data)) {
      return {
        success: true,
        hasRoomTypes: response.data.length > 0,
        roomTypesCount: response.data.length,
      };
    }

    return {
      success: false,
      hasRoomTypes: false,
      roomTypesCount: 0,
    };
  } catch (error) {
    console.error("Error checking hotel room types:", error);
    return {
      success: false,
      hasRoomTypes: false,
      roomTypesCount: 0,
    };
  }
}

export async function updateHotelStatus(formData: FormData) {
  try {
    const response = await apiCall(`hotels/status`, {
      method: "PUT",
      body: formData,
    });

    if (response.status !== 200) {
      return {
        success: false,
        message: response.message || "Failed to update hotel status",
      };
    }

    revalidatePath("/hotel-listing", "layout");

    return {
      success: true,
      message: response.message || "Hotel status updated",
    };
  } catch (error) {
    console.error("Error updating hotel status:", error);

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
          : "Failed to update hotel status",
    };
  }
}

export async function createHotelRoomType(formData: FormData) {
  try {
    const response = await apiCall("hotels/room-types", {
      method: "POST",
      body: formData,
    });


    if (response.status !== 200) {
      return {
        success: false,
        message: response.message || "Failed to create hotel room type",
      };
    }

    const hotelId = formData.get("hotel_id") as string;
    if (hotelId) {
      revalidatePath(`/hotel-listing/${hotelId}/edit`, "page");
    }

    return {
      success: true,
      message: response.message || "Hotel room type created",
    };
  } catch (error) {
    console.error("Error creating hotel room type:", error);

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
          : "Failed to create hotel room type",
    };
  }
}

export async function updateHotelRoomType(
  roomId: string,
  formData: FormData,
  hotelId?: string
) {

  try {
    const response = await apiCall(`hotels/room-types/${roomId}`, {
      method: "PUT",
      body: formData,
    });


    if (response.status !== 200) {
      return {
        success: false,
        message: response.message || "Failed to update hotel room type",
      };
    }

    if (hotelId) {
      revalidatePath(`/hotel-listing/${hotelId}/edit`, "page");
    }

    return {
      success: true,
      message: response.message || "Hotel room type updated",
    };
  } catch (error) {
    console.error("Error updating hotel room type:", error);

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
          : "Failed to update hotel room type",
    };
  }
}

export async function removeHotelRoomType(roomId: string, hotelId: string) {
  try {
    const response = await apiCall(`hotels/room-types/${roomId}`, {
      method: "DELETE",
    });

    if (response.status !== 200) {
      return {
        success: false,
        message: response.message || "Failed to remove hotel room type",
      };
    }

    // Revalidate the specific hotel edit page
    revalidatePath(`/hotel-listing/${hotelId}/edit`, "page");

    return {
      success: true,
      message:
        response.message || "Hotel room type has been successfully removed",
    };
  } catch (error) {
    console.error("Error removing hotel room type:", error);

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
          : "Failed to remove hotel room type",
    };
  }
}

export async function importHotelsFromCsv(file: File) {
  try {
    // Validate file type
    if (file.type !== "text/csv" && !file.name.endsWith(".csv")) {
      return {
        success: false,
        error: "Invalid file type. Please upload a CSV file.",
      };
    }

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      return {
        success: false,
        error: "File size too large. Maximum size is 10MB.",
      };
    }

    // Create FormData and append the file
    const formData = new FormData();
    formData.append("file", file);

    // Call the API endpoint
    const response = await apiCall("hotels/upload", {
      method: "POST",
      body: formData,
    });


    if (response.status !== 200) {
      return {
        success: false,
        error: response.message || "Failed to import CSV file",
      };
    }

    revalidatePath("/hotel-listing", "layout");

    return {
      success: true,
      message: response.message || "Hotels imported successfully",
    };
  } catch (error) {
    console.error("Error importing CSV:", error);

    // Handle API error responses with specific messages
    if (error && typeof error === "object" && "message" in error) {
      return {
        success: false,
        error: error.message as string,
      };
    }

    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to import CSV file",
    };
  }
}
