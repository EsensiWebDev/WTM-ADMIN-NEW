"use client";

import { use } from "react";
import { ApiResponse } from "@/types";
import { EmailTemplate } from "@/app/(dashboard)/email/email-setting/types";
import { EmailBodyTemplateEditor } from "./email-body-template-editor";
import { useState, useEffect } from "react";

interface EmailBodyTemplateEditorWrapperProps {
  emailTemplatePromise: Promise<ApiResponse<EmailTemplate>>;
  onBodyChange?: (body: string) => void;
}

export const EmailBodyTemplateEditorWrapper = ({
  emailTemplatePromise,
  onBodyChange,
}: EmailBodyTemplateEditorWrapperProps) => {
  const { data: emailTemplate } = use(emailTemplatePromise);
  const [bodyValue, setBodyValue] = useState(emailTemplate.body || "");

  useEffect(() => {
    if (onBodyChange) {
      onBodyChange(bodyValue);
    }
  }, [bodyValue, onBodyChange]);

  return (
    <EmailBodyTemplateEditor
      defaultValues={emailTemplate}
      onBodyChange={setBodyValue}
    />
  );
};

