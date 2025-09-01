import { updateAgentStatus } from "@/app/(dashboard)/account/agent-overview/agent-control/actions";
import { AgentControl } from "@/app/(dashboard)/account/agent-overview/agent-control/types";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DataTableRowAction, Option } from "@/types/data-table";
import { ColumnDef, Row } from "@tanstack/react-table";
import { EyeIcon, Text } from "lucide-react";
import React from "react";
import { toast } from "sonner";
import { ConfirmationDialog } from "../../../../confirmation-dialog";

interface GetAgentControlTableColumnsProps {
  setRowAction: React.Dispatch<
    React.SetStateAction<DataTableRowAction<AgentControl> | null>
  >;
  companyOptions: Option[];
}

export function getAgentControlTableColumns({
  setRowAction,
  companyOptions,
}: GetAgentControlTableColumnsProps): ColumnDef<AgentControl>[] {
  const getStatusColor = (value: string) => {
    if (value === "approved") return "text-green-600 bg-green-100";
    if (value === "rejected") return "text-red-600 bg-red-100";
    return "";
  };

  interface StatusCellProps {
    row: Row<AgentControl>;
  }

  function StatusCell({ row }: StatusCellProps) {
    const [isUpdatePending, startUpdateTransition] = React.useTransition();
    const [selectValue, setSelectValue] = React.useState(row.original.status);
    const [dialogOpen, setDialogOpen] = React.useState(false);
    const [pendingValue, setPendingValue] = React.useState<string | null>(null);

    const handleConfirm = async () => {
      if (!pendingValue) return;
      startUpdateTransition(() => {
        (async () => {
          try {
            const result = await updateAgentStatus(
              row.original.id,
              pendingValue
            );
            if (result?.success) {
              setSelectValue(pendingValue);
              setPendingValue(null);
              setDialogOpen(false);
              toast.success(result.message || "Status updated successfully");
            } else {
              toast.error(result?.message || "Failed to update status");
            }
          } catch (error) {
            toast.error("An error occurred. Please try again.");
          }
        })();
      });
    };

    const handleCancel = () => {
      setDialogOpen(false);
      setPendingValue(null);
    };

    return (
      <>
        <Label htmlFor={`${row.original.id}-promo-group`} className="sr-only">
          Status
        </Label>
        <Select
          disabled={isUpdatePending}
          value={selectValue}
          onValueChange={(value) => {
            setPendingValue(value);
            setDialogOpen(true);
          }}
        >
          <SelectTrigger
            className={`w-38 rounded-full px-3 border-0 shadow-none **:data-[slot=select-value]:block **:data-[slot=select-value]:truncate ${getStatusColor(
              selectValue
            )}`}
            id={`${row.original.id}-promo-group`}
          >
            <SelectValue placeholder="Assign promo group" />
          </SelectTrigger>
          <SelectContent align="end">
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
        <ConfirmationDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          onConfirm={handleConfirm}
          onCancel={handleCancel}
          isLoading={isUpdatePending}
          title="Change Approval Status"
          description={`You're about to update the approval status for this agent \n This change may affect their access in the system`}
        />
      </>
    );
  }

  return [
    {
      id: "no",
      header: "No",
      cell: ({ row }) => row.index + 1,
      enableSorting: false,
      enableHiding: false,
      size: 40,
    },
    {
      id: "agent_name",
      accessorKey: "name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Agent Name" />
      ),
      cell: ({ row }) => row.original.name,
      meta: {
        label: "Agent Name",
        placeholder: "Search agent name...",
        variant: "text",
        icon: Text,
      },
      enableColumnFilter: true,
      enableHiding: false,
    },
    {
      id: "agent_company",
      accessorKey: "company",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Agent Company" />
      ),
      cell: ({ row }) => row.original.company,
      meta: {
        label: "Company",
        placeholder: "Search agent company...",
        variant: "multiSelect",
        options: companyOptions,
      },
      enableColumnFilter: true,
    },
    {
      id: "Email",
      accessorKey: "email",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Email" />
      ),
      cell: ({ row }) => row.original.email,
    },
    {
      id: "detail",
      accessorKey: "detail",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Details" />
      ),
      cell: ({ row }) => {
        return (
          <Button
            size={"sm"}
            onClick={() => setRowAction({ row, variant: "detail" })}
          >
            <EyeIcon className="h-4 w-4" />
            See details
          </Button>
        );
      },
      enableHiding: false,
      enableSorting: false,
    },
    {
      id: "status",
      accessorKey: "status",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Status" />
      ),
      cell: ({ row }) => <StatusCell row={row} />,
      enableHiding: false,
      enableSorting: false,
    },
    // {
    //   id: "actions",
    //   cell: function Cell({ row }) {
    //     const [isUpdatePending, startUpdateTransition] = React.useTransition();

    //     return (
    //       <DropdownMenu>
    //         <DropdownMenuTrigger asChild>
    //           <Button
    //             aria-label="Open menu"
    //             variant="ghost"
    //             className="flex size-8 p-0 data-[state=open]:bg-muted"
    //           >
    //             <Ellipsis className="size-4" aria-hidden="true" />
    //           </Button>
    //         </DropdownMenuTrigger>
    //         <DropdownMenuContent align="end" className="w-40">
    //           <DropdownMenuItem
    //             onSelect={() => setRowAction({ row, variant: "update" })}
    //           >
    //             Edit
    //           </DropdownMenuItem>
    //           <DropdownMenuSeparator />
    //           <DropdownMenuItem
    //             variant="destructive"
    //             onSelect={() => setRowAction({ row, variant: "delete" })}
    //           >
    //             Delete
    //           </DropdownMenuItem>
    //         </DropdownMenuContent>
    //       </DropdownMenu>
    //     );
    //   },
    //   size: 40,
    // },
  ];
}
