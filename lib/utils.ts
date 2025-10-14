import { bffFetch } from "@/lib/bff-client";
import { ApiResponse, SearchParams } from "@/types";
import { clsx, type ClassValue } from "clsx";
import * as React from "react";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function useDebounce<T>(value: T, delay?: number): T {
  const [debouncedValue, setDebouncedValue] = React.useState<T>(value);

  React.useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay ?? 500);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Helper function to build query parameters from SearchParams object
 */
export function buildQueryParams(searchParams: SearchParams): string {
  const queryParams = new URLSearchParams();
  Object.entries(searchParams).forEach(([key, value]) => {
    if (value !== undefined) {
      queryParams.append(key, String(value));
    }
  });
  return queryParams.toString();
}

/**
 * Helper function to make API calls with proper error handling and ApiResponse parsing
 */
export async function apiCall<TData>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<TData>> {
  const response = await bffFetch(endpoint, options);

  if (!response.ok) {
    const error = await response.json();

    return error;
  }

  const apiResponse: ApiResponse<TData> = await response.json();
  return apiResponse;
}
