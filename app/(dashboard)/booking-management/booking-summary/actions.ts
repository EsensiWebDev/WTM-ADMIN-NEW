"use server";

import { CreateBookingSummarySchema } from "@/components/dashboard/booking-management/booking-summary/dialog/create-booking-summary-dialog";
import { EditBookingSummarySchema } from "@/components/dashboard/booking-management/booking-summary/dialog/edit-booking-summary-dialog";
import { apiCall } from "@/lib/api";
import { cleanBody } from "@/lib/utils";
import { revalidatePath } from "next/cache";

export async function updateBookingStatus(input: {
  booking_id?: string;
  sub_booking_id?: string;
  status_id: string;
  reason?: string;
}) {
  try {
    const body = {
      ...(input.booking_id && { booking_id: input.booking_id }),
      ...(input.sub_booking_id && { sub_booking_id: input.sub_booking_id }),
      status_id: Number(input.status_id),
      ...(input.reason && { reason: input.reason }),
    };

    const response = await apiCall(`bookings/booking-status`, {
      method: "POST",
      body: JSON.stringify(cleanBody(body)),
    });

    if (response.status !== 200) {
      return {
        success: false,
        message: response.message || "Failed to update booking status",
      };
    }

    revalidatePath("/booking-management/booking-summary", "layout");

    return {
      success: true,
      message: response.message || "Booking status updated successfully",
    };
  } catch (error) {
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
          : "Failed to update booking status",
    };
  }
}

export async function updatePaymentStatus(input: {
  booking_id?: string;
  sub_booking_id?: string;
  payment_status_id: string;
}) {
  try {
    const body = {
      ...(input.booking_id && { booking_id: input.booking_id }),
      ...(input.sub_booking_id && { sub_booking_id: input.sub_booking_id }),
      status_id: Number(input.payment_status_id),
    };

    const response = await apiCall(`bookings/payment-status`, {
      method: "POST",
      body: JSON.stringify(cleanBody(body)),
    });


    if (response.status !== 200) {
      return {
        success: false,
        message: response.message || "Failed to update payment status",
      };
    }

    revalidatePath("/booking-management/booking-summary", "layout");

    return {
      success: true,
      message: response.message || "Payment status updated successfully",
    };
  } catch (error) {
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
          : "Failed to update payment status",
    };
  }
}

export async function deleteBooking(bookingId: string) {
  // Simulate API call delay
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Simulate success response
  return { success: true, message: `Booking deleted` };
}

export async function createBooking(input: CreateBookingSummarySchema) {

  // Simulate API call delay
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Simulate success response
  return { success: true, message: `Booking created` };
}

export async function editBooking(
  input: EditBookingSummarySchema & { id: string }
) {

  // Simulate API call delay
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Simulate success response
  return { success: true, message: `Booking edited` };
}

export async function uploadReceipt(formData: FormData) {
  try {
    const receipt = formData.get("receipt") as File | null;
    const bookingId = formData.get("booking_id") as string | null;
    const subBookingId = formData.get("sub_booking_id") as string | null;

    if (!receipt) {
      return {
        success: false,
        message: "No file provided",
      };
    }

    const response = await apiCall("bookings/receipt", {
      method: "POST",
      body: formData,
    });


    if (response.status !== 200) {
      return {
        success: false,
        message: response.message || "Failed to upload receipt",
      };
    }

    revalidatePath("/booking-management/booking-summary", "layout");

    // For now, just return success without actual processing
    return {
      success: true,
      message: response.message || "Receipt uploaded successfully",
    };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to upload receipt",
    };
  }
}

export async function saveAdminNote(input: {
  sub_booking_id: string;
  admin_notes: string;
}) {
  try {
    const body = {
      sub_booking_id: input.sub_booking_id,
      admin_notes: input.admin_notes,
    };

    const response = await apiCall(`bookings/admin-notes`, {
      method: "POST",
      body: JSON.stringify(cleanBody(body)),
    });

    if (response.status !== 200) {
      return {
        success: false,
        message: response.message || "Failed to save admin note",
      };
    }

    revalidatePath("/booking-management/booking-summary", "layout");

    return {
      success: true,
      message: response.message || "Admin note saved successfully",
    };
  } catch (error) {
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
          : "Failed to save admin note",
    };
  }
}