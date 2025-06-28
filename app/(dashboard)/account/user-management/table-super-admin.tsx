"use client";

import { columns } from "@/components/dashboard/account/user-management/super-admin/columns";
import { DataTable } from "@/components/data-table/data-table";
import { DataTableToolbar } from "@/components/data-table/data-table-toolbar";
import { useDataTable } from "@/hooks/use-data-table";
import React from "react";
import { getData } from "./page";

interface TableSuperAdminProps {
  promise: Awaited<ReturnType<typeof getData>>;
}

const TableSuperAdmin = ({ promise }: TableSuperAdminProps) => {
  const data = React.use(promise);

  const { table } = useDataTable({
    data,
    columns,
    pageCount: 4,
    initialState: {
      sorting: [{ id: "name", desc: true }],
      columnPinning: { right: ["actions"] },
    },
    getRowId: (row) => String(row.id),
  });

  // With standard toolbar
  return (
    <DataTable table={table}>
      <DataTableToolbar table={table} />
    </DataTable>
  );
};

export default TableSuperAdmin;
