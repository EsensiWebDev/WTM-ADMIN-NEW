"use client";

import { getSuperAdminData } from "@/app/(dashboard)/account/user-management/super-admin/fetch";
import { SuperAdmin } from "@/app/(dashboard)/account/user-management/super-admin/types";
import { DataTable } from "@/components/data-table/data-table";
import { DataTableToolbar } from "@/components/data-table/data-table-toolbar";
import { useDataTable } from "@/hooks/use-data-table";
import type { DataTableRowAction } from "@/types/data-table";
import React, { useTransition } from "react";
import CreateSuperAdminDialog from "../dialog/create-super-admin-dialog";
import EditSuperAdminDialog from "../dialog/edit-super-admin-dialog";
import { getSuperAdminTableColumns } from "./super-admin-columns";

interface SuperAdminTableProps {
  promises: Promise<[Awaited<ReturnType<typeof getSuperAdminData>>]>;
}

const SuperAdminTable = ({ promises }: SuperAdminTableProps) => {
  const [isPending, startTransition] = useTransition();
  const [response] = React.use(promises);
  const { status, data, pagination } = response;

  const [rowAction, setRowAction] =
    React.useState<DataTableRowAction<SuperAdmin> | null>(null);

  const columns = React.useMemo(
    () => getSuperAdminTableColumns({ setRowAction }),
    []
  );

  const { table } = useDataTable({
    data,
    columns,
    pageCount: pagination?.total_pages || 0,
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
            <CreateSuperAdminDialog />
          </DataTableToolbar>
        </DataTable>
      </div>
      {rowAction?.variant === "update" && (
        <EditSuperAdminDialog
          open={rowAction?.variant === "update"}
          onOpenChange={() => setRowAction(null)}
          superAdmin={rowAction?.row.original ?? null}
        />
      )}
    </>
  );
};

export default SuperAdminTable;
