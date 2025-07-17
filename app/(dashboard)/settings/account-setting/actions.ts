import {
  AccountProfile,
  AccountSettingResponse,
  PasswordChange,
} from "./types";

// Simulate updating account profile
export async function updateAccountProfile(
  input: AccountProfile
): Promise<AccountSettingResponse> {
  // Simulate API call delay
  await new Promise((resolve) => setTimeout(resolve, 1000));
  // Simulate success response
  return { success: true, message: "Profile updated successfully" };
}

// Simulate changing password
export async function changePassword(
  input: PasswordChange
): Promise<AccountSettingResponse> {
  // Simulate API call delay
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Simulate validation
  if (input.newPassword !== input.confirmPassword) {
    return { success: false, message: "New passwords do not match" };
  }

  if (input.newPassword.length < 8) {
    return {
      success: false,
      message: "Password must be at least 8 characters long",
    };
  }

  // Simulate success response
  return { success: true, message: "Password changed successfully" };
}
