"use client";

import { getData } from "@/app/(dashboard)/booking-management/booking-summary/fetch";
import { BookingSummary } from "@/app/(dashboard)/booking-management/booking-summary/types";
import { DataTable } from "@/components/data-table/data-table";
import { DataTableToolbar } from "@/components/data-table/data-table-toolbar";
import { useDataTable } from "@/hooks/use-data-table";
import {
  getBookingStatusOptions,
  getPaymentStatusOptions,
} from "@/server/general";
import type { DataTableRowAction } from "@/types/data-table";
import React, { useTransition } from "react";
import { DeleteBookingSummaryDialog } from "../dialog/delete-booking-summary-dialog";
import { DetailBookingSummaryDialog } from "../dialog/detail-booking-summary-dialog";
import EditBookingSummaryDialog from "../dialog/edit-booking-summary-dialog";
import { UploadReceiptDialog } from "../dialog/upload-receipt-dialog";
import ViewReceiptDialog from "../dialog/view-receipt-dialog";
import { getBookingSummaryTableColumns } from "./booking-summary-columns";

interface BookingSummaryTableProps {
  promises: Promise<
    [
      Awaited<ReturnType<typeof getData>>,
      Awaited<ReturnType<typeof getBookingStatusOptions>>,
      Awaited<ReturnType<typeof getPaymentStatusOptions>>
    ]
  >;
}

const BookingSummaryTable = ({ promises }: BookingSummaryTableProps) => {
  const [isPending, startTransition] = useTransition();
  const [{ data, pagination }, bookingStatusOptions, paymentStatusOptions] =
    React.use(promises);

  const [rowAction, setRowAction] =
    React.useState<DataTableRowAction<BookingSummary> | null>(null);
  const [uploadReceiptOpen, setUploadReceiptOpen] = React.useState(false);
  const [selectedBookingForReceipt, setSelectedBookingForReceipt] =
    React.useState<{ bookingId?: string; subBookingId?: string } | null>(null);
  const [viewReceiptOpen, setViewReceiptOpen] = React.useState(false);
  const [selectedBookingForViewReceipt, setSelectedBookingForViewReceipt] =
    React.useState<BookingSummary | null>(null);

  const columns = React.useMemo(
    () =>
      getBookingSummaryTableColumns({
        setRowAction,
        bookingStatusOptions,
        paymentStatusOptions,
        onUploadReceipt: (bookingId: string) => {
          setSelectedBookingForReceipt({ bookingId });
          setUploadReceiptOpen(true);
        },
        onViewReceipt: (booking: BookingSummary) => {
          setSelectedBookingForViewReceipt(booking);
          setViewReceiptOpen(true);
        },
      }),
    []
  );

  const { table } = useDataTable({
    data: data || [],
    columns,
    pageCount: pagination?.total_pages || 1,
    getRowId: (originalRow) => String(originalRow.booking_id),
    shallow: false,
    clearOnDefault: true,
    startTransition,
  });

  return (
    <>
      <div className="relative">
        <DataTable table={table} isPending={isPending}>
          <DataTableToolbar table={table} isPending={isPending}>
            {/* <CreateBookingSummaryDialog /> */}
          </DataTableToolbar>
        </DataTable>
      </div>
      <DetailBookingSummaryDialog
        open={rowAction?.variant === "detail"}
        onOpenChange={() => setRowAction(null)}
        bookingSummary={rowAction?.row.original ?? null}
        onSuccess={() => rowAction?.row.toggleSelected(false)}
        bookingStatusOptions={bookingStatusOptions}
      />
      {rowAction?.variant === "update" && (
        <EditBookingSummaryDialog
          open={rowAction?.variant === "update"}
          onOpenChange={() => setRowAction(null)}
          booking={rowAction?.row.original ?? null}
        />
      )}
      <DeleteBookingSummaryDialog
        open={rowAction?.variant === "delete"}
        onOpenChange={() => setRowAction(null)}
        bookingSummary={rowAction?.row.original ? [rowAction.row.original] : []}
        showTrigger={false}
        onSuccess={() => rowAction?.row.toggleSelected(false)}
      />
      <UploadReceiptDialog
        open={uploadReceiptOpen}
        onOpenChange={setUploadReceiptOpen}
        bookingId={selectedBookingForReceipt?.bookingId}
        subBookingId={selectedBookingForReceipt?.subBookingId}
        onSuccess={() => {
          setSelectedBookingForReceipt(null);
          startTransition(() => {});
        }}
      />
      <ViewReceiptDialog
        open={viewReceiptOpen}
        onOpenChange={setViewReceiptOpen}
        booking={selectedBookingForViewReceipt}
      />
    </>
  );
};

export default BookingSummaryTable;
