"use client";

import { use } from "react";
import { ApiResponse } from "@/types";
import { EmailTemplate } from "@/app/(dashboard)/settings/email-setting/types";
import EmailSettingForm from "./email-setting-form";

interface EmailSettingFormAsyncProps {
  emailTemplatePromise: Promise<ApiResponse<EmailTemplate>>;
  type: string;
}

const EmailSettingFormAsync = ({
  emailTemplatePromise,
  type,
}: EmailSettingFormAsyncProps) => {
  const { data: emailTemplate } = use(emailTemplatePromise);

  return <EmailSettingForm defaultValues={emailTemplate} type={type} />;
};

export default EmailSettingFormAsync;
