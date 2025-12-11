"use client";

import * as React from "react";
import { Combobox } from "@/components/ui/combobox";
import { Input } from "@/components/ui/input";
import { type Option } from "@/types/data-table";

export interface PhoneInputProps {
  countryOptions: Option[];
  selectedCountryCode: string;
  phoneNumber: string;
  onCountryCodeChange: (code: string) => void;
  onPhoneNumberChange: (number: string) => void;
  onBlur?: () => void;
  name?: string;
  disabled?: boolean;
}

export const PhoneInput = React.forwardRef<HTMLInputElement, PhoneInputProps>(
  (
    {
      countryOptions,
      selectedCountryCode,
      phoneNumber,
      onCountryCodeChange,
      onPhoneNumberChange,
      onBlur,
      name,
      disabled = false,
    },
    ref
  ) => {
    return (
      <div className="flex gap-2">
        <Combobox
          options={countryOptions}
          value={selectedCountryCode}
          onValueChange={onCountryCodeChange}
          placeholder="Dial code"
          searchPlaceholder="Search country code..."
          emptyText="No country found."
          className="w-[160px]"
          disabled={disabled}
        />
        <Input
          ref={ref}
          name={name}
          placeholder="Enter phone number"
          value={phoneNumber}
          onChange={(e) => {
            const value = e.target.value.replace(/\D/g, ""); // Only digits
            onPhoneNumberChange(value);
          }}
          onBlur={onBlur}
          className="flex-1"
          disabled={disabled}
        />
      </div>
    );
  }
);

PhoneInput.displayName = "PhoneInput";
