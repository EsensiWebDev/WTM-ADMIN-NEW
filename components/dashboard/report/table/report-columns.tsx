import { Report } from "@/app/(dashboard)/report/types";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DataTableRowAction, Option } from "@/types/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { Ellipsis, EyeIcon, Text } from "lucide-react";
import React from "react";

interface GetReportTableColumnsProps {
  setRowAction: React.Dispatch<
    React.SetStateAction<DataTableRowAction<Report> | null>
  >;
  companyOptions: Option[];
}

export function getReportTableColumns({
  setRowAction,
  companyOptions,
}: GetReportTableColumnsProps): ColumnDef<Report>[] {
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
        <DataTableColumnHeader column={column} title="Agent Name" />
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
      id: "company",
      accessorKey: "company",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Agent Company" />
      ),
      cell: ({ row }) => row.original.company,
      meta: {
        label: "Company",
        placeholder: "Search company...",
        variant: "multiSelect",
        options: companyOptions,
      },
      enableColumnFilter: true,
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
      id: "hotel_name",
      accessorKey: "hotel_name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Hotel Name" />
      ),
      cell: ({ row }) => row.original.hotel_name,
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
