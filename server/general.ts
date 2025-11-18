"use server";

import { Hotel } from "@/app/(dashboard)/hotel-listing/types";
import { apiCall } from "@/lib/api";
import { Option } from "@/types/data-table";

export const getCompanyOptions = async () => {
  const url = `/users/agent-companies?limit=0`;
  const apiResponse = await apiCall<{ id: number; name: string }[]>(url);

  if (apiResponse.status === 200 && Array.isArray(apiResponse.data)) {
    return apiResponse.data.map((company) => ({
      label: company.name,
      value: company.id.toString(),
    }));
  }

  return [];
};

export const getHotelOptions = async (): Promise<Option[]> => {
  try {
    const apiResponse = await apiCall<Hotel[]>("/hotels?limit=0");

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

export const getBookingStatusOptions = async (): Promise<Option[]> => {
  try {
    const apiResponse = await apiCall<{ id: number; status: string }[]>(
      "/bookings/booking-status"
    );

    if (apiResponse.status === 200 && Array.isArray(apiResponse.data)) {
      return apiResponse.data.map((bookingStatus) => ({
        label: bookingStatus.status,
        value: bookingStatus.id.toString(), // Using hotel ID now
      }));
    }

    // Fallback to empty array if API call fails
    return [];
  } catch (error) {
    console.error("Error fetching booking status options:", error);
    return [];
  }
};

export const getPaymentStatusOptions = async (): Promise<Option[]> => {
  try {
    const apiResponse = await apiCall<{ id: number; status: string }[]>(
      "/bookings/payment-status"
    );

    if (apiResponse.status === 200 && Array.isArray(apiResponse.data)) {
      return apiResponse.data.map((paymentStatus) => ({
        label: paymentStatus.status,
        value: paymentStatus.id.toString(), // Using hotel ID now
      }));
    }

    // Fallback to empty array if API call fails
    return [];
  } catch (error) {
    console.error("Error fetching payment options:", error);
    return [];
  }
};

export const getRegionOptions = async () => {
  const url = `/hotels/provinces?limit=0`;
  const apiResponse = await apiCall<string[]>(url);

  if (apiResponse.status === 200 && Array.isArray(apiResponse.data)) {
    return apiResponse.data.map((province) => ({
      label: province,
      value: province,
    }));
  }

  return [];
};
