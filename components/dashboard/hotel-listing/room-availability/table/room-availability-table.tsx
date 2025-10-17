"use client";

import { getData } from "@/app/(dashboard)/hotel-listing/room-availability/fetch";
import { RoomAvailabilityHotel } from "@/app/(dashboard)/hotel-listing/room-availability/types";
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
import type { DataTableRowAction } from "@/types/data-table";
import { format } from "date-fns/format";
import { CalendarIcon, ChevronsUpDown } from "lucide-react";
import { createParser, useQueryState } from "nuqs";
import React, { useTransition } from "react";
import { UpdateRoomAvailabilityDrawer } from "../drawer/update-room-availability-drawer";
import { getRoomAvailabilityTableColumns } from "./room-availability-columns";

interface RoomAvailabilityTableProps {
  promises: Promise<[Awaited<ReturnType<typeof getData>>]>;
}

const monthYearParser = createParser({
  parse: (value) => {
    const [month, year] = value.split("-").map(Number);
    return new Date(year, month - 1);
  },
  serialize: (value) => {
    return format(value, "MM-yyyy");
  },
});

export const SelectPeriod = ({
  date,
  setDate,
}: {
  date: Date;
  setDate: React.Dispatch<React.SetStateAction<Date>>;
}) => {
  return (
    <MonthPicker
      selectedMonth={date}
      onMonthSelect={setDate}
      // minDate={new Date("2023-01-01")}
      // maxDate={new Date("2024-12-31")}
    />
  );
};

const RoomAvailabilityTable = ({ promises }: RoomAvailabilityTableProps) => {
  const [isPending, startTransition] = useTransition();
  const [{ data, pageCount }] = React.use(promises);
  const [rowAction, setRowAction] =
    React.useState<DataTableRowAction<RoomAvailabilityHotel> | null>(null);

  const [date, setDate] = useQueryState(
    "period",
    monthYearParser.withDefault(new Date())
  );

  const columns = React.useMemo(
    () =>
      getRoomAvailabilityTableColumns({
        setRowAction,
      }),
    []
  );

  const { table } = useDataTable({
    data,
    columns,
    pageCount,
    getRowId: (originalRow) => originalRow.id,
    shallow: false,
    clearOnDefault: true,
    startTransition,
  });

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
              <SelectPeriod date={date} setDate={setDate} />
            </PopoverContent>
          </Popover>
        </DataTableToolbar>
      </DataTable>

      <UpdateRoomAvailabilityDrawer
        isEdit={rowAction?.variant === "update"}
        open={
          rowAction?.variant === "update" || rowAction?.variant === "detail"
        }
        roomAvailabilityHotel={rowAction?.row.original ?? null}
        onOpenChange={() => setRowAction(null)}
        date={date}
        setDate={setDate}
      />
    </div>
  );
};

export default RoomAvailabilityTable;
