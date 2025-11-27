import SupportTable from "@/components/dashboard/account/user-management/support/table/support-table";
import { DataTableSkeleton } from "@/components/data-table/data-table-skeleton";
import { Suspense } from "react";
import { getSupportData } from "./fetch";
import { SupportPageProps } from "./types";
import { requireAuthorization } from "@/lib/server-authorization";

const SupportPage = async (props: SupportPageProps) => {
  await requireAuthorization({ requiredRole: "Admin" });
  const searchParams = await props.searchParams;

  const promisesSupport = Promise.all([
    getSupportData({
      searchParams,
    }),
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
      <SupportTable promises={promisesSupport} />
    </Suspense>
  );
};

export default SupportPage;
