import { Option } from "@/types/data-table";
import { Promo } from "./types";

import { ApiResponse, SearchParams } from "@/types";
import { buildQueryParams } from "@/lib/utils";
import { apiCall } from "@/lib/api";

export const getData = async ({
  searchParams,
}: {
  searchParams: SearchParams;
}): Promise<ApiResponse<Promo[]>> => {
  const queryString = buildQueryParams(searchParams);
  const url = `/promos${queryString ? `?${queryString}` : ""}`;
  const apiResponse = await apiCall<Promo[]>(url);

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
