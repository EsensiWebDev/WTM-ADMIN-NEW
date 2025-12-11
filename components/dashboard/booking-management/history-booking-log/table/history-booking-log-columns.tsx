import { HistoryBookingLog } from "@/app/(dashboard)/booking-management/history-booking-log/types";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/format";
import { DataTableRowAction, Option } from "@/types/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { Text } from "lucide-react";
import React from "react";

interface GetHistoryBookingLogTableColumnsProps {
  setRowAction: React.Dispatch<
    React.SetStateAction<DataTableRowAction<HistoryBookingLog> | null>
  >;
  bookingStatusOptions: Option[];
  paymentStatusOptions: Option[];
}

export function getHistoryBookingLogTableColumns({
  setRowAction,
  bookingStatusOptions,
  paymentStatusOptions,
}: GetHistoryBookingLogTableColumnsProps): ColumnDef<HistoryBookingLog>[] {
  return [
    {
      id: "no",
      header: "No",
      cell: ({ row }) => row.index + 1,
      enableSorting: false,
      enableHiding: false,
      size: 40,
    },
    {
      id: "search",
      accessorKey: "booking_id",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Booking ID" />
      ),
      cell: ({ row }) => row.original.booking_id,
      meta: {
        label: "Booking ID",
        placeholder: "Search by ID/agent/hotel...",
        variant: "text",
        icon: Text,
      },
      enableColumnFilter: true,
      enableHiding: false,
      enableSorting: false,
    },
    {
      id: "confirm_date",
      accessorKey: "confirm_date",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Confirm Date" />
      ),
      cell: ({ row }) => {
        return row.original.confirm_date === "N/A"
          ? "N/A"
          : formatDate(row.original.confirm_date || new Date());
      },
      meta: {
        label: "Confirm Date",
        placeholder: "Filter by date...",
        variant: "dateRange",
      },
      enableColumnFilter: true,
      enableSorting: false,
      enableHiding: false,
    },
    {
      id: "agent_name",
      accessorKey: "agent_name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Agent Name" />
      ),
      cell: ({ row }) => row.original.agent_name,
      meta: {
        label: "Agent Name",
        placeholder: "Search agent name...",
        variant: "text",
        icon: Text,
      },
      enableColumnFilter: false,
      enableSorting: false,
      enableHiding: false,
    },
    {
      id: "booking_status_id",
      accessorKey: "booking_status_id",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Booking Status" />
      ),
      cell: ({ row }) => {
        const value = row.original.booking_status;
        let variant: "default" | "secondary" | "destructive" = "default";
        if (value === "confirmed") variant = "default";
        else if (value === "rejected") variant = "destructive";
        else if (value === "in review") variant = "secondary";
        return (
          <Badge variant={variant} className="capitalize">
            {value}
          </Badge>
        );
      },
      meta: {
        label: "Booking Status",
        placeholder: "Filter by status...",
        variant: "select",
        options: bookingStatusOptions,
      },
      enableColumnFilter: true,
      enableSorting: false,
      enableHiding: false,
    },
    {
      id: "payment_status_id",
      accessorKey: "payment_status_id",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Payment Status" />
      ),
      cell: ({ row }) => {
        const value = row.original.payment_status;
        let variant: "default" | "secondary" | "destructive" = "default";
        if (value === "paid") variant = "default";
        else if (value === "unpaid") variant = "destructive";
        return (
          <Badge variant={variant} className="capitalize">
            {value}
          </Badge>
        );
      },
      meta: {
        label: "Payment Status",
        placeholder: "Filter by payment status...",
        variant: "select",
        options: paymentStatusOptions,
      },
      enableColumnFilter: true,
      enableSorting: false,
      enableHiding: false,
    },
    {
      id: "check_in_date",
      accessorKey: "check_in_date",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Check-in Date" />
      ),
      cell: ({ row }) => {
        return formatDate(row.original.check_in_date);
      },
      meta: {
        label: "Check-in Date",
        placeholder: "Filter by check-in date...",
        variant: "dateRange",
      },
      enableColumnFilter: true,
      enableSorting: false,
      enableHiding: false,
    },
    {
      id: "check_out_date",
      accessorKey: "check_out_date",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Check-out Date" />
      ),
      cell: ({ row }) => {
        return formatDate(row.original.check_out_date);
      },
      meta: {
        label: "Check-out Date",
        placeholder: "Filter by check-out date...",
        variant: "dateRange",
      },
      enableColumnFilter: true,
      enableSorting: false,
      enableHiding: false,
    },
    {
      id: "hotel_name",
      accessorKey: "hotel_name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Hotel Name" />
      ),
      cell: ({ row }) => row.original.hotel_name,
      meta: {
        label: "Hotel Name",
        placeholder: "Search hotel name...",
        variant: "text",
        icon: Text,
      },
      enableColumnFilter: false,
      enableSorting: false,
      enableHiding: false,
    },
    {
      id: "room_type",
      accessorKey: "room_type",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Room Type" />
      ),
      cell: ({ row }) => row.original.room_type_name,
      meta: {
        label: "Room Type",
        placeholder: "Search room type...",
        variant: "text",
        icon: Text,
      },
      enableColumnFilter: false,
      enableSorting: false,
      enableHiding: false,
    },
    {
      id: "room_night",
      accessorKey: "room_night",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Room Nights" />
      ),
      cell: ({ row }) => row.original.room_nights,
      meta: {
        label: "Room Nights",
        placeholder: "Filter by room nights...",
        variant: "number",
      },
      enableColumnFilter: false,
      enableHiding: false,
      enableSorting: false,
    },
    {
      id: "capacity",
      accessorKey: "capacity",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Capacity" />
      ),
      cell: ({ row }) => row.original.capacity || 0,
      meta: {
        label: "Capacity",
        placeholder: "Search capacity...",
        variant: "text",
        icon: Text,
      },
      enableColumnFilter: false,
      enableHiding: false,
      enableSorting: false,
    },
  ];
}
