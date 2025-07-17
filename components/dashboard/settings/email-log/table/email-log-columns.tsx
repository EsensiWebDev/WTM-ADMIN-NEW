import { EmailLog } from "@/app/(dashboard)/settings/email-log/types";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { Badge } from "@/components/ui/badge";
import { formatDateTimeWIB } from "@/lib/format";
import { DataTableRowAction, Option } from "@/types/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { Text } from "lucide-react";
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
      id: "date",
      accessorKey: "date",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Date" />
      ),
      cell: ({ row }) => formatDateTimeWIB(row.original.date),
      meta: {
        label: "Date",
        placeholder: "Filter by date...",
        variant: "date",
      },
      enableColumnFilter: false,
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
    },
    {
      id: "status",
      accessorKey: "status",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Status" />
      ),
      cell: ({ row }) => {
        const value = row.original.status;
        let variant: "default" | "destructive" =
          value === "success" ? "default" : "destructive";
        return (
          <Badge variant={variant} className="capitalize">
            {value}
          </Badge>
        );
      },
      meta: {
        label: "Status",
        placeholder: "Filter by status...",
        variant: "select",
        options: [
          { label: "Success", value: "success" },
          { label: "Failed", value: "failed" },
        ],
      },
      enableColumnFilter: false,
    },
    {
      id: "notes",
      accessorKey: "notes",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Notes" />
      ),
      cell: ({ row }) => row.original.notes || "-",
      meta: {
        label: "Notes",
        placeholder: "Search notes...",
        variant: "text",
        icon: Text,
      },
      enableColumnFilter: false,
    },
  ];
}
