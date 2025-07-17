"use client";

import { getData } from "@/app/(dashboard)/promo/fetch";
import { Promo } from "@/app/(dashboard)/promo/types";
import { DataTable } from "@/components/data-table/data-table";
import { DataTableToolbar } from "@/components/data-table/data-table-toolbar";
import { useDataTable } from "@/hooks/use-data-table";
import type { DataTableRowAction } from "@/types/data-table";
import React, { useTransition } from "react";
import CreatePromoDialog from "../dialog/create-promo-dialog";
import DeletePromoDialog from "../dialog/delete-promo-dialog";
import EditPromoDialog from "../dialog/edit-promo-dialog";
import { getPromoTableColumns } from "./promo-columns";

interface PromoTableProps {
  promises: Promise<[Awaited<ReturnType<typeof getData>>]>;
}

const PromoTable = ({ promises }: PromoTableProps) => {
  const [isPending, startTransition] = useTransition();
  const [{ data, pageCount }] = React.use(promises);
  const [rowAction, setRowAction] =
    React.useState<DataTableRowAction<Promo> | null>(null);

  const columns = React.useMemo(
    () =>
      getPromoTableColumns({
        setRowAction,
      }),
    []
  );

  const { table } = useDataTable({
    data,
    columns,
    pageCount,
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
            <CreatePromoDialog />
          </DataTableToolbar>
        </DataTable>
      </div>
      {rowAction?.variant === "update" && (
        <EditPromoDialog
          open={rowAction?.variant === "update"}
          onOpenChange={() => setRowAction(null)}
          promo={rowAction?.row.original ?? null}
        />
      )}
      <DeletePromoDialog
        open={rowAction?.variant === "delete"}
        onOpenChange={() => setRowAction(null)}
        promos={rowAction?.row.original ? [rowAction.row.original] : []}
        showTrigger={false}
        onSuccess={() => rowAction?.row.toggleSelected(false)}
      />
      {/* Detail dialog will be added here */}
    </>
  );
};

export default PromoTable;
