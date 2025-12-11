import { updatePromoGroup } from "@/app/(dashboard)/account/agent-overview/agent-management/actions";
import { Agent } from "@/app/(dashboard)/account/agent-overview/agent-management/types";
import { addPromoGroupMembers } from "@/app/(dashboard)/promo-group/actions";
import { PromoGroup } from "@/app/(dashboard)/promo-group/types";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectItemLink,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DataTableRowAction } from "@/types/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { Ellipsis, Text } from "lucide-react";
import React from "react";
import { toast } from "sonner";

interface GetAgentTableColumnsProps {
  setRowAction: React.Dispatch<
    React.SetStateAction<DataTableRowAction<Agent> | null>
  >;
  promoGroupSelect: PromoGroup[];
}

export function getAgentTableColumns({
  setRowAction,
  promoGroupSelect,
}: GetAgentTableColumnsProps): ColumnDef<Agent>[] {
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
        <DataTableColumnHeader column={column} title="Name" />
      ),
      cell: ({ row }) => row.original.name,
      meta: {
        label: "Name",
        placeholder: "Search name...",
        variant: "text",
        icon: Text,
      },
      enableColumnFilter: true,
      enableHiding: false,
      enableSorting: false,
    },
    {
      id: "Agent Company",
      accessorKey: "company",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Agent Company" />
      ),
      cell: ({ row }) => row.original.agent_company_name,
      enableSorting: false,
      enableHiding: false,
    },
    {
      id: "Promo Group",
      accessorKey: "promo_group",
      enableSorting: false,
      enableHiding: false,
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Promo Group" />
      ),
      cell: ({ row }) => {
        const [isUpdatePending, startUpdateTransition] = React.useTransition();

        return (
          <>
            <Label
              htmlFor={`${row.original.id}-promo-group`}
              className="sr-only"
            >
              Promo Group
            </Label>
            <Select
              disabled={isUpdatePending}
              defaultValue={String(row.original.promo_group_id)}
              onValueChange={(value) => {
                startUpdateTransition(async () => {
                  const { success, message } = await addPromoGroupMembers({
                    promo_group_id: String(value),
                    member_id: String(row.original.id),
                  });
                  if (!success) {
                    toast.error(message || "Failed to change promo group");
                    return;
                  }

                  toast.success(message || "Promo group updated successfully");
                });
              }}
            >
              <SelectTrigger
                className="w-38 bg-primary text-white **:data-[slot=select-value]:block **:data-[slot=select-value]:truncate [&>svg]:!text-white [&>svg]:!opacity-100"
                size="sm"
                id={`${row.original.id}-promo-group`}
              >
                <SelectValue placeholder="Assign Promo Group" />
              </SelectTrigger>
              <SelectContent align="end">
                {promoGroupSelect.map((promoGroup) => (
                  <SelectItem key={promoGroup.id} value={String(promoGroup.id)}>
                    {promoGroup.name}
                  </SelectItem>
                ))}
                <SelectSeparator />
                <SelectItemLink href={"/promo-group"}>
                  Create New Group
                </SelectItemLink>
              </SelectContent>
            </Select>
          </>
        );
      },
    },
    {
      id: "email",
      accessorKey: "email",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Email" />
      ),
      cell: ({ row }) => row.original.email,
      enableSorting: false,
      enableHiding: false,
    },
    {
      id: "Kakao Talk ID",
      accessorKey: "kakao_id",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Kakao Talk ID" />
      ),
      cell: ({ row }) => row.original.kakao_talk_id,
      enableSorting: false,
      enableHiding: false,
    },
    {
      id: "phone",
      accessorKey: "phone",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Phone" />
      ),
      cell: ({ row }) => row.original.phone_number,
      meta: {
        label: "Phone",
        placeholder: "Search phone...",
        variant: "text",
        icon: Text,
      },
      enableColumnFilter: false,
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
        return row.original.status ? "Active" : "Inactive";
      },
      meta: {
        label: "Status",
        placeholder: "Search status...",
        variant: "text",
        icon: Text,
      },
      enableColumnFilter: false,
      enableSorting: false,
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
                Edit
              </DropdownMenuItem>
              {/* <DropdownMenuSeparator />
              <DropdownMenuItem
                variant="destructive"
                onSelect={() => setRowAction({ row, variant: "delete" })}
              >
                Delete
              </DropdownMenuItem> */}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
      size: 40,
    },
  ];
}
