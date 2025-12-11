import AgentControlTable from "@/components/dashboard/account/agent-control/table/agent-control-table";
import { DataTableSkeleton } from "@/components/data-table/data-table-skeleton";
import { getCompanyOptions, getCountryPhoneOptions } from "@/server/general";
import React from "react";
import { getData } from "./fetch";
import { AgentControlPageProps } from "./types";

const AgentControlPage = async (props: AgentControlPageProps) => {
  const searchParams = await props.searchParams;

  const promises = Promise.all([
    getData({
      searchParams,
    }),
    getCompanyOptions(),
    getCountryPhoneOptions(),
  ]);

  return (
    <React.Suspense
      fallback={
        <DataTableSkeleton
          columnCount={7}
          filterCount={2}
          cellWidths={[
            "10rem",
            "30rem",
            "10rem",
            "10rem",
            "6rem",
            "6rem",
            "6rem",
          ]}
        />
      }
    >
      <AgentControlTable promises={promises} />
    </React.Suspense>
  );
};

export default AgentControlPage;
