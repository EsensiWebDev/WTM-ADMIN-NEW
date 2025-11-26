import { ChartAreaInteractive } from "@/components/dashboard/report/chart-area-interactive";
import { SectionCards } from "@/components/dashboard/report/section-cards";
import ReportTable from "@/components/dashboard/report/table/report-table";
import { DataTableSkeleton } from "@/components/data-table/data-table-skeleton";
import { Separator } from "@/components/ui/separator";
import { getCompanyOptions, getHotelOptions } from "@/server/general";
import React from "react";
import { getReportAgent, getReportSummary } from "./fetch";
import { ReportPageProps } from "./types";

const ReportPage = async (props: ReportPageProps) => {
  const searchParams = await props.searchParams;

  const promises = Promise.all([
    getReportAgent({ searchParams }),
    getCompanyOptions(),
    getHotelOptions(),
  ]);

  const reportSummary = await getReportSummary({
    searchParams,
  });

  return (
    <div className="flex flex-col gap-4 md:gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Report</h1>
      </div>
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
        <SectionCards data={reportSummary.data.summary_data} />
        <ChartAreaInteractive data={reportSummary.data.graphic_data || []} />
        <Separator />
        <ReportTable promises={promises} />
      </React.Suspense>
    </div>
  );
};

export default ReportPage;
