"use client";

import {
  BookingSummary,
  BookingSummaryDetail,
} from "@/app/(dashboard)/booking-management/booking-summary/types";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Separator } from "@/components/ui/separator";
import { formatCurrency, formatDate } from "@/lib/format";
import { PDFService } from "@/lib/pdf-service";
import { ComprehensiveInvoiceData, InvoiceDialogState } from "@/types/invoice";
import {
  IconCloudUpload,
  IconFileDescription,
  IconFileText,
  IconRosetteDiscount,
} from "@tabler/icons-react";
import { format, isValid } from "date-fns";
import React, { useState } from "react";
import { toast } from "sonner";
import { NewInvoiceData } from "./new-invoice-pdf-document";

/**
 * Validates and formats a date string. Returns formatted date or error message.
 * @param dateString - The date string to validate and format
 * @param errorMessage - The error message to return if validation fails
 * @param formatPattern - The date format pattern (default: "dd.MM.yy")
 * @returns Formatted date string or error message
 */
const validateAndFormatDate = (
  dateString: string | undefined | null,
  errorMessage: string,
  formatPattern: string = "dd.MM.yy"
): string => {
  // Check if dateString is missing or empty
  if (
    !dateString ||
    typeof dateString !== "string" ||
    dateString.trim() === ""
  ) {
    return errorMessage;
  }

  try {
    const date = new Date(dateString);

    // Validate if the date is a valid date object
    if (!isValid(date)) {
      return errorMessage;
    }

    // Check if the date string is actually a valid date (not just any string)
    if (isNaN(date.getTime())) {
      return errorMessage;
    }

    return format(date, formatPattern);
  } catch {
    return errorMessage;
  }
};

interface ViewInvoiceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  // booking: HistoryBooking | null;
  bookingSummary: BookingSummaryDetail | null;
}

const ViewInvoiceDialog: React.FC<ViewInvoiceDialogProps> = ({
  open,
  onOpenChange,
  bookingSummary,
  // booking,
}) => {
  const [state, setState] = useState<InvoiceDialogState>({
    isGeneratingPDF: false,
    invoiceData: null,
    error: null,
    isLoading: false,
  });

  const invoice = bookingSummary?.invoice;

  const newInvoiceData = {
    invoiceNumber: invoice?.invoice_number || "Invoice Number Not Found",
    companyName: invoice?.company_agent || "Company Name Not Found",
    agentName: invoice?.agent || "Agent Name Not Found",
    agentEmail: invoice?.email || "Email Not Found",
    hotelName: invoice?.hotel || "Hotel Name Not Found",
    guestName: invoice?.guest || "Guest Name Not Found",
    checkInDate: validateAndFormatDate(
      invoice?.check_in,
      "Check-in Date Not Found",
      "dd.MM.yy"
    ),
    checkOutDate: validateAndFormatDate(
      invoice?.check_out,
      "Check-out Date Not Found",
      "dd.MM.yy"
    ),
    invoiceDate: validateAndFormatDate(
      invoice?.invoice_date,
      "Invoice Date Not Found",
      "dd.MM.yy"
    ),
    subBookingId: invoice?.sub_booking_id || "Sub-Booking ID Not Found",
    items: invoice?.description_invoice || [],
    totalPrice: invoice?.total_price || 0,
    totalBeforePromo: invoice?.total_before_promo || 0,
    promo: {
      ...invoice?.promo,
    },
  };

  // Handle PDF download
  const handleDownloadPDF = async () => {
    if (!newInvoiceData) {
      toast.error("No invoice data available");
      return;
    }

    try {
      setState((prev) => ({ ...prev, isGeneratingPDF: true, error: null }));

      // Use centralized PDFService for PDF generation and download
      await PDFService.generateAndDownloadNewInvoice(
        newInvoiceData as NewInvoiceData,
        (step) => {
          // Optional: You could show progress here if needed
          console.log("PDF Generation:", step);
        }
      );

      toast.success("Invoice PDF downloaded successfully!");
    } catch (error) {
      console.error("PDF download error:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to download PDF";
      setState((prev) => ({ ...prev, error: errorMessage }));
      toast.error(errorMessage);
    } finally {
      setState((prev) => ({ ...prev, isGeneratingPDF: false }));
    }
  };

  // if (!booking) {
  //   return (
  //     <Dialog open={open} onOpenChange={onOpenChange}>
  //       <DialogContent className="w-[95vw] max-w-7xl px-8">
  //         <DialogHeader>
  //           <DialogTitle>Invoice</DialogTitle>
  //         </DialogHeader>
  //         <div className="text-muted-foreground py-8 text-center">
  //           No booking selected.
  //         </div>
  //       </DialogContent>
  //     </Dialog>
  //   );
  // }

  if (!newInvoiceData) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="w-[95vw] max-w-7xl px-8">
          <DialogHeader>
            <DialogTitle>Invoice</DialogTitle>
          </DialogHeader>
          <div className="py-8 text-center">
            <LoadingSpinner className="mx-auto mb-4" />
            <p className="text-muted-foreground">Loading invoice data...</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] min-w-7xl overflow-y-auto bg-white px-8">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="sr-only flex items-center gap-2">
              <IconFileText className="h-5 w-5" />
              Invoice #{newInvoiceData.invoiceNumber}
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {state.error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4">
              <p className="text-sm text-red-700">{state.error}</p>
            </div>
          )}

          {/* Company Header */}
          <div className="flex items-start justify-between pb-6">
            <div className="space-y-1">
              <h2 className="text-xl font-bold text-gray-900">
                PT. World Travel Marketing Bali test
              </h2>
              <p className="text-sm text-gray-600">
                Ikat Plaza Building - Jl. Bypass Ngurah Rai No. 505
              </p>
              <p className="text-sm text-gray-600">
                Pemogan - Denpasar Selatan
              </p>
              <p className="text-sm text-gray-600">
                80221 Denpasar - Bali - Indonesia
              </p>
            </div>
            <div className="text-right">
              <h1 className="text-3xl font-bold text-gray-900">Invoice</h1>
              <p className="text-2xl font-bold text-gray-700">
                #{newInvoiceData.invoiceNumber}
              </p>
            </div>
          </div>

          <Separator />

          {/* Billing and Invoice Details */}
          <h3 className="mb-3 font-semibold text-gray-900">Bill To:</h3>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {/* Bill To */}
            <div>
              <div className="space-y-1 text-sm">
                <p className="font-medium">{newInvoiceData.companyName}</p>
                <p>{newInvoiceData.agentName}</p>
                <p>{newInvoiceData.agentEmail}</p>
              </div>
            </div>

            {/* Booking Details */}
            <div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Villa</span>
                  <span>{newInvoiceData.hotelName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Guest Name</span>
                  <span>{newInvoiceData.guestName}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600">Check-In</span>
                  <span>{newInvoiceData.checkInDate}</span>
                </div>
              </div>
            </div>

            {/* Invoice Details */}
            <div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Invoice Date</span>
                  <span>{newInvoiceData.invoiceDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Sub Booking ID</span>
                  <span>{newInvoiceData.subBookingId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Check-Out</span>
                  <span>{newInvoiceData.checkOutDate}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Items Table */}
          <div className="mt-8">
            <div className="overflow-hidden rounded-lg border">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                      No.
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                      Description
                    </th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-gray-900">
                      Qty
                    </th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-gray-900">
                      Unit
                    </th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900">
                      Unit Price
                    </th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900">
                      Total Price
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {newInvoiceData.items.map((item, index) => (
                    <tr key={index}>
                      <td className="px-4 py-3 text-sm">{index + 1}.</td>
                      <td className="px-4 py-3 text-sm">{item.description}</td>
                      <td className="px-4 py-3 text-center text-sm">
                        {item.quantity}
                      </td>
                      <td className="px-4 py-3 text-center text-sm">
                        {item.unit}
                      </td>
                      <td className="px-4 py-3 text-right text-sm">
                        {formatCurrency(item.price, "IDR")}
                      </td>
                      <td className="px-4 py-3 text-right text-sm font-medium">
                        <div className="flex flex-col items-end gap-1">
                          {/* Conditionally show strikethrough price when promo is applied to this item */}
                          {newInvoiceData.promo?.promo_code &&
                            item.total_before_promo > item.total && (
                              <span className="text-xs text-gray-500 line-through">
                                {formatCurrency(item.total_before_promo, "IDR")}
                              </span>
                            )}
                          <span>{formatCurrency(item.total, "IDR")}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Total Section */}
          <div className="flex justify-end">
            <div className="w-full max-w-sm space-y-2">
              <div className="flex items-start justify-between pb-2">
                <div>
                  <span className="text-lg font-medium text-gray-900">
                    Total Room Price
                  </span>
                  {/* <p className="mt-1 text-sm text-gray-600">
                    {invoiceData.numberOfGuests} room(s),{" "}
                    {invoiceData.numberOfNights} night
                  </p> */}
                </div>
                <div className="text-right">
                  {/* Conditionally show strikethrough price when promo is applied */}
                  {newInvoiceData.promo?.promo_code &&
                    newInvoiceData.totalBeforePromo >
                      newInvoiceData.totalPrice && (
                      <div className="mb-1 flex items-center justify-end gap-2">
                        <span className="text-sm text-gray-500 line-through">
                          {formatCurrency(
                            newInvoiceData.totalBeforePromo,
                            "IDR"
                          )}
                        </span>
                      </div>
                    )}
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(newInvoiceData.totalPrice, "IDR")}
                  </p>
                </div>
              </div>
              {/* Conditionally show promo badge when promo code exists */}
              {newInvoiceData.promo?.promo_code && (
                <div className="flex items-end justify-end">
                  <span className="flex items-center gap-1 rounded-full bg-gray-800 px-3 py-1 text-xs font-medium text-white">
                    Promo
                    <IconRosetteDiscount size={14} />
                    <span className="font-semibold">
                      {newInvoiceData.promo.promo_code}
                    </span>
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Footer Note */}
          <div className="mb-4 border-b pt-8 pb-4">
            <p className="text-sm text-gray-600">
              Payment and cancellation policy as per contract.
            </p>
          </div>
        </div>

        <DialogFooter className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {/* Payment Info */}
          <div>
            <h4 className="mb-3 font-semibold text-gray-900">Payments</h4>
            <div className="space-y-1 text-sm text-gray-600">
              <p>Make checks payable to:</p>
              <p>Aina (Indira)</p>
              <p>CIMB Niaga 704 904 511 700</p>
              <p>KCP Teuku Umar - Denpasar</p>
            </div>
          </div>

          {/* Questions */}
          <div>
            <h4 className="mb-3 font-semibold text-gray-900">Questions</h4>
            <div className="space-y-1 text-sm text-gray-600">
              <p>0361 4756583</p>
              <p>info.wtmbali@gmail.com</p>
              <p>www.wtmbali.com</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-3">
            <Button className="w-full">
              <IconCloudUpload /> Upload Payment Receipt
            </Button>
            <Button
              variant="outline"
              className="w-full bg-[#D0D6DB]"
              onClick={handleDownloadPDF}
              disabled={state.isGeneratingPDF}
            >
              {state.isGeneratingPDF ? (
                <>
                  <IconFileDescription /> Generating...
                </>
              ) : (
                <>
                  <IconFileDescription />
                  Download Invoice (.pdf)
                </>
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ViewInvoiceDialog;
