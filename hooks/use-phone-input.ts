import * as React from "react";
import { type Option } from "@/types/data-table";

interface UsePhoneInputProps {
  initialPhone: string;
  countryOptions: Option[];
  defaultCountryCode?: string;
}

interface UsePhoneInputReturn {
  selectedCountryCode: string;
  phoneNumber: string;
  setSelectedCountryCode: (code: string) => void;
  setPhoneNumber: (number: string) => void;
  fullPhoneValue: string;
}

export function usePhoneInput({
  initialPhone,
  countryOptions,
  defaultCountryCode = "+62",
}: UsePhoneInputProps): UsePhoneInputReturn {
  // Parse existing phone number to extract country code and number
  const parsePhoneNumber = React.useCallback(
    (fullPhone: string) => {
      if (!fullPhone)
        return { countryCode: defaultCountryCode, phoneNumber: "" };

      // Find the country code from the options
      const matchedCountry = countryOptions.find((option) =>
        fullPhone.startsWith(option.value)
      );

      if (matchedCountry) {
        const phoneNumber = fullPhone.substring(matchedCountry.value.length);
        return { countryCode: matchedCountry.value, phoneNumber };
      }

      // Default to defaultCountryCode if no match
      return {
        countryCode: defaultCountryCode,
        phoneNumber: fullPhone.replace(/^\+/, ""),
      };
    },
    [countryOptions, defaultCountryCode]
  );

  const { countryCode: initialCountryCode, phoneNumber: initialPhoneNumber } =
    React.useMemo(
      () => parsePhoneNumber(initialPhone || ""),
      [initialPhone, parsePhoneNumber]
    );

  const [selectedCountryCode, setSelectedCountryCode] =
    React.useState<string>(initialCountryCode);
  const [phoneNumber, setPhoneNumber] =
    React.useState<string>(initialPhoneNumber);

  const fullPhoneValue = React.useMemo(
    () => (phoneNumber ? `${selectedCountryCode}${phoneNumber}` : ""),
    [selectedCountryCode, phoneNumber]
  );

  return {
    selectedCountryCode,
    phoneNumber,
    setSelectedCountryCode,
    setPhoneNumber,
    fullPhoneValue,
  };
}
