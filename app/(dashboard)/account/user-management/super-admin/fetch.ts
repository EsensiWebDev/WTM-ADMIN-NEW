import { apiCall, buildQueryParams } from "@/lib/utils";
import { ApiResponse, SearchParams } from "@/types";
import { SuperAdmin } from "./types";

export const getSuperAdminData = async ({
  searchParams,
}: {
  searchParams: SearchParams;
}): Promise<ApiResponse<SuperAdmin[]>> => {
  const queryString = buildQueryParams(searchParams);
  const url = `/users?role=super_admin${queryString ? `&${queryString}` : ""}`;
  const apiResponse = await apiCall<SuperAdmin[]>(url);

  return apiResponse;
};
