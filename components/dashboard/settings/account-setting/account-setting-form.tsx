"use client";

import { changePassword } from "@/app/(dashboard)/settings/account-setting/actions";
import { AccountProfile } from "@/app/(dashboard)/settings/account-setting/types";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";

const passwordChangeSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type PasswordChangeSchema = z.infer<typeof passwordChangeSchema>;

interface AccountSettingFormProps {
  defaultValues: AccountProfile;
}

const AccountSettingForm = ({ defaultValues }: AccountSettingFormProps) => {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<PasswordChangeSchema>({
    resolver: zodResolver(passwordChangeSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  function onSubmit(values: PasswordChangeSchema) {
    setIsLoading(true);
    toast.promise(changePassword(values), {
      loading: "Changing password...",
      success: (data) => {
        setIsLoading(false);
        form.reset();
        return data.message || "Password changed successfully";
      },
      error: (error) => {
        setIsLoading(false);
        return error.message || "Failed to change password";
      },
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="mb-8 flex items-start gap-8">
          <div className="min-w-[180px] font-medium">Account Setting</div>
          <div className="flex-1">
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <FormField
                  control={form.control}
                  name="currentPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">
                        Current Password
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="Enter current password"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="newPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">
                        New Password
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="Enter new password"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">
                        Confirm New Password
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="Confirm new password"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button className="mt-2" type="submit" disabled={isLoading}>
                {isLoading && (
                  <Loader
                    className="mr-2 h-4 w-4 animate-spin"
                    aria-hidden="true"
                  />
                )}
                Change Password
              </Button>
            </div>
          </div>
        </div>
      </form>
    </Form>
  );
};

export default AccountSettingForm;
