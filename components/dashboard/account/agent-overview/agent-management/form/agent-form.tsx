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
import { Combobox } from "@/components/ui/combobox";
import { Switch } from "@/components/ui/switch";
import { FileInputPreview } from "./file-input-preview";
import { Option } from "@/types/data-table";

interface AgentFormProps<T extends FieldValues>
  extends Omit<React.ComponentPropsWithRef<"form">, "onSubmit"> {
  children: React.ReactNode;
  form: UseFormReturn<T>;
  onSubmit: (data: T) => void;
  promoGroupSelect: PromoGroup[];
  countryOptions?: Option[];
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
  isEditMode = false,
}: AgentFormProps<T>) {
  // Parse existing phone number to extract country code and number
  const parsePhoneNumber = (fullPhone: string) => {
    if (!fullPhone) return { countryCode: "+62", phoneNumber: "" };

    // Find the country code from the options
    const matchedCountry = countryOptions.find((option) =>
      fullPhone.startsWith(option.value)
    );

    if (matchedCountry) {
      const phoneNumber = fullPhone.substring(matchedCountry.value.length);
      return { countryCode: matchedCountry.value, phoneNumber };
    }

    // Default to +62 if no match
    return { countryCode: "+62", phoneNumber: fullPhone.replace(/^\+/, "") };
  };

  const initialPhone = form.getValues("phone" as FieldPath<T>) as string;
  const { countryCode: initialCountryCode, phoneNumber: initialPhoneNumber } =
    parsePhoneNumber(initialPhone || "");

  const [selectedCountryCode, setSelectedCountryCode] =
    React.useState<string>(initialCountryCode);
  const [phoneNumber, setPhoneNumber] =
    React.useState<string>(initialPhoneNumber);

  // Update form value when country code or phone number changes
  React.useEffect(() => {
    const fullPhone = phoneNumber ? `${selectedCountryCode}${phoneNumber}` : "";
    form.setValue("phone" as FieldPath<T>, fullPhone as any);
  }, [selectedCountryCode, phoneNumber, form]);

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
              <FormLabel>Promo Group*</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select promo group" />
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
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone*</FormLabel>
              <div className="flex gap-2">
                <Combobox
                  options={countryOptions}
                  value={selectedCountryCode}
                  onValueChange={(value) => {
                    setSelectedCountryCode(value);
                    // Trigger validation
                    field.onChange(`${value}${phoneNumber}`);
                  }}
                  placeholder="Code"
                  searchPlaceholder="Search country code..."
                  emptyText="No country found."
                  className="w-[160px]"
                />
                <FormControl>
                  <Input
                    placeholder="Enter phone number"
                    value={phoneNumber}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, ""); // Only digits
                      setPhoneNumber(value);
                      // Update the form field for validation
                      field.onChange(`${selectedCountryCode}${value}`);
                    }}
                    onBlur={field.onBlur}
                    name={field.name}
                    ref={field.ref}
                    className="flex-1"
                  />
                </FormControl>
              </div>
              <FormMessage />
            </FormItem>
          )}
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
