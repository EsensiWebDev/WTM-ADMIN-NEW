"use client";

import { Promo } from "@/app/(dashboard)/promo/types";
import { DataTable } from "@/components/data-table/data-table";
import { DataTableToolbar } from "@/components/data-table/data-table-toolbar";
import { useDataTable } from "@/hooks/use-data-table";
import { formatDate } from "@/lib/format";
import { ColumnDef } from "@tanstack/react-table";
import { Search } from "lucide-react";
import { useMemo } from "react";

interface PromoDetailsCardProps {
  promos: Promo[];
}

const PromoDetailsCard = ({ promos }: PromoDetailsCardProps) => {
  const columns = useMemo<ColumnDef<Promo>[]>(
    () => [
      {
        id: "no",
        header: "No.",
        cell: ({ row }) => row.index + 1,
        enableSorting: false,
        enableHiding: false,
        size: 40,
      },
      {
        id: "id",
        accessorKey: "id",
        header: "Promo ID",
        cell: ({ row }) => row.original.id,
        enableHiding: false,
      },
      {
        id: "name",
        accessorKey: "name",
        header: "Promo Name",
        cell: ({ row }) => row.original.name,
        meta: {
          label: "Promo Name",
          placeholder: "Search Promo Name Here...",
          variant: "text",
          icon: Search,
        },
        enableColumnFilter: true,
      },
      {
        id: "start_date",
        accessorKey: "start_date",
        header: "Promo Start Date",
        cell: ({ row }) => {
          const date = new Date(row.original.start_date);
          return formatDate(date);
        },
      },
      {
        id: "end_date",
        accessorKey: "end_date",
        header: "Promo End Date",
        cell: ({ row }) => {
          const date = new Date(row.original.end_date);
          return formatDate(date);
        },
      },
    ],
    []
  );

  const { table } = useDataTable({
    data: promos,
    columns,
    pageCount: Math.ceil(promos.length / 10), // Assuming 10 items per page
    getRowId: (originalRow) => originalRow.id,
    shallow: false,
    clearOnDefault: true,
  });

  return (
    <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Promo Details</h3>
        </div>

        <div className="relative">
          <DataTable table={table}>
            <DataTableToolbar table={table} />
          </DataTable>
        </div>
      </div>
    </div>
  );
};

export default PromoDetailsCard;
