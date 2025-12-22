import { EmailSettingLayout } from "./email-setting-layout";
import { getEmailTemplate } from "./fetch";
import { requireAuthorization } from "@/lib/server-authorization";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { SearchParams } from "@/types";

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
    <div className="space-y-8">
      {/* Email Type Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 pb-4 border-b">
        <span className="text-sm font-medium text-muted-foreground">
          Template Type:
        </span>
        <div className="flex gap-2">
          <Button
            asChild
            variant={currentTab === "confirm" ? "default" : "outline"}
            size="sm"
          >
            <Link href="/email/email-setting?type=confirm">
              Confirmation
            </Link>
          </Button>
          <Button
            asChild
            variant={currentTab === "cancel" ? "default" : "outline"}
            size="sm"
          >
            <Link href="/email/email-setting?type=cancel">
              Cancellation
            </Link>
          </Button>
        </div>
      </div>

      <EmailSettingLayout
        emailTemplatePromise={emailTemplatePromise}
        currentTab={currentTab}
      />
    </div>
  );
};

export default EmailSettingPage;
