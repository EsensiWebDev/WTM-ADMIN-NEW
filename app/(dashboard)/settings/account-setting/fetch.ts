"use server";

import { apiCall } from "@/lib/api";
import { ApiResponse } from "@/types";
import { AccountProfile } from "./types";

export async function fetchAccountProfile(): Promise<
  ApiResponse<AccountProfile>
> {
  const url = `/profile`;
  const apiResponse = await apiCall<AccountProfile>(url);

  return apiResponse;
}
