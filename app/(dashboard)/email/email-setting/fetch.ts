import { apiCall } from "@/lib/api";
import { ApiResponse } from "@/types";
import { EmailTemplate } from "./types";

export async function getEmailTemplate({
  type = "confirm",
}: {
  type: string;
}): Promise<ApiResponse<EmailTemplate>> {
  const url = `/email/template?type=${type}`;

  const apiResponse = await apiCall<EmailTemplate>(url);

  return apiResponse;
}
