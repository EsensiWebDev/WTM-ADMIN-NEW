/* eslint-disable react-hooks/rules-of-hooks */
import { updatePromoStatus } from "@/app/(dashboard)/promo/actions";
import { Promo } from "@/app/(dashboard)/promo/types";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { formatDate } from "@/lib/format";
import { DataTableRowAction } from "@/types/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { Ellipsis, Text } from "lucide-react";
import React from "react";
import { toast } from "sonner";

interface GetPromoTableColumnsProps {
  setRowAction: React.Dispatch<
    React.SetStateAction<DataTableRowAction<Promo> | null>
  >;
}

export function getPromoTableColumns({
  setRowAction,
}: GetPromoTableColumnsProps): ColumnDef<Promo>[] {
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
      id: "id",
      accessorKey: "id",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Promo ID" />
      ),
      cell: ({ row }) => row.original.id,
      enableSorting: false,
      enableHiding: false,
    },
    {
      id: "code",
      accessorKey: "code",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Promo Code" />
      ),
      cell: ({ row }) => row.original.promo_code,
      meta: {
        label: "Promo Code",
        placeholder: "Search promo code...",
        variant: "text",
        icon: Text,
      },
      enableColumnFilter: false,
      enableHiding: false,
      enableSorting: false,
    },
    {
      id: "search",
      accessorKey: "search",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Promo Name" />
      ),
      cell: ({ row }) => row.original.promo_name,
      meta: {
        label: "Promo Name",
        placeholder: "Search by promo id/code/name",
        variant: "text",
        icon: Text,
      },
      enableColumnFilter: true,
      enableSorting: false,
      enableHiding: false,
    },
    {
      id: "duration",
      accessorKey: "duration",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Duration (Days)" />
      ),
      cell: ({ row }) => `${row.original.duration} Nights`,
      enableSorting: false,
      enableHiding: false,
    },
    {
      id: "start_date",
      accessorKey: "start_date",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Start Date" />
      ),
      cell: ({ row }) => {
        const date = new Date(row.original.promo_start_date);
        return formatDate(date);
      },
      enableSorting: false,
      enableHiding: false,
    },
    {
      id: "end_date",
      accessorKey: "end_date",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="End Date" />
      ),
      cell: ({ row }) => {
        const date = new Date(row.original.promo_end_date);
        return formatDate(date);
      },
      enableSorting: false,
      enableHiding: false,
    },

    {
      id: "status",
      accessorKey: "status",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Status" />
      ),
      cell: ({ row }) => {
        const [isUpdatePending, startUpdateTransition] = React.useTransition();

        return (
          <>
            <Label htmlFor={`${row.original.id}-status`} className="sr-only">
              Status
            </Label>
            <Switch
              disabled={isUpdatePending}
              checked={row.original.is_active}
              onCheckedChange={(checked) => {
                startUpdateTransition(() => {
                  const fd = new FormData();
                  fd.append("promo_id", String(row.original.id));
                  fd.append("is_active", String(checked));

                  toast.promise(updatePromoStatus(fd), {
                    loading: "Updating promo status...",
                    success: (data) => data.message,
                    error: "Failed to update promo status",
                  });
                });
              }}
              id={`${row.original.id}-status`}
            />
          </>
        );
      },
      meta: {
        label: "Status",
        placeholder: "Filter by status...",
        variant: "select",
        options: [
          { label: "Active", value: "true" },
          { label: "Inactive", value: "false" },
        ],
      },
      enableColumnFilter: false,
      enableHiding: false,
      enableSorting: false,
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
              {/* <DropdownMenuItem
                onSelect={() => setRowAction({ row, variant: "detail" })}
              >
                Details
              </DropdownMenuItem> */}
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
      enableHiding: false,
      enableSorting: false,
    },
  ];
}
