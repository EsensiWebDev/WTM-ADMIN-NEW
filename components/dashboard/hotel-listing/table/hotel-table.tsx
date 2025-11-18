"use client";

import { getData } from "@/app/(dashboard)/hotel-listing/fetch";
import { Hotel } from "@/app/(dashboard)/hotel-listing/types";
import { DataTable } from "@/components/data-table/data-table";
import { DataTableToolbar } from "@/components/data-table/data-table-toolbar";
import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";
import { useDataTable } from "@/hooks/use-data-table";
import { formatCurrency } from "@/lib/format";
import type { DataTableRowAction } from "@/types/data-table";
import { Plus } from "lucide-react";
import Link from "next/link";
import React, { useTransition } from "react";
import { DeleteHotelDialog } from "../dialog/delete-hotel-dialog";
import EditHotelDialog from "../dialog/edit-hotel-dialog";
import ImportCsvDialog from "../dialog/import-csv-dialog";
import { getHotelTableColumns } from "./hotel-columns";
import { getRegionOptions } from "@/server/general";

interface HotelTableProps {
  promises: Promise<
    [
      Awaited<ReturnType<typeof getData>>,
      Awaited<ReturnType<typeof getRegionOptions>>
    ]
  >;
}

const HotelTable = ({ promises }: HotelTableProps) => {
  const [isPending, startTransition] = useTransition();
  const [{ data, pagination }, companyOptions] = React.use(promises);
  const [rowAction, setRowAction] =
    React.useState<DataTableRowAction<Hotel> | null>(null);

  const columns = React.useMemo(
    () =>
      getHotelTableColumns({
        setRowAction,
        companyOptions,
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
    // getSubRows: (row) => row.rooms,
  });

  return (
    <>
      <div className="relative">
        <DataTable
          table={table}
          isPending={isPending}
          renderSubRow={(hotel) => (
            <TableRow>
              <TableCell />
              <TableCell className="px-5">
                <div className="space-y-2">
                  {hotel.rooms?.map((room) => (
                    <React.Fragment key={room.name}>
                      {room.price && (
                        <div className="mt-1">
                          <div className="flex justify-between">
                            <h3>{room.name}</h3>
                          </div>
                          <div className="flex justify-between">
                            <p className="text-muted-foreground text-xs">
                              with breakfast
                            </p>
                            <h3 className="font-medium">
                              {formatCurrency(room.price_with_breakfast)}
                            </h3>
                          </div>
                        </div>
                      )}
                      {room.price_with_breakfast && (
                        <div className="mt-1">
                          <div className="flex justify-between">
                            <h3>{room.name}</h3>
                          </div>
                          <div className="flex justify-between">
                            <p className="text-muted-foreground text-xs">
                              without breakfast
                            </p>
                            <h3 className="font-medium">
                              {formatCurrency(room.price)}
                            </h3>
                          </div>
                        </div>
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </TableCell>
              <TableCell colSpan={table.getAllColumns().length} />
            </TableRow>
          )}
        >
          <DataTableToolbar table={table} isPending={isPending}>
            <div className="flex gap-2">
              <ImportCsvDialog />

              <Button size="sm" asChild>
                <Link href={"/hotel-listing/create"}>
                  <Plus />
                  Add Listing
                </Link>
              </Button>
            </div>
            {/* <CreateHotelDialog /> */}
          </DataTableToolbar>
        </DataTable>
      </div>
      {rowAction?.variant === "update" && (
        <EditHotelDialog
          open={rowAction?.variant === "update"}
          onOpenChange={() => setRowAction(null)}
          hotel={rowAction?.row.original ?? null}
        />
      )}
      <DeleteHotelDialog
        open={rowAction?.variant === "delete"}
        onOpenChange={() => setRowAction(null)}
        hotel={rowAction?.row.original ? [rowAction.row.original] : []}
        showTrigger={false}
        onSuccess={() => rowAction?.row.toggleSelected(false)}
      />
    </>
  );
};

export default HotelTable;
