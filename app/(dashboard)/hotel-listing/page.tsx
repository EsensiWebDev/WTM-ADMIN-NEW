import HotelTable from "@/components/dashboard/hotel-listing/table/hotel-table";
import { DataTableSkeleton } from "@/components/data-table/data-table-skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";
import React from "react";
import { getData, getRegionOptions } from "./fetch";
import { HotelPageProps } from "./types";

const HotelPage = async (props: HotelPageProps) => {
  const searchParams = await props.searchParams;
  const activeTab =
    typeof searchParams.tab === "string" ? searchParams.tab : "all";

  const promises = Promise.all([
    getData({
      searchParams,
    }),
    getRegionOptions(),
  ]);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Hotel Listing</h1>
      </div>

      <Tabs defaultValue="all" className="w-[400px]">
        <TabsList className="gap-1">
          <Link href={"?tab=all"} scroll={false}>
            <TabsTrigger value="all">All</TabsTrigger>
          </Link>
          <Link href={"?tab=approved"} scroll={false}>
            <TabsTrigger value="approved">Approved</TabsTrigger>
          </Link>
          <Link href={"?tab=in_review"} scroll={false}>
            <TabsTrigger value="in_review">In Review</TabsTrigger>
          </Link>
          <Link href={"?tab=rejected"} scroll={false}>
            <TabsTrigger value="rejected">Rejected</TabsTrigger>
          </Link>
        </TabsList>
      </Tabs>

      <div className="w-full">
        <React.Suspense
          key={activeTab}
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
          <HotelTable promises={promises} />
        </React.Suspense>
      </div>
    </div>
  );
};

export default HotelPage;
