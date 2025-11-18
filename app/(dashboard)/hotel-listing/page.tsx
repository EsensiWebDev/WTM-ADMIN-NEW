import HotelTable from "@/components/dashboard/hotel-listing/table/hotel-table";
import { DataTableSkeleton } from "@/components/data-table/data-table-skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";
import React from "react";
import { getData } from "./fetch";
import { HotelPageProps } from "./types";
import { getRegionOptions } from "@/server/general";

const HotelPage = async (props: HotelPageProps) => {
  const searchParams = await props.searchParams;
  const activeTab =
    typeof searchParams.status_id === "string" ? searchParams.status_id : "";

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

      <Tabs defaultValue={activeTab} className="w-[400px]">
        <TabsList className="gap-1">
          <Link href={"?status_id="} scroll={false}>
            <TabsTrigger value="">All</TabsTrigger>
          </Link>
          <Link href={"?status_id=2"} scroll={false}>
            <TabsTrigger value="2">Approved</TabsTrigger>
          </Link>
          <Link href={"?status_id=1"} scroll={false}>
            <TabsTrigger value="1">In Review</TabsTrigger>
          </Link>
          <Link href={"?status_id=3"} scroll={false}>
            <TabsTrigger value="3">Rejected</TabsTrigger>
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
