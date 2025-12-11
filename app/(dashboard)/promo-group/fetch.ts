"use server";

import { apiCall } from "@/lib/api";
import { buildQueryParams } from "@/lib/utils";
import { ApiResponse, SearchParams } from "@/types";
import { PromoGroup, PromoGroupMembers, PromoGroupPromos } from "./types";

export const getPromoGroups = async ({
  searchParams,
}: {
  searchParams: SearchParams;
}): Promise<ApiResponse<PromoGroup[]>> => {
  const params = {
    ...searchParams,
    limit: searchParams.limit ?? "10",
  };

  const queryString = buildQueryParams(params);
  const url = `/promo-groups${queryString ? `?${queryString}` : ""}`;
  const apiResponse = await apiCall<PromoGroup[]>(url);

  return apiResponse;
};

export const getPromoGroupsById = async (
  id: string
): Promise<ApiResponse<{ id: number; name: string }>> => {
  const url = `/promo-groups/${id}`;
  const apiResponse = await apiCall<{ id: number; name: string }>(url);

  return apiResponse;
};

// Retrieve a paginated list of promos that belong to a specific promo group using query parameters.
export const getPromoGroupPromosById = async (
  id: string,
  searchParams: SearchParams
): Promise<ApiResponse<PromoGroupPromos[]>> => {
  const queryString = buildQueryParams(searchParams);
  const url = `/promo-groups/promos?id=${id}${
    queryString ? `&${queryString}` : ""
  }`;
  const apiResponse = await apiCall<PromoGroupPromos[]>(url);

  return apiResponse;
};

export const getAgentByCompanyId = async (id: string) => {
  const url = `/users/by-agent-company/${id}`;
  const apiResponse = await apiCall<{ id: number; name: string }[]>(url);

  if (apiResponse.status === 200 && Array.isArray(apiResponse.data)) {
    return apiResponse.data.map((agent) => ({
      label: agent.name,
      value: agent.id.toString(),
    }));
  }

  return [];
};

// Return Member[] optionally filtered by company label
export const getPromoGroupMembersById = async (
  searchParams: SearchParams
): Promise<ApiResponse<PromoGroupMembers[]>> => {
  const queryString = buildQueryParams(searchParams);
  const url = `/promo-groups/members${queryString ? `?${queryString}` : ""}`;
  const apiResponse = await apiCall<PromoGroupMembers[]>(url);

  return apiResponse;
};

export const getUnassignedPromos = async (promo_group_id: string) => {
  const url = `/promo-groups/unassigned-promos?promo_group_id=${promo_group_id}`;
  const apiResponse = await apiCall<{ id: number; name: string }[]>(url);

  if (apiResponse.status === 200 && Array.isArray(apiResponse.data)) {
    return apiResponse.data.map((promo) => ({
      label: promo.name,
      value: promo.id.toString(),
    }));
  }

  return [];
};
