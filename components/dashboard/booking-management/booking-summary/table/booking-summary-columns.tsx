import {
  updateBookingStatus,
  updatePaymentStatus,
} from "@/app/(dashboard)/booking-management/booking-summary/actions";
import {
  BookingStatus,
  BookingSummary,
  PaymentStatus,
} from "@/app/(dashboard)/booking-management/booking-summary/types";
import { ConfirmationDialog } from "@/components/confirmation-dialog";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { Button } from "@/components/ui/button";
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
import { DataTableRowAction, Option } from "@/types/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { CloudOff, Ellipsis, EyeIcon, FileText, Text } from "lucide-react";
import React from "react";
import { toast } from "sonner";

interface GetBookingSummaryTableColumnsProps {
  setRowAction: React.Dispatch<
    React.SetStateAction<DataTableRowAction<BookingSummary> | null>
  >;
  companyOptions: Option[];
}

export function getBookingSummaryTableColumns({
  setRowAction,
  companyOptions,
}: GetBookingSummaryTableColumnsProps): ColumnDef<BookingSummary>[] {
  return [
    {
      id: "no",
      header: "No",
      cell: ({ row }) => row.index + 1,
      enableSorting: false,
      enableHiding: false,
      size: 40,
    },
    {
      id: "guest_name",
      accessorKey: "guest_name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Guest Name" />
      ),
      cell: ({ row }) => row.original.guest_name,
      meta: {
        label: "Guest Name",
        placeholder: "Search guest name...",
        variant: "text",
        icon: Text,
      },
      enableColumnFilter: true,
      enableHiding: false,
    },
    {
      id: "agent_name",
      accessorKey: "agent_name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Agent Name" />
      ),
      cell: ({ row }) => row.original.agent_name,
      meta: {
        label: "Agent Name",
        placeholder: "Search agent name...",
        variant: "text",
        icon: Text,
      },
      enableColumnFilter: false,
    },
    {
      id: "agent_company",
      accessorKey: "agent_company",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Agent Company" />
      ),
      cell: ({ row }) => row.original.agent_company,
      meta: {
        label: "Agent Company",
        placeholder: "Search agent company...",
        variant: "multiSelect",
        options: companyOptions,
      },
      enableColumnFilter: true,
    },
    {
      id: "group_promo",
      accessorKey: "group_promo",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Group Promo" />
      ),
      cell: ({ row }) => row.original.group_promo,
    },
    {
      id: "booking_id",
      accessorKey: "booking_id",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Booking ID" />
      ),
      cell: ({ row }) => row.original.booking_id,
    },
    {
      id: "booking_status",
      accessorKey: "booking_status",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Booking Status" />
      ),
      cell: ({ row }) => {
        // --- BEGIN: Select-based status change logic ---
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
                const result = await updateBookingStatus(
                  row.original.id,
                  pendingValue,
                  reason.trim()
                );
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
              htmlFor={`${row.original.id}-booking-status`}
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
                id={`${row.original.id}-booking-status`}
              >
                <SelectValue placeholder="Change status" />
              </SelectTrigger>
              <SelectContent align="end">
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="in review">In Review</SelectItem>
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
        // --- END: Select-based status change logic ---
      },
      meta: {
        label: "Booking Status",
        placeholder: "Filter by status...",
        variant: "select",
        options: [
          { label: "Confirmed", value: "confirmed" },
          { label: "Rejected", value: "rejected" },
          { label: "In Review", value: "in review" },
        ],
      },
      enableColumnFilter: true,
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
          startUpdateTransition(() => {
            (async () => {
              try {
                const result = await updatePaymentStatus(
                  row.original.id,
                  pendingValue
                );
                if (result?.success) {
                  setSelectValue(pendingValue as PaymentStatus);
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
          if (value === "paid") return "text-green-600 bg-green-100";
          if (value === "unpaid") return "text-red-600 bg-red-100";
          return "";
        };
        return (
          <>
            <Label
              htmlFor={`${row.original.id}-payment-status`}
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
                className={`w-38 rounded-full px-3 border-0 shadow-none **:data-[slot=select-value]:block **:data-[slot=select-value]:truncate ${getStatusColor(
                  selectValue
                )}`}
                id={`${row.original.id}-payment-status`}
              >
                <SelectValue placeholder="Change payment status" />
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
              description={`You're about to update the payment status for this booking.\nPlease review your selection before proceeding.`}
            />
          </>
        );
      },
      meta: {
        label: "Payment Status",
        placeholder: "Filter by payment status...",
        variant: "select",
        options: [
          { label: "Paid", value: "paid" },
          { label: "Unpaid", value: "unpaid" },
        ],
      },
      enableColumnFilter: true,
    },
    {
      id: "promo_id",
      accessorKey: "promo_id",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Promo ID" />
      ),
      cell: ({ row }) => row.original.promo_id,
    },
    {
      id: "receipt",
      accessorKey: "receipt",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Payment Receipt" />
      ),
      cell: ({ row }) => {
        return (
          <Button
            size={"sm"}
            onClick={() => setRowAction({ row, variant: "detail" })}
          >
            <FileText className="h-4 w-4" />
            View Receipt
          </Button>
        );
      },
      enableHiding: false,
      enableSorting: false,
    },
    {
      id: "detail",
      accessorKey: "detail",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Booking Detail" />
      ),
      cell: ({ row }) => {
        return (
          <Button
            size={"sm"}
            onClick={() => setRowAction({ row, variant: "detail" })}
          >
            <EyeIcon className="h-4 w-4" />
            See details
          </Button>
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
      // cell: ({ row }) => {
      //   return row.original.api_status ? (
      //     <Cloud className="size-5 text-green-500" aria-hidden="true" />
      //   ) : (
      //     <CloudOff className="size-5 text-red-500" aria-hidden="true" />
      //   );
      // },
      cell: ({ row }) => (
        <CloudOff className="size-5 text-red-500" aria-hidden="true" />
      ),
      enableHiding: false,
      enableSorting: false,
      size: 50,
    },
    {
      id: "actions",
      cell: function Cell({ row }) {
        const [isUpdatePending, startUpdateTransition] = React.useTransition();

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                aria-label="Open menu"
                variant="ghost"
                className="flex size-8 p-0 data-[state=open]:bg-muted"
              >
                <Ellipsis className="size-4" aria-hidden="true" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem
                onSelect={() => setRowAction({ row, variant: "update" })}
              >
                Edit
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                variant="destructive"
                onSelect={() => setRowAction({ row, variant: "delete" })}
              >
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
      size: 40,
    },
  ];
}
