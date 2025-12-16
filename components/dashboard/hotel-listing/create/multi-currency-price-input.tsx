"use client";

import { Button } from "@/components/ui/button";
import {
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
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useFormattedCurrencyInput } from "@/lib/currency";
import { getActiveCurrencies } from "@/app/(dashboard)/currency/fetch";
import { Plus, Trash2 } from "lucide-react";
import React from "react";
import type { FieldPath, FieldValues, UseFormReturn } from "react-hook-form";
import { Option } from "@/types/data-table";

interface MultiCurrencyPriceInputProps<T extends FieldValues> {
  form: UseFormReturn<T>;
  fieldName: FieldPath<T>;
  label?: string;
  currencies?: Option[];
  required?: boolean;
}

// Individual currency price input component
function CurrencyPriceInput({
  currencyCode,
  price,
  symbol,
  isRequired,
  onPriceChange,
  onRemove,
}: {
  currencyCode: string;
  price: number;
  symbol: string;
  isRequired: boolean;
  onPriceChange: (value: number) => void;
  onRemove?: () => void;
}) {
  const { displayValue, handleChange, handleBlur } = useFormattedCurrencyInput(
    price,
    onPriceChange,
    "id-ID"
  );

  return (
    <div className="flex items-center gap-2">
      <div className="relative flex-1">
        <FormControl>
          <Input
            type="text"
            className="bg-gray-200 pl-10 pr-16"
            placeholder="0"
            value={displayValue}
            onChange={handleChange}
            onBlur={handleBlur}
          />
        </FormControl>
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold">
          {symbol}
        </span>
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
          {currencyCode}
        </span>
      </div>
      {!isRequired && onRemove && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onRemove}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      )}
      {isRequired && (
        <span className="text-xs text-muted-foreground w-16 text-center">
          Required
        </span>
      )}
    </div>
  );
}

export function MultiCurrencyPriceInput<T extends FieldValues>({
  form,
  fieldName,
  label = "Price",
  currencies: providedCurrencies,
  required = true,
}: MultiCurrencyPriceInputProps<T>) {
  const [currencyOptions, setCurrencyOptions] = React.useState<Option[]>([]);
  const [selectedCurrencies, setSelectedCurrencies] = React.useState<string[]>(
    ["IDR"]
  );
  const [selectValue, setSelectValue] = React.useState<string>("");

  React.useEffect(() => {
    if (providedCurrencies && providedCurrencies.length > 0) {
      setCurrencyOptions(providedCurrencies);
    } else {
      getActiveCurrencies().then((response) => {
        if (response.status === 200 && Array.isArray(response.data)) {
          const options = response.data.map((currency) => ({
            label: `${currency.code} - ${currency.name} (${currency.symbol})`,
            value: currency.code,
          }));
          setCurrencyOptions(options);
        }
      });
    }
  }, [providedCurrencies]);

  // Get current prices from form
  const prices = form.watch(fieldName) as Record<string, number> | undefined;

  React.useEffect(() => {
    // Ensure IDR is always in selected currencies
    if (!selectedCurrencies.includes("IDR")) {
      setSelectedCurrencies(["IDR", ...selectedCurrencies]);
    }

    // Initialize prices with IDR if empty
    if (!prices || Object.keys(prices).length === 0) {
      form.setValue(fieldName, { IDR: 0 } as any);
    } else if (!prices.IDR && prices.IDR !== 0) {
      // Ensure IDR exists
      form.setValue(fieldName, { ...prices, IDR: 0 } as any);
    }

    // Sync selected currencies with prices
    if (prices) {
      const priceCurrencies = Object.keys(prices);
      const missing = priceCurrencies.filter(
        (c) => !selectedCurrencies.includes(c)
      );
      if (missing.length > 0) {
        setSelectedCurrencies([...selectedCurrencies, ...missing]);
      }
    }
  }, [form, fieldName, prices, selectedCurrencies]);

  const handleCurrencySelect = (currencyCode: string) => {
    if (currencyCode && !selectedCurrencies.includes(currencyCode)) {
      setSelectedCurrencies([...selectedCurrencies, currencyCode]);
      const currentPrices = (form.getValues(fieldName) as Record<string, number>) || {};
      form.setValue(fieldName, { ...currentPrices, [currencyCode]: 0 } as any);
      // Reset select value to show placeholder again
      setSelectValue("");
    }
  };

  const removeCurrency = (currencyCode: string) => {
    if (currencyCode === "IDR") {
      // IDR cannot be removed
      return;
    }
    setSelectedCurrencies(selectedCurrencies.filter((c) => c !== currencyCode));
    const currentPrices = (form.getValues(fieldName) as Record<string, number>) || {};
    const newPrices = { ...currentPrices };
    delete newPrices[currencyCode];
    form.setValue(fieldName, newPrices as any);
  };

  const getCurrencySymbol = (code: string): string => {
    const currency = currencyOptions.find((c) => c.value === code);
    if (currency) {
      // Extract symbol from label (format: "CODE - Name (Symbol)")
      const match = currency.label.match(/\(([^)]+)\)/);
      return match ? match[1] : code;
    }
    return code;
  };

  return (
    <FormField
      control={form.control}
      name={fieldName}
      render={({ field }) => {
        const currentPrices = (field.value as Record<string, number>) || { IDR: 0 };

        return (
          <FormItem>
            <FormLabel>
              {label} {required && "*"}
            </FormLabel>
            <div className="space-y-3">
              {selectedCurrencies.map((currencyCode) => {
                const priceValue = currentPrices[currencyCode] || 0;
                const isIDR = currencyCode === "IDR";

                return (
                  <CurrencyPriceInput
                    key={currencyCode}
                    currencyCode={currencyCode}
                    price={priceValue}
                    symbol={getCurrencySymbol(currencyCode)}
                    isRequired={isIDR}
                    onPriceChange={(value) => {
                      const updatedPrices = {
                        ...currentPrices,
                        [currencyCode]: value,
                      };
                      field.onChange(updatedPrices);
                    }}
                    onRemove={!isIDR ? () => removeCurrency(currencyCode) : undefined}
                  />
                );
              })}
              {selectedCurrencies.length < currencyOptions.length && (
                <div className="flex items-center gap-2">
                  <Select
                    value={selectValue}
                    onValueChange={handleCurrencySelect}
                  >
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Select currency to add" />
                    </SelectTrigger>
                    <SelectContent>
                      {currencyOptions
                        .filter((option) => !selectedCurrencies.includes(option.value))
                        .map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
            <FormMessage />
          </FormItem>
        );
      }}
    />
  );
}

