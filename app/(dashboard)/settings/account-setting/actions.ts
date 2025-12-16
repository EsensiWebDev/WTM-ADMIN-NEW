"use server";

import { PasswordChangeSchema } from "@/components/dashboard/settings/account-setting/account-setting-form";
import { ProfileSchema } from "@/components/dashboard/settings/account-setting/edit-profile-form";
import { apiCall } from "@/lib/api";
import { revalidatePath } from "next/cache";
import { AccountSettingResponse } from "./types";

export async function updateAccountProfile(
  input: ProfileSchema
): Promise<AccountSettingResponse> {
  try {
    const body = {
      ...input,
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

export async function changePassword(
  input: PasswordChangeSchema
): Promise<AccountSettingResponse> {
  try {
    const body = {
      ...input,
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

export async function updateAccountProfilePhoto(
  formData: FormData
): Promise<AccountSettingResponse> {
  try {
    const file = formData.get("photo_profile");

    if (!file || !(file instanceof File)) {
      return {
        success: false,
        message: "Please provide a valid image file.",
      };
    }

    const body = new FormData();

    body.append("file_type", "photo");
    body.append("photo", file);

    const response = await apiCall("profile/file", {
      method: "PUT",
      body,
    });


    if (response.status !== 200) {
      return {
        success: false,
        message: response.message || "Failed to update profile photo",
      };
    }

    revalidatePath("/setting/account-setting", "layout");

    return {
      success: true,
      message: response.message || "Profile photo updated successfully",
    };
  } catch (error) {
    console.error("Error updating profile photo:", error);
    if (error && typeof error === "object" && "message" in error) {
      return {
        success: false,
        message: error.message as string,
      };
    }

    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to update profile photo",
    };
  }
}
