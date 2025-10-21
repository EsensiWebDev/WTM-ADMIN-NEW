"use client";

import { getPromoGroups } from "@/app/(dashboard)/promo-group/fetch";
import { PromoGroup } from "@/app/(dashboard)/promo-group/types";
import { DataTable } from "@/components/data-table/data-table";
import { DataTableToolbar } from "@/components/data-table/data-table-toolbar";
import { useDataTable } from "@/hooks/use-data-table";
import type { DataTableRowAction } from "@/types/data-table";
import React, { useTransition } from "react";
import CreatePromoGroupDialog from "../dialog/create-promo-group-dialog";
import DeletePromoGroupDialog from "../dialog/delete-promo-group-dialog";
import EditPromoGroupDialog from "../dialog/edit-promo-group-dialog";
import { getPromoGroupTableColumns } from "./promo-group-columns";

interface PromoGroupTableProps {
  promises: Promise<[Awaited<ReturnType<typeof getPromoGroups>>]>;
}

const PromoGroupTable = ({ promises }: PromoGroupTableProps) => {
  const [isPending, startTransition] = useTransition();
  const [{ data, pagination }] = React.use(promises);
  const [rowAction, setRowAction] =
    React.useState<DataTableRowAction<PromoGroup> | null>(null);

  const columns = React.useMemo(
    () =>
      getPromoGroupTableColumns({
        setRowAction,
      }),
    []
  );

  const { table } = useDataTable({
    data,
    columns,
    pageCount: pagination?.total_pages || 1,
    getRowId: (originalRow) => originalRow.id,
    shallow: false,
    clearOnDefault: true,
    startTransition,
  });

  return (
    <>
      <div className="relative">
        <DataTable table={table} isPending={isPending}>
          <DataTableToolbar table={table} isPending={isPending}>
            <CreatePromoGroupDialog />
          </DataTableToolbar>
        </DataTable>
      </div>
      {rowAction?.variant === "update" && (
        <EditPromoGroupDialog
          open={rowAction?.variant === "update"}
          onOpenChange={() => setRowAction(null)}
          promoGroup={rowAction?.row.original ?? null}
        />
      )}
      <DeletePromoGroupDialog
        open={rowAction?.variant === "delete"}
        onOpenChange={() => setRowAction(null)}
        promoGroups={rowAction?.row.original ? [rowAction.row.original] : []}
        showTrigger={false}
        onSuccess={() => rowAction?.row.toggleSelected(false)}
      />
      {/* Detail dialog will be added here */}
    </>
  );
};

export default PromoGroupTable;
