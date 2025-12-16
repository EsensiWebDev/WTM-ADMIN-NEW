/* eslint-disable react-hooks/rules-of-hooks */
import { Currency } from "@/app/(dashboard)/currency/types";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DataTableRowAction } from "@/types/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { Ellipsis, Text } from "lucide-react";
import React from "react";

interface GetCurrencyTableColumnsProps {
  setRowAction: React.Dispatch<
    React.SetStateAction<DataTableRowAction<Currency> | null>
  >;
}

export function getCurrencyTableColumns({
  setRowAction,
}: GetCurrencyTableColumnsProps): ColumnDef<Currency>[] {
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
      id: "code",
      accessorKey: "code",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Code" />
      ),
      cell: ({ row }) => (
        <span className="font-mono font-semibold">{row.original.code}</span>
      ),
      meta: {
        label: "Code",
        placeholder: "Search currency code...",
        variant: "text",
        icon: Text,
      },
      enableColumnFilter: false,
      enableHiding: false,
      enableSorting: false,
    },
    {
      id: "name",
      accessorKey: "name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Name" />
      ),
      cell: ({ row }) => row.original.name,
      meta: {
        label: "Name",
        placeholder: "Search currency name...",
        variant: "text",
        icon: Text,
      },
      enableColumnFilter: true,
      enableHiding: false,
      enableSorting: false,
    },
    {
      id: "symbol",
      accessorKey: "symbol",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Symbol" />
      ),
      cell: ({ row }) => (
        <span className="font-semibold">{row.original.symbol}</span>
      ),
      enableSorting: false,
    },
    {
      id: "is_active",
      accessorKey: "is_active",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Status" />
      ),
      cell: ({ row }) => (
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
            row.original.is_active
              ? "bg-green-100 text-green-800"
              : "bg-gray-100 text-gray-800"
          }`}
        >
          {row.original.is_active ? "Active" : "Inactive"}
        </span>
      ),
      enableSorting: false,
    },
    {
      id: "actions",
      cell: ({ row }) => {
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <Ellipsis className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() =>
                  setRowAction({
                    row,
                    variant: "update",
                  })
                }
              >
                Edit
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() =>
                  setRowAction({
                    row,
                    variant: "delete",
                  })
                }
                className="text-destructive"
              >
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
      enableHiding: false,
      enableSorting: false,
    },
  ];
}

