import EmailSettingForm from "@/components/dashboard/settings/email-setting/form/email-setting-form";
import { Card, CardContent } from "@/components/ui/card";
import { fetchEmailSetting } from "./fetch";

const EmailSettingPage = async () => {
  const emailSetting = await fetchEmailSetting();
  return (
    <div className="flex gap-12">
      {/* Left: Form */}
      <div className="flex-1">
        <EmailSettingForm defaultValues={emailSetting} />
      </div>
      {/* Right: Preview */}
      <div className="flex flex-col min-w-[340px] max-w-md w-full">
        <div className="mb-2 font-medium">E-mail Preview</div>
        <Card className="w-full h-full min-h-[320px]">
          <CardContent className="text-muted-foreground text-base leading-relaxed p-6">
            {emailSetting.bodyTemplate}
            <br />
            <br />
            {emailSetting.signature}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EmailSettingPage;
