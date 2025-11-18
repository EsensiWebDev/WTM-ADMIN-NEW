import { updateHotelStatus } from "@/app/(dashboard)/hotel-listing/actions";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { DataTableRowAction, Option } from "@/types/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { ChevronDown, Cloud, CloudOff, Ellipsis, Text } from "lucide-react";
import { useRouter } from "next/navigation";
import React from "react";
import { toast } from "sonner";

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
      id: "search",
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
        const [isUpdatePending, startUpdateTransition] = React.useTransition();
        const status = row.original.status.toLowerCase();

        const getStatusColor = (value: string) => {
          if (value === "approved") return "text-green-600 bg-green-100";
          if (value === "rejected") return "text-red-600 bg-red-100";
          if (value === "in review") return "text-yellow-600 bg-yellow-100";
          return "";
        };

        return (
          <Select
            defaultValue={status}
            disabled={isUpdatePending}
            onValueChange={(value) => {
              startUpdateTransition(async () => {
                const sendValue = value === "approved";

                const fd = new FormData();
                fd.append("status", String(sendValue));
                fd.append("hotel_id", row.original.id);

                const { success, message } = await updateHotelStatus(fd);

                if (!success) {
                  toast.error(message);
                  return;
                }
                toast.success(message);
              });
            }}
          >
            <SelectTrigger
              className={`w-38 rounded-full px-3 border-0 shadow-none **:data-[slot=select-value]:block **:data-[slot=select-value]:truncate ${getStatusColor(
                status
              )}`}
            >
              <SelectValue placeholder="Change status" />
            </SelectTrigger>
            <SelectContent align="end">
              <SelectItem value={"approved"}>Approved</SelectItem>
              <SelectItem value={"in review"} disabled>
                In Review
              </SelectItem>
              <SelectItem value={"rejected"}>Rejected</SelectItem>
            </SelectContent>
          </Select>
        );
      },
      enableHiding: false,
      enableSorting: false,
    },
    {
      id: "is_api",
      accessorKey: "is_api",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="API Status" />
      ),
      cell: ({ row }) => {
        return row.original.is_api ? (
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
          { label: "API", value: "true" },
          { label: "Non API", value: "false" },
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
        const router = useRouter();

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
                onSelect={() => {
                  router.push(`/hotel-listing/${row.original.id}/edit`);
                }}
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
