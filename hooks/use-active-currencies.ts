"use client";

import { useQuery } from "@tanstack/react-query";
import { getActiveCurrencies } from "@/app/(dashboard)/currency/fetch";
import { Option } from "@/types/data-table";

/**
 * Custom hook to fetch and cache active currencies using React Query.
 * This ensures that multiple components can share the same cached data,
 * preventing duplicate API calls.
 */
export function useActiveCurrencies() {
  const {
    data: apiResponse,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["active-currencies"],
    queryFn: () => getActiveCurrencies(),
    staleTime: 1000 * 60 * 5, // 5 minutes - currencies don't change frequently
    refetchOnWindowFocus: false,
    retry: 2,
  });

  const currencies: Option[] =
    apiResponse?.status === 200 && Array.isArray(apiResponse.data)
      ? apiResponse.data.map((currency) => ({
          label: `${currency.code} - ${currency.name} (${currency.symbol})`,
          value: currency.code,
        }))
      : [];

  return {
    currencies,
    isLoading,
    isError,
    error,
  };
}

