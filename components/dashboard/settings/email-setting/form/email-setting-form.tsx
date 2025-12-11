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
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader, FileText, Image } from "lucide-react";
import { FileInputPreview } from "@/components/dashboard/account/agent-overview/agent-management/form/file-input-preview";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";

const emailSettingSchema = z
  .object({
    body: z.string().min(1, "Body template is required"),
    signature_type: z.enum(["text", "image"]),
    signature_text: z.string().optional(),
    signature_image: z.instanceof(File).optional(),
  })
  .refine(
    (data) => {
      if (data.signature_type === "text") {
        return data.signature_text && data.signature_text.trim().length > 0;
      }
      if (data.signature_type === "image") {
        return data.signature_image instanceof File;
      }
      return false;
    },
    {
      message: "Signature is required",
      path: ["signature_text"],
    }
  )
  .refine(
    (data) => {
      if (
        data.signature_type === "image" &&
        data.signature_image instanceof File
      ) {
        // Check file size (2MB max)
        return data.signature_image.size <= 2 * 1024 * 1024;
      }
      return true;
    },
    {
      message: "Image size must be less than 2MB",
      path: ["signature_image"],
    }
  )
  .refine(
    (data) => {
      if (
        data.signature_type === "image" &&
        data.signature_image instanceof File
      ) {
        // Check file type
        const validTypes = ["image/jpeg", "image/png", "image/webp"];
        return validTypes.includes(data.signature_image.type);
      }
      return true;
    },
    {
      message: "Only JPG, PNG, and WEBP formats are allowed",
      path: ["signature_image"],
    }
  );

export type EmailSettingSchema = z.infer<typeof emailSettingSchema>;

interface EmailSettingFormProps {
  defaultValues: EmailTemplate;
  type: string;
}

const EmailSettingForm = ({ defaultValues, type }: EmailSettingFormProps) => {
  const [isPending, startTransition] = useTransition();
  const [signatureType, setSignatureType] = useState<"text" | "image">("text");

  const form = useForm<EmailSettingSchema>({
    resolver: zodResolver(emailSettingSchema),
    defaultValues: {
      body: defaultValues.body || "",
      signature_type: "text",
      signature_text: defaultValues.signature || "",
      signature_image: undefined,
    },
  });

  function onSubmit(values: EmailSettingSchema) {
    const formData = new FormData();
    formData.append("subject", defaultValues.subject);
    formData.append("body", values.body);
    formData.append("type", type);

    // Only send the relevant signature field based on type
    if (values.signature_type === "text" && values.signature_text) {
      formData.append("signature_text", values.signature_text);
    } else if (values.signature_type === "image" && values.signature_image) {
      formData.append("signature_image", values.signature_image);
    }

    startTransition(async () => {
      const result = await saveEmailSetting(formData);
      if (!result.success) {
        toast.error(result.message || "Failed to save email settings");
        return;
      }

      toast.success(result.message || "Email settings saved successfully");
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
              name="signature_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="mb-2 block text-base">
                    E-mail Signature Type
                  </FormLabel>
                  <FormControl>
                    <ToggleGroup
                      type="single"
                      value={field.value}
                      onValueChange={(value) => {
                        if (value) {
                          field.onChange(value);
                          setSignatureType(value as "text" | "image");
                        }
                      }}
                      variant="outline"
                    >
                      <ToggleGroupItem
                        value="text"
                        aria-label="Text signature"
                        className="data-[state=on]:bg-primary data-[state=on]:text-white bg-[var(--tabs-background)] text-[var(--tabs-foreground)] hover:bg-[var(--tabs-background)] hover:text-[var(--tabs-foreground)]"
                      >
                        <FileText className="h-4 w-4" />
                        Text
                      </ToggleGroupItem>
                      <ToggleGroupItem
                        value="image"
                        aria-label="Image signature"
                        className="data-[state=on]:bg-primary data-[state=on]:text-white bg-[var(--tabs-background)] text-[var(--tabs-foreground)] hover:bg-[var(--tabs-background)] hover:text-[var(--tabs-foreground)]"
                      >
                        <Image className="h-4 w-4" />
                        Image
                      </ToggleGroupItem>
                    </ToggleGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {signatureType === "text" ? (
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
            ) : (
              <FormField
                control={form.control}
                name="signature_image"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="mb-2 block text-base">
                      E-mail Signature Image
                    </FormLabel>
                    <FormControl>
                      <FileInputPreview
                        accept="image/jpeg,image/png,image/webp"
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                        value={field.value}
                        name={field.name}
                        ref={field.ref}
                        placeholder="Choose signature image (Max 2MB)"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
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
