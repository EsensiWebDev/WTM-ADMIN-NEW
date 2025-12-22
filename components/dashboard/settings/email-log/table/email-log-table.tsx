"use client";

import { EmailLog } from "@/app/(dashboard)/email/email-log/types";

import { getData } from "@/app/(dashboard)/email/email-log/fetch";
import { DataTable } from "@/components/data-table/data-table";
import { DataTableToolbar } from "@/components/data-table/data-table-toolbar";
import { useDataTable } from "@/hooks/use-data-table";
import { getCompanyOptions } from "@/server/general";
import type { DataTableRowAction } from "@/types/data-table";
import React, { useTransition } from "react";
import { getEmailLogTableColumns } from "./email-log-columns";
import { EmailLogDetailDialog } from "../dialog/email-log-detail-dialog";
import { EmailPreviewDialog } from "../dialog/email-preview-dialog";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { RotateCcw } from "lucide-react";

interface EmailLogTableProps {
  promises: Promise<
    [
      Awaited<ReturnType<typeof getData>>,
      Awaited<ReturnType<typeof getCompanyOptions>>
    ]
  >;
}

const EmailLogTable = ({ promises }: EmailLogTableProps) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [{ data, pagination }, companyOptions] = React.use(promises);
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
    pageCount: pagination?.total_pages || 1,
    getRowId: (originalRow, index) =>
      `${index}_${originalRow.date_time}_${originalRow.hotel_name}`,
    shallow: false,
    clearOnDefault: true,
    startTransition,
  });

  const handleSuccess = () => {
    router.refresh();
  };

  return (
    <>
      <div className="relative">
        <DataTable table={table} isPending={isPending}>
          <DataTableToolbar table={table} isPending={isPending}>
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.refresh()}
              disabled={isPending}
              className="h-8"
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
          </DataTableToolbar>
        </DataTable>
      </div>
      <EmailLogDetailDialog
        open={rowAction?.variant === "detail"}
        onOpenChange={(open) => {
          if (!open) setRowAction(null);
        }}
        emailLogId={rowAction?.row.original.id || null}
        onSuccess={handleSuccess}
      />
      <EmailPreviewDialog
        open={rowAction?.variant === "preview"}
        onOpenChange={(open) => {
          if (!open) setRowAction(null);
        }}
        emailLogId={rowAction?.row.original.id || null}
      />
    </>
  );
};

export default EmailLogTable;
