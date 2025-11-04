import { buildQueryParams } from "@/lib/utils";
import { AgentControl } from "./types";

import { ApiResponse, SearchParams } from "@/types";
import { apiCall } from "@/lib/api";

export const getData = async ({
  searchParams,
}: {
  searchParams: SearchParams;
}): Promise<ApiResponse<AgentControl[]>> => {
  const queryString = buildQueryParams(searchParams);
  const url = `/users/control${queryString ? `?${queryString}` : ""}`;
  const apiResponse = await apiCall<AgentControl[]>(url);

  return apiResponse;
};
