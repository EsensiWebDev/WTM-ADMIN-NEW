import EmailLogTable from "@/components/dashboard/settings/email-log/table/email-log-table";
import { DataTableSkeleton } from "@/components/data-table/data-table-skeleton";
import { getCompanyOptions } from "@/server/general";
import React from "react";
import { getData } from "./fetch";
import { EmailLogPageProps } from "./types";

const EmailLogPage = async (props: EmailLogPageProps) => {
  const searchParams = await props.searchParams;

  const promises = Promise.all([
    getData({
      searchParams,
    }),
    getCompanyOptions(),
  ]);

  return (
    <React.Suspense
      fallback={
        <DataTableSkeleton
          columnCount={5}
          filterCount={2}
          cellWidths={["12rem", "18rem", "10rem", "20rem", "20rem"]}
        />
      }
    >
      <EmailLogTable promises={promises} />
    </React.Suspense>
  );
};

export default EmailLogPage;
