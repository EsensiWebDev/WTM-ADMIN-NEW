"use client";

import { getData } from "@/app/(dashboard)/banner/fetch";
import { Banner } from "@/app/(dashboard)/banner/types";
import { DataTable } from "@/components/data-table/data-table";
import { DataTableToolbar } from "@/components/data-table/data-table-toolbar";
import { useDataTable } from "@/hooks/use-data-table";
import type { DataTableRowAction } from "@/types/data-table";
import React, { useTransition } from "react";
import CreateBannerDialog from "../dialog/create-banner-dialog";
import DeleteBannerDialog from "../dialog/delete-banner-dialog";
import EditBannerDialog from "../dialog/edit-banner-dialog";
import { getBannerTableColumns } from "./banner-columns";

interface BannerTableProps {
  promises: Promise<[Awaited<ReturnType<typeof getData>>]>;
}

const BannerTable = ({ promises }: BannerTableProps) => {
  const [isPending, startTransition] = useTransition();
  const [{ data, status, error, pagination }] = React.use(promises);
  const [rowAction, setRowAction] =
    React.useState<DataTableRowAction<Banner> | null>(null);

  const columns = React.useMemo(
    () =>
      getBannerTableColumns({
        setRowAction,
        total: pagination?.total || 0,
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

  if (error) {
    return <div>{error}</div>;
  }

  if (status !== 200) {
    return <div>Failed to load data</div>;
  }

  return (
    <>
      <div className="relative">
        <DataTable table={table} isPending={isPending}>
          <DataTableToolbar table={table} isPending={isPending}>
            <CreateBannerDialog />
          </DataTableToolbar>
        </DataTable>
      </div>
      {rowAction?.variant === "update" && (
        <EditBannerDialog
          open={rowAction?.variant === "update"}
          onOpenChange={() => setRowAction(null)}
          banner={rowAction?.row.original || null}
        />
      )}
      <DeleteBannerDialog
        open={rowAction?.variant === "delete"}
        onOpenChange={() => setRowAction(null)}
        banners={rowAction?.row.original ? [rowAction.row.original] : []}
        showTrigger={false}
        onSuccess={() => rowAction?.row.toggleSelected(false)}
      />
    </>
  );
};

export default BannerTable;
