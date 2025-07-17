import { RoomAvailabilityHotel } from "@/app/(dashboard)/hotel-listing/room-availability/types";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DataTableRowAction } from "@/types/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { Ellipsis, Text } from "lucide-react";
import React from "react";

interface GetRoomAvailabilityTableColumnsProps {
  setRowAction: React.Dispatch<
    React.SetStateAction<DataTableRowAction<RoomAvailabilityHotel> | null>
  >;
}

export function getRoomAvailabilityTableColumns({
  setRowAction,
}: GetRoomAvailabilityTableColumnsProps): ColumnDef<RoomAvailabilityHotel>[] {
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
        <DataTableColumnHeader column={column} title="Hotel Name" />
      ),
      cell: ({ row }) => (
        <div className="flex items-center gap-2">{row.original.name}</div>
      ),
      meta: {
        label: "Hotel Name",
        placeholder: "Search hotel name...",
        variant: "text",
        icon: Text,
      },
      enableColumnFilter: true,
      enableHiding: false,
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
                Detail
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
      size: 10,
    },
  ];
}
