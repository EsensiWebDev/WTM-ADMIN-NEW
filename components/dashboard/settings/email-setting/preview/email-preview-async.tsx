"use client";

import { use } from "react";
import { ApiResponse } from "@/types";
import { EmailTemplate } from "@/app/(dashboard)/email/email-setting/types";
import EmailPreview from "./email-preview";

interface EmailPreviewAsyncProps {
  emailTemplatePromise: Promise<ApiResponse<EmailTemplate>>;
}

const EmailPreviewAsync = ({
  emailTemplatePromise,
}: EmailPreviewAsyncProps) => {
  const { data: emailTemplate } = use(emailTemplatePromise);

  return <EmailPreview emailTemplate={emailTemplate} />;
};

export default EmailPreviewAsync;
