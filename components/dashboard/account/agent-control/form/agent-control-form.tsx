"use client";

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
import { PhoneInput } from "@/components/ui/phone-input";
import { usePhoneInput } from "@/hooks/use-phone-input";
import { type Option } from "@/types/data-table";

interface AgentControlFormProps<T extends FieldValues>
  extends Omit<React.ComponentPropsWithRef<"form">, "onSubmit"> {
  children: React.ReactNode;
  form: UseFormReturn<T>;
  onSubmit: (data: T) => void;
  countryOptions?: Option[];
}

export function AgentControlForm<T extends FieldValues>({
  form,
  onSubmit,
  children,
  countryOptions = [],
}: AgentControlFormProps<T>) {
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
          name={"name" as FieldPath<T>}
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
                <Input placeholder="Enter email" {...field} />
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
        {children}
      </form>
    </Form>
  );
}
