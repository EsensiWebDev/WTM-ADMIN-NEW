"use server";

import { EditHotelSchema } from "@/components/dashboard/hotel-listing/dialog/edit-hotel-dialog";
import { Hotel, Room } from "./types";

export async function deleteHotel(hotelId: string) {
  console.log("Delete Hotel");
  // Simulate API call delay
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Simulate success response
  return { success: true, message: `Hotel deleted` };
}

export async function createHotel(formData: FormData) {
  try {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Extract data from FormData
    const hotelInfo = JSON.parse(formData.get("hotelInfo") as string);
    const rooms = JSON.parse(formData.get("rooms") as string);
    const images = formData.getAll("images") as File[];
    const mainImageIndex = formData.get("mainImageIndex") as string;

    // Validate required data
    if (!hotelInfo.name || !hotelInfo.location || !hotelInfo.description) {
      return { success: false, error: "Missing required hotel information" };
    }

    if (images.length === 0) {
      return { success: false, error: "At least one image is required" };
    }

    if (rooms.length === 0) {
      return { success: false, error: "At least one room is required" };
    }

    // Simulate successful creation
    console.log("Hotel created successfully:", {
      hotelInfo,
      roomsCount: rooms.length,
      imagesCount: images.length,
      mainImageIndex,
      createdAt: new Date().toISOString(),
    });

    return { success: true };
  } catch (error) {
    console.error("Error creating hotel:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create hotel",
    };
  }
}

export async function editHotel(input: EditHotelSchema & { id: string }) {
  console.log("Edit Hotel:");
  console.log({ input });

  // Simulate API call delay
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Simulate success response
  return { success: true, message: `Hotel edited` };
}

export async function importHotelsFromCsv(file: File) {
  try {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 3000));

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

    // Read file content
    const csvData = await file.text();

    console.log({ fileName: file.name, fileSize: file.size, csvData });

    // Parse CSV data (basic parsing - in real implementation, use a proper CSV parser)
    const lines = csvData.trim().split("\n");
    const headers = lines[0].split(",");

    if (lines.length < 2) {
      return {
        success: false,
        error: "CSV file is empty or contains only headers",
      };
    }

    // Validate headers
    const requiredHeaders = [
      "name",
      "region",
      "email",
      "approval_status",
      "api_status",
    ];
    const missingHeaders = requiredHeaders.filter(
      (header) => !headers.includes(header)
    );

    if (missingHeaders.length > 0) {
      return {
        success: false,
        error: `Missing required headers: ${missingHeaders.join(", ")}`,
      };
    }

    const hotels: Partial<Hotel>[] = [];
    const errors: string[] = [];

    // Process each data row
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(",");

      if (values.length !== headers.length) {
        errors.push(`Row ${i + 1}: Column count mismatch`);
        continue;
      }

      const rowData: any = {};
      headers.forEach((header, index) => {
        rowData[header.trim()] = values[index]?.trim();
      });

      // Validate required fields
      if (!rowData.name || !rowData.region || !rowData.email) {
        errors.push(
          `Row ${i + 1}: Missing required fields (name, region, or email)`
        );
        continue;
      }

      // Validate approval_status
      if (
        !["approved", "pending", "rejected"].includes(rowData.approval_status)
      ) {
        errors.push(
          `Row ${
            i + 1
          }: Invalid approval_status. Must be: approved, pending, or rejected`
        );
        continue;
      }

      // Validate api_status
      if (!["true", "false"].includes(rowData.api_status?.toLowerCase())) {
        errors.push(`Row ${i + 1}: Invalid api_status. Must be: true or false`);
        continue;
      }

      // Find existing hotel or create new one
      let hotel = hotels.find(
        (h) => h.name === rowData.name && h.email === rowData.email
      );

      if (!hotel) {
        hotel = {
          id: `hotel_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          name: rowData.name,
          region: rowData.region,
          email: rowData.email,
          approval_status: rowData.approval_status,
          api_status: rowData.api_status?.toLowerCase() === "true",
          rooms: [],
        };
        hotels.push(hotel);
      }

      // Add room if room data is provided
      if (rowData.room_name && rowData.room_description) {
        const room: Partial<Room> = {
          id: `room_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          name: rowData.room_name,
          description: rowData.room_description,
          normal_price: parseFloat(rowData.normal_price) || 0,
          discount_price: parseFloat(rowData.discount_price) || 0,
        };

        if (!hotel.rooms) hotel.rooms = [];
        hotel.rooms.push(room as Room);
      }
    }

    if (errors.length > 0 && hotels.length === 0) {
      return {
        success: false,
        error: `Import failed with errors:\n${errors.join("\n")}`,
      };
    }

    // Simulate successful import
    console.log("Hotels imported successfully:", {
      hotelsCount: hotels.length,
      totalRooms: hotels.reduce(
        (acc, hotel) => acc + (hotel.rooms?.length || 0),
        0
      ),
      errors: errors.length > 0 ? errors : null,
      importedAt: new Date().toISOString(),
    });

    const message =
      errors.length > 0
        ? `Imported ${hotels.length} hotels with ${errors.length} errors. Check console for details.`
        : `Successfully imported ${hotels.length} hotels`;

    return {
      success: true,
      message,
      data: {
        imported: hotels.length,
        errors: errors.length,
        errorDetails: errors.length > 0 ? errors : undefined,
      },
    };
  } catch (error) {
    console.error("Error importing CSV:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to import CSV file",
    };
  }
}
