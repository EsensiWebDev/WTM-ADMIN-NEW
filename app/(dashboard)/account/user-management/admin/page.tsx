import AdminTable from "@/components/dashboard/account/user-management/admin/table/admin-table";
import { DataTableSkeleton } from "@/components/data-table/data-table-skeleton";
import { Suspense } from "react";
import { getAdminData } from "./fetch";
import { AdminPageProps } from "./types";
import { requireAuthorization } from "@/lib/server-authorization";

const AdminPage = async (props: AdminPageProps) => {
  // await requireAuthorization({ requiredRole: "Super Admin" });

  const searchParams = await props.searchParams;

  const promises = Promise.all([
    getAdminData({
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
      <AdminTable promises={promises} />
    </Suspense>
  );
};

export default AdminPage;
