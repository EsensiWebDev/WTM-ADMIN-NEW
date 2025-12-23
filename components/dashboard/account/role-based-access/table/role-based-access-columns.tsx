import { RoleBasedAccessPageData } from "@/app/(dashboard)/account/role-based-access/types";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { ColumnDef } from "@tanstack/react-table";
import { ChevronDown, Shield } from "lucide-react";

export function getRoleBasedAccessTableColumns(
  roles: string[]
): ColumnDef<RoleBasedAccessPageData>[] {
  const baseColumns: ColumnDef<RoleBasedAccessPageData>[] = [
    {
      id: "page_name",
      accessorKey: "name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Module" />
      ),
      cell: ({ row }) => {
        const page = row.original;
        return (
          <Button
            variant="ghost"
            onClick={() => row.toggleExpanded()}
            className={cn(
              "flex items-center gap-2 font-semibold hover:bg-muted/50 transition-colors",
              "justify-start w-full h-auto py-2 px-2 sm:px-3 rounded-md text-sm sm:text-base"
            )}
          >
            <Shield className="h-4 w-4 text-primary shrink-0" />
            <span className="text-left truncate">{page.name}</span>
            <ChevronDown
              className={cn(
                "h-4 w-4 ml-auto transition-transform duration-200 text-muted-foreground shrink-0",
                {
                  "rotate-180": row.getIsExpanded(),
                }
              )}
            />
          </Button>
        );
      },
      enableColumnFilter: false,
      enableHiding: false,
      enableSorting: false,
      size: 300,
    },
  ];

  // Dynamically create columns for each role
  const roleColumns: ColumnDef<RoleBasedAccessPageData>[] = roles.map(
    (role) => ({
      id: role.toLowerCase(),
      accessorKey: role.toLowerCase(),
      header: () => (
        <div className="flex items-center justify-center">
          <Badge variant="outline" className="text-xs font-semibold">
            {role}
          </Badge>
        </div>
      ),
      cell: ({ row }) => <></>,
      enableSorting: false,
      enableHiding: false,
      size: 150,
    })
  );

  return [...baseColumns, ...roleColumns];
}
