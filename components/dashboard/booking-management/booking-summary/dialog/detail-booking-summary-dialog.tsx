/* eslint-disable react-hooks/rules-of-hooks */
"use client";

import {
  ColumnDef,
  ExpandedState,
  PaginationState,
  SortingState,
  getCoreRowModel,
  getExpandedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import {
  saveAdminNote,
  updateBookingStatus,
  updatePaymentStatus,
} from "@/app/(dashboard)/booking-management/booking-summary/actions";
import {
  AdditionalService,
  BookingStatus,
  BookingSummary,
  BookingSummaryDetail,
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
import { TableCell, TableRow } from "@/components/ui/table";
import { DataTableRowAction, Option } from "@/types/data-table";
import {
  IconApi,
  IconApiOff,
  IconFileDownload,
  IconFileText,
  IconNote,
} from "@tabler/icons-react";
import { Ban, MoreHorizontal } from "lucide-react";
import { UploadReceiptDialog } from "./upload-receipt-dialog";
import ViewInvoiceDialog from "./view-invoice-dialog";
import ViewReceiptDialog from "./view-receipt-dialog";
import { formatCurrency } from "@/lib/format";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";

interface GetDetailBookingTableColumnsProps {
  setRowAction: React.Dispatch<
    React.SetStateAction<DataTableRowAction<BookingSummaryDetail> | null>
  >;
  bookingStatusOptions: Option[];
  onUploadReceipt: (subBookingId: string) => void;
  onSuccess?: () => void;
}

interface DetailBookingSummaryDialogProps
  extends React.ComponentPropsWithoutRef<typeof Dialog> {
  bookingSummary: BookingSummary | null;
  onSuccess?: () => void;
  bookingStatusOptions: Option[];
}

// Notes Dialog Component
interface NotesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  notes: string;
  adminNotes?: string;
  guestName: string;
  subBookingId: string;
  onSuccess?: () => void;
}

function NotesDialog({
  open,
  onOpenChange,
  notes,
  adminNotes,
  guestName,
  subBookingId,
  onSuccess,
}: NotesDialogProps) {
  const router = useRouter();
  const [adminNoteValue, setAdminNoteValue] = React.useState(adminNotes || "");
  const [isSaving, startSaveTransition] = React.useTransition();

  // Reset admin note value when dialog opens/closes or adminNotes prop changes
  React.useEffect(() => {
    if (open) {
      setAdminNoteValue(adminNotes || "");
    }
  }, [open, adminNotes]);

  const handleSave = () => {
    startSaveTransition(() => {
      (async () => {
        try {
          const savedNote = adminNoteValue.trim();
          const result = await saveAdminNote({
            sub_booking_id: subBookingId,
            admin_notes: savedNote,
          });

          if (result?.success) {
            toast.success(result.message || "Admin note saved successfully");
            // Update local state optimistically to show the saved note immediately
            setAdminNoteValue(savedNote);
            // Refresh the page data to get the updated admin notes from server
            router.refresh();
            onSuccess?.();
            // Keep dialog open so admin can continue editing if needed
          } else {
            toast.error(result?.message || "Failed to save admin note");
          }
        } catch (error) {
          void error;
          toast.error("An error occurred. Please try again.");
        }
      })();
    });
  };

  const handleCancel = () => {
    setAdminNoteValue(adminNotes || "");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Booking Notes - {guestName}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          {/* Agent Notes (Read-only) */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Notes from Agent</Label>
            <div className="bg-muted/50 rounded-lg p-4 min-h-[80px]">
              <p className="text-sm leading-relaxed whitespace-pre-line">
                {notes || "No notes available from agent."}
              </p>
            </div>
          </div>

          {/* Admin Notes (Editable) */}
          <div className="space-y-2">
            <Label htmlFor="admin-notes" className="text-sm font-medium">
              Admin Notes (Visible to Agent)
            </Label>
            <Textarea
              id="admin-notes"
              className="min-h-[120px] resize-none"
              value={adminNoteValue}
              onChange={(e) => setAdminNoteValue(e.target.value)}
              placeholder="Write notes that will be visible to the agent..."
              disabled={isSaving}
            />
            <p className="text-xs text-muted-foreground">
              These notes will be visible to the agent for this booking.
            </p>
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? "Saving..." : "Save Note"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

const getDetailBookingColumns = ({
  setRowAction,
  bookingStatusOptions,
  onUploadReceipt,
  onSuccess,
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
    enableSorting: false,
  },
  {
    id: "hotel_name",
    accessorKey: "hotel_name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Hotel Name" />
    ),
    cell: ({ row }) => row.original.hotel_name,
    enableHiding: false,
    enableSorting: false,
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
    enableSorting: false,
  },
  {
    id: "booking_status",
    accessorKey: "booking_status",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Booking Status" />
    ),
    cell: ({ row }) => {
      const transformIntoValue = (text: string) => {
        switch (text.toLowerCase()) {
          case "confirmed":
            return "3";
          case "rejected":
            return "4";
          case "waiting approval":
            return "2";
          case "cancelled":
            return "5";
          default:
            return "";
        }
      };

      const transformIntoText = (text: string) => {
        switch (text.toLowerCase()) {
          case "3":
            return "Confirmed";
          case "4":
            return "Rejected";
          case "2":
            return "Waiting Approval";
          case "5":
            return "Cancelled";
          default:
            return "";
        }
      };

      const [isUpdatePending, startUpdateTransition] = React.useTransition();
      const [selectValue, setSelectValue] = React.useState<string>(
        transformIntoValue(row.original.booking_status.toLowerCase())
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
              const status_id = pendingValue;

              const result = await updateBookingStatus({
                sub_booking_id: String(row.original.sub_booking_id),
                status_id: status_id || "",
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
        if (value === "3") return "text-green-600 bg-green-100";
        if (value === "4") return "text-red-600 bg-red-100";
        if (value === "2") return "text-yellow-600 bg-yellow-100";
        if (value === "5") return "text-red-600 bg-red-100";
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
              disabled={selectValue === "5"}
            >
              <SelectValue placeholder="Change status" />
            </SelectTrigger>
            <SelectContent align="end">
              {bookingStatusOptions.map((option) => (
                <SelectItem
                  key={option.value}
                  value={option.value}
                  disabled={option.value === "5"}
                >
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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
                    {transformIntoText(pendingValue)}
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
    enableSorting: false,
  },
  {
    id: "payment_status",
    accessorKey: "payment_status",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Payment Status" />
    ),
    cell: ({ row }) => {
      const transformIntoValue = (text: string) => {
        switch (text.toLowerCase()) {
          case "paid":
            return "2";
          case "unpaid":
            return "1";
          default:
            return "";
        }
      };

      const transformIntoText = (text: string) => {
        switch (text) {
          case "2":
            return "Paid";
          case "1":
            return "Unpaid";
          default:
            return "";
        }
      };

      const [isUpdatePending, startUpdateTransition] = React.useTransition();
      const [selectValue, setSelectValue] = React.useState<string>(
        transformIntoValue(row.original.payment_status.toLowerCase())
      );
      const [dialogOpen, setDialogOpen] = React.useState(false);
      const [pendingValue, setPendingValue] = React.useState<string | null>(
        null
      );

      const handleConfirm = async () => {
        if (!pendingValue) return;
        startUpdateTransition(() => {
          (async () => {
            try {
              const result = await updatePaymentStatus({
                sub_booking_id: String(row.original.sub_booking_id),
                payment_status_id: pendingValue,
              });
              if (result?.success) {
                setSelectValue(pendingValue);
                setPendingValue(null);
                setDialogOpen(false);
                toast.success(
                  result.message || "Payment status updated successfully"
                );
              } else {
                toast.error(
                  result?.message || "Failed to update payment status"
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
      };

      const getStatusColor = (value: string) => {
        if (value === "2") return "text-green-600 bg-green-100";
        if (value === "1") return "text-red-600 bg-red-100";
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
            onValueChange={(value: string) => {
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
              <SelectItem value="1">Unpaid</SelectItem>
              <SelectItem value="2">Paid</SelectItem>
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
    enableSorting: false,
  },
  {
    id: "notes",
    accessorKey: "additional_notes",
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
            key={row.original.sub_booking_id}
            open={notesOpen}
            onOpenChange={setNotesOpen}
            notes={row.original.additional_notes || ""}
            adminNotes={row.original.admin_notes}
            guestName={row.original.guest_name.toLocaleString()}
            subBookingId={row.original.sub_booking_id}
            onSuccess={onSuccess}
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
      const isExpanded = row.getIsExpanded();

      const handleCancel = async () => {
        try {
          // Simulating an async operation
          await new Promise((resolve) =>
            setTimeout(() => resolve({ success: true }), 1000)
          );
          toast.success("Booking cancelled successfully");
        } catch (error) {
          toast.error("Failed to cancel booking");
        }
      };

      const handleToggleDetails = () => {
        row.toggleExpanded();
      };

      const handleUploadReceipt = () => {
        onUploadReceipt(String(row.original.sub_booking_id));
      };

      const handleViewReceipt = () => {
        setRowAction({ row, variant: "receipt" });
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
            <DropdownMenuItem onClick={handleToggleDetails}>
              {isExpanded ? "Hide details" : "Show details"}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {/* {row.original.payment_status.toLowerCase() === "paid" && ( */}
            <DropdownMenuItem onClick={handleViewReceipt}>
              <IconFileText className="mr-2 h-4 w-4" />
              View Receipt
            </DropdownMenuItem>
            {/* )} */}
            {/* {row.original.payment_status.toLowerCase() === "unpaid" && (
              <DropdownMenuItem onClick={handleUploadReceipt}>
                <IconCloudUpload className="mr-2 h-4 w-4" />
                Upload Receipt
              </DropdownMenuItem>
            )} */}
            <DropdownMenuItem onClick={handleViewInvoice}>
              <IconFileDownload className="mr-2 h-4 w-4" />
              View Invoice
            </DropdownMenuItem>
            {/* <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleCancel}
              className="text-red-600 focus:text-red-600"
            >
              <Ban className="mr-2 h-4 w-4" />
              Cancel
            </DropdownMenuItem> */}
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
  bookingStatusOptions,
  ...props
}: DetailBookingSummaryDialogProps) {
  const router = useRouter();
  const [rowAction, setRowAction] =
    React.useState<DataTableRowAction<any> | null>(null);
  const [uploadReceiptOpen, setUploadReceiptOpen] = React.useState(false);
  const [selectedSubBookingId, setSelectedSubBookingId] = React.useState<
    string | null
  >(null);
  // State for server-side pagination and sorting
  const [pagination, setPagination] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [expanded, setExpanded] = React.useState<ExpandedState>({});

  const mockData = React.useMemo(
    () => bookingSummary?.detail || [],
    [bookingSummary?.detail]
  );

  // Create a combined onSuccess handler that refreshes data
  const handleSuccess = React.useCallback(() => {
    router.refresh();
    onSuccess?.();
  }, [router, onSuccess]);

  const columns = React.useMemo(
    () =>
      getDetailBookingColumns({
        setRowAction,
        bookingStatusOptions,
        onUploadReceipt: (subBookingId: string) => {
          setSelectedSubBookingId(subBookingId);
          setUploadReceiptOpen(true);
        },
        onSuccess: handleSuccess,
      }),
    [handleSuccess, bookingStatusOptions]
  );

  const table = useReactTable({
    data: mockData,
    columns,
    pageCount: 1, // Mock page count
    state: {
      pagination,
      sorting,
      expanded,
    },
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    onExpandedChange: setExpanded,
    getCoreRowModel: getCoreRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    getRowCanExpand: () => true,
    manualPagination: true,
    manualSorting: true,
  });

  if (!bookingSummary) return null;

  const selectedDetail = rowAction?.row
    ?.original as BookingSummaryDetail | undefined;

  const bookingForInvoice =
    bookingSummary && selectedDetail?.invoice
      ? {
          // Provide full detail list so the invoice dialog can show rich room info,
          // additional services, preferences, etc. (matched by sub_booking_id)
          detail: bookingSummary.detail,
          // Provide all invoices in the same order as details so navigation & indexing work
          invoices: bookingSummary.detail.map((d) => d.invoice),
          receipts: bookingSummary.receipts ?? [],
        }
      : null;

  return (
    <>
      <Dialog {...props}>
        <DialogContent className="sm:max-w-7xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle>Booking Management Details</DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-hidden flex flex-col">
            <div className="flex-1 overflow-auto relative">
              <DataTable
                table={table}
                showPagination={false}
                renderSubRow={(detail) => (
                  <TableRow className="bg-muted/40">
                    <TableCell />
                    <TableCell
                      colSpan={table.getAllColumns().length - 1}
                      className="px-6 py-4 text-sm"
                    >
                      {/* High-level room details and promo, similar to Agent view-detail */}
                      <div className="grid gap-4 grid-cols-1 md:grid-cols-3 mb-4">
                        <div className="space-y-2">
                          {/* Room Type */}
                          {detail.room_type_name && (
                            <div>
                              <p className="text-xs font-semibold uppercase text-muted-foreground">
                                Room Type
                              </p>
                              <p className="text-sm font-medium capitalize">
                                {detail.room_type_name}
                              </p>
                            </div>
                          )}

                          {/* Room Option (Breakfast) with Price */}
                          <div>
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-xs font-semibold uppercase text-muted-foreground">
                                  Room Option
                                </p>
                                <p className="text-sm font-medium">
                                  {detail.is_breakfast
                                    ? "Breakfast Included"
                                    : "Without Breakfast"}
                                </p>
                              </div>
                              {detail.room_price !== undefined &&
                                detail.room_price > 0 && (
                                  <div className="text-right">
                                    <p className="text-xs text-muted-foreground">
                                      Per Night
                                    </p>
                                    <p className="text-sm font-semibold">
                                      {formatCurrency(
                                        detail.room_price,
                                        detail.currency ||
                                          detail.invoice?.currency ||
                                          "IDR"
                                      )}
                                    </p>
                                  </div>
                                )}
                            </div>
                          </div>

                          {/* Bed Type */}
                          {(detail.bed_type || detail.invoice?.bed_type) && (
                            <div>
                              <p className="text-xs font-semibold uppercase text-muted-foreground">
                                Bed Type
                              </p>
                              <p className="text-sm font-medium capitalize">
                                {detail.bed_type || detail.invoice?.bed_type}
                              </p>
                            </div>
                          )}
                        </div>

                        {/* Check-in / Check-out dates */}
                        <div className="space-y-2">
                          {(detail.check_in_date || detail.check_out_date) && (
                            <>
                              {detail.check_in_date && (
                                <div>
                                  <p className="text-xs font-semibold uppercase text-muted-foreground">
                                    Check-in Date
                                  </p>
                                  <p className="text-sm font-medium">
                                    {format(
                                      new Date(detail.check_in_date),
                                      "EEE, MMMM d yyyy"
                                    )}
                                  </p>
                                </div>
                              )}
                              {detail.check_out_date && (
                                <div>
                                  <p className="text-xs font-semibold uppercase text-muted-foreground">
                                    Check-out Date
                                  </p>
                                  <p className="text-sm font-medium">
                                    {format(
                                      new Date(detail.check_out_date),
                                      "EEE, MMMM d yyyy"
                                    )}
                                  </p>
                                </div>
                              )}
                            </>
                          )}
                        </div>

                        {/* Promotion Applied */}
                        <div className="space-y-2">
                          {!!detail.invoice?.promo?.promo_code && (
                            <div className="rounded-md bg-blue-50 p-2">
                              <p className="text-xs font-semibold text-blue-900 uppercase">
                                Promotion Applied
                              </p>
                              <div className="mt-1 space-y-1">
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-semibold text-blue-900">
                                    {detail.invoice.promo.promo_code}
                                  </span>
                                  {detail.invoice.promo.type && (
                                    <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
                                      {detail.invoice.promo.type}
                                    </Badge>
                                  )}
                                </div>
                                {detail.invoice.promo.name && (
                                  <p className="text-xs text-blue-700">
                                    {detail.invoice.promo.name}
                                  </p>
                                )}
                                {(() => {
                                  const promo = detail.invoice!.promo;
                                  const invoiceCurrency =
                                    detail.invoice?.currency || "IDR";

                                  if (promo.fixed_price && promo.fixed_price > 0) {
                                    return (
                                      <p className="text-xs font-medium text-green-700">
                                        Fixed price:{" "}
                                        {formatCurrency(
                                          promo.fixed_price,
                                          invoiceCurrency
                                        )}
                                      </p>
                                    );
                                  }

                                  if (
                                    promo.discount_percent &&
                                    promo.discount_percent > 0
                                  ) {
                                    return (
                                      <p className="text-xs font-medium text-green-700">
                                        {promo.discount_percent}% discount
                                      </p>
                                    );
                                  }

                                  if (
                                    promo.upgraded_to_id &&
                                    promo.upgraded_to_id > 0
                                  ) {
                                    return (
                                      <p className="text-xs font-medium text-green-700">
                                        Room will be automatically upgraded
                                      </p>
                                    );
                                  }

                                  if (promo.benefit_note) {
                                    return (
                                      <p className="text-xs font-medium text-green-700">
                                        {promo.benefit_note}
                                      </p>
                                    );
                                  }

                                  return null;
                                })()}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Existing extra details sections */}
                      <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
                        <div className="space-y-1">
                          <p className="text-xs font-semibold uppercase text-muted-foreground">
                            Additional Services
                          </p>
                          {Array.isArray(detail.additional_services) &&
                          detail.additional_services.length > 0 ? (
                            <ul className="list-disc pl-4 space-y-2">
                              {detail.additional_services.map((service, index) => (
                                <li key={index} className="text-sm">
                                  <div className="font-medium">{service.name}</div>
                                  {service.category === "pax" && service.pax !== null && (
                                    <div className="text-muted-foreground text-xs">
                                      {service.pax} {service.pax === 1 ? "person" : "people"}
                                    </div>
                                  )}
                              {service.category === "price" && service.price !== null && (
                                <div className="text-muted-foreground text-xs">
                                  {formatCurrency(
                                    service.price,
                                    detail.currency || "IDR"
                                  )}
                                </div>
                              )}
                                  {service.is_required && (
                                    <span className="text-xs text-orange-600 font-semibold">
                                      (Required)
                                    </span>
                                  )}
                                </li>
                              ))}
                            </ul>
                          ) : Array.isArray(detail.additional) &&
                            detail.additional.length > 0 ? (
                            <ul className="list-disc pl-4 space-y-1">
                              {detail.additional.map((service, index) => (
                                <li key={index} className="text-sm">{service}</li>
                              ))}
                            </ul>
                          ) : (
                            <p className="text-muted-foreground">
                              No additional services provided.
                            </p>
                          )}
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs font-semibold uppercase text-muted-foreground">
                            Other Preferences
                          </p>
                          {Array.isArray(detail.other_preferences) &&
                          detail.other_preferences.length > 0 ? (
                            <ul className="list-disc pl-4 space-y-1">
                              {detail.other_preferences.map((item) => (
                                <li key={item}>{item}</li>
                              ))}
                            </ul>
                          ) : (
                            <p className="text-muted-foreground">
                              No other preferences provided.
                            </p>
                          )}
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs font-semibold uppercase text-muted-foreground">
                            Additional Notes From Agent
                          </p>
                          <p className="whitespace-pre-line text-muted-foreground">
                            {detail.additional_notes ||
                              "No additional notes for this booking."}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              />
            </div>
          </div>
        </DialogContent>
      </Dialog>
      <ViewInvoiceDialog
        booking={bookingForInvoice}
        open={rowAction?.variant === "invoice"}
        onOpenChange={() => setRowAction(null)}
        // Ensure the correct invoice is selected initially, matching the clicked row
        invoiceIndex={rowAction?.row.index}
      />
      <ViewReceiptDialog
        open={rowAction?.variant === "receipt"}
        onOpenChange={() => setRowAction(null)}
        receipts={bookingSummary?.receipts || null}
        invoiceIndex={rowAction?.row.index}
        receipt={rowAction?.row.original.invoice.receipt}
      />
      <UploadReceiptDialog
        open={uploadReceiptOpen}
        onOpenChange={setUploadReceiptOpen}
        subBookingId={selectedSubBookingId ?? undefined}
        onSuccess={() => {
          setSelectedSubBookingId(null);
          onSuccess?.();
        }}
      />
    </>
  );
}
