import SuperAdminTable from "@/components/dashboard/account/user-management/super-admin/table/super-admin-table";
import { DataTableSkeleton } from "@/components/data-table/data-table-skeleton";
import { Suspense } from "react";
import { getSuperAdminData } from "./fetch";
import { SuperAdminPageProps } from "./types";
import { getCountryPhoneOptions } from "@/server/general";

const SuperAdminPage = async (props: SuperAdminPageProps) => {
  const searchParams = await props.searchParams;

  const promises = Promise.all([
    getSuperAdminData({
      searchParams,
    }),
    getCountryPhoneOptions(),
  ]);

  return (
    <Suspense
      fallback={
        <DataTableSkeleton
          columnCount={6}
          filterCount={1}
          cellWidths={["6rem", "10rem", "30rem", "10rem", "6rem", "6rem"]}
        />
      }
    >
      <SuperAdminTable promises={promises} />
    </Suspense>
  );
};

export default SuperAdminPage;
