"use client";

import { getData, getPromoById } from "@/app/(dashboard)/promo/fetch";
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
import { useQuery } from "@tanstack/react-query";

interface PromoTableProps {
  promises: Promise<[Awaited<ReturnType<typeof getData>>]>;
}

const PromoTable = ({ promises }: PromoTableProps) => {
  const [isPending, startTransition] = useTransition();
  const [{ data, pagination }] = React.use(promises);
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
    data: data || [],
    columns,
    pageCount: pagination?.total_pages || 1,
    getRowId: (originalRow) => String(originalRow.id),
    shallow: false,
    clearOnDefault: true,
    startTransition,
  });

  const {
    data: promoDetail,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["promo-details", String(rowAction?.row.original.id)],
    queryFn: () => getPromoById(String(rowAction?.row.original.id)),
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 2,
    enabled: rowAction?.variant === "detail" || rowAction?.variant === "update",
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
      {!isLoading && !isError && rowAction?.variant === "update" && (
        <EditPromoDialog
          open={rowAction?.variant === "update"}
          onOpenChange={() => setRowAction(null)}
          promo={promoDetail?.data || null}
          isLoading={isLoading}
          isError={isError}
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
