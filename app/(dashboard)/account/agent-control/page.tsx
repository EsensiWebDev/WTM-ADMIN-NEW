import AgentControlTable from "@/components/dashboard/account/agent-control/table/agent-control-table";
import { DataTableSkeleton } from "@/components/data-table/data-table-skeleton";
import { SearchParams } from "@/types";
import React from "react";
import { AgentControlPageProps, AgentControlTableResponse } from "./types";

export const getData = async ({
  searchParams,
}: {
  searchParams: SearchParams;
}) => {
  console.log({ searchParams });

  await new Promise((resolve) => setTimeout(resolve, 2000));

  const data = [
    {
      id: "1",
      name: "kelvin",
      company: "esensi digital",
      email: "kelvin@wtmdigital.com",
      phone_number: "081234567800",
      status: "approved",
    },
    {
      id: "2",
      name: "budi",
      company: "esensi digital",
      email: "budi@wtmdigital.com",
      phone_number: "081234567800",
      status: "rejected",
    },
  ] as AgentControlTableResponse[];

  return data;
};

const AgentControlPage = async (props: AgentControlPageProps) => {
  const searchParams = await props.searchParams;

  const promises = Promise.all([
    getData({
      searchParams,
    }),
  ]);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">User Management</h1>
      </div>

      <div className="w-full">
        <React.Suspense
          key={JSON.stringify(searchParams)}
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
      </div>
    </div>
  );
};

export default AgentControlPage;
