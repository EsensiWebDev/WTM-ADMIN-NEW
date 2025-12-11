/* eslint-disable react-hooks/rules-of-hooks */
import {
  changeBannerOrder,
  changeBannerStatus,
} from "@/app/(dashboard)/banner/actions";
import { Banner } from "@/app/(dashboard)/banner/types";
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
import { cn } from "@/lib/utils";
import { DataTableRowAction } from "@/types/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowDown, ArrowUp, Ellipsis, ImageIcon, Text } from "lucide-react";
import Image from "next/image";
import React from "react";
import { toast } from "sonner";

interface GetBannerTableColumnsProps {
  setRowAction: React.Dispatch<
    React.SetStateAction<DataTableRowAction<Banner> | null>
  >;
  total: number;
}

export function getBannerTableColumns({
  setRowAction,
  total,
}: GetBannerTableColumnsProps): ColumnDef<Banner>[] {
  return [
    {
      id: "no",
      header: "No",
      cell: ({ row }) => row.index + 1,
      enableSorting: false,
      enableHiding: false,
      size: 10,
    },
    // {
    //   id: "id",
    //   accessorKey: "id",
    //   header: ({ column }) => (
    //     <DataTableColumnHeader column={column} title="Banner ID" />
    //   ),
    //   cell: ({ row }) => row.original.id,
    //   enableHiding: false,
    // },
    {
      id: "image",
      accessorKey: "image_url",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Preview" />
      ),
      cell: ({ row }) => {
        const imageUrl = row.original.image_url;

        return (
          <div className="relative h-40 w-72 overflow-hidden rounded-md border">
            {imageUrl ? (
              <Image
                priority
                src={imageUrl}
                alt={row.original.title || "Banner image"}
                fill
                className="object-cover"
                sizes="288px"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-muted">
                <ImageIcon className="h-8 w-8 text-muted-foreground" />
              </div>
            )}
          </div>
        );
      },
      enableSorting: false,
      enableHiding: false,
      size: 60,
    },
    {
      id: "search",
      accessorKey: "search",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Title" />
      ),
      cell: ({ row }) => (
        <div className="max-w-[300px] truncate font-medium">
          {row.original.title}
        </div>
      ),
      meta: {
        label: "Title",
        placeholder: "Search title...",
        variant: "text",
        icon: Text,
      },
      enableColumnFilter: true,
      enableHiding: false,
      enableSorting: false,
      size: 60,
    },
    {
      id: "description",
      accessorKey: "description",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Description" />
      ),
      cell: ({ row }) => (
        <div className="max-w-[400px] truncate text-sm text-muted-foreground">
          {row.original.description || "-"}
        </div>
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      id: "order",
      accessorKey: "order",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Order" />
      ),
      cell: ({ row }) => {
        const [isUpdatePending, startUpdateTransition] = React.useTransition();
        const handleOrderChange = (direction: "up" | "down") => {
          startUpdateTransition(async () => {
            const { success, message } = await changeBannerOrder({
              id: String(row.original.id),
              order: direction,
            });
            if (!success) {
              toast.error(message || "Failed to update banner order");
              return;
            }

            toast.success(message || "Banner order updated successfully");
          });
        };

        return (
          <div className="flex items-center gap-2">
            <Button
              // className={cn({ invisible: row.index === 0 })}
              disabled={isUpdatePending || row.index === 0}
              onClick={() => handleOrderChange("up")}
            >
              <ArrowUp />
            </Button>
            <Button
              // className={cn({ invisible: row.index === 0 })}
              disabled={isUpdatePending || row.index === total - 1}
              onClick={() => handleOrderChange("down")}
            >
              <ArrowDown />
            </Button>
          </div>
        );
      },
      enableSorting: false,
      enableHiding: false,
      size: 60,
    },
    {
      id: "is_active",
      accessorKey: "is_active",
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
                startUpdateTransition(async () => {
                  const { success, message } = await changeBannerStatus({
                    id: String(row.original.id),
                    status: checked,
                  });
                  if (!success) {
                    toast.error(message || "Failed to update banner status");
                    return;
                  }

                  toast.success(
                    message || "Banner status updated successfully"
                  );
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
      enableColumnFilter: true,
      enableHiding: false,
      enableSorting: false,
      size: 40,
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
      enableHiding: false,
      enableSorting: false,
      size: 40,
    },
  ];
}
