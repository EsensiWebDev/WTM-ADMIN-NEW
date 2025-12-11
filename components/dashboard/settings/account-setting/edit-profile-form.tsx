"use client";

import { updateAccountProfile } from "@/app/(dashboard)/settings/account-setting/actions";
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
import { PhoneInput } from "@/components/ui/phone-input";
import { usePhoneInput } from "@/hooks/use-phone-input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { Loader } from "lucide-react";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";
import { type Option } from "@/types/data-table";

const profileSchema = z.object({
  full_name: z
    .string()
    .min(2, "Full name must be at least 2 characters")
    .regex(
      /^[a-zA-Z\s'-]+$/,
      "Full name can only contain alphabetic characters, spaces, hyphens, and apostrophes"
    )
    .refine((value) => {
      // Ensure at least one alphabetic character exists
      return /[a-zA-Z]/.test(value);
    }, "Full name must contain at least one alphabetic character"),
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
  phone: z
    .string()
    .min(1, "Phone number is required")
    .regex(
      /^\+[1-9]\d{1,14}$/,
      "Phone number must start with '+' followed by country code and national number (E.164 format)"
    )
    .refine((value) => {
      // Validate E.164 format: +[1-9]{1-3}[0-9]{6,14}
      // This allows for country codes (1-3 digits) and national numbers (6-14 digits)
      const match = value.match(/^\+(\d{1,3})(\d{6,14})$/);
      return match !== null;
    }, "Phone number must follow E.164 format: + then 1-3 digit country code, then 6-14 digit national number"),
});

export type ProfileSchema = z.infer<typeof profileSchema>;

interface EditProfileFormProps {
  defaultValues: AccountProfile;
  countryOptions?: Option[];
}

const EditProfileForm = ({
  defaultValues,
  countryOptions = [],
}: EditProfileFormProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();

  const form = useForm<ProfileSchema>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      full_name: defaultValues.full_name,
      email: defaultValues.email,
      phone: defaultValues.phone,
    },
  });

  const phoneInput = usePhoneInput({
    initialPhone: defaultValues.phone || "",
    countryOptions,
  });

  async function onSubmit(values: ProfileSchema) {
    setIsLoading(true);
    const { success, message } = await updateAccountProfile(values);
    if (!success) {
      setIsLoading(false);
      toast.error(message || "Failed to update profile");
      return;
    }
    setIsLoading(false);
    queryClient.invalidateQueries({
      queryKey: ["profile"],
    });
    toast.success(message || "Profile updated successfully");
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="flex items-start gap-8">
          <div className="min-w-[180px] font-medium">Edit Profile</div>
          <div className="flex-1">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="full_name"
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel className="text-sm font-medium">
                      Full Name
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="Enter first name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel className="text-sm font-medium">Email</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => {
                  // Update form value when phone input changes
                  React.useEffect(() => {
                    field.onChange(phoneInput.fullPhoneValue);
                  }, [phoneInput.fullPhoneValue]);

                  return (
                    <FormItem className="col-span-2">
                      <FormLabel className="text-sm font-medium">
                        Phone Number*
                      </FormLabel>
                      <FormControl>
                        <PhoneInput
                          countryOptions={countryOptions}
                          selectedCountryCode={phoneInput.selectedCountryCode}
                          phoneNumber={phoneInput.phoneNumber}
                          onCountryCodeChange={(code) => {
                            phoneInput.setSelectedCountryCode(code);
                          }}
                          onPhoneNumberChange={(number) => {
                            phoneInput.setPhoneNumber(number);
                          }}
                          onBlur={field.onBlur}
                          name={field.name}
                          ref={field.ref}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  );
                }}
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

export default EditProfileForm;
