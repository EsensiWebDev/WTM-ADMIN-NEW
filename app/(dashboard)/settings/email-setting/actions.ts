import { EmailSetting } from "./types";

// Simulate saving email settings
export async function saveEmailSetting(input: EmailSetting) {
  // Simulate API call delay
  await new Promise((resolve) => setTimeout(resolve, 1000));
  // Simulate success response
  return { success: true, message: "Email settings saved successfully" };
}
