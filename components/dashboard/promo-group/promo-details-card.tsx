"use client";

import { editPromoGroupPromos } from "@/app/(dashboard)/promo-group/actions";
import { ConfirmationDialog } from "@/components/confirmation-dialog";
import { DataTable } from "@/components/data-table/data-table";
import { DataTableToolbar } from "@/components/data-table/data-table-toolbar";
import { Button } from "@/components/ui/button";
import { useDataTable } from "@/hooks/use-data-table";
import { formatDate } from "@/lib/format";
import { ColumnDef } from "@tanstack/react-table";
import { Search, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import AddPromoDialog from "./dialog/add-promo-dialog";
import { PromoGroupPromos } from "@/app/(dashboard)/promo-group/types";

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
  const [localPromos, setLocalPromos] = useState<PromoGroupPromos[]>(promos);
  const [isPending, startTransition] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [promoToDelete, setPromoToDelete] = useState<PromoGroupPromos | null>(
    null
  );
  const [isDeleting, setIsDeleting] = useState(false);
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
        header: "Promo ID",
        cell: ({ row }) => row.original.promo_id,
        enableHiding: false,
      },
      {
        id: "name",
        accessorKey: "name",
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
    data: localPromos || [],
    columns,
    pageCount,
    getRowId: (originalRow) => String(originalRow.promo_id),
    shallow: false,
    clearOnDefault: true,
  });

  const handleAddPromo = async (promo: PromoGroupPromos) => {
    const newPromos = [...localPromos, promo];
    setLocalPromos(newPromos);

    // Update on server
    startTransition(true);
    try {
      const result = await editPromoGroupPromos(promoGroupId, newPromos);
      if (result.success) {
        toast.success("Promo added to group successfully");
      } else {
        toast.error("Failed to add promo to group");
        // Revert the local state
        setLocalPromos(localPromos);
      }
    } catch (error) {
      console.error("Error adding promo:", error);
      toast.error("Failed to add promo to group");
      // Revert the local state
      setLocalPromos(localPromos);
    } finally {
      startTransition(false);
    }
  };

  const handleDeleteClick = (promo: PromoGroupPromos) => {
    setPromoToDelete(promo);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!promoToDelete) return;

    setIsDeleting(true);
    const updatedPromos = localPromos.filter(
      (p) => p.promo_id !== promoToDelete.promo_id
    );
    const previousPromos = [...localPromos];

    // Optimistically update local state
    setLocalPromos(updatedPromos);

    try {
      const result = await editPromoGroupPromos(promoGroupId, updatedPromos);
      if (result.success) {
        toast.success("Promo removed from group successfully");
      } else {
        toast.error("Failed to remove promo from group");
        // Revert the local state
        setLocalPromos(previousPromos);
      }
    } catch (error) {
      console.error("Error removing promo:", error);
      toast.error("Failed to remove promo from group");
      // Revert the local state
      setLocalPromos(previousPromos);
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
      setPromoToDelete(null);
    }
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
              <AddPromoDialog
                onAdd={handleAddPromo}
                currentPromos={localPromos}
              />
            </DataTableToolbar>
          </DataTable>
        </div>
      </div>

      <ConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
        isLoading={isDeleting}
        title="Are you sure you want to remove this promo?"
        description={`Are you sure you want to remove "${promoToDelete?.promo_name}" from this promo group? This action cannot be undone.`}
      />
    </div>
  );
};

export default PromoDetailsCard;
