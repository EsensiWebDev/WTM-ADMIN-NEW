"use client";

import { exportHistoryBookingLog } from "@/app/(dashboard)/booking-management/history-booking-log/actions";
import {
  getCompanyOptions,
  getData,
} from "@/app/(dashboard)/booking-management/history-booking-log/fetch";
import { HistoryBookingLog } from "@/app/(dashboard)/booking-management/history-booking-log/types";
import { DataTable } from "@/components/data-table/data-table";
import { DataTableToolbar } from "@/components/data-table/data-table-toolbar";
import { ExportButton } from "@/components/ui/export-button";
import { useDataTable } from "@/hooks/use-data-table";
import { useExport } from "@/lib/export-client";
import type { DataTableRowAction } from "@/types/data-table";
import React, { useTransition } from "react";
import { getHistoryBookingLogTableColumns } from "./history-booking-log-columns";

interface HistoryBookingLogTableProps {
  promises: Promise<
    [
      Awaited<ReturnType<typeof getData>>,
      Awaited<ReturnType<typeof getCompanyOptions>>
    ]
  >;
}

const HistoryBookingLogTable = ({ promises }: HistoryBookingLogTableProps) => {
  const [isPending, startTransition] = useTransition();
  const [{ data, pagination }, companyOptions] = React.use(promises);
  const [rowAction, setRowAction] =
    React.useState<DataTableRowAction<HistoryBookingLog> | null>(null);

  // Use the reusable export hook
  const { isExporting, handleDownload } = useExport(exportHistoryBookingLog);

  const columns = React.useMemo(
    () =>
      getHistoryBookingLogTableColumns({
        setRowAction,
        companyOptions,
      }),
    []
  );

  const { table } = useDataTable({
    data: data || [],
    columns,
    pageCount: pagination?.total_pages || 1,
    getRowId: (originalRow) => originalRow.booking_code,
    shallow: false,
    clearOnDefault: true,
    startTransition,
  });

  return (
    <>
      <div className="relative">
        <DataTable table={table} isPending={isPending}>
          <DataTableToolbar table={table} isPending={isPending}>
            <ExportButton
              isExporting={isExporting}
              onDownload={handleDownload}
            />
          </DataTableToolbar>
        </DataTable>
      </div>
    </>
  );
};

export default HistoryBookingLogTable;
