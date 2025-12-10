import { ReportAgent } from "@/app/(dashboard)/report/types";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { Button } from "@/components/ui/button";
import { DataTableRowAction, Option } from "@/types/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { CalendarIcon, EyeIcon, Text } from "lucide-react";
import React from "react";

interface GetReportTableColumnsProps {
  setRowAction: React.Dispatch<
    React.SetStateAction<DataTableRowAction<ReportAgent> | null>
  >;
  companyOptions: Option[];
  hotelOptions: Option[];
}

export function getReportTableColumns({
  setRowAction,
  companyOptions,
  hotelOptions,
}: GetReportTableColumnsProps): ColumnDef<ReportAgent>[] {
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
      id: "hotel_name",
      accessorKey: "hotel_name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Hotel Name" />
      ),
      cell: ({ row }) => row.original.hotel_name,
      enableColumnFilter: true,
      enableSorting: false,
      enableHiding: false,
    },
    {
      id: "agent_company",
      accessorKey: "agent_company",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Agent Company" />
      ),
      cell: ({ row }) => row.original.agent_company,
      enableColumnFilter: true,
      enableSorting: false,
      enableHiding: false,
    },
    {
      id: "search",
      accessorKey: "search",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Agent Name" />
      ),
      cell: ({ row }) => row.original.agent_name,
      meta: {
        label: "Name",
        placeholder: "Search agent name...",
        variant: "text",
        icon: Text,
      },
      enableColumnFilter: true,
      enableHiding: false,
      enableSorting: false,
    },
    {
      id: "confirmed_booking",
      accessorKey: "confirmed_booking",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Confirmed Bookings" />
      ),
      cell: ({ row }) => (
        <div className="text-center">
          {row.original.confirmed_booking || "-"}
        </div>
      ),
      enableHiding: false,
      enableSorting: false,
    },
    {
      id: "rejected_booking",
      accessorKey: "rejected_booking",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Rejected Bookings" />
      ),
      cell: ({ row }) => (
        <div className="text-center">
          {row.original.rejected_booking || "-"}
        </div>
      ),
      enableHiding: false,
      enableSorting: false,
    },
    {
      id: "cancelled_booking",
      accessorKey: "cancelled_booking",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Cancelled Bookings" />
      ),
      cell: ({ row }) => (
        <div className="text-center">{row.original.cancelled_booking}</div>
      ),
      enableHiding: false,
      enableSorting: false,
    },
    {
      id: "detail",
      accessorKey: "detail",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Details" />
      ),
      cell: ({ row }) => {
        return (
          <Button
            size={"sm"}
            onClick={() => setRowAction({ row, variant: "detail" })}
          >
            <EyeIcon className="h-4 w-4" />
            See details
          </Button>
        );
      },
      enableHiding: false,
      enableSorting: false,
    },
  ];
}
