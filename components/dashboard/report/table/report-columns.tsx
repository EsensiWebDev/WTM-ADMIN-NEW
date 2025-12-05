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
      id: "hotel_id",
      accessorKey: "hotel_id",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Hotel Name" />
      ),
      cell: ({ row }) => row.original.hotel_name,
      meta: {
        label: "Hotel",
        placeholder: "Search hotel...",
        variant: "multiSelect",
        options: hotelOptions,
      },
      enableColumnFilter: true,
      enableSorting: false,
    },
    {
      id: "agent_company_id",
      accessorKey: "agent_company_id",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Agent Company" />
      ),
      cell: ({ row }) => row.original.agent_company,
      meta: {
        label: "Company",
        placeholder: "Search company...",
        variant: "multiSelect",
        options: companyOptions,
      },
      enableColumnFilter: true,
      enableSorting: false,
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

    // {
    //   id: "email",
    //   accessorKey: "email",
    //   header: ({ column }) => (
    //     <DataTableColumnHeader column={column} title="Email" />
    //   ),
    //   cell: ({ row }) => row.original.email,
    // },

    {
      id: "period_date",
      header: "Date",
      cell: ({ row }) => row.index + 1,
      size: 40,
      enableSorting: false,
      enableHiding: false,
      meta: {
        label: "Period",
        variant: "dateRange",
        icon: CalendarIcon,
      },
      enableColumnFilter: false,
    },
    {
      id: "confirmed_bookings",
      accessorKey: "deconfirmed_bookingstail",
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
      id: "rejected_bookings",
      accessorKey: "rejected_bookings",
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
      id: "cancelled_bookings",
      accessorKey: "cancelled_bookings",
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
    // {
    //   id: "actions",
    //   cell: function Cell({ row }) {
    //     const [isUpdatePending, startUpdateTransition] = React.useTransition();

    //     return (
    //       <DropdownMenu>
    //         <DropdownMenuTrigger asChild>
    //           <Button
    //             aria-label="Open menu"
    //             variant="ghost"
    //             className="flex size-8 p-0 data-[state=open]:bg-muted"
    //           >
    //             <Ellipsis className="size-4" aria-hidden="true" />
    //           </Button>
    //         </DropdownMenuTrigger>
    //         <DropdownMenuContent align="end" className="w-40">
    //           <DropdownMenuItem
    //             onSelect={() => setRowAction({ row, variant: "update" })}
    //           >
    //             Edit
    //           </DropdownMenuItem>
    //           <DropdownMenuSeparator />
    //           <DropdownMenuItem
    //             variant="destructive"
    //             onSelect={() => setRowAction({ row, variant: "delete" })}
    //           >
    //             Delete
    //           </DropdownMenuItem>
    //         </DropdownMenuContent>
    //       </DropdownMenu>
    //     );
    //   },
    //   size: 40,
    // },
  ];
}
