import { BookingSummary } from "@/app/(dashboard)/booking-management/booking-summary/types";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DataTableRowAction, Option } from "@/types/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { CloudOff, Ellipsis, EyeIcon, FileText, Text } from "lucide-react";
import React from "react";

interface GetBookingSummaryTableColumnsProps {
  setRowAction: React.Dispatch<
    React.SetStateAction<DataTableRowAction<BookingSummary> | null>
  >;
  companyOptions: Option[];
}

export function getBookingSummaryTableColumns({
  setRowAction,
  companyOptions,
}: GetBookingSummaryTableColumnsProps): ColumnDef<BookingSummary>[] {
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
      id: "guest_name",
      accessorKey: "guest_name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Guest Name" />
      ),
      cell: ({ row }) => row.original.guest_name,
      meta: {
        label: "Guest Name",
        placeholder: "Search guest name...",
        variant: "text",
        icon: Text,
      },
      enableColumnFilter: true,
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
    },
    {
      id: "agent_company",
      accessorKey: "agent_company",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Agent Company" />
      ),
      cell: ({ row }) => row.original.agent_company,
      meta: {
        label: "Agent Company",
        placeholder: "Search agent company...",
        variant: "multiSelect",
        options: companyOptions,
      },
      enableColumnFilter: true,
    },
    {
      id: "group_promo",
      accessorKey: "group_promo",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Group Promo" />
      ),
      cell: ({ row }) => row.original.group_promo,
    },
    {
      id: "booking_id",
      accessorKey: "booking_id",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Booking ID" />
      ),
      cell: ({ row }) => row.original.booking_id,
    },
    {
      id: "booking_status",
      accessorKey: "booking_status",
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
        options: [
          { label: "Confirmed", value: "confirmed" },
          { label: "Rejected", value: "rejected" },
          { label: "In Review", value: "in review" },
        ],
      },
      enableColumnFilter: true,
    },
    {
      id: "payment_status",
      accessorKey: "payment_status",
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
        options: [
          { label: "Paid", value: "paid" },
          { label: "Unpaid", value: "unpaid" },
        ],
      },
      enableColumnFilter: true,
    },
    {
      id: "promo_id",
      accessorKey: "promo_id",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Promo ID" />
      ),
      cell: ({ row }) => row.original.promo_id,
    },
    {
      id: "receipt",
      accessorKey: "receipt",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Payment Receipt" />
      ),
      cell: ({ row }) => {
        return (
          <Button
            size={"sm"}
            onClick={() => setRowAction({ row, variant: "detail" })}
          >
            <FileText className="h-4 w-4" />
            View Receipt
          </Button>
        );
      },
      enableHiding: false,
      enableSorting: false,
    },
    {
      id: "detail",
      accessorKey: "detail",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Booking Detail" />
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
    {
      id: "api_status",
      accessorKey: "api_status",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="API Status" />
      ),
      // cell: ({ row }) => {
      //   return row.original.api_status ? (
      //     <Cloud className="size-5 text-green-500" aria-hidden="true" />
      //   ) : (
      //     <CloudOff className="size-5 text-red-500" aria-hidden="true" />
      //   );
      // },
      cell: ({ row }) => (
        <CloudOff className="size-5 text-red-500" aria-hidden="true" />
      ),
      enableHiding: false,
      enableSorting: false,
      size: 50,
    },
    {
      id: "actions",
      cell: function Cell({ row }) {
        const [isUpdatePending, startUpdateTransition] = React.useTransition();

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                aria-label="Open menu"
                variant="ghost"
                className="flex size-8 p-0 data-[state=open]:bg-muted"
              >
                <Ellipsis className="size-4" aria-hidden="true" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem
                onSelect={() => setRowAction({ row, variant: "update" })}
              >
                Edit
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                variant="destructive"
                onSelect={() => setRowAction({ row, variant: "delete" })}
              >
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
      size: 40,
    },
  ];
}
