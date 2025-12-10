import AgentTable from "@/components/dashboard/account/agent-overview/agent-management/table/agent-table";
import { DataTableSkeleton } from "@/components/data-table/data-table-skeleton";
import { Suspense } from "react";
import { getAgentData, getPromoGroupSelect } from "./fetch";
import { AgentPageProps } from "./types";
import { getCountryPhoneOptions } from "@/server/general";

const AgentPage = async (props: AgentPageProps) => {
  const searchParams = await props.searchParams;

  const promises = Promise.all([
    getAgentData({
      searchParams,
    }),
    getPromoGroupSelect(),
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
      <AgentTable promises={promises} />
    </Suspense>
  );
};

export default AgentPage;
