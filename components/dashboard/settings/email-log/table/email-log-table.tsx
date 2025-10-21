"use client";

import { EmailLog } from "@/app/(dashboard)/settings/email-log/types";

import {
  getCompanyOptions,
  getData,
} from "@/app/(dashboard)/settings/email-log/fetch";
import { DataTable } from "@/components/data-table/data-table";
import { DataTableToolbar } from "@/components/data-table/data-table-toolbar";
import { useDataTable } from "@/hooks/use-data-table";
import type { DataTableRowAction } from "@/types/data-table";
import React, { useTransition } from "react";
import { getEmailLogTableColumns } from "./email-log-columns";

interface EmailLogTableProps {
  promises: Promise<
    [
      Awaited<ReturnType<typeof getData>>,
      Awaited<ReturnType<typeof getCompanyOptions>>
    ]
  >;
}

const EmailLogTable = ({ promises }: EmailLogTableProps) => {
  const [isPending, startTransition] = useTransition();
  const [{ data, page_count }, companyOptions] = React.use(promises);
  const [rowAction, setRowAction] =
    React.useState<DataTableRowAction<EmailLog> | null>(null);

  const columns = React.useMemo(
    () =>
      getEmailLogTableColumns({
        setRowAction,
        companyOptions,
      }),
    [companyOptions]
  );

  const { table } = useDataTable({
    data: data || [],
    columns,
    pageCount: page_count,
    getRowId: (originalRow) => `${originalRow.date}_${originalRow.hotel_name}`,
    shallow: false,
    clearOnDefault: true,
    startTransition,
  });

  return (
    <>
      <div className="relative">
        <DataTable table={table} isPending={isPending}>
          <DataTableToolbar table={table} isPending={isPending} />
        </DataTable>
      </div>
    </>
  );
};

export default EmailLogTable;
