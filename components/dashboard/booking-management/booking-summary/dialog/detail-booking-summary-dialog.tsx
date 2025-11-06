/* eslint-disable react-hooks/rules-of-hooks */
"use client";

import {
  ColumnDef,
  PaginationState,
  SortingState,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import * as React from "react";
import { toast } from "sonner";

import { updateBookingStatus } from "@/app/(dashboard)/booking-management/booking-summary/actions";
import {
  BookingStatus,
  BookingSummary,
  BookingSummaryDetail,
  PaymentStatus,
} from "@/app/(dashboard)/booking-management/booking-summary/types";
import { ConfirmationDialog } from "@/components/confirmation-dialog";
import { DataTable } from "@/components/data-table/data-table";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { DataTableRowAction } from "@/types/data-table";
import {
  IconApi,
  IconApiOff,
  IconCloudUpload,
  IconFileDownload,
  IconFileText,
  IconNote,
} from "@tabler/icons-react";
import { Ban, MoreHorizontal } from "lucide-react";
import ViewInvoiceDialog from "./view-invoice-dialog";

interface GetDetailBookingTableColumnsProps {
  setRowAction: React.Dispatch<
    React.SetStateAction<DataTableRowAction<BookingSummaryDetail> | null>
  >;
}

interface DetailBookingSummaryDialogProps
  extends React.ComponentPropsWithoutRef<typeof Dialog> {
  bookingSummary: BookingSummary | null;
  onSuccess?: () => void;
}

// Notes Dialog Component
interface NotesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  notes: string;
  guestName: string;
}

function NotesDialog({
  open,
  onOpenChange,
  notes,
  guestName,
}: NotesDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Booking Notes - {guestName}</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <div className="bg-muted/50 rounded-lg p-4">
            <p className="text-sm leading-relaxed">
              {notes || "No notes available for this booking."}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

const getDetailBookingColumns = ({
  setRowAction,
}: GetDetailBookingTableColumnsProps): ColumnDef<BookingSummaryDetail>[] => [
  {
    id: "no",
    header: "No",
    cell: ({ row }) => row.index + 1,
    enableSorting: false,
    enableHiding: false,
    size: 60,
  },
  {
    id: "guest_name",
    accessorKey: "guest_name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Guest Name" />
    ),
    cell: ({ row }) => (
      <div className="font-medium">{row.original.guest_name}</div>
    ),
    enableHiding: false,
  },
  {
    id: "hotel_name",
    accessorKey: "hotel_name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Hotel Name" />
    ),
    cell: ({ row }) => row.original.hotel_name,
    enableHiding: false,
  },
  {
    id: "sub_booking_id",
    accessorKey: "sub_booking_id",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Sub-Booking ID" />
    ),
    cell: ({ row }) => (
      <div className="font-mono text-sm">{row.original.sub_booking_id}</div>
    ),
    enableHiding: false,
  },
  {
    id: "booking_status",
    accessorKey: "booking_status",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Booking Status" />
    ),
    cell: ({ row }) => {
      const [isUpdatePending, startUpdateTransition] = React.useTransition();
      const [selectValue, setSelectValue] = React.useState<BookingStatus>(
        row.original.booking_status
      );
      const [dialogOpen, setDialogOpen] = React.useState(false);
      const [pendingValue, setPendingValue] = React.useState<string | null>(
        null
      );
      const [reason, setReason] = React.useState("");

      const handleConfirm = async () => {
        if (!pendingValue) return;
        startUpdateTransition(() => {
          (async () => {
            try {
              const result = await updateBookingStatus({
                booking_detail_id: String(row.original.sub_booking_id),
                status_id: pendingValue,
                reason: reason.trim(),
              });
              if (result?.success) {
                setSelectValue(pendingValue as BookingStatus);
                setPendingValue(null);
                setDialogOpen(false);
                setReason("");
                toast.success(
                  result.message || "Booking status updated successfully"
                );
              } else {
                toast.error(
                  result?.message || "Failed to update booking status"
                );
              }
            } catch (error) {
              void error;
              toast.error("An error occurred. Please try again.");
            }
          })();
        });
      };

      const handleCancel = () => {
        setDialogOpen(false);
        setPendingValue(null);
        setReason("");
      };

      const getStatusColor = (value: string) => {
        if (value === "confirmed") return "text-green-600 bg-green-100";
        if (value === "rejected") return "text-red-600 bg-red-100";
        if (value === "in review") return "text-yellow-600 bg-yellow-100";
        return "";
      };

      return (
        <>
          <Label
            htmlFor={`${row.original.sub_booking_id}-booking-status`}
            className="sr-only"
          >
            Booking Status
          </Label>
          <Select
            disabled={isUpdatePending}
            value={selectValue}
            onValueChange={(value: BookingStatus) => {
              setPendingValue(value);
              setDialogOpen(true);
            }}
          >
            <SelectTrigger
              className={`w-38 rounded-full px-3 border-0 shadow-none **:data-[slot=select-value]:block **:data-[slot=select-value]:truncate ${getStatusColor(
                selectValue
              )}`}
              id={`${row.original.sub_booking_id}-booking-status`}
            >
              <SelectValue placeholder="Change status" />
            </SelectTrigger>
            <SelectContent align="end">
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
              <SelectItem value="in review">In Review</SelectItem>
            </SelectContent>
          </Select>
          {/* <ConfirmationDialog
            open={dialogOpen}
            onOpenChange={setDialogOpen}
            onConfirm={handleConfirm}
            onCancel={handleCancel}
            isLoading={isUpdatePending}
            title="Change Booking Status"
            description="You're about to update the booking status for this booking."
          /> */}
          <ConfirmationDialog
            open={dialogOpen}
            onOpenChange={setDialogOpen}
            onConfirm={handleConfirm}
            onCancel={handleCancel}
            isLoading={isUpdatePending}
            title="Change Booking Status"
            description={`You're about to update the booking status for this booking.\nThis change may affect the booking process.`}
          >
            <div className="space-y-2 mt-2">
              {/* Show the new booking status */}
              {pendingValue && (
                <div className="mb-2 flex items-center justify-center gap-2">
                  <span className="font-semibold">New Booking Status</span>
                  <span
                    className={`capitalize inline-block rounded-full px-3 py-1 text-sm font-semibold ${getStatusColor(
                      pendingValue
                    )}`}
                  >
                    {pendingValue}
                  </span>
                </div>
              )}
              <Label
                htmlFor="booking-status-reason"
                className="block text-sm font-medium "
              >
                Notes
              </Label>
              <Textarea
                id="booking-status-reason"
                className="w-full rounded border bg-gray-200 p-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                rows={3}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="(Optional) Add a note for changing the booking status."
              />
            </div>
          </ConfirmationDialog>
        </>
      );
    },
    enableHiding: false,
  },
  {
    id: "payment_status",
    accessorKey: "payment_status",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Payment Status" />
    ),
    cell: ({ row }) => {
      const [isUpdatePending, startUpdateTransition] = React.useTransition();
      const [selectValue, setSelectValue] = React.useState<PaymentStatus>(
        row.original.payment_status
      );
      const [dialogOpen, setDialogOpen] = React.useState(false);
      const [pendingValue, setPendingValue] = React.useState<string | null>(
        null
      );

      const handleConfirm = async () => {
        if (!pendingValue) return;
        // Implementation would call updatePaymentStatus API
        startUpdateTransition(() => {
          setTimeout(() => {
            setSelectValue(pendingValue as PaymentStatus);
            setPendingValue(null);
            setDialogOpen(false);
            toast.success("Payment status updated successfully");
          }, 1000);
        });
      };

      const handleCancel = () => {
        setDialogOpen(false);
        setPendingValue(null);
      };

      const getStatusColor = (value: string) => {
        if (value === "paid") return "text-green-600 bg-green-100";
        if (value === "unpaid") return "text-red-600 bg-red-100";
        return "";
      };

      return (
        <>
          <Label
            htmlFor={`${row.original.sub_booking_id}-payment-status`}
            className="sr-only"
          >
            Payment Status
          </Label>
          <Select
            disabled={isUpdatePending}
            value={selectValue}
            onValueChange={(value: PaymentStatus) => {
              setPendingValue(value);
              setDialogOpen(true);
            }}
          >
            <SelectTrigger
              className={`w-32 rounded-full px-3 border-0 shadow-none **:data-[slot=select-value]:block **:data-[slot=select-value]:truncate ${getStatusColor(
                selectValue
              )}`}
              id={`${row.original.sub_booking_id}-payment-status`}
            >
              <SelectValue placeholder="Change status" />
            </SelectTrigger>
            <SelectContent align="end">
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="unpaid">Unpaid</SelectItem>
            </SelectContent>
          </Select>
          <ConfirmationDialog
            open={dialogOpen}
            onOpenChange={setDialogOpen}
            onConfirm={handleConfirm}
            onCancel={handleCancel}
            isLoading={isUpdatePending}
            title="Change Payment Status"
            description="You're about to update the payment status for this booking."
          />
        </>
      );
    },
    enableHiding: false,
  },
  {
    id: "notes",
    accessorKey: "notes",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Notes" />
    ),
    cell: ({ row }) => {
      const [notesOpen, setNotesOpen] = React.useState(false);
      return (
        <>
          <Button size="sm" onClick={() => setNotesOpen(true)}>
            <IconNote />
            Notes
          </Button>
          <NotesDialog
            open={notesOpen}
            onOpenChange={setNotesOpen}
            // TODO: Fetch notes from API and set as default value, for now empty array
            notes={""}
            // notes={row.original.notes || ""}
            guestName={row.original.guest_name.toLocaleString()}
          />
        </>
      );
    },
    enableHiding: false,
    enableSorting: false,
  },
  {
    id: "api_status",
    accessorKey: "api_status",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="API Status" />
    ),
    cell: ({ row }) => (
      <div>
        {row.original.is_api ? (
          <IconApi aria-label="API Connected" />
        ) : (
          <IconApiOff aria-label="API Disconnected" />
        )}
      </div>
    ),
    enableHiding: false,
    enableSorting: false,
    size: 100,
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const handleCancel = () => {
        toast.promise(
          new Promise((resolve) =>
            setTimeout(() => resolve({ success: true }), 1000)
          ),
          {
            loading: "Cancelling booking...",
            success: "Booking cancelled successfully",
            error: "Failed to cancel booking",
          }
        );
      };

      const handleViewReceipt = () => {
        toast.info("Opening receipt viewer...");
        // Implementation would open receipt viewer
      };

      const handleViewInvoice = () => {
        // toast.info("Opening invoice viewer...");
        // Implementation would open invoice viewer
        setRowAction({ row, variant: "invoice" });
      };

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              aria-label="Open menu"
              variant="ghost"
              className="flex size-8 p-0 data-[state=open]:bg-muted"
            >
              <MoreHorizontal className="size-4" aria-hidden="true" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            {row.original.payment_status === "paid" && (
              <DropdownMenuItem onClick={handleViewReceipt}>
                <IconFileText className="mr-2 h-4 w-4" />
                View Receipt
              </DropdownMenuItem>
            )}
            {row.original.payment_status === "unpaid" && (
              <DropdownMenuItem onClick={handleViewReceipt}>
                <IconCloudUpload className="mr-2 h-4 w-4" />
                Upload Receipt
              </DropdownMenuItem>
            )}
            <DropdownMenuItem onClick={handleViewInvoice}>
              <IconFileDownload className="mr-2 h-4 w-4" />
              View Invoice
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleCancel}
              className="text-red-600 focus:text-red-600"
            >
              <Ban className="mr-2 h-4 w-4" />
              Cancel
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
    enableHiding: false,
    enableSorting: false,
    size: 60,
  },
];

export function DetailBookingSummaryDialog({
  bookingSummary,
  onSuccess,
  ...props
}: DetailBookingSummaryDialogProps) {
  const [rowAction, setRowAction] =
    React.useState<DataTableRowAction<any> | null>(null);
  // State for server-side pagination and sorting
  const [pagination, setPagination] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  const [sorting, setSorting] = React.useState<SortingState>([]);

  const mockData = bookingSummary?.detail || [];

  const columns = React.useMemo(
    () =>
      getDetailBookingColumns({
        setRowAction,
      }),
    []
  );

  const table = useReactTable({
    data: mockData,
    columns,
    pageCount: 1, // Mock page count
    state: {
      pagination,
      sorting,
    },
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    manualSorting: true,
  });

  if (!bookingSummary) return null;

  return (
    <>
      <Dialog {...props}>
        <DialogContent className="sm:max-w-7xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle>Booking Management Details</DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-hidden flex flex-col">
            <div className="flex-1 overflow-auto relative">
              <DataTable table={table} showPagination={false} />
            </div>
          </div>
        </DialogContent>
      </Dialog>
      <ViewInvoiceDialog
        open={rowAction?.variant === "invoice"}
        onOpenChange={() => setRowAction(null)}
      />
    </>
  );
}
