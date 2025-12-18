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
import { useActiveCurrencies } from "@/hooks/use-active-currencies";
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
      <div className="relative w-[170px]">
        <FormControl>
          <Input
            type="text"
            className={`bg-gray-200 pl-8 pr-12 h-9 ${isRequired ? "ring-1 ring-primary/20" : ""}`}
            placeholder="0"
            value={displayValue}
            onChange={handleChange}
            onBlur={handleBlur}
          />
        </FormControl>
        <span className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-sm font-semibold">
          {symbol}
        </span>
        <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
          {currencyCode}
          {isRequired && <span className="text-primary ml-0.5">*</span>}
        </span>
      </div>
      {!isRequired && onRemove && (
        <Button
          type="button"
          variant="destructive"
          size="icon"
          onClick={onRemove}
          className="h-8 w-8 shrink-0"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
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
  const { currencies: fetchedCurrencies } = useActiveCurrencies();
  const [selectedCurrencies, setSelectedCurrencies] = React.useState<string[]>(
    ["IDR"]
  );
  const [selectValue, setSelectValue] = React.useState<string>("");

  // Use provided currencies if available, otherwise use fetched currencies from the hook
  const currencyOptions = React.useMemo(() => {
    return providedCurrencies && providedCurrencies.length > 0
      ? providedCurrencies
      : fetchedCurrencies;
  }, [providedCurrencies, fetchedCurrencies]);

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
            {label && (
              <FormLabel>
                {label} {required && "*"}
              </FormLabel>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
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
                <div className="flex items-center">
                  <Select
                    value={selectValue}
                    onValueChange={handleCurrencySelect}
                  >
                    <SelectTrigger className="w-full bg-gray-200 h-9 max-w-[170px]">
                      <SelectValue placeholder="Add New Currency" />
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

