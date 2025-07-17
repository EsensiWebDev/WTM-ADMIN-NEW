import { EmailSetting } from "./types";

// Simulate fetching email settings from a data source
export async function fetchEmailSetting(): Promise<EmailSetting> {
  // Simulate API call delay
  await new Promise((resolve) => setTimeout(resolve, 500));
  // Return mock data
  return {
    bodyTemplate:
      "Lorem ipsum dolor sit amet consectetur. Velit donec sagittis senectus integer pharetra massa pulvinar accumsan. Sed diam pulvinar ornare cras donec tellus vitae ut. Proin ullamcorper vitae sollicitudin consequat et duis sed blandit. Proin mi aliquam mi amet egestas aliquet porta quam ac. Ridiculus aliquet aliquam posuere scelerisque. Mollis nunc eget molestie sodales eu nibh.",
    signature: "Best regards,\nYour Company Team",
  };
}
