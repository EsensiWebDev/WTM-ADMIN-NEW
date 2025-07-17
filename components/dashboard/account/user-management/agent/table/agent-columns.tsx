import { updatePromoGroup } from "@/app/(dashboard)/account/user-management/agent/actions";
import { Agent } from "@/app/(dashboard)/account/user-management/agent/types";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { DataTableRowAction } from "@/types/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { Ellipsis, Text } from "lucide-react";
import Link from "next/link";
import React from "react";
import { toast } from "sonner";

interface GetAgentTableColumnsProps {
  setRowAction: React.Dispatch<
    React.SetStateAction<DataTableRowAction<Agent> | null>
  >;
}

export function getAgentTableColumns({
  setRowAction,
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
      id: "name",
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
    },
    {
      id: "Agent Company",
      accessorKey: "company",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Agent Company" />
      ),
      cell: ({ row }) => row.original.company,
    },
    {
      id: "Promo Group",
      accessorKey: "promo_group",
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
              defaultValue={row.original.promo_group}
              onValueChange={(value) => {
                startUpdateTransition(() => {
                  toast.promise(updatePromoGroup(row.original.id, value), {
                    loading: "Updating promo group...",
                    success: (data) => data.message,
                    error: "Failed to change promo group",
                  });
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
                <SelectItem value="promo_a">Promo Group A</SelectItem>
                <SelectItem value="promo_b">Promo Group B</SelectItem>
                <SelectItem value="promo_c">Promo Group C</SelectItem>
                <SelectSeparator />
                <SelectItemLink href={"/dummy"}>
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
    },
    {
      id: "Kakao Talk ID",
      accessorKey: "kakao_id",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Kakao Talk ID" />
      ),
      cell: ({ row }) => row.original.kakao_id,
    },
    {
      id: "phone",
      accessorKey: "phone",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Phone" />
      ),
      cell: ({ row }) => row.original.phone,
      meta: {
        label: "Phone",
        placeholder: "Search phone...",
        variant: "text",
        icon: Text,
      },
      enableColumnFilter: false,
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

const SelectItemLink = ({
  href,
  children,
  className,
}: React.ComponentProps<typeof Link>) => {
  return (
    <Link
      href={href}
      className={cn(
        "hover:bg-accent hover:text-accent-foreground [&_svg:not([class*='text-'])]:text-muted-foreground relative flex w-full cursor-default items-center gap-2 rounded-sm py-1.5 pr-8 pl-2 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 *:[span]:last:flex *:[span]:last:items-center *:[span]:last:gap-2",
        className
      )}
    >
      {children}
    </Link>
  );
};
