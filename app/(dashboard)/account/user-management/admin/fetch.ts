import { ApiResponse, SearchParams } from "@/types";
import { Admin } from "./types";
import { apiCall, buildQueryParams } from "@/lib/utils";

export const getAdminData = async ({
  searchParams,
}: {
  searchParams: SearchParams;
}): Promise<ApiResponse<Admin[]>> => {
  const queryString = buildQueryParams(searchParams);
  const url = `/users/by-role/admin${queryString ? `?${queryString}` : ""}`;
  const apiResponse = await apiCall<Admin[]>(url);

  return apiResponse;
};
