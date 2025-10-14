"use client";

import { getSupportData } from "@/app/(dashboard)/account/user-management/support/fetch";
import { Support } from "@/app/(dashboard)/account/user-management/support/types";
import { DataTable } from "@/components/data-table/data-table";
import { DataTableToolbar } from "@/components/data-table/data-table-toolbar";
import { useDataTable } from "@/hooks/use-data-table";
import type { DataTableRowAction } from "@/types/data-table";
import React, { useTransition } from "react";
import CreateSupportDialog from "../dialog/create-support-dialog";
import EditSupportDialog from "../dialog/edit-support-dialog";
import { getSupportTableColumns } from "./support-columns";

interface SupportTableProps {
  promises: Promise<[Awaited<ReturnType<typeof getSupportData>>]>;
}

const SupportTable = ({ promises }: SupportTableProps) => {
  const [isPending, startTransition] = useTransition();
  const [response] = React.use(promises);
  const { status, data, pagination } = response;

  const [rowAction, setRowAction] =
    React.useState<DataTableRowAction<Support> | null>(null);

  const columns = React.useMemo(
    () => getSupportTableColumns({ setRowAction }),
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

  if (status !== 200) {
    return <div>Failed to load data</div>;
  }

  return (
    <>
      <div className="relative">
        <DataTable table={table} isPending={isPending}>
          <DataTableToolbar table={table} isPending={isPending}>
            <CreateSupportDialog />
          </DataTableToolbar>
        </DataTable>
      </div>
      {rowAction?.variant === "update" && (
        <EditSupportDialog
          open={rowAction?.variant === "update"}
          onOpenChange={() => setRowAction(null)}
          support={rowAction?.row.original ?? null}
        />
      )}
    </>
  );
};

export default SupportTable;
