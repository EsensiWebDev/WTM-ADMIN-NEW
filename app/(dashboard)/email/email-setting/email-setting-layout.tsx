"use client";

import { useState } from "react";
import EmailSettingFormAsync from "@/components/dashboard/settings/email-setting/form/email-setting-form-async";
import EmailSettingFormSkeleton from "@/components/dashboard/settings/email-setting/form/email-setting-form-skeleton";
import EmailPreviewAsync from "@/components/dashboard/settings/email-setting/preview/email-preview-async";
import EmailPreviewSkeleton from "@/components/dashboard/settings/email-setting/preview/email-preview-skeleton";
import { EmailBodyTemplateEditorWrapper } from "@/components/dashboard/settings/email-setting/form/email-body-template-editor-wrapper";
import { ApiResponse } from "@/types";
import { EmailTemplate } from "./types";
import { Suspense } from "react";

interface EmailSettingLayoutProps {
  emailTemplatePromise: Promise<ApiResponse<EmailTemplate>>;
  currentTab: string;
}

export const EmailSettingLayout = ({
  emailTemplatePromise,
  currentTab,
}: EmailSettingLayoutProps) => {
  const [bodyValue, setBodyValue] = useState<string>("");

  return (
    <>
      {/* Email Body Template and Live Preview - Side by Side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Email Body Template (50%) */}
        <div className="space-y-4">
          <div>
            <h3 className="text-base font-semibold mb-2">
              E-mail Body Template
            </h3>
            <p className="text-sm text-muted-foreground">
              Edit your email template content
            </p>
          </div>
          <Suspense
            fallback={
              <div className="h-96 bg-muted animate-pulse rounded" />
            }
            key={currentTab}
          >
            <EmailBodyTemplateEditorWrapper
              emailTemplatePromise={emailTemplatePromise}
              onBodyChange={setBodyValue}
            />
          </Suspense>
        </div>

        {/* Right: Live Preview (50%) */}
        <div className="space-y-4">
          <div>
            <h3 className="text-base font-semibold mb-2">Live Preview</h3>
            <p className="text-sm text-muted-foreground">
              See how your email will look when sent
            </p>
          </div>
          <Suspense fallback={<EmailPreviewSkeleton />} key={currentTab}>
            <EmailPreviewAsync
              emailTemplatePromise={emailTemplatePromise}
            />
          </Suspense>
        </div>
      </div>

      {/* Signature Section - Below */}
      <div className="border-t pt-8">
        <Suspense fallback={<EmailSettingFormSkeleton />} key={currentTab}>
          <EmailSettingFormAsync
            emailTemplatePromise={emailTemplatePromise}
            type={currentTab}
            hideBodyField={true}
            externalBodyValue={bodyValue}
          />
        </Suspense>
      </div>
    </>
  );
};

