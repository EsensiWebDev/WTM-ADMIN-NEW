import { RoleBasedAccessPageData } from "@/app/(dashboard)/account/role-based-access/types";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ColumnDef } from "@tanstack/react-table";
import { ChevronDown } from "lucide-react";

export function getRoleBasedAccessTableColumns(): ColumnDef<RoleBasedAccessPageData>[] {
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
      id: "page_name",
      accessorKey: "name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Page Name" />
      ),
      cell: ({ row }) => {
        const page = row.original;
        return (
          <Button
            variant="ghost"
            onClick={() => row.toggleExpanded()}
            className="flex items-center gap-2 font-medium"
          >
            {page.name}
            <ChevronDown
              className={cn("size-4 transition-transform", {
                "rotate-180": row.getIsExpanded(),
              })}
            />
          </Button>
        );
      },
      enableColumnFilter: false,
      enableHiding: false,
      size: 400,
    },
    {
      id: "admin",
      accessorKey: "admin",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Admin" />
      ),
      cell: ({ row }) => <></>,
      enableSorting: false,
    },
    {
      id: "agent",
      accessorKey: "agent",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Agent" />
      ),
      cell: ({ row }) => <></>,
      enableSorting: false,
    },
    {
      id: "support",
      accessorKey: "support",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Support" />
      ),
      cell: ({ row }) => <></>,
      enableSorting: false,
    },
  ];
}
