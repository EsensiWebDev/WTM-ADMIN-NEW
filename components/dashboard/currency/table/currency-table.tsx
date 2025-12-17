"use client";

import { getCurrencies, getCurrencyById } from "@/app/(dashboard)/currency/fetch";
import { Currency } from "@/app/(dashboard)/currency/types";
import { DataTable } from "@/components/data-table/data-table";
import { DataTableToolbar } from "@/components/data-table/data-table-toolbar";
import { useDataTable } from "@/hooks/use-data-table";
import type { DataTableRowAction } from "@/types/data-table";
import { useQuery } from "@tanstack/react-query";
import React, { useTransition } from "react";
import CreateCurrencyDialog from "../dialog/create-currency-dialog";
import DeleteCurrencyDialog from "../dialog/delete-currency-dialog";
import EditCurrencyDialog from "../dialog/edit-currency-dialog";
import { getCurrencyTableColumns } from "./currency-columns";

interface CurrencyTableProps {
  promises: Promise<[Awaited<ReturnType<typeof getCurrencies>>]>;
}

const CurrencyTable = ({ promises }: CurrencyTableProps) => {
  const [isPending, startTransition] = useTransition();
  const [{ data, status, error, pagination }] = React.use(promises);
  const [rowAction, setRowAction] =
    React.useState<DataTableRowAction<Currency> | null>(null);

  const columns = React.useMemo(
    () =>
      getCurrencyTableColumns({
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
    manualFiltering: false,
    initialState: {
      columnVisibility: {
        search: false,
      },
    },
  });

  const {
    data: currencyDetail,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["currency-details", String(rowAction?.row.original.id)],
    queryFn: () => getCurrencyById(String(rowAction?.row.original.id)),
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 2,
    enabled: rowAction?.variant === "update",
  });

  if (error) {
    return <div>{error}</div>;
  }

  if (status === 403) {
    return <div>You don't have permission to access this page.</div>;
  }

  if (status !== 200) {
    return <div>Failed to load data</div>;
  }

  return (
    <>
      <div className="relative">
        <DataTable table={table} isPending={isPending}>
          <DataTableToolbar table={table} isPending={isPending}>
            <CreateCurrencyDialog />
          </DataTableToolbar>
        </DataTable>
      </div>
      {rowAction?.variant === "update" && (
        <EditCurrencyDialog
          open={rowAction?.variant === "update"}
          onOpenChange={() => setRowAction(null)}
          currency={
            rowAction?.row.original && currencyDetail?.data
              ? { 
                  ...rowAction.row.original,
                  ...currencyDetail.data,
                  id: rowAction.row.original.id,
                  code: rowAction.row.original.code 
                }
              : currencyDetail?.data || rowAction?.row.original || null
          }
          isLoading={isLoading}
          isError={isError}
        />
      )}
      <DeleteCurrencyDialog
        open={rowAction?.variant === "delete"}
        onOpenChange={() => setRowAction(null)}
        currencies={rowAction?.row.original ? [rowAction.row.original] : []}
        showTrigger={false}
        onSuccess={() => rowAction?.row.toggleSelected(false)}
      />
    </>
  );
};

export default CurrencyTable;

