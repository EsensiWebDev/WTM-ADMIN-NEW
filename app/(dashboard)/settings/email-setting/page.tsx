import EmailSettingForm from "@/components/dashboard/settings/email-setting/form/email-setting-form";
import EmailPreview from "@/components/dashboard/settings/email-setting/preview/email-preview";
import { getEmailTemplate } from "./fetch";
import { requireAuthorization } from "@/lib/server-authorization";

const EmailSettingPage = async () => {
  await requireAuthorization({ requiredRole: "Super Admin" });

  const { data: emailTemplate } = await getEmailTemplate();
  return (
    <div className="flex gap-12">
      {/* Left: Form */}
      <div className="flex-1">
        <EmailSettingForm defaultValues={emailTemplate} />
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
