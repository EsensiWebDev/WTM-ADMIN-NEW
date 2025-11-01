"use server";

import { PasswordChangeSchema } from "@/components/dashboard/settings/account-setting/account-setting-form";
import { ProfileSchema } from "@/components/dashboard/settings/account-setting/edit-profile-form";
import { apiCall } from "@/lib/api";
import { revalidatePath } from "next/cache";
import { AccountSettingResponse } from "./types";

// Simulate updating account profile
export async function updateAccountProfile(
  input: ProfileSchema,
  email: string
): Promise<AccountSettingResponse> {
  try {
    const body = {
      full_name: input.full_name,
      phone: input.phone,
      email,
    };

    const response = await apiCall(`profile`, {
      method: "PUT",
      body: JSON.stringify(body),
    });

    if (response.status !== 200) {
      return {
        success: false,
        message: response.message || "Failed to update profile",
      };
    }

    revalidatePath("/setting/account-setting", "layout");

    return {
      success: true,
      message: response.message || "Profile has been successfully updated",
    };
  } catch (error) {
    console.error("Error updating profile:", error);

    // Handle API error responses with specific messages
    if (error && typeof error === "object" && "message" in error) {
      return {
        success: false,
        message: error.message as string,
      };
    }

    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to update profile",
    };
  }
}

// Simulate changing password
export async function changePassword(
  input: PasswordChangeSchema,
  username: string
): Promise<AccountSettingResponse> {
  try {
    const body = {
      ...input,
      username,
    };

    const response = await apiCall(`profile/setting`, {
      method: "PUT",
      body: JSON.stringify(body),
    });

    if (response.status !== 200) {
      return {
        success: false,
        message: response.message || "Failed to change password",
      };
    }

    revalidatePath("/setting/account-setting", "layout");

    return {
      success: true,
      message: response.message || "Password has been successfully changed",
    };
  } catch (error) {
    console.error("Error changing password:", error);

    // Handle API error responses with specific messages
    if (error && typeof error === "object" && "message" in error) {
      return {
        success: false,
        message: error.message as string,
      };
    }

    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to change password",
    };
  }
}
