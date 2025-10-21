"use client";

import { exportAgent } from "@/app/(dashboard)/account/agent-overview/agent-management/actions";
import {
  getAgentData,
  getPromoGroupSelect,
} from "@/app/(dashboard)/account/agent-overview/agent-management/fetch";
import { Agent } from "@/app/(dashboard)/account/agent-overview/agent-management/types";
import { DataTable } from "@/components/data-table/data-table";
import { DataTableToolbar } from "@/components/data-table/data-table-toolbar";
import { ExportButton } from "@/components/ui/export-button";
import { useDataTable } from "@/hooks/use-data-table";
import { useExport } from "@/lib/export-client";
import type { DataTableRowAction } from "@/types/data-table";
import React, { useTransition } from "react";
import CreateAgentDialog from "../dialog/create-agent-dialog";
import { DeleteAgentDialog } from "../dialog/delete-agent-dialog";
import EditAgentDialog from "../dialog/edit-agent-dialog";
import { getAgentTableColumns } from "./agent-columns";

interface AgentTableProps {
  promises: Promise<
    [
      Awaited<ReturnType<typeof getAgentData>>,
      Awaited<ReturnType<typeof getPromoGroupSelect>>
    ]
  >;
}

const AgentTable = ({ promises }: AgentTableProps) => {
  const [isPending, startTransition] = useTransition();
  const [{ data, pagination }, { data: promoGroupSelect }] =
    React.use(promises);

  const [rowAction, setRowAction] =
    React.useState<DataTableRowAction<Agent> | null>(null);

  // Use the reusable export hook
  const { isExporting, handleDownload } = useExport(exportAgent);

  const columns = React.useMemo(
    () => getAgentTableColumns({ setRowAction, promoGroupSelect }),
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

  return (
    <>
      <div className="relative">
        <DataTable table={table} isPending={isPending}>
          <DataTableToolbar table={table} isPending={isPending}>
            <ExportButton
              isExporting={isExporting}
              onDownload={handleDownload}
            />
            <CreateAgentDialog />
          </DataTableToolbar>
        </DataTable>
      </div>
      {rowAction?.variant === "update" && (
        <EditAgentDialog
          open={rowAction?.variant === "update"}
          onOpenChange={() => setRowAction(null)}
          agent={rowAction?.row.original ?? null}
        />
      )}
      <DeleteAgentDialog
        open={rowAction?.variant === "delete"}
        onOpenChange={() => setRowAction(null)}
        agent={rowAction?.row.original ? [rowAction.row.original] : []}
        showTrigger={false}
        onSuccess={() => rowAction?.row.toggleSelected(false)}
      />
    </>
  );
};

export default AgentTable;
