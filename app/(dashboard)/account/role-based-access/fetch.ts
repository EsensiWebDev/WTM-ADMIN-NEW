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

  if (apiResponse.status === 200) {
    const filteredData = apiResponse.data.filter((item) => {
      const searchRole = Array.isArray(searchParams.role)
        ? searchParams.role[0]
        : searchParams.role;
      const matchesSearchRole = item.role
        .toLowerCase()
        .includes(searchRole?.toLowerCase() || "");
      const isNotAgent = item.role !== "Agent";
      return matchesSearchRole && isNotAgent;
    });

    return {
      ...apiResponse,
      data: filteredData,
    };
  }

  return apiResponse;
};
