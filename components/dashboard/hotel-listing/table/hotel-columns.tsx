import { Hotel } from "@/app/(dashboard)/hotel-listing/types";
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
import { cn } from "@/lib/utils";
import { DataTableRowAction, Option } from "@/types/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { ChevronDown, Cloud, CloudOff, Ellipsis, Text } from "lucide-react";
import React from "react";

interface GetHotelTableColumnsProps {
  setRowAction: React.Dispatch<
    React.SetStateAction<DataTableRowAction<Hotel> | null>
  >;
  companyOptions: Option[];
}

export function getHotelTableColumns({
  setRowAction,
  companyOptions,
}: GetHotelTableColumnsProps): ColumnDef<Hotel>[] {
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
      accessorKey: "name",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title="Hotel Name"
          className="mx-1"
        />
      ),
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            onClick={() => row.toggleExpanded()}
            className="flex items-center gap-2"
          >
            {row.original.name}
            <ChevronDown
              className={cn("size-4 transition-transform", {
                "rotate-180": row.getIsExpanded(),
              })}
            />
          </Button>
        </div>
      ),
      meta: {
        label: "Hotel Name",
        placeholder: "Search hotel name...",
        variant: "text",
        icon: Text,
      },
      enableColumnFilter: true,
      enableHiding: false,
      size: 400,
    },
    {
      id: "region",
      accessorKey: "region",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Region" />
      ),
      cell: ({ row }) => row.original.region,
      meta: {
        label: "Region",
        placeholder: "Search region...",
        variant: "multiSelect",
        options: companyOptions,
      },
      enableColumnFilter: true,
    },
    {
      id: "Email",
      accessorKey: "email",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Email" />
      ),
      cell: ({ row }) => row.original.email,
    },
    {
      id: "approval_status",
      accessorKey: "approval_status",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Approval Status" />
      ),
      cell: ({ row }) => {
        return (
          <Badge variant="default" className="capitalize">
            {row.original.approval_status}
          </Badge>
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
      cell: ({ row }) => {
        return row.original.api_status ? (
          <Cloud className="size-5 text-green-500" aria-hidden="true" />
        ) : (
          <CloudOff className="size-5 text-red-500" aria-hidden="true" />
        );
      },
      meta: {
        label: "API",
        placeholder: "Search API...",
        variant: "multiSelect",
        options: [
          { label: "API", value: "api" },
          { label: "Non API", value: "non_api" },
        ],
      },
      enableColumnFilter: true,
      enableHiding: false,
      enableSorting: false,
      size: 50,
    },
    {
      id: "actions",
      cell: function Cell({ row }) {
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
