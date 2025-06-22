import { SuperAdmin } from "@/app/(dashboard)/account/user-management/data-super-admin";
import { useQuery } from "@tanstack/react-query";

// Fetch super admin users
export function useSuperAdminUsers() {
  return useQuery({
    queryKey: ["users", "super-admin"],
    queryFn: async (): Promise<SuperAdmin[]> => {
      const response = await fetch("/api/users/super-admin");
      if (!response.ok) {
        throw new Error("Failed to fetch users");
      }
      const data = await response.json();
      return data.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
  });
}
