import PromoGroupTable from "@/components/dashboard/promo-group/table/promo-group-table";
import { DataTableSkeleton } from "@/components/data-table/data-table-skeleton";
import React from "react";
import { getData } from "./fetch";
import { PromoPageProps } from "./types";

const PromoGroupPage = async (props: PromoPageProps) => {
  const searchParams = await props.searchParams;

  const promises = Promise.all([
    getData({
      searchParams,
    }),
  ]);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Promo Group Management</h1>
      </div>

      <div className="w-full">
        <React.Suspense
          fallback={
            <DataTableSkeleton
              columnCount={3}
              filterCount={1}
              cellWidths={["10rem", "15rem", "20rem"]}
            />
          }
        >
          <PromoGroupTable promises={promises} />
        </React.Suspense>
      </div>
    </div>
  );
};

export default PromoGroupPage;
