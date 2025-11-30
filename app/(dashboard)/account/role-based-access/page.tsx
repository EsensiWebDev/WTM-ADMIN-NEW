import RoleBasedAccessTable from "@/components/dashboard/account/role-based-access/table/role-based-access-table";
import { DataTableSkeleton } from "@/components/data-table/data-table-skeleton";
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
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Role Based Access</h1>
      </div>
      <div className="w-full">
        <React.Suspense
          fallback={
            <DataTableSkeleton
              columnCount={2}
              filterCount={0}
              cellWidths={["10rem", "30rem"]}
            />
          }
        >
          <RoleBasedAccessTable promise={promise} />
        </React.Suspense>
      </div>
    </div>
  );
};

export default RoleBasedAccessPage;
