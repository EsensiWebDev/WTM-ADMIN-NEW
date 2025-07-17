"use client";

import { updateRBA } from "@/app/(dashboard)/account/role-based-access/actions";
import { getRoleBasedAccessData } from "@/app/(dashboard)/account/role-based-access/fetch";
import { RoleBasedAccessPageData } from "@/app/(dashboard)/account/role-based-access/types";
import { DataTable } from "@/components/data-table/data-table";
import { DataTableToolbar } from "@/components/data-table/data-table-toolbar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TableCell, TableRow } from "@/components/ui/table";
import { useDataTable } from "@/hooks/use-data-table";
import { CheckCircle, XCircle } from "lucide-react";
import React, { useTransition } from "react";
import { toast } from "sonner";
import { getRoleBasedAccessTableColumns } from "./role-based-access-columns";

interface RoleBasedAccessTableProps {
  promise: Promise<Awaited<ReturnType<typeof getRoleBasedAccessData>>>;
}

const RoleBasedAccessTable = ({ promise }: RoleBasedAccessTableProps) => {
  const [isPending, startTransition] = useTransition();
  const [isUpdatePending, startUpdateTransition] = useTransition();
  const { data, pageCount } = React.use(promise);
  const columns = React.useMemo(() => getRoleBasedAccessTableColumns(), []);

  const { table } = useDataTable({
    data,
    columns,
    pageCount,
    getRowId: (originalRow) => originalRow.id,
    shallow: false,
    clearOnDefault: true,
    startTransition,
  });

  const handleChangePermission = ({
    pageId,
    roleId,
    status,
  }: {
    pageId: string;
    roleId: string;
    status: boolean;
  }) => {
    startUpdateTransition(() => {
      toast.promise(updateRBA({ pageId, roleId, status }), {
        loading: "Updating role based...",
        success: (data) => data.message,
        error: "Failed to update role based",
      });
    });
  };

  return (
    <div className="relative">
      <DataTable
        table={table}
        isPending={isPending}
        renderSubRow={(page: RoleBasedAccessPageData) => (
          <>
            {page.actions.map((action, index) => {
              return (
                <TableRow key={`action-${index}`}>
                  <TableCell />
                  <TableCell>{action.action}</TableCell>
                  {Object.entries(action.permissions).map(([role, allowed]) => (
                    <TableCell key={role}>
                      <Select
                        disabled={isUpdatePending}
                        defaultValue={String(allowed)}
                        onValueChange={(value) =>
                          handleChangePermission({
                            pageId: String(index),
                            roleId: role,
                            status: value === "true",
                          })
                        }
                      >
                        <SelectTrigger
                          className="w-38 **:data-[slot=select-value]:block **:data-[slot=select-value]:truncate"
                          size="sm"
                          id={`${role}-permission`}
                        >
                          <SelectValue placeholder="Assign permission" />
                        </SelectTrigger>
                        <SelectContent align="end">
                          <SelectItem value="true">
                            <span className="flex items-center gap-2">
                              <CheckCircle className="w-4 h-4 text-green-500" />
                              Allow
                            </span>
                          </SelectItem>
                          <SelectItem value="false">
                            <span className="flex items-center gap-2">
                              <XCircle className="w-4 h-4 text-red-500" />
                              Deny
                            </span>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                  ))}
                </TableRow>
              );
            })}
          </>
        )}
      >
        <DataTableToolbar table={table} isPending={isPending}>
          {/* Add create dialog or actions here if needed */}
        </DataTableToolbar>
      </DataTable>
    </div>
  );
};

export default RoleBasedAccessTable;
