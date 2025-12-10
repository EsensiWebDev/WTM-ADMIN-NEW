"use client";

import {
  getData,
  getRoomAvaliableByHotelId,
} from "@/app/(dashboard)/hotel-listing/room-availability/fetch";
import { RoomAvailabilityHotel } from "@/app/(dashboard)/hotel-listing/room-availability/types";
import { Hotel } from "@/app/(dashboard)/hotel-listing/types";
import { DataTable } from "@/components/data-table/data-table";
import { DataTableToolbar } from "@/components/data-table/data-table-toolbar";
import { Button } from "@/components/ui/button";
import { MonthPicker } from "@/components/ui/monthpicker";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useDataTable } from "@/hooks/use-data-table";
import { cn } from "@/lib/utils";
import { getRegionOptions } from "@/server/general";
import type { DataTableRowAction } from "@/types/data-table";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns/format";
import { CalendarIcon, ChevronsUpDown } from "lucide-react";
import { createParser, useQueryState } from "nuqs";
import React, { useTransition } from "react";
import { UpdateRoomAvailabilityDrawer } from "../drawer/update-room-availability-drawer";
import { getRoomAvailabilityTableColumns } from "./room-availability-columns";

interface RoomAvailabilityTableProps {
  promises: Promise<
    [
      Awaited<ReturnType<typeof getData>>,
      Awaited<ReturnType<typeof getRegionOptions>>
    ]
  >;
}

const monthYearParser = createParser({
  parse: (value) => {
    const [year, month] = value.split("-").map(Number);
    return new Date(year, month - 1);
  },
  serialize: (value) => {
    return format(value, "yyyy-MM");
  },
});

const RoomAvailabilityTable = ({ promises }: RoomAvailabilityTableProps) => {
  const [isPending, startTransition] = useTransition();
  const [{ data, status, pagination, error }, regionOptions] =
    React.use(promises);
  const [rowAction, setRowAction] =
    React.useState<DataTableRowAction<Hotel> | null>(null);

  const [date, setDate] = useQueryState(
    "period",
    monthYearParser.withDefault(new Date()).withOptions({
      shallow: false,
      clearOnDefault: true,
      startTransition,
    })
  );

  const query = useQuery({
    queryKey: [
      "room-availability",
      format(date, "yyyy-MM"),
      rowAction?.row.original.id,
    ],
    queryFn: async () => {
      const data = await getRoomAvaliableByHotelId({
        hotel_id: rowAction?.row.original.id || "",
        period: format(date, "yyyy-MM"),
      });
      return data;
    },
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    enabled: rowAction?.variant === "update" || rowAction?.variant === "detail",
  });

  const columns = React.useMemo(
    () =>
      getRoomAvailabilityTableColumns({
        setRowAction,
        regionOptions,
      }),
    []
  );

  const { table } = useDataTable({
    data: data || [],
    columns,
    pageCount: pagination?.total_pages || 1,
    getRowId: (originalRow) => originalRow.id,
    shallow: false,
    clearOnDefault: true,
    startTransition,
  });

  if (error) {
    return <div>{error}</div>;
  }

  if (status === 403) {
    return <div>You don’t have permission to access this page.</div>;
  }

  if (status !== 200) {
    return <div>Failed to load data</div>;
  }

  return (
    <div className="relative">
      <DataTable table={table} isPending={isPending}>
        <DataTableToolbar table={table} isPending={isPending}>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                className={cn(
                  "justify-start text-left font-normal",
                  !date && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? format(date, "MMM yyyy") : <span>Select Period</span>}
                <ChevronsUpDown className="ml-auto text-white opacity-100" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <MonthPicker
                selectedMonth={date}
                onMonthSelect={setDate}
                // minDate={new Date("2023-01-01")}
                // maxDate={new Date("2024-12-31")}
              />
            </PopoverContent>
          </Popover>
        </DataTableToolbar>
      </DataTable>

      <UpdateRoomAvailabilityDrawer
        isEdit={rowAction?.variant === "update"}
        isPending={query.isPending}
        open={
          rowAction?.variant === "update" || rowAction?.variant === "detail"
        }
        roomAvailabilityHotel={
          query.data?.data || ([] as RoomAvailabilityHotel[])
        }
        dataHotel={rowAction?.row.original ?? null}
        onOpenChange={() => setRowAction(null)}
        date={date}
        setDate={setDate}
      />
    </div>
  );
};

export default RoomAvailabilityTable;
