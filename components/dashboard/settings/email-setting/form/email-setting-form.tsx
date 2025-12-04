"use client";

import { saveEmailSetting } from "@/app/(dashboard)/settings/email-setting/actions";
import { EmailTemplate } from "@/app/(dashboard)/settings/email-setting/types";
import { Button } from "@/components/ui/button";
import Editor from "@/components/ui/editor";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader } from "lucide-react";

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";

const emailSettingSchema = z.object({
  body: z.string().min(1, "Body template is required"),
  signature_text: z.string().min(1, "Signature is required"),
});

export type EmailSettingSchema = z.infer<typeof emailSettingSchema>;

interface EmailSettingFormProps {
  defaultValues: EmailTemplate;
  type: string;
}

const EmailSettingForm = ({ defaultValues, type }: EmailSettingFormProps) => {
  const [isPending, startTransition] = useTransition();

  const form = useForm<EmailSettingSchema>({
    resolver: zodResolver(emailSettingSchema),
    defaultValues: {
      body: defaultValues.body || "",
      signature_text: defaultValues.signature || "",
    },
  });

  function onSubmit(values: EmailSettingSchema) {
    const formData = new FormData();
    formData.append("body", values.body);
    formData.append("signature_text", values.signature_text);
    formData.append("type", type);

    startTransition(() => {
      toast.promise(saveEmailSetting(formData), {
        loading: "Saving email settings...",
        success: (data) => {
          return data.message || "Email settings saved successfully";
        },
        error: (error) => {
          return error.message || "Failed to save email settings";
        },
      });
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="flex-1">
          <div className="grid grid-cols-1 gap-6 items-end">
            <FormField
              control={form.control}
              name="body"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="mb-2 block text-base">
                    E-mail Body Template
                  </FormLabel>
                  <FormControl>
                    <Editor
                      content={field.value}
                      onChange={field.onChange}
                      placeholder="Enter your email body template here..."
                      className="bg-white"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="signature_text"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="mb-2 block text-base">
                    E-mail Signature
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      className="h-24 bg-white"
                      placeholder="Enter your email signature here"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <Button className="mt-6" type="submit" disabled={isPending}>
            {isPending && (
              <Loader
                className="mr-2 h-4 w-4 animate-spin"
                aria-hidden="true"
              />
            )}
            Save Changes
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default EmailSettingForm;
