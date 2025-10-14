import { apiCall, buildQueryParams } from "@/lib/utils";
import { ApiResponse, SearchParams } from "@/types";
import { Admin } from "./types";

export const getAdminData = async ({
  searchParams,
}: {
  searchParams: SearchParams;
}): Promise<ApiResponse<Admin[]>> => {
  const queryString = buildQueryParams(searchParams);
  const url = `/users?role=admin${queryString ? `&${queryString}` : ""}`;
  const apiResponse = await apiCall<Admin[]>(url);

  return apiResponse;
};
