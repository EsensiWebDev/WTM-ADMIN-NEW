import { updateAgentStatus } from "@/app/(dashboard)/account/agent-control/actions";
import { AgentControlTableResponse } from "@/app/(dashboard)/account/agent-control/types";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DataTableRowAction } from "@/types/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { CircleAlert, Ellipsis, EyeIcon, Text } from "lucide-react";
import React from "react";
import { toast } from "sonner";

interface GetAgentControlTableColumnsProps {
  setRowAction: React.Dispatch<
    React.SetStateAction<DataTableRowAction<AgentControlTableResponse> | null>
  >;
}

export function getAgentControlTableColumns({
  setRowAction,
}: GetAgentControlTableColumnsProps): ColumnDef<AgentControlTableResponse>[] {
  return [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
          className="translate-y-0.5"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
          className="translate-y-0.5"
        />
      ),
      enableSorting: false,
      enableHiding: false,
      size: 40,
    },
    {
      id: "agent_name",
      accessorKey: "name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Agent Name" />
      ),
      cell: ({ row }) => row.original.name,
      meta: {
        label: "Agent Name",
        placeholder: "Search agent name...",
        variant: "text",
        icon: Text,
      },
      enableColumnFilter: true,
      enableHiding: false,
    },
    {
      id: "agent_company",
      accessorKey: "company",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Agent Company" />
      ),
      cell: ({ row }) => row.original.company,
      meta: {
        label: "Company",
        placeholder: "Search agent company...",
        variant: "multiSelect",
        options: [{ label: "Esensi DIgital", value: "12", icon: CircleAlert }],
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
      id: "detail",
      accessorKey: "detail",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Details" />
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
      id: "status",
      accessorKey: "status",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Status" />
      ),
      cell: ({ row }) => {
        const [isUpdatePending, startUpdateTransition] = React.useTransition();

        return (
          <>
            <Label
              htmlFor={`${row.original.id}-promo-group`}
              className="sr-only"
            >
              Status
            </Label>
            <Select
              disabled={isUpdatePending}
              defaultValue={row.original.status}
              onValueChange={(value) => {
                startUpdateTransition(() => {
                  toast.promise(updateAgentStatus(row.original.id, value), {
                    loading: "Updating agent status...",
                    success: (data) => data.message,
                    error: "Failed to update agent status",
                  });
                });
              }}
            >
              <SelectTrigger
                className="w-38 **:data-[slot=select-value]:block **:data-[slot=select-value]:truncate"
                size="sm"
                id={`${row.original.id}-promo-group`}
              >
                <SelectValue placeholder="Assign promo group" />
              </SelectTrigger>
              <SelectContent align="end">
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </>
        );
      },
      enableHiding: false,
      enableSorting: false,
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
