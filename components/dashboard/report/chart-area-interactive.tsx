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

export const description = "An interactive area chart";

const chartData = [
  { date: "2025-04-01", confirmed: 222, rejected: 150 },
  { date: "2025-04-02", confirmed: 97, rejected: 180 },
  { date: "2025-04-03", confirmed: 167, rejected: 120 },
  { date: "2025-04-04", confirmed: 242, rejected: 260 },
  { date: "2025-04-05", confirmed: 373, rejected: 290 },
  { date: "2025-04-06", confirmed: 301, rejected: 340 },
  { date: "2025-04-07", confirmed: 245, rejected: 180 },
  { date: "2025-04-08", confirmed: 409, rejected: 320 },
  { date: "2025-04-09", confirmed: 59, rejected: 110 },
  { date: "2025-04-10", confirmed: 261, rejected: 190 },
  { date: "2025-04-11", confirmed: 327, rejected: 350 },
  { date: "2025-04-12", confirmed: 292, rejected: 210 },
  { date: "2025-04-13", confirmed: 342, rejected: 380 },
  { date: "2025-04-14", confirmed: 137, rejected: 220 },
  { date: "2025-04-15", confirmed: 120, rejected: 170 },
  { date: "2025-04-16", confirmed: 138, rejected: 190 },
  { date: "2025-04-17", confirmed: 446, rejected: 360 },
  { date: "2025-04-18", confirmed: 364, rejected: 410 },
  { date: "2025-04-19", confirmed: 243, rejected: 180 },
  { date: "2025-04-20", confirmed: 89, rejected: 150 },
  { date: "2025-04-21", confirmed: 137, rejected: 200 },
  { date: "2025-04-22", confirmed: 224, rejected: 170 },
  { date: "2025-04-23", confirmed: 138, rejected: 230 },
  { date: "2025-04-24", confirmed: 387, rejected: 290 },
  { date: "2025-04-25", confirmed: 215, rejected: 250 },
  { date: "2025-04-26", confirmed: 75, rejected: 130 },
  { date: "2025-04-27", confirmed: 383, rejected: 420 },
  { date: "2025-04-28", confirmed: 122, rejected: 180 },
  { date: "2025-04-29", confirmed: 315, rejected: 240 },
  { date: "2025-04-30", confirmed: 454, rejected: 380 },
  { date: "2025-05-01", confirmed: 165, rejected: 220 },
  { date: "2025-05-02", confirmed: 293, rejected: 310 },
  { date: "2025-05-03", confirmed: 247, rejected: 190 },
  { date: "2025-05-04", confirmed: 385, rejected: 420 },
  { date: "2025-05-05", confirmed: 481, rejected: 390 },
  { date: "2025-05-06", confirmed: 498, rejected: 520 },
  { date: "2025-05-07", confirmed: 388, rejected: 300 },
  { date: "2025-05-08", confirmed: 149, rejected: 210 },
  { date: "2025-05-09", confirmed: 227, rejected: 180 },
  { date: "2025-05-10", confirmed: 293, rejected: 330 },
  { date: "2025-05-11", confirmed: 335, rejected: 270 },
  { date: "2025-05-12", confirmed: 197, rejected: 240 },
  { date: "2025-05-13", confirmed: 197, rejected: 160 },
  { date: "2025-05-14", confirmed: 448, rejected: 490 },
  { date: "2025-05-15", confirmed: 473, rejected: 380 },
  { date: "2025-05-16", confirmed: 338, rejected: 400 },
  { date: "2025-05-17", confirmed: 499, rejected: 420 },
  { date: "2025-05-18", confirmed: 315, rejected: 350 },
  { date: "2025-05-19", confirmed: 235, rejected: 180 },
  { date: "2025-05-20", confirmed: 177, rejected: 230 },
  { date: "2025-05-21", confirmed: 82, rejected: 140 },
  { date: "2025-05-22", confirmed: 81, rejected: 120 },
  { date: "2025-05-23", confirmed: 252, rejected: 290 },
  { date: "2025-05-24", confirmed: 294, rejected: 220 },
  { date: "2025-05-25", confirmed: 201, rejected: 250 },
  { date: "2025-05-26", confirmed: 213, rejected: 170 },
  { date: "2025-05-27", confirmed: 420, rejected: 460 },
  { date: "2025-05-28", confirmed: 233, rejected: 190 },
  { date: "2025-05-29", confirmed: 78, rejected: 130 },
  { date: "2025-05-30", confirmed: 340, rejected: 280 },
  { date: "2025-05-31", confirmed: 178, rejected: 230 },
  { date: "2025-06-01", confirmed: 178, rejected: 200 },
  { date: "2025-06-02", confirmed: 470, rejected: 410 },
  { date: "2025-06-03", confirmed: 103, rejected: 160 },
  { date: "2025-06-04", confirmed: 439, rejected: 380 },
  { date: "2025-06-05", confirmed: 88, rejected: 140 },
  { date: "2025-06-06", confirmed: 294, rejected: 250 },
  { date: "2025-06-07", confirmed: 323, rejected: 370 },
  { date: "2025-06-08", confirmed: 385, rejected: 320 },
  { date: "2025-06-09", confirmed: 438, rejected: 480 },
  { date: "2025-06-10", confirmed: 155, rejected: 200 },
  { date: "2025-06-11", confirmed: 92, rejected: 150 },
  { date: "2025-06-12", confirmed: 492, rejected: 420 },
  { date: "2025-06-13", confirmed: 81, rejected: 130 },
  { date: "2025-06-14", confirmed: 426, rejected: 380 },
  { date: "2025-06-15", confirmed: 307, rejected: 350 },
  { date: "2025-06-16", confirmed: 371, rejected: 310 },
  { date: "2025-06-17", confirmed: 475, rejected: 520 },
  { date: "2025-06-18", confirmed: 107, rejected: 170 },
  { date: "2025-06-19", confirmed: 341, rejected: 290 },
  { date: "2025-06-20", confirmed: 408, rejected: 450 },
  { date: "2025-06-21", confirmed: 169, rejected: 210 },
  { date: "2025-06-22", confirmed: 317, rejected: 270 },
  { date: "2025-06-23", confirmed: 480, rejected: 530 },
  { date: "2025-06-24", confirmed: 132, rejected: 180 },
  { date: "2025-06-25", confirmed: 141, rejected: 190 },
  { date: "2025-06-26", confirmed: 434, rejected: 380 },
  { date: "2025-06-27", confirmed: 448, rejected: 490 },
  { date: "2025-06-28", confirmed: 149, rejected: 200 },
  { date: "2025-06-29", confirmed: 103, rejected: 160 },
  { date: "2025-06-30", confirmed: 446, rejected: 400 },
];

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

export function ChartAreaInteractive() {
  const isMobile = useIsMobile();
  const [open, setOpen] = React.useState(false);
  const [range, setRange] = React.useState<DateRange | undefined>({
    from: new Date(2025, 3, 1),
    to: new Date(2025, 5, 30),
  });

  const newFilteredData = React.useMemo(() => {
    if (!range?.from && !range?.to) {
      return chartData;
    }
    return chartData.filter((item) => {
      const date = new Date(item.date);
      return date >= range.from! && date <= range.to!;
    });
  }, [range]);

  // Check if there's no data to display
  const hasNoData = newFilteredData.length === 0;

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
  const setPresetRange = (days: number) => {
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

    setRange({
      from: fromDate,
      to: new Date(today),
    });
  };

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
                      onClick={() => {
                        setPresetRange(preset.value);
                        setOpen(false);
                      }}
                    >
                      {preset.label}
                    </Button>
                  ))}
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
            <AreaChart data={newFilteredData}>
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
                dataKey="rejected"
                type="natural"
                fill="url(#fillRejected)"
                stroke="var(--color-rejected)"
                stackId="a"
              />
              <Area
                dataKey="confirmed"
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
