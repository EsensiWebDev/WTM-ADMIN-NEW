"use server";

import { apiCall } from "@/lib/api";
import { buildQueryParams } from "@/lib/utils";
import { ApiResponse } from "@/types";
import { format } from "date-fns";
import { SearchParams } from "nuqs";
import { ReportAgent, ReportAgentDetail, ReportSummary } from "./types";

export const getReportSummary = async ({
  searchParams,
}: {
  searchParams: SearchParams;
}): Promise<ApiResponse<ReportSummary>> => {
  const params = {
    ...searchParams,
    limit: searchParams.limit ?? "10",
  };

  const queryString = buildQueryParams(params);
  const url = `/reports/summary${queryString ? `?${queryString}` : ""}`;
  const apiResponse = await apiCall<ReportSummary>(url);

  return apiResponse;
};

export const getReportAgent = async ({
  searchParams,
}: {
  searchParams: SearchParams;
}): Promise<ApiResponse<ReportAgent[]>> => {
  // Extract and parse date range
  // Ensure period_date exists and is a string
  const periodDate = searchParams.period_date;
  let query = searchParams;

  if (periodDate && !Array.isArray(periodDate)) {
    const [dateFrom, dateTo] = periodDate.split(",");

    // Convert timestamps to formatted dates and prepare final query params
    const formattedQuery = {
      ...searchParams,
      date_from: format(new Date(parseInt(dateFrom)), "yyyy-MM-dd"),
      date_to: format(new Date(parseInt(dateTo)), "yyyy-MM-dd"),
    } as SearchParams;

    // Remove the original period_date parameter
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { period_date, ...rest } = formattedQuery;
    query = rest;
  } else {
    // If no period_date, remove it from query if it exists
    const { period_date, ...rest } = searchParams;
    query = rest as SearchParams;
  }

  const queryString = buildQueryParams(query);
  const url = `/reports/agent${queryString ? `?${queryString}` : ""}`;
  const apiResponse = await apiCall<ReportAgent[]>(url);

  return apiResponse;
};

export const getReportAgentDetail = async ({
  searchParams,
}: {
  searchParams: SearchParams;
}): Promise<ApiResponse<ReportAgentDetail[]>> => {
  const searchParamsWithDefaults = {
    ...searchParams,
    limit: "0",
  };

  const queryString = buildQueryParams(searchParamsWithDefaults);
  console.log({ queryString });
  const url = `/reports/agent/detail${queryString ? `?${queryString}` : ""}`;
  const apiResponse = await apiCall<ReportAgentDetail[]>(url);

  return apiResponse;
};
