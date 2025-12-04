import EmailSettingForm from "@/components/dashboard/settings/email-setting/form/email-setting-form";
import EmailPreview from "@/components/dashboard/settings/email-setting/preview/email-preview";
import { getEmailTemplate } from "./fetch";
import { requireAuthorization } from "@/lib/server-authorization";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const EmailSettingPage = async () => {
  await requireAuthorization({ requiredRole: "Super Admin" });

  const { data: emailTemplate } = await getEmailTemplate();
  return (
    <div className="flex gap-12">
      {/* Left: Form */}
      <div className="flex-1">
        <div className="mb-8 flex items-start gap-8">
          <div className="min-w-[180px] font-medium flex flex-col gap-2">
            E-mail Setting
            <Button asChild>
              <Link href="/settings/email-setting?type=confirmation">
                Confirmation
              </Link>
            </Button>
            <Button asChild>
              <Link href="/settings/email-setting?type=cancel">Cancel</Link>
            </Button>
          </div>

          <EmailSettingForm defaultValues={emailTemplate} />
        </div>
      </div>
      {/* Right: Preview */}
      <div className="flex flex-col min-w-[340px] max-w-md w-full">
        <div className="mb-2 font-medium">E-mail Preview</div>
        <EmailPreview emailTemplate={emailTemplate} />
      </div>
    </div>
  );
};

export default EmailSettingPage;
