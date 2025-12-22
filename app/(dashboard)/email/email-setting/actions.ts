"use server";

import { apiCall } from "@/lib/api";
import { revalidatePath } from "next/cache";

export async function saveEmailSetting(formData: FormData) {
  try {
    const response = await apiCall("email/template", {
      method: "PUT",
      body: formData,
    });

    if (response.status !== 200) {
      return {
        success: false,
        message: response.message || "Failed to update email setting",
      };
    }

    revalidatePath("/email/email-setting", "layout");

    return {
      success: true,
      message: response.message || "Email setting updated successfully",
    };
  } catch (error) {
    console.error("Error updating email setting:", error);
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
          : "Failed to update email setting",
    };
  }
}
