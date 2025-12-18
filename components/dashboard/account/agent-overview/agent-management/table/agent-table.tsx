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
import { getCountryPhoneOptions } from "@/server/general";

interface AgentTableProps {
  promises: Promise<
    [
      Awaited<ReturnType<typeof getAgentData>>,
      Awaited<ReturnType<typeof getPromoGroupSelect>>,
      Awaited<ReturnType<typeof getCountryPhoneOptions>>
    ]
  >;
}

const AgentTable = ({ promises }: AgentTableProps) => {
  const [isPending, startTransition] = useTransition();
  const [
    { data, pagination, status, error },
    { data: promoGroupSelect },
    countryOptions,
  ] = React.use(promises);

  const [rowAction, setRowAction] =
    React.useState<DataTableRowAction<Agent> | null>(null);
  const [agentData, setAgentData] = React.useState<Agent[]>(data || []);

  // Update agentData when data changes
  React.useEffect(() => {
    if (data) {
      setAgentData(data);
    }
  }, [data]);

  // Use the reusable export hook
  const { isExporting, handleDownload } = useExport(exportAgent);

  const columns = React.useMemo(
    () => getAgentTableColumns({ setRowAction, promoGroupSelect }),
    []
  );

  const { table } = useDataTable({
    data: agentData,
    columns,
    pageCount: pagination?.total_pages || 1,
    getRowId: (originalRow) => String(originalRow.id),
    shallow: false,
    clearOnDefault: true,
    startTransition,
  });

  // Handle agent update callback
  const handleAgentUpdate = React.useCallback((updatedAgent: Agent) => {
    // Update the agentData state
    setAgentData((prev) =>
      prev.map((agent) => (agent.id === updatedAgent.id ? updatedAgent : agent))
    );
    
    // Update the rowAction if it's the same agent
    if (rowAction?.row.original.id === updatedAgent.id) {
      setRowAction((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          row: {
            ...prev.row,
            original: updatedAgent,
          },
        };
      });
    }
  }, [rowAction]);

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
            <ExportButton
              isExporting={isExporting}
              onDownload={handleDownload}
            />
            <CreateAgentDialog
              promoGroupSelect={promoGroupSelect}
              countryOptions={countryOptions}
            />
          </DataTableToolbar>
        </DataTable>
      </div>
      {rowAction?.variant === "update" && (
        <EditAgentDialog
          promoGroupSelect={promoGroupSelect}
          countryOptions={countryOptions}
          open={rowAction?.variant === "update"}
          onOpenChange={() => setRowAction(null)}
          agent={rowAction?.row.original ?? null}
          onAgentUpdate={handleAgentUpdate}
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
