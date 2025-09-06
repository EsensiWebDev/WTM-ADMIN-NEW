import { PromoGroup } from "@/app/(dashboard)/promo-group/types";
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
import Link from "next/link";
import React from "react";

interface GetPromoGroupTableColumnsProps {
  setRowAction: React.Dispatch<
    React.SetStateAction<DataTableRowAction<PromoGroup> | null>
  >;
}

export function getPromoGroupTableColumns({
  setRowAction,
}: GetPromoGroupTableColumnsProps): ColumnDef<PromoGroup>[] {
  return [
    {
      id: "no",
      header: "No",
      cell: ({ row }) => <div className="text-center">{row.index + 1}</div>,
      enableSorting: false,
      enableHiding: false,
      size: 30,
    },
    {
      id: "name",
      accessorKey: "name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Group Name" />
      ),
      cell: ({ row }) => row.original.name,
      meta: {
        label: "Group Name",
        placeholder: "Search group name...",
        variant: "text",
        icon: Text,
      },
      enableColumnFilter: true,
      size: 2200,
    },
    {
      id: "actions",
      header: "Actions",
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
              <DropdownMenuItem asChild>
                <Link href={`/promo-group/${row.original.id}/edit`}>Edit</Link>
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
      enableHiding: false,
      enableSorting: false,
    },
  ];
}
