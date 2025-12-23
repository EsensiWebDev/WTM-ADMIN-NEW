"use client";

import { updateRBA } from "@/app/(dashboard)/account/role-based-access/actions";
import { getRoleBasedAccessData } from "@/app/(dashboard)/account/role-based-access/fetch";
import {
  ModuleKey,
  RoleBasedAccessPageData,
} from "@/app/(dashboard)/account/role-based-access/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import {
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
  Shield,
  Lock,
  Unlock,
  ChevronDown,
} from "lucide-react";
import React, { useTransition } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface RoleBasedAccessCardProps {
  promise: Promise<Awaited<ReturnType<typeof getRoleBasedAccessData>>>;
}

const RoleBasedAccessCard = ({ promise }: RoleBasedAccessCardProps) => {
  const [isPending, startTransition] = useTransition();
  const [isUpdatePending, startUpdateTransition] = useTransition();
  const [selectValueMap, setSelectValueMap] = React.useState<
    Record<string, string>
  >({});
  const [expandedModuleId, setExpandedModuleId] = React.useState<string | null>(null);
  const response = React.use(promise);
  const { data, status, error } = response;

  // Transform API response to card data structure
  const transformedData = React.useMemo(() => {
    if (!data || data.length === 0) return [];

    const firstRoleAccess = data[0]?.access;
    if (!firstRoleAccess) return [];

    const moduleKeys = Object.keys(firstRoleAccess) as ModuleKey[];

    const formatModuleName = (key: string) => {
      return key
        .split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
    };

    const formatActionName = (key: string) => {
      return key.charAt(0).toUpperCase() + key.slice(1);
    };

    return moduleKeys.map((moduleKey) => {
      const firstModuleActions = firstRoleAccess[moduleKey];
      const actionKeys = Object.keys(firstModuleActions) as string[];

      return {
        id: moduleKey,
        name: formatModuleName(moduleKey),
        actions: actionKeys.map((actionKey) => {
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
        setSelectValueMap((prev) => ({
          ...prev,
          [selectKey]: previousValue || String(!allowed),
        }));
      }
    });
  };

  return (
    // Use flexbox instead of CSS grid so each card can expand independently
    // without forcing other cards in the same row to match its height.
    <div className="flex flex-wrap gap-4 sm:gap-6">
      {transformedData.map((module) => (
        <Card
          key={module.id}
          className="flex flex-col overflow-hidden border-2 hover:border-primary/50 transition-colors w-full md:w-[calc(50%-0.5rem)] lg:w-[calc(33.333%-0.666rem)]"
        >
          <CardHeader className="pb-3 border-b bg-muted/30">
            <button
              type="button"
              onClick={() =>
                setExpandedModuleId((prev) =>
                  prev === module.id ? null : module.id
                )
              }
              className="flex w-full items-start gap-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 rounded-lg px-1 -mx-1 py-1"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 shrink-0">
                <Shield className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start gap-2">
                  <div className="flex-1 min-w-0 space-y-1">
                    <CardTitle className="text-base sm:text-lg font-semibold truncate">
                      {module.name}
                    </CardTitle>
                    <CardDescription className="text-[11px] sm:text-xs flex items-center gap-1 text-muted-foreground">
                      <span>
                        {module.actions.length}{" "}
                        {module.actions.length === 1 ? "action" : "actions"}
                      </span>
                      <span className="text-[9px] sm:text-[10px] uppercase tracking-wide">
                        • Click to {expandedModuleId === module.id ? "collapse" : "expand"}
                      </span>
                    </CardDescription>
                  </div>
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 mt-1 shrink-0 text-muted-foreground transition-transform duration-200",
                      expandedModuleId === module.id && "rotate-180"
                    )}
                  />
                </div>
              </div>
            </button>
          </CardHeader>

          {expandedModuleId === module.id && (
            <CardContent className="flex-1 p-4 sm:p-6 space-y-4">
              {module.actions.map((action, index) => (
                <div key={index}>
                  {index > 0 && <Separator className="my-4" />}

                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                      <span className="font-medium text-sm sm:text-base">
                        {action.action}
                      </span>
                    </div>

                    <div className="grid gap-2 pl-3.5">
                      {roles.map((role) => {
                        const selectKey = `${role}-${module.id}-${action.actionKey}`;
                        const currentValue =
                          selectValueMap[selectKey] ??
                          String(action.permissions[role] ?? false);
                        const isAllowed = currentValue === "true";

                        return (
                          <div
                            key={role}
                            className="flex items-center justify-between gap-3 p-2 rounded-md bg-muted/30 hover:bg-muted/50 transition-colors"
                          >
                            <div className="flex items-center gap-2 min-w-0 flex-1">
                              <Badge
                                variant="outline"
                                className="text-xs font-medium shrink-0"
                              >
                                {role}
                              </Badge>
                              <span
                                className={cn(
                                  "text-xs sm:text-sm font-medium truncate",
                                  isAllowed
                                    ? "text-green-700 dark:text-green-400"
                                    : "text-red-700 dark:text-red-400"
                                )}
                              >
                                {isAllowed ? "Allowed" : "Denied"}
                              </span>
                            </div>

                            <Select
                              disabled={isUpdatePending}
                              value={currentValue}
                              onValueChange={(value) =>
                                handleChangePermission({
                                  action: action.actionKey,
                                  page: module.id,
                                  role: role.toLowerCase(),
                                  allowed: value === "true",
                                })
                              }
                            >
                              <SelectTrigger
                                className={cn(
                                  "w-[100px] sm:w-[110px] h-8",
                                  isAllowed &&
                                    "border-green-200 bg-green-50/50 dark:border-green-900 dark:bg-green-950/20",
                                  !isAllowed &&
                                    "border-red-200 bg-red-50/50 dark:border-red-900 dark:bg-red-950/20"
                                )}
                                size="sm"
                              >
                                <SelectValue>
                                  <div className="flex items-center gap-1.5">
                                    {isUpdatePending ? (
                                      <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
                                    ) : isAllowed ? (
                                      <Unlock className="h-3 w-3 text-green-600 dark:text-green-400" />
                                    ) : (
                                      <Lock className="h-3 w-3 text-red-600 dark:text-red-400" />
                                    )}
                                    <span className="text-xs font-medium">
                                      {isAllowed ? "Allow" : "Deny"}
                                    </span>
                                  </div>
                                </SelectValue>
                              </SelectTrigger>
                              <SelectContent align="end" className="min-w-[110px]">
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
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          )}
        </Card>
      ))}
    </div>
  );
};

export default RoleBasedAccessCard;

