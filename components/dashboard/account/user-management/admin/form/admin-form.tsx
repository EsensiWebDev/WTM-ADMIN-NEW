import * as React from "react";
import type { FieldPath, FieldValues, UseFormReturn } from "react-hook-form";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { PhoneInput } from "@/components/ui/phone-input";
import { usePhoneInput } from "@/hooks/use-phone-input";
import { type Option } from "@/types/data-table";

interface AdminFormProps<T extends FieldValues>
  extends Omit<React.ComponentPropsWithRef<"form">, "onSubmit"> {
  children: React.ReactNode;
  form: UseFormReturn<T>;
  onSubmit: (data: T) => void;
  isEdit?: boolean;
  countryOptions?: Option[];
}

export function AdminForm<T extends FieldValues>({
  form,
  onSubmit,
  children,
  isEdit = false,
  countryOptions = [],
}: AdminFormProps<T>) {
  const initialPhone = form.getValues("phone" as FieldPath<T>) as string;
  const phoneInput = usePhoneInput({
    initialPhone: initialPhone || "",
    countryOptions,
  });

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-4"
      >
        <FormField
          control={form.control}
          name={"full_name" as FieldPath<T>}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name={"email" as FieldPath<T>}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter email"
                  {...field}
                  readOnly={isEdit}
                  disabled={isEdit}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name={"phone" as FieldPath<T>}
          render={({ field }) => {
            // Update form value when phone input changes
            React.useEffect(() => {
              field.onChange(phoneInput.fullPhoneValue);
            }, [phoneInput.fullPhoneValue]);

            return (
              <FormItem>
                <FormLabel>Phone*</FormLabel>
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
        {isEdit && (
          <FormField
            control={form.control}
            name={"username" as FieldPath<T>}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Username</FormLabel>
                <FormControl>
                  <Input placeholder="Enter username" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
        <FormField
          control={form.control}
          name={"is_active" as FieldPath<T>}
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Status</FormLabel>
                <div className="text-sm text-muted-foreground">
                  Enable or disable this user account
                </div>
              </div>
              <FormControl>
                <Switch
                  checked={!!field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />
        {children}
      </form>
    </Form>
  );
}
