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
  // Set default date range to last 7 days (6 days ago to today) if not provided
  const getDefaultDateRange = () => {
    const today = new Date();
    const fromDate = new Date(today);
    fromDate.setDate(fromDate.getDate() - 6); // 6 days ago
    return {
      date_from: format(fromDate, "yyyy-MM-dd"),
      date_to: format(today, "yyyy-MM-dd"),
    };
  };

  const defaultRange = getDefaultDateRange();

  const params = {
    ...searchParams,
    date_from: searchParams.date_from ?? defaultRange.date_from,
    date_to: searchParams.date_to ?? defaultRange.date_to,
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
      limit: searchParams.limit ?? "10",
      date_from: format(new Date(parseInt(dateFrom)), "yyyy-MM-dd"),
      date_to: format(new Date(parseInt(dateTo)), "yyyy-MM-dd"),
    } as SearchParams;

    // Remove the original period_date parameter
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { period_date, ...rest } = formattedQuery;
    query = rest;
  } else {
    const formattedQuery = {
      ...searchParams,
      limit: searchParams.limit ?? "10",
    } as SearchParams;

    // If no period_date, remove it from query if it exists
    const { period_date, ...rest } = formattedQuery;
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
  const url = `/reports/agent/detail${queryString ? `?${queryString}` : ""}`;
  const apiResponse = await apiCall<ReportAgentDetail[]>(url);

  return apiResponse;
};
