import * as React from "react";
import type { FieldPath, FieldValues, UseFormReturn } from "react-hook-form";

import { PromoGroup } from "@/app/(dashboard)/promo-group/types";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectItemLink,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { FileInputPreview } from "./file-input-preview";
import { Option } from "@/types/data-table";
import { PhoneInput } from "@/components/ui/phone-input";
import { usePhoneInput } from "@/hooks/use-phone-input";

interface AgentFormProps<T extends FieldValues>
  extends Omit<React.ComponentPropsWithRef<"form">, "onSubmit"> {
  children: React.ReactNode;
  form: UseFormReturn<T>;
  onSubmit: (data: T) => void;
  promoGroupSelect: PromoGroup[];
  countryOptions?: Option[];
  currencyOptions?: Option[];
  existingImages?: {
    photo_selfie?: string | null;
    photo_id_card?: string | null;
    certificate?: string | null;
    name_card?: string | null;
  };
  isEditMode?: boolean;
}

export function AgentForm<T extends FieldValues>({
  form,
  onSubmit,
  children,
  promoGroupSelect,
  existingImages,
  countryOptions = [],
  currencyOptions = [],
  isEditMode = false,
}: AgentFormProps<T>) {
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
              <FormLabel>Agent Name*</FormLabel>
              <FormControl>
                <Input placeholder="Enter agent name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {isEditMode && (
          <FormField
            control={form.control}
            name={"username" as FieldPath<T>}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Username*</FormLabel>
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
          name={"agent_company" as FieldPath<T>}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Agent Company</FormLabel>
              <FormControl>
                <Input placeholder="Enter agent company" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name={"promo_group_id" as FieldPath<T>}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Promo Group</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select promo group (optional)" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent align="end">
                  {promoGroupSelect.map((promoGroup) => (
                    <SelectItem
                      key={promoGroup.id}
                      value={String(promoGroup.id)}
                    >
                      {promoGroup.name}
                    </SelectItem>
                  ))}
                  <SelectSeparator />
                  <SelectItemLink href={"/promo-group"}>
                    Create New Group
                  </SelectItemLink>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name={"currency" as FieldPath<T>}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Currency*</FormLabel>
              <Select onValueChange={field.onChange} value={field.value || "IDR"}>
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select currency" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {currencyOptions.length > 0 ? (
                    currencyOptions.map((currency) => (
                      <SelectItem key={currency.value} value={currency.value}>
                        {currency.label}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="IDR">IDR - Indonesian Rupiah</SelectItem>
                  )}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name={"email" as FieldPath<T>}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email*</FormLabel>
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
        <FormField
          control={form.control}
          name={"kakao_talk_id" as FieldPath<T>}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Kakao Talk ID*</FormLabel>
              <FormControl>
                <Input placeholder="Enter Kakao Talk ID" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name={"photo_selfie" as FieldPath<T>}
          render={({ field: { ref, name, onBlur, onChange, value } }) => (
            <FormItem>
              <FormLabel>Agent Selfie Photo*</FormLabel>
              <FormControl>
                <FileInputPreview
                  ref={ref}
                  name={name}
                  onBlur={onBlur}
                  onChange={onChange}
                  value={value}
                  accept="image/*"
                  initialPreview={existingImages?.photo_selfie}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name={"photo_id_card" as FieldPath<T>}
          render={({ field: { ref, name, onBlur, onChange, value } }) => (
            <FormItem>
              <FormLabel>Identity Card*</FormLabel>
              <FormControl>
                <FileInputPreview
                  ref={ref}
                  name={name}
                  onBlur={onBlur}
                  onChange={onChange}
                  value={value}
                  accept="image/*"
                  initialPreview={existingImages?.photo_id_card}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name={"certificate" as FieldPath<T>}
          render={({ field: { ref, name, onBlur, onChange, value } }) => (
            <FormItem>
              <FormLabel>Certificate</FormLabel>
              <FormControl>
                <FileInputPreview
                  ref={ref}
                  name={name}
                  onBlur={onBlur}
                  onChange={onChange}
                  value={value}
                  accept="image/*"
                  initialPreview={existingImages?.certificate}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name={"name_card" as FieldPath<T>}
          render={({ field: { ref, name, onBlur, onChange, value } }) => (
            <FormItem>
              <FormLabel>Name Card*</FormLabel>
              <FormControl>
                <FileInputPreview
                  ref={ref}
                  name={name}
                  onBlur={onBlur}
                  onChange={onChange}
                  value={value}
                  accept="image/*"
                  initialPreview={existingImages?.name_card}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {isEditMode && (
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
        )}
        {children}
      </form>
    </Form>
  );
}
