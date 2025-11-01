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
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";

const profileSchema = z.object({
  username: z.string().min(1, "Username is required"),
  full_name: z.string().min(1, "Full name is required"),
  agent_company: z.string().min(1, "Agent company is required"),
  phone: z
    .string()
    .min(1, "Phone number is required")
    .regex(
      /^(\+62|62|0)?8[1-9][0-9]{6,9}$/,
      "Please enter a valid phone number"
    ),
});

export type ProfileSchema = z.infer<typeof profileSchema>;

interface EditProfileFormProps {
  defaultValues: AccountProfile;
}

const EditProfileForm = ({ defaultValues }: EditProfileFormProps) => {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<ProfileSchema>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      username: defaultValues.username,
      full_name: defaultValues.full_name,
      agent_company: "DUMMY",
      phone: defaultValues.phone,
    },
  });

  function onSubmit(values: ProfileSchema) {
    setIsLoading(true);
    toast.promise(updateAccountProfile(values, defaultValues.email), {
      loading: "Saving profile changes...",
      success: (data) => {
        setIsLoading(false);
        return data.message || "Profile updated successfully";
      },
      error: (error) => {
        setIsLoading(false);
        return error.message || "Failed to update profile";
      },
    });
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
                name="username"
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel className="text-sm font-medium">
                      Username
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="Enter username" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="full_name"
                render={({ field }) => (
                  <FormItem>
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
                name="agent_company"
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel className="text-sm font-medium">
                      Agent Company
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="Enter agent company" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel className="text-sm font-medium">
                      Phone Number
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="Enter phone number" {...field} />
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

export default EditProfileForm;
