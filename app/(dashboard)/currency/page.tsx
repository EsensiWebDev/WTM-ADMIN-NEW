import CurrencyTable from "@/components/dashboard/currency/table/currency-table";
import { DataTableSkeleton } from "@/components/data-table/data-table-skeleton";
import React from "react";
import { getCurrencies } from "./fetch";
import { CurrencyPageProps } from "./types";

const CurrencyPage = async (props: CurrencyPageProps) => {
  const searchParams = await props.searchParams;

  const promises = Promise.all([
    getCurrencies({
      searchParams,
    }),
  ]);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Currency Management</h1>
      </div>

      <div className="w-full">
        <React.Suspense
          fallback={
            <DataTableSkeleton
              columnCount={5}
              filterCount={1}
              cellWidths={["8rem", "15rem", "20rem", "10rem", "6rem"]}
            />
          }
        >
          <CurrencyTable promises={promises} />
        </React.Suspense>
      </div>
    </div>
  );
};

export default CurrencyPage;

