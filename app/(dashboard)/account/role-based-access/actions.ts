"use server";

import { apiCall } from "@/lib/api";
import { revalidatePath } from "next/cache";

export async function updateRBA(body: {
  action: string;
  page: string;
  role: string;
  allowed: boolean;
}) {
  try {
    const response = await apiCall("role-access", {
      method: "PUT",
      body: JSON.stringify(body),
    });


    if (response.status !== 200) {
      return {
        success: false,
        message: response.message || "Failed to update",
      };
    }

    revalidatePath("/account/role-based-access", "layout");

    return {
      success: true,
      message: response.message ?? `Update success`,
    };
  } catch (error) {
    console.error("Error updating:", error);

    // Handle API error responses with specific messages
    if (error && typeof error === "object" && "message" in error) {
      return {
        success: false,
        message: error.message as string,
      };
    }

    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to update",
    };
  }
}

export async function createRoleBasedAccessPage(input: any) {
  await new Promise((resolve) => setTimeout(resolve, 1000));
  return { success: true, message: `Role Based Access Page created` };
}

export async function editRoleBasedAccessPage(input: any) {
  await new Promise((resolve) => setTimeout(resolve, 1000));
  return { success: true, message: `Role Based Access Page edited` };
}

export async function deleteRoleBasedAccessPage(id: string) {
  await new Promise((resolve) => setTimeout(resolve, 1000));
  return { success: true, message: `Role Based Access Page deleted` };
}
