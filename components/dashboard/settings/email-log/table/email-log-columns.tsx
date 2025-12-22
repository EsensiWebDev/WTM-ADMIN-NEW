import { EmailLog } from "@/app/(dashboard)/email/email-log/types";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatDateTimeWIB } from "@/lib/format";
import { DataTableRowAction, Option } from "@/types/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, Text } from "lucide-react";
import React from "react";

interface GetEmailLogTableColumnsProps {
  setRowAction: React.Dispatch<
    React.SetStateAction<DataTableRowAction<EmailLog> | null>
  >;
  companyOptions: Option[];
}

export function getEmailLogTableColumns({
  setRowAction,
  companyOptions,
}: GetEmailLogTableColumnsProps): ColumnDef<EmailLog>[] {
  return [
    {
      id: "date_time",
      accessorKey: "date_time",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Date" />
      ),
      cell: ({ row }) => formatDateTimeWIB(row.original.date_time),
      meta: {
        label: "Date",
        placeholder: "Filter by date...",
        variant: "dateRange",
      },
      enableColumnFilter: true,
      enableHiding: false,
      enableSorting: true,
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
      enableColumnFilter: true,
      enableSorting: false,
    },
    {
      id: "email_type",
      accessorKey: "email_type",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Type" />
      ),
      cell: ({ row }) => row.original.email_type || "-",
      enableColumnFilter: false,
      enableSorting: false,
    },
    {
      id: "booking_code",
      accessorKey: "booking_code",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Booking Code" />
      ),
      cell: ({ row }) => row.original.booking_code || "-",
      meta: {
        label: "Booking Code",
        placeholder: "Search booking code...",
        variant: "text",
        icon: Text,
      },
      enableColumnFilter: true,
      enableSorting: false,
    },
    {
      id: "status",
      accessorKey: "status",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Status" />
      ),
      cell: ({ row }) => {
        const value = row.original.status.toLowerCase() as
          | "success"
          | "failed"
          | "pending";

        return (
          <Badge variant={value} className="capitalize">
            {value}
          </Badge>
        );
      },
      meta: {
        label: "Status",
        placeholder: "Filter by status...",
        variant: "select",
        options: [
          { label: "Success", value: "Success" },
          { label: "Failed", value: "Failed" },
          { label: "Pending", value: "Pending" },
        ],
      },
      enableColumnFilter: true,
      enableSorting: false,
    },
    {
      id: "notes",
      accessorKey: "notes",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Notes" />
      ),
      cell: ({ row }) => {
        const notes = row.original.notes || "-";
        if (notes === "-" || notes.length <= 50) {
          return <span className="text-sm">{notes}</span>;
        }
        return (
          <span className="text-sm truncate block max-w-[200px]" title={notes}>
            {notes.substring(0, 50)}...
          </span>
        );
      },
      enableColumnFilter: false,
      enableSorting: false,
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                aria-label="Open menu"
                variant="ghost"
                className="flex size-8 p-0 data-[state=open]:bg-muted"
              >
                <MoreHorizontal className="size-4" aria-hidden="true" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem
                onSelect={() => setRowAction({ row, variant: "detail" })}
              >
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={() => setRowAction({ row, variant: "preview" })}
              >
                Preview Email
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
      enableHiding: false,
      enableSorting: false,
      size: 40,
    },
  ];
}
