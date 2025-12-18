"use server";

import { ExportConfigs } from "@/lib/export-client";
import { ExportService } from "@/lib/export-service";
import { ExportColumn, ExportFormat, ExportResult } from "@/lib/export-types";
import { formatDate } from "@/lib/format";
import { SearchParams } from "@/types";
import { getData } from "./fetch";
import { HistoryBookingLog } from "./types";

// Define columns for export
const exportColumns: ExportColumn<HistoryBookingLog>[] = [
  {
    key: "booking_id",
    header: "Booking ID",
    accessor: (item) => item.booking_id,
    width: 12,
  },
  {
    key: "confirm_date",
    header: "Confirm Date",
    accessor: (item) => item.confirm_date,
    formatter: (value) =>
      formatDate(value, {
        year: "numeric",
        month: "short",
        day: "numeric",
      }),
    width: 15,
  },
  {
    key: "agent_name",
    header: "Agent Name",
    accessor: (item) => item.agent_name,
    width: 20,
  },
  {
    key: "booking_status",
    header: "Booking Status",
    accessor: (item) => item.booking_status,
    width: 15,
  },
  {
    key: "payment_status",
    header: "Payment Status",
    accessor: (item) => item.payment_status,
    width: 15,
  },
  {
    key: "date_in",
    header: "Check-in Date",
    accessor: (item) => item.check_in_date,
    formatter: (value) =>
      formatDate(value, {
        year: "numeric",
        month: "short",
        day: "numeric",
      }),
    width: 15,
  },
  {
    key: "date_out",
    header: "Check-out Date",
    accessor: (item) => item.check_out_date,
    formatter: (value) =>
      formatDate(value, {
        year: "numeric",
        month: "short",
        day: "numeric",
      }),
    width: 15,
  },
  {
    key: "hotel_name",
    header: "Hotel Name",
    accessor: (item) => item.hotel_name,
    width: 25,
  },
  {
    key: "room_type",
    header: "Room Type",
    accessor: (item) => item.room_type_name,
    width: 20,
  },
  {
    key: "room_night",
    header: "Room Nights",
    accessor: (item) => item.room_nights,
    width: 12,
  },
  {
    key: "capacity",
    header: "Capacity",
    accessor: (item) => item.capacity,
    width: 15,
  },
];

export async function exportHistoryBookingLog(
  searchParams: SearchParams,
  format: ExportFormat = "csv"
): Promise<ExportResult> {
  try {

    const { data, status, message } = await getData({
      searchParams: { ...searchParams, limit: "0" },
    });

    if (status !== 200) {
      throw new Error(message);
      // return { success: false, message: message || "Failed to export data" };
    }

    return await ExportService.exportData(
      data,
      exportColumns,
      ExportConfigs.bookingLog,
      format
    );
  } catch (error) {
    console.error("Error exporting history booking log:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to export data",
    };
  }
}
