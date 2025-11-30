import { apiCall } from "@/lib/api";
import { buildQueryParams } from "@/lib/utils";
import { ApiResponse, SearchParams } from "@/types";
import { RoleAccess } from "./types";

export const getRoleBasedAccessData = async ({
  searchParams,
}: {
  searchParams: SearchParams;
}): Promise<ApiResponse<RoleAccess[]>> => {
  const queryString = buildQueryParams(searchParams);
  const url = `/role-access${queryString ? `?${queryString}` : ""}`;
  const apiResponse = await apiCall<RoleAccess[]>(url);

  return apiResponse;
};
