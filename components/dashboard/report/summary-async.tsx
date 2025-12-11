import React from "react";
import { SectionCards } from "./section-cards";
import { ChartAreaInteractive } from "./chart-area-interactive";
import {
  getReportAgent,
  getReportSummary,
} from "@/app/(dashboard)/report/fetch";
import { getCompanyOptions, getHotelOptions } from "@/server/general";

interface SummaryAsyncProps {
  promises: Promise<
    [
      Awaited<ReturnType<typeof getReportAgent>>,
      Awaited<ReturnType<typeof getCompanyOptions>>,
      Awaited<ReturnType<typeof getHotelOptions>>,
      Awaited<ReturnType<typeof getReportSummary>>
    ]
  >;
}

const SummaryAsync = ({ promises }: SummaryAsyncProps) => {
  const [, , , reportSummary] = React.use(promises);

  if (reportSummary.error) {
    return <div>{reportSummary.error}</div>;
  }

  if (reportSummary.status === 403) {
    return <div>You don’t have permission to access this page.</div>;
  }

  if (reportSummary.status !== 200) {
    return <div>Failed to load data</div>;
  }

  return (
    <>
      <SectionCards data={reportSummary.data.summary_data} />
      <ChartAreaInteractive data={reportSummary.data.graphic_data || []} />
    </>
  );
};

export default SummaryAsync;
