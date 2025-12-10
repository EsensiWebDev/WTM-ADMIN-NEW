"use client";

import type { Column, Table } from "@tanstack/react-table";
import { Loader, Search, X } from "lucide-react";
import * as React from "react";

import { DataTableDateFilter } from "@/components/data-table/data-table-date-filter";
import { DataTableFacetedFilter } from "@/components/data-table/data-table-faceted-filter";
import { DataTableSliderFilter } from "@/components/data-table/data-table-slider-filter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface DataTableToolbarProps<TData> extends React.ComponentProps<"div"> {
  table: Table<TData>;
  isPending?: boolean;
}

export function DataTableToolbar<TData>({
  table,
  children,
  className,
  isPending = false,
  ...props
}: DataTableToolbarProps<TData>) {
  const [resetTrigger, setResetTrigger] = React.useState(0);

  const isFiltered = table.getState().columnFilters.some((filter) => {
    if (Array.isArray(filter.value) && filter.value.length === 0) return false;
    return true;
  });

  const columns = React.useMemo(
    () =>
      table
        .getAllColumns()
        .filter((column) => column.columnDef.enableColumnFilter)
        .sort((a, b) => {
          const aIsText = a.columnDef.meta?.variant === "text";
          const bIsText = b.columnDef.meta?.variant === "text";
          if (aIsText === bIsText) return 0;
          return aIsText ? -1 : 1;
        }),
    [table]
  );

  const onReset = React.useCallback(async () => {
    table.resetColumnFilters();
    setResetTrigger((prev) => prev + 1);
  }, [table]);

  return (
    <div
      role="toolbar"
      aria-orientation="horizontal"
      className={cn(
        "flex w-full items-start justify-between gap-2 p-1",
        className
      )}
      {...props}
    >
      <div className="flex flex-1 flex-wrap items-center gap-2">
        {columns.map((column) => (
          <DataTableToolbarFilter
            key={column.id}
            column={column}
            resetTrigger={resetTrigger}
          />
        ))}
        {isFiltered && (
          <Button
            aria-label="Reset filters"
            variant="outline"
            size="sm"
            className="border-dashed bg-white"
            onClick={onReset}
          >
            <X />
            Reset
          </Button>
        )}
        {isPending && (
          <Loader className="size-4 animate-spin" aria-hidden="true" />
        )}
      </div>

      <div className="flex items-center gap-2">
        {children}
        {/* <DataTableViewOptions table={table} /> */}
      </div>
    </div>
  );
}
interface DataTableToolbarFilterProps<TData> {
  column: Column<TData>;
  resetTrigger?: number;
}

function DataTableToolbarFilter<TData>({
  column,
  resetTrigger,
}: DataTableToolbarFilterProps<TData>) {
  {
    const columnMeta = column.columnDef.meta;
    const [pendingTextValue, setPendingTextValue] = React.useState("");

    React.useEffect(() => {
      if (columnMeta?.variant === "text") {
        const val = column.getFilterValue();
        let textString = "";
        if (Array.isArray(val)) {
          textString = val.join(" ");
        } else {
          textString = (val as string) ?? "";
        }
        setPendingTextValue(textString);
      }
    }, [column, columnMeta?.variant, resetTrigger]);

    const onApply = React.useCallback(() => {
      if (columnMeta?.variant === "text") {
        column.setFilterValue(pendingTextValue || undefined);
      }
    }, [column, pendingTextValue, columnMeta?.variant]);

    const handleKeyDown = React.useCallback(
      (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === "Enter") {
          onApply();
        }
      },
      [onApply]
    );

    const onFilterRender = React.useCallback(() => {
      if (!columnMeta?.variant) return null;

      switch (columnMeta.variant) {
        case "text":
          return (
            <div className="flex items-center gap-0">
              <Input
                placeholder={columnMeta.placeholder ?? columnMeta.label}
                value={pendingTextValue}
                onChange={(event) => setPendingTextValue(event.target.value)}
                onKeyDown={handleKeyDown}
                className="h-8 w-40 lg:w-56 bg-white rounded-r-none"
              />
              <Button
                size="sm"
                className="h-8 px-2 rounded-l-none"
                aria-label="Search"
                onClick={onApply}
              >
                <Search className="h-4 w-4" /> Search
              </Button>
            </div>
          );

        case "number":
          return (
            <div className="relative">
              <Input
                type="number"
                inputMode="numeric"
                placeholder={columnMeta.placeholder ?? columnMeta.label}
                value={(column.getFilterValue() as string) ?? ""}
                onChange={(event) => column.setFilterValue(event.target.value)}
                className={cn("h-8 w-[120px]", columnMeta.unit && "pr-8")}
              />
              {columnMeta.unit && (
                <span className="absolute top-0 right-0 bottom-0 flex items-center rounded-r-md bg-accent px-2 text-muted-foreground text-sm">
                  {columnMeta.unit}
                </span>
              )}
            </div>
          );

        case "range":
          return (
            <DataTableSliderFilter
              column={column}
              title={columnMeta.label ?? column.id}
            />
          );

        case "date":
        case "dateRange":
          return (
            <DataTableDateFilter
              column={column}
              title={columnMeta.label ?? column.id}
              multiple={columnMeta.variant === "dateRange"}
            />
          );

        case "select":
        case "multiSelect":
          return (
            <DataTableFacetedFilter
              column={column}
              title={columnMeta.label ?? column.id}
              placeholder={columnMeta.placeholder}
              options={columnMeta.options ?? []}
              multiple={columnMeta.variant === "multiSelect"}
            />
          );

        default:
          return null;
      }
    }, [column, columnMeta, pendingTextValue, handleKeyDown, onApply]);

    return onFilterRender();
  }
}
