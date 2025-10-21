"use client";

import {
  getCompanyOptions,
  getData,
  getHotelOptions,
} from "@/app/(dashboard)/report/fetch";
import { Report } from "@/app/(dashboard)/report/types";
import { DataTable } from "@/components/data-table/data-table";
import { DataTableToolbar } from "@/components/data-table/data-table-toolbar";
import { useDataTable } from "@/hooks/use-data-table";
import type { DataTableRowAction } from "@/types/data-table";
import React, { useTransition } from "react";
import { DeleteReportDialog } from "../dialog/delete-report-dialog";
import { DetailReportDialog } from "../dialog/detail-report-dialog";
import EditReportDialog from "../dialog/edit-report-dialog";
import { getReportTableColumns } from "./report-columns";

interface ReportTableProps {
  promises: Promise<
    [
      Awaited<ReturnType<typeof getData>>,
      Awaited<ReturnType<typeof getCompanyOptions>>,
      Awaited<ReturnType<typeof getHotelOptions>>
    ]
  >;
}

const ReportTable = ({ promises }: ReportTableProps) => {
  const [isPending, startTransition] = useTransition();
  const [{ data, pageCount }, companyOptions, hotelOptions] =
    React.use(promises);
  const [rowAction, setRowAction] =
    React.useState<DataTableRowAction<Report> | null>(null);

  const columns = React.useMemo(
    () =>
      getReportTableColumns({
        setRowAction,
        companyOptions,
        hotelOptions,
      }),
    []
  );

  const { table } = useDataTable({
    data: data || [],
    columns,
    pageCount,
    getRowId: (originalRow) => originalRow.id,
    shallow: false,
    clearOnDefault: true,
    startTransition,
    initialState: {
      columnVisibility: {
        period_date: false,
      },
    },
  });

  return (
    <>
      <div className="relative">
        <DataTable table={table} isPending={isPending}>
          <DataTableToolbar table={table} isPending={isPending}>
            {/* <CreateReportDialog /> */}
          </DataTableToolbar>
        </DataTable>
      </div>
      <DetailReportDialog
        open={rowAction?.variant === "detail"}
        onOpenChange={() => setRowAction(null)}
        report={rowAction?.row.original ? rowAction.row.original : null}
        onSuccess={() => rowAction?.row.toggleSelected(false)}
      />
      {rowAction?.variant === "update" && (
        <EditReportDialog
          open={rowAction?.variant === "update"}
          onOpenChange={() => setRowAction(null)}
          report={rowAction?.row.original ?? null}
        />
      )}
      <DeleteReportDialog
        open={rowAction?.variant === "delete"}
        onOpenChange={() => setRowAction(null)}
        report={rowAction?.row.original ? [rowAction.row.original] : []}
        showTrigger={false}
        onSuccess={() => rowAction?.row.toggleSelected(false)}
      />
    </>
  );
};

export default ReportTable;
