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
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useDataTable } from "@/hooks/use-data-table";
import { CheckCircle, XCircle, AlertCircle, Loader2 } from "lucide-react";
import React, { useTransition } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
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
    return (
      <Alert variant="destructive" className="border-red-200 bg-red-50 dark:bg-red-950/20">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error loading data</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (status === 403) {
    return (
      <Alert variant="destructive" className="border-red-200 bg-red-50 dark:bg-red-950/20">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Access Denied</AlertTitle>
        <AlertDescription>
          You don't have permission to access this page. Please contact your administrator.
        </AlertDescription>
      </Alert>
    );
  }

  if (status !== 200) {
    return (
      <Alert variant="destructive" className="border-red-200 bg-red-50 dark:bg-red-950/20">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Failed to load data</AlertTitle>
        <AlertDescription>
          An error occurred while loading role-based access data. Please try again later.
        </AlertDescription>
      </Alert>
    );
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

  // Empty state check
  if (transformedData.length === 0) {
    return (
      <Alert className="border-blue-200 bg-blue-50/50 dark:bg-blue-950/20">
        <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
        <AlertTitle>No modules found</AlertTitle>
        <AlertDescription>
          There are no modules available to configure. Please contact your administrator.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="relative space-y-4">
      <DataTable
        table={table}
        isPending={isPending}
        renderSubRow={(page: RoleBasedAccessPageData) => (
          <>
            {page.actions.map((action, index) => {
              return (
                <TableRow 
                  key={`action-${index}`}
                  className="bg-muted/30 hover:bg-muted/50 transition-colors"
                >
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <span className="text-sm sm:text-base">{action.action}</span>
                    </div>
                  </TableCell>
                  {Object.entries(action.permissions).map(([role, allowed]) => {
                    const selectKey = `${role}-${page.id}-${action.actionKey}`;
                    const currentValue =
                      selectValueMap[selectKey] ?? String(allowed);
                    const isAllowed = currentValue === "true";

                    return (
                      <TableCell key={role} className="min-w-[130px] sm:min-w-[140px]">
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
                            className={cn(
                              "w-full min-w-[120px] sm:min-w-[140px]",
                              "**:data-[slot=select-value]:block **:data-[slot=select-value]:truncate",
                              isAllowed && "border-green-200 bg-green-50/50 dark:border-green-900 dark:bg-green-950/20",
                              !isAllowed && "border-red-200 bg-red-50/50 dark:border-red-900 dark:bg-red-950/20"
                            )}
                            size="sm"
                            id={`${role}-permission`}
                          >
                            <SelectValue placeholder="Assign permission">
                              <div className="flex items-center gap-2">
                                {isUpdatePending ? (
                                  <>
                                    <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
                                    <span className="font-medium">Updating...</span>
                                  </>
                                ) : isAllowed ? (
                                  <>
                                    <CheckCircle className="h-3.5 w-3.5 text-green-600 dark:text-green-400 shrink-0" />
                                    <span className="font-medium">Allow</span>
                                  </>
                                ) : (
                                  <>
                                    <XCircle className="h-3.5 w-3.5 text-red-600 dark:text-red-400 shrink-0" />
                                    <span className="font-medium">Deny</span>
                                  </>
                                )}
                              </div>
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent align="end" className="min-w-[140px]">
                            <SelectItem value="true" className="cursor-pointer">
                              <span className="flex items-center gap-2">
                                <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                                <span className="font-medium">Allow</span>
                              </span>
                            </SelectItem>
                            <SelectItem value="false" className="cursor-pointer">
                              <span className="flex items-center gap-2">
                                <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                                <span className="font-medium">Deny</span>
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
