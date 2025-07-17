"use client";

import { saveEmailSetting } from "@/app/(dashboard)/settings/email-setting/actions";
import { Button } from "@/components/ui/button";
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

import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";

const emailSettingSchema = z.object({
  bodyTemplate: z.string().min(1, "Body template is required"),
  signature: z.string().min(1, "Signature is required"),
});

type EmailSettingSchema = z.infer<typeof emailSettingSchema>;

interface EmailSettingFormProps {
  defaultValues: EmailSettingSchema;
}

const EmailSettingForm = ({ defaultValues }: EmailSettingFormProps) => {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<EmailSettingSchema>({
    resolver: zodResolver(emailSettingSchema),
    defaultValues,
  });

  function onSubmit(values: EmailSettingSchema) {
    setIsLoading(true);
    toast.promise(saveEmailSetting(values), {
      loading: "Saving email settings...",
      success: (data) => {
        setIsLoading(false);
        return data.message || "Email settings saved successfully";
      },
      error: (error) => {
        setIsLoading(false);
        return error.message || "Failed to save email settings";
      },
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="mb-8 flex items-start gap-8">
          <div className="min-w-[180px] font-medium">E-mail Setting</div>
          <div className="flex-1">
            <div className="grid grid-cols-1 gap-6 items-end">
              <FormField
                control={form.control}
                name="bodyTemplate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="mb-2 block text-base">
                      E-mail Body Template
                    </FormLabel>
                    <FormControl>
                      <Textarea className="h-40 bg-white" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="signature"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="mb-2 block text-base">
                      E-mail Signature
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        className="h-24 bg-white"
                        placeholder="Enter your email subject here"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <Button className="mt-6" type="submit" disabled={isLoading}>
              {isLoading && (
                <Loader
                  className="mr-2 h-4 w-4 animate-spin"
                  aria-hidden="true"
                />
              )}
              Save Changes
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
};

export default EmailSettingForm;
