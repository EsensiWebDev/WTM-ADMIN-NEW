"use server";

import { Option } from "@/types/data-table";
import { Currency } from "./types";
import { apiCall } from "@/lib/api";
import { buildQueryParams } from "@/lib/utils";
import { ApiResponse, SearchParams } from "@/types";

export const getCurrencies = async ({
  searchParams,
}: {
  searchParams: SearchParams;
}): Promise<ApiResponse<Currency[]>> => {
  const params = {
    ...searchParams,
    limit: searchParams.limit ?? "10",
  };

  const queryString = buildQueryParams(params);
  const url = `/currencies${queryString ? `?${queryString}` : ""}`;
  const apiResponse = await apiCall<Currency[]>(url);

  return apiResponse;
};

export const getActiveCurrencies = async (): Promise<ApiResponse<Currency[]>> => {
  const url = `/currencies/active`;
  const apiResponse = await apiCall<Currency[]>(url);
  return apiResponse;
};

export const getCurrencyById = async (
  id: string
): Promise<ApiResponse<Currency>> => {
  const url = `/currencies/${id}`;
  const apiResponse = await apiCall<Currency>(url);
  return apiResponse;
};

export const getCurrencyOptions = async (): Promise<Option[]> => {
  try {
    const apiResponse = await apiCall<Currency[]>("/currencies/active");

    if (apiResponse.status === 200 && Array.isArray(apiResponse.data)) {
      return apiResponse.data.map((currency) => ({
        label: `${currency.code} - ${currency.name}`,
        value: currency.code,
      }));
    }

    return [];
  } catch (error) {
    console.error("Error fetching currency options:", error);
    return [];
  }
};

