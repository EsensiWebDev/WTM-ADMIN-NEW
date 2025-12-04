import { apiCall } from "@/lib/api";
import { bffFetch } from "@/lib/bff-client";
import { buildQueryParams } from "@/lib/utils";
import { ApiResponse, SearchParams } from "@/types";
import { Hotel, HotelDetail } from "./types";

export const getData = async ({
  searchParams,
}: {
  searchParams: SearchParams;
}): Promise<ApiResponse<Hotel[]>> => {
  const params = {
    ...searchParams,
    limit: searchParams.limit ?? "10",
  };

  const queryString = buildQueryParams(params);
  const url = `/hotels${queryString ? `?${queryString}` : ""}`;
  const apiResponse = await apiCall<Hotel[]>(url);

  return apiResponse;
};

export const getHotelDetails = async (id: string) => {
  const apiResponse = await apiCall<HotelDetail>(`/hotels/${id}`);
  return apiResponse;
};

export const downloadCsvTemplate = async () => {
  try {
    const response = await bffFetch("/hotels/download-format", {
      method: "GET",
      headers: {
        Accept: "application/octet-stream",
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        message: "Failed to download template",
      }));
      return {
        status: response.status,
        message: errorData.message || "Failed to download template",
        data: null as unknown as Blob,
        error: errorData.message || "Failed to download template",
      };
    }

    const blob = await response.blob();
    return {
      status: 200,
      message: "Template downloaded successfully",
      data: blob,
    };
  } catch (error) {
    console.error("Error downloading CSV template:", error);
    return {
      status: 500,
      message: "Failed to download template",
      data: null as unknown as Blob,
      error: "Failed to download template",
    };
  }
};
