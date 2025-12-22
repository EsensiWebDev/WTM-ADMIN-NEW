"use client";

import { use } from "react";
import { ApiResponse } from "@/types";
import { EmailTemplate } from "@/app/(dashboard)/email/email-setting/types";
import EmailSettingForm from "./email-setting-form";

interface EmailSettingFormAsyncProps {
  emailTemplatePromise: Promise<ApiResponse<EmailTemplate>>;
  type: string;
  hideBodyField?: boolean;
  onBodyChange?: (body: string) => void;
  externalBodyValue?: string;
}

const EmailSettingFormAsync = ({
  emailTemplatePromise,
  type,
  hideBodyField,
  onBodyChange,
  externalBodyValue,
}: EmailSettingFormAsyncProps) => {
  const { data: emailTemplate } = use(emailTemplatePromise);

  return (
    <EmailSettingForm
      defaultValues={emailTemplate}
      type={type}
      hideBodyField={hideBodyField}
      onBodyChange={onBodyChange}
      externalBodyValue={externalBodyValue}
    />
  );
};

export default EmailSettingFormAsync;
