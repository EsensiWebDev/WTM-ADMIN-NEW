import { apiCall } from "@/lib/api";
import { buildQueryParams } from "@/lib/utils";
import { ApiResponse, SearchParams } from "@/types";
import { Option } from "@/types/data-table";
import { Hotel, HotelDetail } from "./types";

export const getData = async ({
  searchParams,
}: {
  searchParams: SearchParams;
}): Promise<ApiResponse<Hotel[]>> => {
  const queryString = buildQueryParams(searchParams);
  const url = `/hotels${queryString ? `?${queryString}` : ""}`;
  const apiResponse = await apiCall<Hotel[]>(url);

  return apiResponse;
};

export const getHotelDetails = async (id: string) => {
  const apiResponse = await apiCall<HotelDetail>(`/hotels/${id}`);
  return apiResponse;
};

export const getRegionOptions = async () => {
  await new Promise((resolve) => setTimeout(resolve, 1000));

  const data = [
    {
      label: "Jakarta",
      value: "1",
    },
    {
      label: "Bali",
      value: "2",
    },
    {
      label: "Surabaya",
      value: "3",
    },
  ] as Option[];

  return data;
};
