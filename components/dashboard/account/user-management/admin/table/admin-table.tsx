"use client";

import { getAdminData } from "@/app/(dashboard)/account/user-management/admin/fetch";
import { Admin } from "@/app/(dashboard)/account/user-management/admin/types";
import { DataTable } from "@/components/data-table/data-table";
import { DataTableToolbar } from "@/components/data-table/data-table-toolbar";
import { useDataTable } from "@/hooks/use-data-table";
import type { DataTableRowAction } from "@/types/data-table";
import React, { useTransition } from "react";
import CreateAdminDialog from "../dialog/create-admin-dialog";
import EditAdminDialog from "../dialog/edit-admin-dialog";
import { getAdminTableColumns } from "./admin-columns";

interface AdminTableProps {
  promises: Promise<[Awaited<ReturnType<typeof getAdminData>>]>;
}

const AdminTable = ({ promises }: AdminTableProps) => {
  const [isPending, startTransition] = useTransition();
  const [response] = React.use(promises);
  const { status, data, pagination, error } = response;

  const [rowAction, setRowAction] =
    React.useState<DataTableRowAction<Admin> | null>(null);

  const columns = React.useMemo(
    () => getAdminTableColumns({ setRowAction }),
    []
  );

  const { table } = useDataTable({
    data: data || [],
    columns,
    pageCount: pagination?.total_pages || 0,
    getRowId: (originalRow) => originalRow.id,
    shallow: false,
    clearOnDefault: true,
    startTransition,
  });

  if (error) {
    return <div>{error}</div>;
  }

  if (status === 403) {
    return <div>You don’t have permission to access this page.</div>;
  }

  if (status !== 200) {
    return <div>Failed to load data</div>;
  }

  return (
    <>
      <div className="relative">
        <DataTable table={table} isPending={isPending}>
          <DataTableToolbar table={table} isPending={isPending}>
            <CreateAdminDialog />
          </DataTableToolbar>
        </DataTable>
      </div>
      {rowAction?.variant === "update" && (
        <EditAdminDialog
          open={rowAction?.variant === "update"}
          onOpenChange={() => setRowAction(null)}
          admin={rowAction?.row.original ?? null}
        />
      )}
    </>
  );
};

export default AdminTable;
