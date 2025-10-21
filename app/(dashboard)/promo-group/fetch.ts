import { ApiResponse, SearchParams } from "@/types";
import { Option } from "@/types/data-table";
import { Promo } from "../promo/types";
import { PromoGroup, PromoGroupMembers, PromoGroupPromos } from "./types";
import { buildQueryParams } from "@/lib/utils";
import { apiCall } from "@/lib/api";

export const getPromoGroups = async ({
  searchParams,
}: {
  searchParams: SearchParams;
}): Promise<ApiResponse<PromoGroup[]>> => {
  const queryString = buildQueryParams(searchParams);
  const url = `/promo-groups${queryString ? `?${queryString}` : ""}`;
  const apiResponse = await apiCall<PromoGroup[]>(url);

  return apiResponse;
};

// Retrieve a paginated list of promos that belong to a specific promo group using query parameters.
export const getPromoGroupPromosById = async (
  id: string,
  searchParams: SearchParams
): Promise<ApiResponse<PromoGroupPromos[]>> => {
  const queryString = buildQueryParams(searchParams);
  const url = `/promo-groups/${id}${queryString ? `?${queryString}` : ""}`;
  const apiResponse = await apiCall<PromoGroupPromos[]>(url);

  return apiResponse;
};

export const getCompanyOptions = async () => {
  await new Promise((resolve) => setTimeout(resolve, 2000));

  const data = [
    {
      label: "Esensi Digital",
      value: "1",
    },
    {
      label: "Vevo",
      value: "2",
    },
    {
      label: "88 Rising",
      value: "3",
    },
  ] as Option[];

  return data;
};

// Return Member[] optionally filtered by company label
export const getPromoGroupMembersById = async (
  id: string,
  searchParams: SearchParams
): Promise<ApiResponse<PromoGroupMembers[]>> => {
  const queryString = buildQueryParams(searchParams);
  const url = `/promo-groups/members/${id}${
    queryString ? `?${queryString}` : ""
  }`;
  const apiResponse = await apiCall<PromoGroupMembers[]>(url);

  return apiResponse;
};

// Search promos with query (for AsyncSelect)
export const searchPromos = async (
  query?: string
): Promise<ApiResponse<Promo[]>> => {
  const queryString = buildQueryParams({
    search: query,
  });
  const url = `/promos${queryString ? `?${queryString}` : ""}`;
  const apiResponse = await apiCall<Promo[]>(url);

  return apiResponse;
};
