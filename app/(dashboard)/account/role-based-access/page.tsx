import RoleBasedAccessCard from "@/components/dashboard/account/role-based-access/card/role-based-access-card";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Shield, Info } from "lucide-react";
import { SearchParams } from "@/types";
import React from "react";
import { getRoleBasedAccessData } from "./fetch";

const RoleBasedAccessPage = async (props: {
  searchParams: Promise<SearchParams>;
}) => {
  // Require Super Admin role - redirects to /unauthorized if not authorized
  // await requireAuthorization({ requiredRole: "Super Admin" });

  const searchParams = await props.searchParams;
  const promise = getRoleBasedAccessData({
    searchParams,
  });

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-lg bg-primary/10 shrink-0">
              <Shield className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Role Based Access</h1>
          </div>
          <p className="text-sm text-muted-foreground max-w-2xl pl-0 sm:pl-12">
            Manage permissions and access controls for different user roles across all system modules.
            Configure what actions each role can perform on specific pages.
          </p>
        </div>
      </div>

      {/* Info Card */}
      <Card className="border-blue-200 bg-blue-50/50 dark:border-blue-900 dark:bg-blue-950/20">
        <CardHeader className="pb-3 px-4 sm:px-6">
          <div className="flex items-start gap-2 sm:gap-3">
            <Info className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
            <div className="space-y-1">
              <CardTitle className="text-sm sm:text-base">How it works</CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Each module is displayed as a card with its available actions. Use the dropdown menus 
                next to each role to allow or deny specific permissions. Changes are saved automatically.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Card Grid Section */}
      <React.Suspense
        fallback={
          <div className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="overflow-hidden">
                <CardHeader className="pb-3 border-b bg-muted/30">
                  <div className="flex items-start gap-3">
                    <Skeleton className="h-10 w-10 rounded-lg" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-5 w-32" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-4 sm:p-6 space-y-4">
                  {[1, 2].map((j) => (
                    <div key={j} className="space-y-3">
                      <Skeleton className="h-4 w-20" />
                      <div className="space-y-2 pl-3.5">
                        {[1, 2, 3].map((k) => (
                          <Skeleton key={k} className="h-12 w-full" />
                        ))}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>
        }
      >
        <RoleBasedAccessCard promise={promise} />
      </React.Suspense>
    </div>
  );
};

export default RoleBasedAccessPage;
