"use client";

import { getData } from "@/app/(dashboard)/account/agent-control/page";
import { AgentControlTableResponse } from "@/app/(dashboard)/account/agent-control/types";
import { DataTable } from "@/components/data-table/data-table";
import { DataTableToolbar } from "@/components/data-table/data-table-toolbar";
import { useDataTable } from "@/hooks/use-data-table";
import type { DataTableRowAction } from "@/types/data-table";
import React from "react";
import CreateAgentControlDialog from "../dialog/create-agent-control-dialog";
import { DeleteAgentControlDialog } from "../dialog/delete-agent-control-dialog";
import { DetailAgentControlDialog } from "../dialog/detail-agent-control-dialog";
import EditAgentControlDialog from "../dialog/edit-agent-control-dialog";
import { getAgentControlTableColumns } from "./agent-control-columns";

interface AgentControlTableProps {
  promises: Promise<[Awaited<ReturnType<typeof getData>>]>;
}

const AgentControlTable = ({ promises }: AgentControlTableProps) => {
  const [data] = React.use(promises);
  const [rowAction, setRowAction] =
    React.useState<DataTableRowAction<AgentControlTableResponse> | null>(null);

  const columns = React.useMemo(
    () =>
      getAgentControlTableColumns({
        setRowAction,
      }),
    []
  );

  const { table } = useDataTable({
    data,
    columns,
    pageCount: 2,
    getRowId: (originalRow) => originalRow.id,
    shallow: false,
    clearOnDefault: true,
  });

  return (
    <>
      <DataTable table={table}>
        <DataTableToolbar table={table}>
          <CreateAgentControlDialog />
        </DataTableToolbar>
      </DataTable>
      <DetailAgentControlDialog
        open={rowAction?.variant === "detail"}
        onOpenChange={() => setRowAction(null)}
        agentControl={rowAction?.row.original ? [rowAction.row.original] : []}
        onSuccess={() => rowAction?.row.toggleSelected(false)}
      />
      {rowAction?.variant === "update" && (
        <EditAgentControlDialog
          open={rowAction?.variant === "update"}
          onOpenChange={() => setRowAction(null)}
          agent={rowAction?.row.original ?? null}
        />
      )}
      <DeleteAgentControlDialog
        open={rowAction?.variant === "delete"}
        onOpenChange={() => setRowAction(null)}
        agentControl={rowAction?.row.original ? [rowAction.row.original] : []}
        showTrigger={false}
        onSuccess={() => rowAction?.row.toggleSelected(false)}
      />
    </>
  );
};

export default AgentControlTable;
