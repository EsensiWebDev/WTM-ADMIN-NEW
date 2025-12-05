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
