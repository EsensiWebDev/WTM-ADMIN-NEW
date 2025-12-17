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
      id: "search",
      accessorFn: (row) => `${row.code} ${row.name}`,
      header: () => null,
      cell: () => null,
      enableHiding: true,
      enableSorting: false,
      enableColumnFilter: true,
      size: 0,
      minSize: 0,
      maxSize: 0,
      meta: {
        label: "Search",
        placeholder: "Search by code or name...",
        variant: "text",
        icon: Text,
      },
      filterFn: (row, id, value) => {
        const code = row.original.code?.toLowerCase() ?? "";
        const name = row.original.name?.toLowerCase() ?? "";
        const searchText = `${code} ${name}`;
        
        if (!value || (Array.isArray(value) && value.length === 0)) {
          return true;
        }
        const searchValue = Array.isArray(value) ? value.join(" ") : String(value);
        return searchText.includes(searchValue.toLowerCase() ?? "");
      },
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
      enableColumnFilter: false,
      enableHiding: false,
      enableSorting: false,
      size: 100,
      minSize: 80,
    },
    {
      id: "name",
      accessorKey: "name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Name" />
      ),
      cell: ({ row }) => row.original.name,
      enableColumnFilter: false,
      enableHiding: false,
      enableSorting: false,
      size: 250,
      minSize: 200,
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
      size: 120,
      minSize: 100,
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
      size: 120,
      minSize: 100,
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const isIDR = row.original.code === "IDR";
        
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
                disabled={isIDR}
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
                variant="destructive"
                disabled={isIDR}
              >
                Deactivate
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
      enableHiding: false,
      enableSorting: false,
      size: 70,
      minSize: 70,
      maxSize: 70,
    },
  ];
}

