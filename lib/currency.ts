import { useState } from "react";

export interface CurrencyInfo {
  code: string;
  name: string;
  symbol: string;
  locale?: string;
  decimalPlaces?: number;
}

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

/**
 * Formats a currency value with its symbol based on currency code.
 * 
 * @param value - The numeric value to format
 * @param currencyCode - The currency code (e.g., 'USD', 'IDR', 'EUR')
 * @param currencySymbol - The currency symbol (e.g., '$', 'IDR', '€')
 * @param locale - The locale to use for formatting (default: 'id-ID')
 * @param options - Additional Intl.NumberFormat options
 * @returns Formatted string with currency symbol
 * 
 * @example
 * formatCurrencyWithSymbol(50000, 'IDR', 'IDR') // Returns "IDR 50.000"
 * formatCurrencyWithSymbol(100, 'USD', '$') // Returns "$100"
 */
export function formatCurrencyWithSymbol(
  value: number | string,
  currencyCode: string,
  currencySymbol: string,
  locale: string = "id-ID",
  options: Intl.NumberFormatOptions = {}
): string {
  if (value === "" || value === null || value === undefined) return "";

  const numericValue =
    typeof value === "string"
      ? parseFloat(value.replace(/[^0-9.-]/g, ""))
      : value;

  if (isNaN(numericValue)) return "";

  // Determine decimal places based on currency
  const decimalPlaces = getDecimalPlacesForCurrency(currencyCode);
  
  const formatted = new Intl.NumberFormat(locale, {
    minimumFractionDigits: decimalPlaces,
    maximumFractionDigits: decimalPlaces,
    ...options,
  }).format(numericValue);

  // Format with symbol (symbol before for most currencies, after for some)
  const symbolPosition = getSymbolPosition(currencyCode);
  return symbolPosition === "before"
    ? `${currencySymbol} ${formatted}`
    : `${formatted} ${currencySymbol}`;
}

/**
 * Gets the number of decimal places for a currency.
 * Most currencies use 2 decimal places, but some use 0 (JPY, KRW, IDR, VND).
 */
export function getDecimalPlacesForCurrency(currencyCode: string): number {
  const zeroDecimalCurrencies = ["JPY", "KRW", "IDR", "VND"];
  return zeroDecimalCurrencies.includes(currencyCode.toUpperCase()) ? 0 : 2;
}

/**
 * Gets the symbol position for a currency (before or after the amount).
 */
export function getSymbolPosition(currencyCode: string): "before" | "after" {
  // Most currencies place symbol before, but some place after
  const afterSymbolCurrencies: string[] = []; // Add currencies that place symbol after if needed
  return afterSymbolCurrencies.includes(currencyCode.toUpperCase())
    ? "after"
    : "before";
}

/**
 * Formats a multi-currency price map for display.
 * 
 * @param prices - Map of currency codes to prices
 * @param currencies - Array of currency info objects
 * @returns Formatted string showing all prices
 * 
 * @example
 * formatMultiCurrencyPrices(
 *   { IDR: 1600000, USD: 100 },
 *   [{ code: 'IDR', symbol: 'IDR' }, { code: 'USD', symbol: '$' }]
 * ) // Returns "IDR 1.600.000 / $100"
 */
export function formatMultiCurrencyPrices(
  prices: Record<string, number>,
  currencies: CurrencyInfo[]
): string {
  if (!prices || Object.keys(prices).length === 0) return "";

  const currencyMap = new Map(
    currencies.map((c) => [c.code.toUpperCase(), c])
  );

  return Object.entries(prices)
    .map(([code, value]) => {
      const currency = currencyMap.get(code.toUpperCase());
      if (!currency) return null;
      
      const formatted = formatCurrencyWithSymbol(
        value,
        code,
        currency.symbol,
        currency.locale || "id-ID"
      );
      return formatted;
    })
    .filter((formatted): formatted is string => formatted !== null)
    .join(" / ");
}
