"use client";

import {
  getReportAgent,
  getReportAgentDetail,
} from "@/app/(dashboard)/report/fetch";
import { ReportAgent } from "@/app/(dashboard)/report/types";
import { DataTable } from "@/components/data-table/data-table";
import { DataTableToolbar } from "@/components/data-table/data-table-toolbar";
import { useDataTable } from "@/hooks/use-data-table";
import { getCompanyOptions, getHotelOptions } from "@/server/general";
import type { DataTableRowAction } from "@/types/data-table";
import { useQuery } from "@tanstack/react-query";
import React, { useTransition } from "react";
import { DetailReportDialog } from "../dialog/detail-report-dialog";
import { getReportTableColumns } from "./report-columns";

interface ReportTableProps {
  promises: Promise<
    [
      Awaited<ReturnType<typeof getReportAgent>>,
      Awaited<ReturnType<typeof getCompanyOptions>>,
      Awaited<ReturnType<typeof getHotelOptions>>
    ]
  >;
}

const ReportTable = ({ promises }: ReportTableProps) => {
  const [isPending, startTransition] = useTransition();
  const [{ data, pagination }, companyOptions, hotelOptions] =
    React.use(promises);
  const [rowAction, setRowAction] =
    React.useState<DataTableRowAction<ReportAgent> | null>(null);

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
    pageCount: pagination?.total_pages || 1,
    getRowId: (originalRow) =>
      originalRow.hotel_name +
      originalRow.agent_name +
      originalRow.agent_company,
    shallow: false,
    clearOnDefault: true,
    startTransition,
    initialState: {
      columnVisibility: {
        period_date: false,
      },
    },
  });

  console.log({ dataRow: rowAction?.row.original });

  const query = useQuery({
    queryKey: [
      "report-agent-details",
      `agent-${rowAction?.row.original?.agent_id}`,
      `hotel-${rowAction?.row.original?.hotel_id}`,
    ],
    queryFn: async () => {
      const data = await getReportAgentDetail({
        searchParams: {
          agent_id: String(rowAction?.row.original?.agent_id),
          hotel_id: String(rowAction?.row.original?.hotel_id),
        },
      });
      return data;
    },
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    enabled: rowAction?.variant === "detail",
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
        onSuccess={() => rowAction?.row.toggleSelected(false)}
        query={query}
      />
    </>
  );
};

export default ReportTable;
