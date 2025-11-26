import { useState } from "react";

/**
 * Formats a numeric value with locale-specific separators for display purposes.
 * The actual value stored remains unformatted.
 *
 * @param value - The numeric value to format (can be number or string)
 * @param locale - The locale to use for formatting (default: 'id-ID' for Indonesian Rupiah)
 * @param options - Additional Intl.NumberFormat options
 * @returns Formatted string for display
 *
 * @example
 * // For Indonesian Rupiah (id-ID)
 * formatCurrencyDisplay(50000) // Returns "50.000"
 * formatCurrencyDisplay(1234567.89) // Returns "1.234.567,89"
 *
 * @example
 * // For US Dollar (en-US)
 * formatCurrencyDisplay(50000, 'en-US') // Returns "50,000"
 */
export function formatCurrencyDisplay(
  value: number | string,
  locale: string = "id-ID",
  options: Intl.NumberFormatOptions = {}
): string {
  if (value === "" || value === null || value === undefined) return "";

  const numericValue =
    typeof value === "string"
      ? parseFloat(value.replace(/[^0-9.-]/g, ""))
      : value;

  if (isNaN(numericValue)) return "";

  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
    ...options,
  }).format(numericValue);
}

/**
 * Parses a formatted currency string back to a numeric value.
 * Removes all locale-specific separators and returns the raw number.
 *
 * @param formattedValue - The formatted string to parse
 * @param locale - The locale used for formatting (default: 'id-ID')
 * @returns Numeric value without formatting
 *
 * @example
 * parseCurrencyInput("50.000") // Returns 50000
 * parseCurrencyInput("1.234.567,89") // Returns 1234567.89
 */
export function parseCurrencyInput(
  formattedValue: string,
  locale: string = "id-ID"
): number {
  if (!formattedValue) return 0;

  // For id-ID: . is thousands separator, , is decimal separator
  // For en-US: , is thousands separator, . is decimal separator
  const decimalSeparator = locale === "id-ID" ? "," : ".";
  const thousandsSeparator = locale === "id-ID" ? "." : ",";

  // Remove thousands separators and replace decimal separator with .
  const normalized = formattedValue
    .replace(new RegExp(`\\${thousandsSeparator}`, "g"), "")
    .replace(decimalSeparator, ".");

  const parsed = parseFloat(normalized);
  return isNaN(parsed) ? 0 : parsed;
}

/**
 * Custom hook to manage formatted currency input state.
 * Returns display value and handlers for input changes.
 *
 * @param fieldValue - The current field value from react-hook-form
 * @param fieldOnChange - The onChange handler from react-hook-form
 * @param locale - The locale to use for formatting
 * @returns Object containing display value and change handler
 *
 * @example
 * const { displayValue, handleChange } = useFormattedCurrencyInput(
 *   field.value,
 *   field.onChange,
 *   'id-ID'
 * );
 */
export function useFormattedCurrencyInput(
  fieldValue: number | string,
  fieldOnChange: (value: number) => void,
  locale: string = "id-ID"
) {
  const [displayValue, setDisplayValue] = useState<string>(() =>
    fieldValue ? formatCurrencyDisplay(fieldValue, locale) : ""
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;

    // Allow empty input
    if (inputValue === "") {
      setDisplayValue("");
      fieldOnChange(0);
      return;
    }

    // Parse the input and update the actual form value
    const numericValue = parseCurrencyInput(inputValue, locale);
    fieldOnChange(numericValue);

    // Format for display
    setDisplayValue(formatCurrencyDisplay(numericValue, locale));
  };

  const handleBlur = () => {
    // Re-format on blur to ensure consistent formatting
    if (displayValue) {
      const numericValue = parseCurrencyInput(displayValue, locale);
      setDisplayValue(formatCurrencyDisplay(numericValue, locale));
    }
  };

  return {
    displayValue,
    handleChange,
    handleBlur,
  };
}
