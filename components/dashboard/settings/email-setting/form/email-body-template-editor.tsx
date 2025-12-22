"use client";

import { EmailTemplate } from "@/app/(dashboard)/email/email-setting/types";
import Editor from "@/components/ui/editor";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
import { useEffect } from "react";

const bodyTemplateSchema = z.object({
  body: z.string().min(1, "Body template is required"),
});

interface EmailBodyTemplateEditorProps {
  defaultValues: EmailTemplate;
  onBodyChange: (body: string) => void;
}

export const EmailBodyTemplateEditor = ({
  defaultValues,
  onBodyChange,
}: EmailBodyTemplateEditorProps) => {
  const form = useForm({
    resolver: zodResolver(bodyTemplateSchema),
    defaultValues: {
      body: defaultValues.body || "",
    },
  });

  const bodyValue = form.watch("body");

  useEffect(() => {
    onBodyChange(bodyValue);
  }, [bodyValue, onBodyChange]);

  return (
    <Form {...form}>
      <FormField
        control={form.control}
        name="body"
        render={({ field }) => (
          <FormItem>
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
    </Form>
  );
};

