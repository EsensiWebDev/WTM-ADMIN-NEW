"use client";

import {
  getCompanyOptions,
  getData,
} from "@/app/(dashboard)/account/agent-overview/agent-control/fetch";
import { AgentControl } from "@/app/(dashboard)/account/agent-overview/agent-control/types";
import { DataTable } from "@/components/data-table/data-table";
import { DataTableToolbar } from "@/components/data-table/data-table-toolbar";
import { useDataTable } from "@/hooks/use-data-table";
import type { DataTableRowAction } from "@/types/data-table";
import React, { useTransition } from "react";
import { DeleteAgentControlDialog } from "../dialog/delete-agent-control-dialog";
import { DetailAgentControlDialog } from "../dialog/detail-agent-control-dialog";
import EditAgentControlDialog from "../dialog/edit-agent-control-dialog";
import { getAgentControlTableColumns } from "./agent-control-columns";

interface AgentControlTableProps {
  promises: Promise<
    [
      Awaited<ReturnType<typeof getData>>,
      Awaited<ReturnType<typeof getCompanyOptions>>
    ]
  >;
}

const AgentControlTable = ({ promises }: AgentControlTableProps) => {
  const [isPending, startTransition] = useTransition();
  const [{ data, pageCount }, companyOptions] = React.use(promises);
  const [rowAction, setRowAction] =
    React.useState<DataTableRowAction<AgentControl> | null>(null);

  const columns = React.useMemo(
    () =>
      getAgentControlTableColumns({
        setRowAction,
        companyOptions,
      }),
    []
  );

  const { table } = useDataTable({
    data: data || [],
    columns,
    pageCount,
    getRowId: (originalRow) => originalRow.id,
    shallow: false,
    clearOnDefault: true,
    startTransition,
  });

  return (
    <>
      <div className="relative">
        <DataTable table={table} isPending={isPending}>
          <DataTableToolbar table={table} isPending={isPending}>
            {/* <CreateAgentControlDialog /> */}
          </DataTableToolbar>
        </DataTable>
      </div>
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
