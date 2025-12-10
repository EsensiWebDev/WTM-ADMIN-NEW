"use client";

import { updateRBA } from "@/app/(dashboard)/account/role-based-access/actions";
import { getRoleBasedAccessData } from "@/app/(dashboard)/account/role-based-access/fetch";
import {
  ModuleKey,
  RoleBasedAccessPageData,
} from "@/app/(dashboard)/account/role-based-access/types";
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
  const [selectValueMap, setSelectValueMap] = React.useState<
    Record<string, string>
  >({});
  const response = React.use(promise);
  const { data, status, error } = response;

  // Transform API response to table data structure
  const transformedData = React.useMemo(() => {
    if (!data || data.length === 0) return [];

    // Dynamically extract modules from the first role's access object
    const firstRoleAccess = data[0]?.access;
    if (!firstRoleAccess) return [];

    const moduleKeys = Object.keys(firstRoleAccess) as ModuleKey[];

    // Transform data for each module
    return moduleKeys.map((moduleKey) => {
      // Dynamically extract actions from the first module's actions object
      const firstModuleActions = firstRoleAccess[moduleKey];
      const actionKeys = Object.keys(firstModuleActions) as string[];

      // Format module name: "promo-group" → "Promo Group"
      const formatModuleName = (key: string) => {
        return key
          .split("-")
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" ");
      };

      // Format action name: "view" → "View"
      const formatActionName = (key: string) => {
        return key.charAt(0).toUpperCase() + key.slice(1);
      };

      return {
        id: moduleKey,
        name: formatModuleName(moduleKey),
        actions: actionKeys.map((actionKey) => {
          // Build permissions object for all roles
          const permissions: Record<string, boolean> = {};

          data.forEach((roleAccess) => {
            const moduleAccess = roleAccess.access[moduleKey];
            if (moduleAccess && actionKey in moduleAccess) {
              permissions[roleAccess.role] = moduleAccess[actionKey];
            }
          });

          return {
            action: formatActionName(actionKey),
            actionKey: actionKey,
            permissions,
          };
        }),
      };
    });
  }, [data]);

  // Extract unique roles from data
  const roles = React.useMemo(() => {
    if (!data || data.length === 0) return [];
    return data.map((roleAccess) => roleAccess.role);
  }, [data]);

  const columns = React.useMemo(
    () => getRoleBasedAccessTableColumns(roles),
    [roles]
  );

  const { table } = useDataTable({
    data: transformedData,
    columns,
    pageCount: 1,
    getRowId: (originalRow) => originalRow.id,
    shallow: false,
    clearOnDefault: true,
    startTransition,
  });

  if (error) {
    return <div>{error}</div>;
  }

  if (status === 403) {
    return <div>You don’t have permission to access this page.</div>;
  }

  if (status !== 200) {
    return <div>Failed to load data</div>;
  }

  const handleChangePermission = ({
    action,
    page,
    role,
    allowed,
  }: {
    action: string;
    page: string;
    role: string;
    allowed: boolean;
  }) => {
    const selectKey = `${role}-${page}-${action}`;
    const previousValue = selectValueMap[selectKey];

    // Update the select value immediately for optimistic UI
    setSelectValueMap((prev) => ({
      ...prev,
      [selectKey]: String(allowed),
    }));

    startUpdateTransition(async () => {
      const result = await updateRBA({ action, page, role, allowed });

      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.message);
        // Revert the select value to previous state
        setSelectValueMap((prev) => ({
          ...prev,
          [selectKey]: previousValue || String(!allowed),
        }));
      }
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
                  {Object.entries(action.permissions).map(([role, allowed]) => {
                    const selectKey = `${role}-${page.id}-${action.actionKey}`;
                    const currentValue =
                      selectValueMap[selectKey] ?? String(allowed);

                    return (
                      <TableCell key={role}>
                        <Select
                          disabled={isUpdatePending}
                          value={currentValue}
                          onValueChange={(value) =>
                            handleChangePermission({
                              action: action.actionKey,
                              page: page.id,
                              role: role.toLowerCase(),
                              allowed: value === "true",
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
                    );
                  })}
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
