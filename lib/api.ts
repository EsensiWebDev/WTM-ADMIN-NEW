import { bffFetch } from "@/lib/bff-client";
import { ApiResponse } from "@/types";

/**
 * Server-side helper to call the BFF client and parse the standardized API response.
 */
export async function apiCall<TData>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<TData>> {
  const response = await bffFetch(endpoint, options);

  if (!response.ok) {
    // Force user to logout
    // redirect("/logout");

    // Try to parse error response as JSON, but fallback to a default error structure
    try {
      const errorData = await response.json();
      return errorData;
    } catch (error) {
      // If JSON parsing fails, return a default error structure
      console.warn("Failed to parse error response as JSON:", error);
      return {
        status: response.status,
        message: response.statusText || "Request failed",
        data: [] as unknown as TData,
      };
    }
  }

  const apiResponse: ApiResponse<TData> = await response.json();
  return apiResponse;
}
