"use client";

import * as React from "react";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useIsMobile } from "@/hooks/use-mobile";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { DateRange } from "react-day-picker";
import { useQueryStates } from "nuqs";
import { dateParser, getDefaultDateRange } from "@/lib/date-utils";
import { useRouter } from "next/navigation";

export const description = "An interactive area chart";

const chartConfig = {
  bookings: {
    label: "Bookings",
  },
  confirmed: {
    label: "Confirmed",
    color: "var(--chart-2)",
  },
  rejected: {
    label: "Rejected",
    color: "var(--destructive)",
  },
} satisfies ChartConfig;

interface ChartAreaInteractiveProps {
  data?: { date: string; count: number }[]; // date can be ISO 8601 timestamp or date string
}

export function ChartAreaInteractive({ data = [] }: ChartAreaInteractiveProps) {
  const isMobile = useIsMobile();
  const [open, setOpen] = React.useState(false);
  const defaultRange = getDefaultDateRange();
  const router = useRouter();

  // Use nuqs for URL-based state management
  const [{ date_from, date_to }, setDateRange] = useQueryStates(
    {
      date_from: dateParser.withDefault(defaultRange.from),
      date_to: dateParser.withDefault(defaultRange.to),
    },
    {
      clearOnDefault: true,
    }
  );

  // Convert to DateRange format for the Calendar component
  const range: DateRange | undefined = React.useMemo(
    () => ({
      from: date_from || undefined,
      to: date_to || undefined,
    }),
    [date_from, date_to]
  );

  // Update URL state when range changes
  const setRange = React.useCallback(
    (newRange: DateRange | undefined) => {
      setDateRange({
        date_from: newRange?.from || null,
        date_to: newRange?.to || null,
      });
    },
    [setDateRange]
  );

  // Transform and aggregate timestamp-based data into daily totals
  const transformedData = React.useMemo(() => {
    if (data.length === 0) {
      return [];
    }

    // Group bookings by calendar date and sum counts
    const dailyTotals = data.reduce((acc, item) => {
      // Extract date part from timestamp (YYYY-MM-DD)
      const date = new Date(item.date);
      const dateKey = date.toISOString().split("T")[0]; // Get YYYY-MM-DD format

      if (!acc[dateKey]) {
        acc[dateKey] = 0;
      }
      acc[dateKey] += item.count;

      return acc;
    }, {} as Record<string, number>);

    // Convert to chart format and sort by date
    return Object.entries(dailyTotals)
      .map(([date, count]) => ({
        date,
        bookings: count,
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [data]);

  // Check if there's no data to display (backend already filters data)
  const hasNoData = transformedData.length === 0;

  // Format the date range for display in the card description
  const formatDateRange = React.useMemo(() => {
    if (!range?.from && !range?.to) {
      return "Total for the last 3 months";
    }

    if (range?.from && range?.to) {
      // Check if it's a single day
      if (range.from.toDateString() === range.to.toDateString()) {
        return `Total for ${format(range.from, "dd MMM yyyy")}`;
      }
      // Multiple days
      return `Total from ${format(range.from, "dd MMM yyyy")} to ${format(
        range.to,
        "dd MMM yyyy"
      )}`;
    }

    if (range?.from) {
      return `Total from ${format(range.from, "dd MMM yyyy")}`;
    }

    if (range?.to) {
      return `Total until ${format(range.to, "dd MMM yyyy")}`;
    }

    return "Total for the last 3 months";
  }, [range]);

  // Function to set date range based on preset
  const setPresetRange = React.useCallback(
    (days: number) => {
      const today = new Date();
      let fromDate: Date;

      switch (days) {
        case 0: // Today
          fromDate = new Date(today);
          break;
        case 1: // Yesterday
          fromDate = new Date(today);
          fromDate.setDate(fromDate.getDate() - 1);
          break;
        case 7: // Last 7 days
          fromDate = new Date(today);
          fromDate.setDate(fromDate.getDate() - 6); // Include today
          break;
        case 30: // Last 30 days
          fromDate = new Date(today);
          fromDate.setDate(fromDate.getDate() - 29); // Include today
          break;
        case 90: // Last 90 days
          fromDate = new Date(today);
          fromDate.setDate(fromDate.getDate() - 89); // Include today
          break;
        default:
          fromDate = new Date(today);
          fromDate.setDate(fromDate.getDate() - days);
      }

      setDateRange({
        date_from: fromDate,
        date_to: new Date(today),
      });
    },
    [setDateRange]
  );

  return (
    <Card className="@container/card">
      <CardHeader>
        <CardTitle>Total Bookings</CardTitle>
        <CardDescription>
          <span className="hidden @[540px]/card:block">{formatDateRange}</span>
          <span className="@[540px]/card:hidden">
            {range?.from && range?.to
              ? `${format(range.from, "dd MMM")} - ${format(
                  range.to,
                  "dd MMM"
                )}`
              : "Last 3 months"}
          </span>
        </CardDescription>
        <CardAction>
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline">
                <CalendarIcon />
                {range?.from && range?.to
                  ? `${format(range.from, "dd MMM yyyy")} - ${format(
                      range.to,
                      "dd MMM yyyy"
                    )}`
                  : "Select date range"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto overflow-hidden p-0" align="end">
              <Card className="max-w-[300px] py-4">
                <CardContent className="px-4">
                  <Calendar
                    className="w-full"
                    mode="range"
                    defaultMonth={range?.from}
                    selected={range}
                    onSelect={setRange}
                    disabled={{
                      after: new Date(),
                    }}
                  />
                </CardContent>
                <CardFooter className="flex flex-wrap gap-2 border-t px-4 !pt-4">
                  <div className="flex flex-wrap gap-2">
                    {[
                      { label: "Last 90 days", value: 90 },
                      { label: "Last 30 days", value: 30 },
                      { label: "Last 7 days", value: 7 },
                      { label: "Yesterday", value: 1 },
                      { label: "Today", value: 0 },
                    ].map((preset) => (
                      <Button
                        key={preset.value}
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={async () => {
                          setPresetRange(preset.value);
                        }}
                      >
                        {preset.label}
                      </Button>
                    ))}
                  </div>
                  <Button
                    size="sm"
                    className="flex-1"
                    onClick={() => {
                      router.refresh();
                      setOpen(false);
                    }}
                  >
                    Apply
                  </Button>
                </CardFooter>
              </Card>
            </PopoverContent>
          </Popover>
        </CardAction>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        {hasNoData ? (
          <div className="aspect-auto h-[250px] w-full flex items-center justify-center">
            <p className="text-muted-foreground">No data</p>
          </div>
        ) : (
          <ChartContainer
            config={chartConfig}
            className="aspect-auto h-[250px] w-full"
          >
            <AreaChart data={transformedData}>
              <defs>
                <linearGradient id="fillConfirmed" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="var(--color-confirmed)"
                    stopOpacity={1.0}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--color-confirmed)"
                    stopOpacity={0.1}
                  />
                </linearGradient>
                <linearGradient id="fillRejected" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="var(--color-rejected)"
                    stopOpacity={0.8}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--color-rejected)"
                    stopOpacity={0.1}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={32}
                tickFormatter={(value) => {
                  const date = new Date(value);
                  return date.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  });
                }}
              />
              <ChartTooltip
                cursor={false}
                defaultIndex={isMobile ? -1 : 10}
                content={
                  <ChartTooltipContent
                    labelFormatter={(value) => {
                      return new Date(value).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      });
                    }}
                    indicator="dot"
                  />
                }
              />
              <Area
                dataKey="bookings"
                type="natural"
                fill="url(#fillConfirmed)"
                stroke="var(--color-confirmed)"
                stackId="a"
              />
            </AreaChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
