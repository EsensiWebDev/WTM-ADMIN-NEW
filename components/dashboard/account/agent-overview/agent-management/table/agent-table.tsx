"use client";

import { getAgentData } from "@/app/(dashboard)/account/agent-overview/agent-management/fetch";
import { Agent } from "@/app/(dashboard)/account/agent-overview/agent-management/types";
import { DataTable } from "@/components/data-table/data-table";
import { DataTableToolbar } from "@/components/data-table/data-table-toolbar";
import { Button } from "@/components/ui/button";
import { useDataTable } from "@/hooks/use-data-table";
import type { DataTableRowAction } from "@/types/data-table";
import { IconCloudDownload } from "@tabler/icons-react";
import React, { useTransition } from "react";
import CreateAgentDialog from "../dialog/create-agent-dialog";
import { DeleteAgentDialog } from "../dialog/delete-agent-dialog";
import EditAgentDialog from "../dialog/edit-agent-dialog";
import { getAgentTableColumns } from "./agent-columns";

interface AgentTableProps {
  promises: Promise<[Awaited<ReturnType<typeof getAgentData>>]>;
}

const AgentTable = ({ promises }: AgentTableProps) => {
  const [isPending, startTransition] = useTransition();
  const [{ data, pageCount }] = React.use(promises);

  const [rowAction, setRowAction] =
    React.useState<DataTableRowAction<Agent> | null>(null);

  const columns = React.useMemo(
    () => getAgentTableColumns({ setRowAction }),
    []
  );

  const { table } = useDataTable({
    data,
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
            <Button variant={"outline"} className="border-primary">
              <IconCloudDownload />
              Download
            </Button>
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
