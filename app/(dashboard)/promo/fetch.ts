"use server";

import { Option } from "@/types/data-table";
import { Promo, PromoDetailId } from "./types";

import { apiCall } from "@/lib/api";
import { buildQueryParams } from "@/lib/utils";
import { ApiResponse, SearchParams } from "@/types";
import { Hotel } from "../hotel-listing/types";

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

export const getPromoById = async (
  id: string
): Promise<ApiResponse<PromoDetailId>> => {
  const url = `/promos/${id}`;
  const apiResponse = await apiCall<PromoDetailId>(url);

  return apiResponse;
};

export const getHotelOptions = async (): Promise<Option[]> => {
  try {
    const apiResponse = await apiCall<Hotel[]>("/hotels");

    if (apiResponse.status === 200 && Array.isArray(apiResponse.data)) {
      return apiResponse.data.map((hotel) => ({
        label: hotel.name,
        value: hotel.id.toString(), // Using hotel ID now
      }));
    }

    // Fallback to empty array if API call fails
    return [];
  } catch (error) {
    console.error("Error fetching hotel options:", error);
    return [];
  }
};

export const getRoomTypeOptionsByHotelId = async (
  hotelId: string
): Promise<Option[]> => {
  try {
    const apiResponse = await apiCall<{ id: number; name: string }[]>(
      `/hotels/room-types?hotel_id=${hotelId}`
    );

    if (apiResponse.status === 200 && Array.isArray(apiResponse.data)) {
      return apiResponse.data.map((room) => ({
        label: room.name,
        value: room.id.toString(), // Convert to string to match Option type
      }));
    }

    // Fallback to empty array if API call fails
    return [];
  } catch (error) {
    console.error("Error fetching room type options:", error);
    return [];
  }
};

export const getBedTypeOptionsByRoomTypeId = async (
  roomTypeId: string
): Promise<Option[]> => {
  try {
    const apiResponse = await apiCall<string[]>(
      `/hotels/bed-types?room_type_id=${roomTypeId}`
    );

    if (apiResponse.status === 200 && Array.isArray(apiResponse.data)) {
      return apiResponse.data.map((bedType) => ({
        label: bedType,
        value: bedType, // Convert to string to match Option type
      }));
    }

    // Fallback to empty array if API call fails
    return [];
  } catch (error) {
    console.error("Error fetching bed type options:", error);
    return [];
  }
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
