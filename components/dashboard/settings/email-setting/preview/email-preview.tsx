import { EmailTemplate } from "@/app/(dashboard)/email/email-setting/types";
import { Card, CardContent } from "@/components/ui/card";

interface EmailPreviewProps {
  emailTemplate: EmailTemplate;
}

const EmailPreview = ({ emailTemplate }: EmailPreviewProps) => {
  return (
    <Card className="w-full border-2 shadow-lg bg-white">
      <CardContent className="text-muted-foreground text-base leading-relaxed p-8">
        <div className="space-y-6">
          <div
            className="email-body prose prose-base max-w-none"
            dangerouslySetInnerHTML={{ __html: emailTemplate.body }}
          />
          <div className="pt-6 border-t border-gray-200">
            <div
              className="email-signature prose prose-base max-w-none"
              dangerouslySetInnerHTML={{ __html: emailTemplate.signature }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default EmailPreview;
