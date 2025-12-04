import EmailSettingFormAsync from "@/components/dashboard/settings/email-setting/form/email-setting-form-async";
import EmailSettingFormSkeleton from "@/components/dashboard/settings/email-setting/form/email-setting-form-skeleton";
import EmailPreviewAsync from "@/components/dashboard/settings/email-setting/preview/email-preview-async";
import EmailPreviewSkeleton from "@/components/dashboard/settings/email-setting/preview/email-preview-skeleton";
import { getEmailTemplate } from "./fetch";
import { requireAuthorization } from "@/lib/server-authorization";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { SearchParams } from "@/types";
import { cn } from "@/lib/utils";
import { Suspense } from "react";

const EmailSettingPage = async (props: {
  searchParams: Promise<SearchParams>;
}) => {
  const searchParams = await props.searchParams;
  const currentTab = searchParams.type as string;
  await requireAuthorization({ requiredRole: "Super Admin" });

  // Fetch data as promise without awaiting
  const emailTemplatePromise = getEmailTemplate({
    type: currentTab,
  });

  return (
    <div className="flex gap-12">
      {/* Left: Form */}
      <div className="flex-1">
        <div className="mb-8 flex items-start gap-8">
          <div className="min-w-[180px] font-medium flex flex-col gap-2">
            E-mail Setting
            <Button
              asChild
              className={cn({
                "bg-[var(--tabs-background)] text-[var(--tabs-foreground)] hover:bg-[var(--tabs-background)] hover:text-[var(--tabs-foreground)]":
                  currentTab !== "confirm",
              })}
            >
              <Link href="/settings/email-setting?type=confirm">Confirm</Link>
            </Button>
            <Button
              asChild
              className={cn({
                "bg-[var(--tabs-background)] text-[var(--tabs-foreground)] hover:bg-[var(--tabs-background)] hover:text-[var(--tabs-foreground)]":
                  currentTab !== "cancel",
              })}
            >
              <Link href="/settings/email-setting?type=cancel">Cancel</Link>
            </Button>
          </div>

          <Suspense fallback={<EmailSettingFormSkeleton />} key={currentTab}>
            <EmailSettingFormAsync
              emailTemplatePromise={emailTemplatePromise}
              type={currentTab}
            />
          </Suspense>
        </div>
      </div>
      {/* Right: Preview */}
      <div className="flex flex-col min-w-[340px] max-w-md w-full">
        <div className="mb-2 font-medium">E-mail Preview</div>
        <Suspense fallback={<EmailPreviewSkeleton />} key={currentTab}>
          <EmailPreviewAsync emailTemplatePromise={emailTemplatePromise} />
        </Suspense>
      </div>
    </div>
  );
};

export default EmailSettingPage;
