"use client";

import { ConfirmationDialog } from "@/components/confirmation-dialog";
import { DataTable } from "@/components/data-table/data-table";
import { DataTableToolbar } from "@/components/data-table/data-table-toolbar";
import { Button } from "@/components/ui/button";
import { useDataTable } from "@/hooks/use-data-table";
import { formatDate } from "@/lib/format";
import { ColumnDef } from "@tanstack/react-table";
import { Search, Trash2 } from "lucide-react";
import { useMemo, useState, useTransition } from "react";
import { toast } from "sonner";
import AddPromoDialog from "./dialog/add-promo-dialog";
import { PromoGroupPromos } from "@/app/(dashboard)/promo-group/types";
import { removePromoGroupPromos } from "@/app/(dashboard)/promo-group/actions";

interface PromoDetailsCardProps {
  promos: PromoGroupPromos[];
  promoGroupId: string;
  pageCount: number;
}

const PromoDetailsCard = ({
  promos,
  promoGroupId,
  pageCount,
}: PromoDetailsCardProps) => {
  const [isPending, startTransition] = useTransition();

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [promoToDelete, setPromoToDelete] = useState<PromoGroupPromos | null>(
    null
  );
  const columns = useMemo<ColumnDef<PromoGroupPromos>[]>(
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
        header: "Promo Code",
        cell: ({ row }) => row.original.promo_code,
        enableHiding: false,
      },
      {
        id: "search",
        accessorKey: "search",
        header: "Promo Name",
        cell: ({ row }) => row.original.promo_name,
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
          const date = new Date(row.original.promo_start_date);
          return formatDate(date);
        },
      },
      {
        id: "end_date",
        accessorKey: "end_date",
        header: "Promo End Date",
        cell: ({ row }) => {
          const date = new Date(row.original.promo_end_date);
          return formatDate(date);
        },
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleDeleteClick(row.original)}
            className="h-8 w-8 p-0 text-destructive hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        ),
        enableSorting: false,
        enableHiding: false,
        size: 80,
      },
    ],
    []
  );

  const { table } = useDataTable({
    data: promos || [],
    columns,
    pageCount,
    getRowId: (originalRow) => String(originalRow.promo_id),
    shallow: false,
    clearOnDefault: true,
  });

  const handleDeleteClick = (promo: PromoGroupPromos) => {
    setPromoToDelete(promo);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!promoToDelete) return;

    startTransition(async () => {
      const { success, message } = await removePromoGroupPromos({
        promo_group_id: Number(promoGroupId),
        promo_id: Number(promoToDelete.promo_id),
      });
      if (!success) {
        toast.error(message || "Failed to remove promo");
        return;
      }

      toast.success(message || "Promo removed successfully");

      setDeleteDialogOpen(false);
    });
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setPromoToDelete(null);
  };

  return (
    <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Promo Details</h3>
        </div>

        <div className="relative">
          <DataTable table={table}>
            <DataTableToolbar table={table}>
              <AddPromoDialog promoGroupId={promoGroupId} />
            </DataTableToolbar>
          </DataTable>
        </div>
      </div>

      <ConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
        isLoading={isPending}
        title="Are you sure you want to remove this promo?"
        description={`Are you sure you want to remove "${promoToDelete?.promo_name}" from this promo group? This action cannot be undone.`}
      />
    </div>
  );
};

export default PromoDetailsCard;
