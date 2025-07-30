"use server";

import { CreateBookingSummarySchema } from "@/components/dashboard/booking-management/booking-summary/dialog/create-booking-summary-dialog";
import { EditBookingSummarySchema } from "@/components/dashboard/booking-management/booking-summary/dialog/edit-booking-summary-dialog";

export async function updateBookingStatus(
  bookingId: string,
  status: string,
  reason?: string
) {
  console.log("Update Booking Status");
  // Simulate API call delay
  await new Promise((resolve) => setTimeout(resolve, 1000));

  console.table({ bookingId, status, reason });

  // Simulate success response
  return { success: true, message: `Booking status updated to ${status}` };
}

export async function updatePaymentStatus(
  bookingId: string,
  paymentStatus: string
) {
  console.log("Update Payment Status");
  // Simulate API call delay
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Simulate success response
  return {
    success: true,
    message: `Payment status updated to ${paymentStatus}`,
  };
}

export async function deleteBooking(bookingId: string) {
  console.log("Delete Booking");
  // Simulate API call delay
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Simulate success response
  return { success: true, message: `Booking deleted` };
}

export async function createBooking(input: CreateBookingSummarySchema) {
  console.log("Create Booking:");
  console.log({ input });

  // Simulate API call delay
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Simulate success response
  return { success: true, message: `Booking created` };
}

export async function editBooking(
  input: EditBookingSummarySchema & { id: string }
) {
  console.log("Edit Booking:");
  console.log({ input });

  // Simulate API call delay
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Simulate success response
  return { success: true, message: `Booking edited` };
}
