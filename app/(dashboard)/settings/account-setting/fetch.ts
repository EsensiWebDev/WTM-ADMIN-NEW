import { AccountProfile } from "./types";

// Simulate fetching account profile from a data source
export async function fetchAccountProfile(): Promise<AccountProfile> {
  // Simulate API call delay
  await new Promise((resolve) => setTimeout(resolve, 500));
  // Return mock data based on the current page content
  return {
    username: "raffiwtm12",
    firstName: "Muhammad",
    lastName: "Abduraffi",
    agentCompany: "Esensi Digital",
    phoneNumber: "081234567890",
    profileImage: "/avatars/shadcn.jpg",
  };
}
