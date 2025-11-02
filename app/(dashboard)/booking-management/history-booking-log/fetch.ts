import { apiCall } from "@/lib/api";
import { buildQueryParams } from "@/lib/utils";
import { ApiResponse, SearchParams } from "@/types";
import { HistoryBookingLog } from "./types";

export const getData = async ({
  searchParams,
}: {
  searchParams: SearchParams;
}): Promise<ApiResponse<HistoryBookingLog[]>> => {
  const queryString = buildQueryParams(searchParams);
  const url = `/bookings/logs${queryString ? `?${queryString}` : ""}`;
  const apiResponse = await apiCall<HistoryBookingLog[]>(url);

  return apiResponse;
};
