"use server";

import { apiCall } from "@/lib/api";
import { buildQueryParams } from "@/lib/utils";
import { ApiResponse, SearchParams } from "@/types";
import { EmailLog, EmailLogDetail } from "./types";

/**
 * Helper function to process date range parameters
 * Splits comma-separated date strings into from/to parameters
 */
function processDateRangeParam(
  query: SearchParams,
  paramName: string,
  fromParamName: string,
  toParamName: string
): SearchParams {
  const dateValue = query[paramName];

  if (dateValue && !Array.isArray(dateValue)) {
    const dates = dateValue.split(",");
    if (dates.length === 2) {
      const [dateFrom, dateTo] = dates;
      const { [paramName]: _, ...rest } = query;
      return {
        ...rest,
        [fromParamName]: dateFrom,
        [toParamName]: dateTo,
      };
    } else if (dates.length === 1) {
      // Single date - use as both from and to
      const { [paramName]: _, ...rest } = query;
      return {
        ...rest,
        [fromParamName]: dates[0],
        [toParamName]: dates[0],
      };
    }
  }

  // Remove the parameter if it exists but is not valid
  const { [paramName]: _, ...rest } = query;
  return rest;
}

export const getData = async ({
  searchParams,
}: {
  searchParams: SearchParams;
}): Promise<ApiResponse<EmailLog[]>> => {
  // Process date range parameters
  let query = processDateRangeParam(
    searchParams,
    "date",
    "date_from",
    "date_to"
  );

  // Map status filter to array format if needed
  if (query.status && !Array.isArray(query.status)) {
    query = {
      ...query,
      status: [query.status],
    };
  }

  // Process sort parameter - convert from JSON array to sort and dir
  if (query.sort) {
    try {
      const sortArray = typeof query.sort === "string" ? JSON.parse(query.sort) : query.sort;
      if (Array.isArray(sortArray) && sortArray.length > 0) {
        const firstSort = sortArray[0];
        if (firstSort && typeof firstSort === "object" && "id" in firstSort) {
          query = {
            ...query,
            sort: firstSort.id,
            dir: firstSort.desc ? "desc" : "asc",
          };
        }
      }
    } catch {
      // If parsing fails, remove sort parameter
      const { sort: _, ...rest } = query;
      query = rest;
    }
  }

  // Map booking_code filter (column id is booking_code, query param should be booking_code)
  // The useDataTable hook automatically maps column filters to query params by column id

  const queryString = buildQueryParams(query);
  const url = `/email/logs${queryString ? `?${queryString}` : ""}`;
  const apiResponse = await apiCall<EmailLog[]>(url);

  return apiResponse;
};

export const getEmailLogDetail = async (
  id: number
): Promise<ApiResponse<EmailLogDetail>> => {
  const apiResponse = await apiCall<EmailLogDetail>(`/email/logs/${id}`);
  return apiResponse;
};

export const retryEmail = async (
  id: number
): Promise<ApiResponse<{ success: boolean; message: string }>> => {
  const apiResponse = await apiCall<{ success: boolean; message: string }>(
    `/email/logs/retry`,
    {
      method: "POST",
      body: JSON.stringify({ id }),
    }
  );
  return apiResponse;
};
