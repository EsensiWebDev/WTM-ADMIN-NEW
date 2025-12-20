"use client";

import { BookingSummaryDetail } from "@/app/(dashboard)/booking-management/booking-summary/types";
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
import { formatCurrency } from "@/lib/format";
import { PDFService } from "@/lib/pdf-service";
import { InvoiceDialogState } from "@/types/invoice";
import {
  IconChevronLeft,
  IconChevronRight,
  IconCloudUpload,
  IconFileDescription,
  IconFileText,
  IconMoon,
  IconReceipt,
  IconRosetteDiscount,
} from "@tabler/icons-react";
import { format, isValid, differenceInDays } from "date-fns";
import React, { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Clock } from "lucide-react";
import { NewInvoiceData } from "./new-invoice-pdf-document";
import { UploadReceiptDialog } from "./upload-receipt-dialog";
import ViewReceiptDialog from "./view-receipt-dialog";

// Extended admin sub-booking detail with optional enriched fields
interface AdminSubBookingDetail extends BookingSummaryDetail {
  room_type_name?: string;
  is_breakfast?: boolean;
  bed_type?: string;
  room_price?: number;
  total_price?: number;
  currency?: string;
}

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
  formatPattern: string = "dd.MM.yy",
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
  booking: {
    invoices: any[];
    receipts?: string[] | null;
    detail?: BookingSummaryDetail[];
    guest_name?: string[]; // Guest names array from booking
  } | null;
  viewBtnReceipt?: boolean;
  invoiceIndex?: number;
}

const ViewInvoiceDialog: React.FC<ViewInvoiceDialogProps> = ({
  open,
  onOpenChange,
  booking,
  viewBtnReceipt = true,
  invoiceIndex = 0,
}) => {
  const [state, setState] = useState<InvoiceDialogState>({
    isGeneratingPDF: false,
    invoiceData: null,
    error: null,
    isLoading: false,
  });
  const [uploadReceiptOpen, setUploadReceiptOpen] = useState(false);
  const [viewReceiptOpen, setViewReceiptOpen] = useState(false);
  const [currentInvoiceIndex, setCurrentInvoiceIndex] = useState(invoiceIndex);

  useEffect(() => {
    setCurrentInvoiceIndex(invoiceIndex);
  }, [invoiceIndex]);

  // All hooks must be called before any early returns
  const allInvoiceData = booking?.invoices || [];
  const invoice = allInvoiceData[currentInvoiceIndex];
  const checkInDateRaw = invoice?.check_in;
  const checkOutDateRaw = invoice?.check_out;

  // Try to find the matching sub-booking detail for richer reservation info
  const matchingSubBooking: AdminSubBookingDetail | undefined = booking?.detail
    ? (booking.detail.find(
        (detail) => detail.sub_booking_id === invoice?.sub_booking_id,
      ) as AdminSubBookingDetail | undefined)
    : undefined;

  // Get currency from invoice, with fallback to IDR
  const invoiceCurrency = invoice?.currency || "IDR";

  // Get guest names from booking.guest_name array instead of invoice.guest
  const guestNamesList = booking?.guest_name && booking.guest_name.length > 0
    ? booking.guest_name
    : invoice?.guest
      ? invoice.guest.split(", ")
      : ["Guest Name Not Found"];

  // Parse check-in and check-out dates from comma-separated string
  const checkInDatesList = checkInDateRaw
    ? checkInDateRaw.split(", ").map((date: string) => date.trim()).filter((date: string) => date !== "")
    : [];
  const checkOutDatesList = checkOutDateRaw
    ? checkOutDateRaw.split(", ").map((date: string) => date.trim()).filter((date: string) => date !== "")
    : [];

  // Format dates for display
  const formattedCheckInDates = checkInDatesList.length > 0
    ? checkInDatesList.map((date: string) => validateAndFormatDate(date, "Check-in Date Not Found", "dd-MM-yyyy"))
    : ["Check-in Date Not Found"];
  const formattedCheckOutDates = checkOutDatesList.length > 0
    ? checkOutDatesList.map((date: string) => validateAndFormatDate(date, "Check-out Date Not Found", "dd-MM-yyyy"))
    : ["Check-out Date Not Found"];

  const newInvoiceData = {
    invoiceNumber: invoice?.invoice_number || "Invoice Number Not Found",
    companyName: invoice?.company_agent || "",
    agentName: invoice?.agent || "Agent Name Not Found",
    agentEmail: invoice?.email || "Email Not Found",
    hotelName: invoice?.hotel || "Hotel Name Not Found",
    guestName: guestNamesList.join(", "),
    checkInDate: formattedCheckInDates.join(", "),
    checkOutDate: formattedCheckOutDates.join(", "),
    checkInDateRaw: checkInDateRaw || "",
    checkOutDateRaw: checkOutDateRaw || "",
    invoiceDate: validateAndFormatDate(
      invoice?.invoice_date,
      "Invoice Date Not Found",
      "dd-MM-yyyy",
    ),
    subBookingId: invoice?.sub_booking_id || "Sub-Booking ID Not Found",
    items: invoice?.description_invoice || [],
    totalPrice: invoice?.total_price || 0,
    totalBeforePromo: invoice?.total_before_promo || 0,
    currency: invoiceCurrency,
    promo: {
      ...invoice?.promo,
    },
  };

  // Parse invoice items into structured format, handling consolidated invoices with sub-booking sections
  const parsedItems = useMemo(() => {
    const rooms: typeof newInvoiceData.items = [];
    const additionalServices: typeof newInvoiceData.items = [];
    const otherPreferences: typeof newInvoiceData.items = [];
    const subBookingSections: Array<{
      subBookingId: string;
      hotelName: string;
      rooms: typeof newInvoiceData.items;
      additionalServices: typeof newInvoiceData.items;
      otherPreferences: typeof newInvoiceData.items;
    }> = [];

    let currentSection: {
      subBookingId: string;
      hotelName: string;
      rooms: typeof newInvoiceData.items;
      additionalServices: typeof newInvoiceData.items;
      otherPreferences: typeof newInvoiceData.items;
    } | null = null;

    newInvoiceData.items.forEach((item: (typeof newInvoiceData.items)[number]) => {
      // Check if this is a separator item indicating a new sub-booking section
      if (item.unit === "separator") {
        // Save current section if it exists
        if (currentSection) {
          subBookingSections.push(currentSection);
        }
        // Extract hotel name and sub-booking ID from description (format: "--- Hotel Name (Sub-Booking ID: XXX) ---")
        const match = item.description.match(/--- (.+?) \(Sub-Booking ID: ([^)]+)\) ---/);
        if (match) {
          const hotelName = match[1];
          const subBookingId = match[2];
          currentSection = {
            subBookingId,
            hotelName, // Store hotel name for display
            rooms: [],
            additionalServices: [],
            otherPreferences: [],
          };
        } else {
          // Fallback for old format
          const oldMatch = item.description.match(/Sub-Booking ID: ([^-\s]+)/);
          const subBookingId = oldMatch ? oldMatch[1] : "Unknown";
          currentSection = {
            subBookingId,
            hotelName: "Hotel", // Default hotel name
            rooms: [],
            additionalServices: [],
            otherPreferences: [],
          };
        }
      } else if (item.unit === "night") {
        if (currentSection) {
          currentSection.rooms.push(item);
        }
        rooms.push(item);
      } else if (item.unit === "preference") {
        if (currentSection) {
          currentSection.otherPreferences.push(item);
        }
        otherPreferences.push(item);
      } else {
        if (currentSection) {
          currentSection.additionalServices.push(item);
        }
        additionalServices.push(item);
      }
    });

    // Don't forget to add the last section
    if (currentSection) {
      subBookingSections.push(currentSection);
    }

    return { rooms, additionalServices, otherPreferences, subBookingSections };
  }, [newInvoiceData.items]);

  // Calculate nights
  const nights = useMemo(() => {
    if (!checkInDateRaw || !checkOutDateRaw) return 0;
    try {
      const checkIn = new Date(checkInDateRaw);
      const checkOut = new Date(checkOutDateRaw);
      if (isValid(checkIn) && isValid(checkOut)) {
        return differenceInDays(checkOut, checkIn);
      }
    } catch {
      // Ignore errors
    }
    return 0;
  }, [checkInDateRaw, checkOutDateRaw]);

  if (!booking) {
    return null;
  }

  const isReceiptAvailable =
    booking && booking.receipts && booking.receipts.length > 0;

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
        },
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

  const navigateToPrevious = () => {
    if (currentInvoiceIndex > 0) {
      setCurrentInvoiceIndex(currentInvoiceIndex - 1);
    }
  };

  const navigateToNext = () => {
    if (currentInvoiceIndex < allInvoiceData.length - 1) {
      setCurrentInvoiceIndex(currentInvoiceIndex + 1);
    }
  };

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
      <DialogContent className="max-h-[90vh] max-w-7xl overflow-y-auto bg-white px-4 sm:min-w-[95vw] sm:px-6 md:px-8">
        <DialogHeader>
          <DialogTitle className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center sm:gap-0">
            <div className="flex items-center gap-2">
              <IconFileText className="h-5 w-5" />
              <span className="text-base sm:text-lg">
                Invoice #{invoice?.invoice_number}
              </span>
            </div>

            {/* Navigation arrows for multiple invoices */}
            {allInvoiceData.length > 1 && (
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  onClick={navigateToPrevious}
                  disabled={currentInvoiceIndex === 0}
                  className="h-8 w-8 p-0"
                >
                  <IconChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-muted-foreground text-sm font-normal">
                  {currentInvoiceIndex + 1} of {allInvoiceData.length}
                </span>
                <Button
                  size="sm"
                  onClick={navigateToNext}
                  disabled={currentInvoiceIndex === allInvoiceData.length - 1}
                  className="h-8 w-8 p-0"
                >
                  <IconChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 sm:space-y-6">
          {state.error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 sm:p-4">
              <p className="text-xs text-red-700 sm:text-sm">{state.error}</p>
            </div>
          )}

          {/* Company Header */}
          <div className="flex flex-col items-start gap-4 pb-4 sm:flex-row sm:justify-between sm:pb-6">
            <div className="space-y-1">
              <h2 className="text-base font-bold text-gray-900 sm:text-lg md:text-xl">
                PT. World Travel Marketing Bali
              </h2>
              <p className="text-xs text-gray-600 sm:text-sm">
                Ikat Plaza Building - Jl. Bypass Ngurah Rai No. 505
              </p>
              <p className="text-xs text-gray-600 sm:text-sm">
                Pemogan - Denpasar Selatan
              </p>
              <p className="text-xs text-gray-600 sm:text-sm">
                80221 Denpasar - Bali - Indonesia
              </p>
            </div>
            <div className="text-left sm:text-right">
              <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
                Invoice
              </h1>
              <p className="text-xl font-bold text-gray-700 sm:text-2xl">
                #{newInvoiceData.invoiceNumber}
              </p>
            </div>
          </div>

          <Separator />

          {/* Billing and Invoice Details */}
          <h3 className="mb-2 text-sm font-semibold text-gray-900 sm:mb-3 sm:text-base">
            Bill To:
          </h3>
          <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-3 md:gap-8">
            {/* Bill To */}
            <div>
              <div className="space-y-1 text-xs sm:text-sm">
                {newInvoiceData.companyName !== "" && (
                  <p className="font-medium">{newInvoiceData.companyName}</p>
                )}
                <p>{newInvoiceData.agentName}</p>
                <p className="break-all">{newInvoiceData.agentEmail}</p>
              </div>
            </div>

            {/* Booking Details */}
            <div>
              <div className="space-y-2 text-xs sm:text-sm">
                <div className="flex justify-between gap-2">
                  <span className="text-gray-600">Hotel Name</span>
                  <span className="text-right break-words text-left">
                    {newInvoiceData.hotelName.split(", ").map((hotel: string, idx: number) => (
                      <span key={idx}>
                        {hotel}
                        {idx < newInvoiceData.hotelName.split(", ").length - 1 && ", "}
                      </span>
                    ))}
                  </span>
                </div>
                <div className="flex justify-between gap-2">
                  <span className="text-gray-600">Guest Name</span>
                  <span className="text-right break-words text-left">
                    {guestNamesList.map((guest: string, idx: number) => (
                      <div key={idx}>{guest}</div>
                    ))}
                  </span>
                </div>

                <div className="flex justify-between gap-2">
                  <span className="text-gray-600">Check-In</span>
                  <span className="text-right break-words text-left">
                    {formattedCheckInDates.map((date: string, idx: number) => (
                      <div key={idx}>{date}</div>
                    ))}
                  </span>
                </div>
              </div>
            </div>

            {/* Invoice Details */}
            <div>
              <div className="space-y-2 text-xs sm:text-sm">
                <div className="flex justify-between gap-2">
                  <span className="text-gray-600">Invoice Date</span>
                  <span className="text-right">
                    {newInvoiceData.invoiceDate}
                  </span>
                </div>
                <div className="flex justify-between gap-2">
                  <span className="text-gray-600">Sub Booking ID</span>
                  <span className="text-right break-words text-left">
                    {newInvoiceData.subBookingId.split(", ").map((id: string, idx: number) => (
                      <div key={idx}>{id}</div>
                    ))}
                  </span>
                </div>
                <div className="flex justify-between gap-2">
                  <span className="text-gray-600">Check-Out</span>
                  <span className="text-right break-words text-left">
                    {formattedCheckOutDates.map((date: string, idx: number) => (
                      <div key={idx}>{date}</div>
                    ))}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Reservation Summary */}
          <div className="mt-4 sm:mt-6 md:mt-8">
            <Card className="relative flex flex-col gap-0 p-0">
              <div className="flex items-center justify-between p-6">
                <h3 className="font-semibold">Reservation Summary</h3>
              </div>

              {/* Hotel Name - Only show if single booking */}
              {parsedItems.subBookingSections.length <= 1 && (
                <div className="px-6 pb-4">
                  <h4 className="text-base font-semibold text-gray-900 sm:text-lg">
                    {matchingSubBooking?.hotel_name || newInvoiceData.hotelName}
                  </h4>
                  {/* Show check-in/check-out dates and nights for single booking */}
                  {matchingSubBooking?.check_in_date && matchingSubBooking?.check_out_date && (
                    <div className="mt-2 space-y-1 text-xs text-gray-600">
                      <div>
                        Check-in: {validateAndFormatDate(
                          matchingSubBooking.check_in_date,
                          "",
                          "dd-MM-yyyy"
                        )}
                      </div>
                      <div>
                        Check-out: {validateAndFormatDate(
                          matchingSubBooking.check_out_date,
                          "",
                          "dd-MM-yyyy"
                        )}
                      </div>
                      {nights > 0 && (
                        <div className="font-medium">
                          {nights} {nights === 1 ? "Night" : "Nights"}
                        </div>
                      )}
                    </div>
                  )}
                  {matchingSubBooking?.room_type_name && (
                    <p className="mt-1 text-xs text-gray-700 sm:text-sm">
                      {matchingSubBooking.room_type_name}
                      {matchingSubBooking.bed_type && (
                        <span className="ml-1 text-xs text-gray-500">
                          ({matchingSubBooking.bed_type})
                        </span>
                      )}
                      {matchingSubBooking.is_breakfast && (
                        <span className="ml-2 text-xs text-green-700">
                          Breakfast Included
                        </span>
                      )}
                    </p>
                  )}
                </div>
              )}

          {/* Reservation Summary - Grouped by Sub-Booking */}
              <div className="my-6 space-y-6 px-6">
                {parsedItems.subBookingSections.length > 1 ? (
                  // Show grouped sub-bookings with all info and subtotals
                  parsedItems.subBookingSections.map((section, sectionIdx) => {
                    // Find matching sub-booking detail for this section
                    const sectionSubBooking = booking?.detail?.find(
                      (detail) => detail.sub_booking_id === section.subBookingId
                    );
                    
                    // Calculate nights for this booking
                    let sectionNights = 0;
                    if (sectionSubBooking?.check_in_date && sectionSubBooking?.check_out_date) {
                      try {
                        const checkIn = new Date(sectionSubBooking.check_in_date);
                        const checkOut = new Date(sectionSubBooking.check_out_date);
                        if (isValid(checkIn) && isValid(checkOut)) {
                          sectionNights = differenceInDays(checkOut, checkIn);
                        }
                      } catch {
                        // Ignore errors
                      }
                    }

                    // Calculate subtotal for this section
                    const sectionSubtotal = section.rooms.reduce((sum: number, room: typeof section.rooms[number]) => sum + room.total, 0) +
                      section.additionalServices.reduce((sum: number, service: typeof section.additionalServices[number]) => sum + (service.total || 0), 0);

                    // Get promo for this sub-booking
                    const sectionPromo = sectionSubBooking?.invoice?.promo;

                    return (
                      <div key={`section-${sectionIdx}`} className="space-y-4">
                        <div className="border-t pt-4 first:border-t-0 first:pt-0">
                          {/* Hotel Name and Dates */}
                          <div className="mb-4">
                            <h4 className="text-base font-semibold text-gray-900 sm:text-lg">
                              {section.hotelName}
                            </h4>
                            <p className="mt-1 text-xs text-gray-500">
                              Sub-Booking ID: {section.subBookingId}
                            </p>
                            {sectionSubBooking?.check_in_date && sectionSubBooking?.check_out_date && (
                              <div className="mt-2 space-y-1 text-xs text-gray-600">
                                <div>
                                  Check-in: {validateAndFormatDate(
                                    sectionSubBooking.check_in_date,
                                    "",
                                    "dd-MM-yyyy"
                                  )}
                                </div>
                                <div>
                                  Check-out: {validateAndFormatDate(
                                    sectionSubBooking.check_out_date,
                                    "",
                                    "dd-MM-yyyy"
                                  )}
                                </div>
                                {sectionNights > 0 && (
                                  <div className="font-medium">
                                    {sectionNights} {sectionNights === 1 ? "Night" : "Nights"}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>

                          {/* Room Type */}
                          {sectionSubBooking?.room_type_name && (
                            <div className="mb-3">
                              <p className="text-sm font-medium text-gray-700">
                                {sectionSubBooking.room_type_name}
                                {sectionSubBooking.bed_type && (
                                  <span className="ml-1 text-xs text-gray-500">
                                    ({sectionSubBooking.bed_type})
                                  </span>
                                )}
                                {sectionSubBooking.is_breakfast && (
                                  <span className="ml-2 text-xs text-green-700">
                                    Breakfast Included
                                  </span>
                                )}
                              </p>
                            </div>
                          )}

                          {/* Promotion Applied */}
                          {sectionPromo && (() => {
                            const hasPromoCode =
                              (sectionPromo.promo_code && sectionPromo.promo_code.trim() !== "") ||
                              (sectionPromo.name && sectionPromo.name.trim() !== "");
                            const hasPromoType = sectionPromo.type && sectionPromo.type.trim() !== "";
                            const hasDiscount = sectionPromo.discount_percent && sectionPromo.discount_percent > 0;
                            const hasFixedPrice = sectionPromo.fixed_price && sectionPromo.fixed_price > 0;
                            const hasBenefit = sectionPromo.benefit_note && sectionPromo.benefit_note.trim() !== "";

                            if (hasPromoCode || hasPromoType || hasDiscount || hasFixedPrice || hasBenefit) {
                              return (
                                <div className="mb-3 rounded-md bg-blue-50 p-3 text-xs">
                                  <div className="mb-1 flex items-center gap-2">
                                    <span className="font-semibold text-blue-900">
                                      Promo: {sectionPromo.promo_code || sectionPromo.name || "N/A"}
                                    </span>
                                    {sectionPromo.type && (
                                      <span className="rounded bg-blue-100 px-1.5 py-0.5 font-medium text-blue-800">
                                        {sectionPromo.type}
                                      </span>
                                    )}
                                  </div>
                                  {sectionPromo.benefit_note && sectionPromo.benefit_note.trim() !== "" && (
                                    <p className="mb-1 text-blue-700">{sectionPromo.benefit_note}</p>
                                  )}
                                  {sectionPromo.fixed_price && sectionPromo.fixed_price > 0 && (
                                    <p className="font-medium text-green-700">
                                      Fixed price: {formatCurrency(sectionPromo.fixed_price, newInvoiceData.currency)}
                                    </p>
                                  )}
                                  {sectionPromo.discount_percent && sectionPromo.discount_percent > 0 && (
                                    <p className="font-medium text-green-700">
                                      {sectionPromo.discount_percent}% discount
                                    </p>
                                  )}
                                </div>
                              );
                            }
                            return null;
                          })()}

                          {/* Bed Type (if not shown with room type) */}
                          {sectionSubBooking?.bed_type && !sectionSubBooking?.room_type_name && (
                            <div className="mb-3">
                              <span className="text-muted-foreground text-xs">Bed Type: </span>
                              <span className="text-sm font-medium">{sectionSubBooking.bed_type}</span>
                            </div>
                          )}

                          {/* Room Selected */}
                          {section.rooms.length > 0 && (
                            <div className="mb-3 space-y-2">
                              <span className="text-muted-foreground text-xs">Room Selected</span>
                              {section.rooms.map((room: typeof section.rooms[number], idx: number) => (
                                <div
                                  key={`room-${sectionIdx}-${idx}`}
                                  className="flex items-center justify-between gap-4"
                                >
                                  <div className="flex-1">
                                    <div className="text-sm font-medium">{room.description}</div>
                                    {room.price > 0 && (
                                      <div className="mt-0.5 text-xs text-gray-500">
                                        {formatCurrency(room.price, newInvoiceData.currency)} / night × {room.quantity} night
                                        {room.quantity > 1 ? "s" : ""}
                                      </div>
                                    )}
                                  </div>
                                  <span className="whitespace-nowrap text-sm font-medium">
                                    {formatCurrency(room.total, newInvoiceData.currency)}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Additional Services */}
                          {section.additionalServices.length > 0 && (
                            <div className="mb-3 space-y-2">
                              <span className="text-muted-foreground text-xs">Additional Services</span>
                              {section.additionalServices.map((additional: typeof section.additionalServices[number], idx: number) => {
                                const category = additional.category || "price";
                                const displayValue =
                                  category === "price" && additional.price !== undefined
                                    ? formatCurrency(additional.total, newInvoiceData.currency)
                                    : category === "pax" && additional.quantity
                                      ? `${additional.quantity} ${additional.quantity === 1 ? "person" : "people"}`
                                      : formatCurrency(additional.total, newInvoiceData.currency);

                                return (
                                  <div
                                    key={`additional-${sectionIdx}-${idx}`}
                                    className="flex items-center justify-between gap-4"
                                  >
                                    <span className="text-sm font-medium">{additional.description}</span>
                                    <span className="whitespace-nowrap text-sm font-medium">{displayValue}</span>
                                  </div>
                                );
                              })}
                            </div>
                          )}

                          {/* Other Preferences */}
                          {section.otherPreferences.length > 0 && (
                            <div className="mb-3 space-y-2">
                              <span className="text-muted-foreground text-xs">Other Preferences</span>
                              {section.otherPreferences.map((pref: typeof section.otherPreferences[number], idx: number) => (
                                <div
                                  key={`preference-${sectionIdx}-${idx}`}
                                  className="flex items-center justify-between gap-4"
                                >
                                  <span className="text-sm font-medium">{pref.description}</span>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Additional Notes for this sub-booking */}
                          {sectionSubBooking?.additional_notes && (
                            <div className="mb-3 space-y-2">
                              <span className="text-muted-foreground text-xs">Additional Notes</span>
                              <div className="whitespace-pre-line rounded-md bg-gray-100 p-3 text-sm text-gray-700">
                                {sectionSubBooking.additional_notes}
                              </div>
                            </div>
                          )}

                          {/* Sub-total for this sub-booking */}
                          <div className="mt-4 flex justify-end border-t pt-3">
                            <div className="space-y-1">
                              <div className="flex items-center justify-between gap-4">
                                <span className="text-sm font-semibold text-gray-900">Sub-total:</span>
                                <span className="text-base font-bold text-gray-900">
                                  {formatCurrency(sectionSubtotal, newInvoiceData.currency)}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  // Show single booking format (backward compatibility)
                  <div className="space-y-4">
                    {/* Room Selected */}
                    {parsedItems.rooms.length > 0 && (
                      <div className="space-y-2">
                        <span className="text-muted-foreground text-xs">Room Selected</span>
                        {parsedItems.rooms.map((room: typeof parsedItems.rooms[number], idx: number) => (
                          <div
                            key={`room-${idx}`}
                            className="flex items-center justify-between gap-4"
                          >
                            <div className="flex-1">
                              <div className="text-sm font-medium">{room.description}</div>
                              {matchingSubBooking?.room_price && nights > 0 && (
                                <div className="mt-0.5 text-xs text-gray-500">
                                  {formatCurrency(matchingSubBooking.room_price, newInvoiceData.currency)} / night × {nights} night
                                  {nights > 1 ? "s" : ""}
                                </div>
                              )}
                            </div>
                            <span className="whitespace-nowrap text-sm font-medium">
                              {formatCurrency(room.total, newInvoiceData.currency)}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Promotion Applied */}
                    {(() => {
                      const promo = newInvoiceData.promo;
                      if (!promo) return null;

                      const hasPromoCode =
                        (promo.promo_code && promo.promo_code.trim() !== "") ||
                        (promo.name && promo.name.trim() !== "");
                      const hasPromoType = promo.type && promo.type.trim() !== "";
                      const hasDiscount = promo.discount_percent && promo.discount_percent > 0;
                      const hasFixedPrice = promo.fixed_price && promo.fixed_price > 0;
                      const hasBenefit = promo.benefit_note && promo.benefit_note.trim() !== "";

                      if (hasPromoCode || hasPromoType || hasDiscount || hasFixedPrice || hasBenefit) {
                        return (
                          <div className="space-y-2">
                            <span className="text-muted-foreground text-xs">Promotion Applied</span>
                            <div className="rounded-md bg-blue-50 p-3 text-xs">
                              <div className="mb-1 flex items-center gap-2">
                                <span className="font-semibold text-blue-900">
                                  Promo: {promo.promo_code || promo.name || "N/A"}
                                </span>
                                {promo.type && (
                                  <span className="rounded bg-blue-100 px-1.5 py-0.5 font-medium text-blue-800">
                                    {promo.type}
                                  </span>
                                )}
                              </div>
                              {promo.benefit_note && promo.benefit_note.trim() !== "" && (
                                <p className="mb-1 text-blue-700">{promo.benefit_note}</p>
                              )}
                              {promo.fixed_price && promo.fixed_price > 0 && (
                                <p className="font-medium text-green-700">
                                  Fixed price: {formatCurrency(promo.fixed_price, newInvoiceData.currency)}
                                </p>
                              )}
                              {promo.discount_percent && promo.discount_percent > 0 && (
                                <p className="font-medium text-green-700">{promo.discount_percent}% discount</p>
                              )}
                            </div>
                          </div>
                        );
                      }
                      return null;
                    })()}

                    {/* Bed Type */}
                    {(invoice?.bed_type || matchingSubBooking?.bed_type) && (
                      <div className="space-y-2">
                        <span className="text-muted-foreground text-xs">Bed Type</span>
                        <div className="flex items-center justify-between gap-4">
                          <span className="text-sm font-medium">
                            {matchingSubBooking?.bed_type || invoice?.bed_type}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Additional Services */}
                    {(matchingSubBooking?.additional_services && matchingSubBooking.additional_services.length > 0) ||
                    parsedItems.additionalServices.length > 0 ? (
                      <div className="space-y-2">
                        <span className="text-muted-foreground text-xs">Additional Services</span>
                        <>
                          {matchingSubBooking?.additional_services &&
                            matchingSubBooking.additional_services.map((service, idx) => {
                              const category = service.category || "price";
                              const displayValue =
                                category === "pax" && service.pax !== null
                                  ? `${service.pax} ${service.pax === 1 ? "Pax" : "Pax"}`
                                  : formatCurrency(
                                      service.price || 0,
                                      matchingSubBooking.currency || newInvoiceData.currency,
                                    );

                              return (
                                <div
                                  key={`additional-service-${idx}`}
                                  className="flex items-center justify-between gap-4"
                                >
                                  <span className="text-sm font-medium">{service.name}</span>
                                  <span className="whitespace-nowrap text-sm font-medium">{displayValue}</span>
                                </div>
                              );
                            })}
                          {(!matchingSubBooking?.additional_services ||
                            matchingSubBooking.additional_services.length === 0) &&
                            parsedItems.additionalServices.map(
                              (
                                additional: (typeof parsedItems.additionalServices)[number],
                                idx: number,
                              ) => {
                                const category = additional.category || "price";
                                const displayValue =
                                  category === "price" && additional.price !== undefined
                                    ? formatCurrency(additional.total, newInvoiceData.currency)
                                    : category === "pax" && additional.quantity
                                      ? `${additional.quantity} ${additional.quantity === 1 ? "person" : "people"}`
                                      : formatCurrency(additional.total, newInvoiceData.currency);

                                return (
                                  <div
                                    key={`additional-${idx}`}
                                    className="flex items-center justify-between gap-4"
                                  >
                                    <span className="text-sm font-medium">{additional.description}</span>
                                    <span className="whitespace-nowrap text-sm font-medium">{displayValue}</span>
                                  </div>
                                );
                              },
                            )}
                        </>
                      </div>
                    ) : null}

                    {/* Other Preferences */}
                    {(matchingSubBooking?.other_preferences && matchingSubBooking.other_preferences.length > 0) ||
                    parsedItems.otherPreferences.length > 0 ? (
                      <div className="space-y-2">
                        <span className="text-muted-foreground text-xs">Other Preferences</span>
                        <>
                          {matchingSubBooking?.other_preferences &&
                            matchingSubBooking.other_preferences.map((pref, idx) => (
                              <div key={`preference-${idx}`} className="flex items-center justify-between gap-4">
                                <span className="text-sm font-medium">{pref}</span>
                              </div>
                            ))}
                          {(!matchingSubBooking?.other_preferences ||
                            matchingSubBooking.other_preferences.length === 0) &&
                            parsedItems.otherPreferences.map(
                              (
                                pref: (typeof parsedItems.otherPreferences)[number],
                                idx: number,
                              ) => (
                                <div key={`preference-${idx}`} className="flex items-center justify-between gap-4">
                                  <span className="text-sm font-medium">{pref.description}</span>
                                </div>
                              ),
                            )}
                        </>
                      </div>
                    ) : null}

                    {/* Additional Notes */}
                    {invoice?.additional_notes && (
                      <div className="space-y-2">
                        <span className="text-muted-foreground text-xs">Additional Notes</span>
                        <div className="whitespace-pre-line rounded-md bg-gray-100 p-3 text-sm text-gray-700">
                          {invoice.additional_notes}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Total Section */}
          <div className="flex justify-end">
            <div className="w-full space-y-2 sm:max-w-sm">
              <div className="flex flex-col items-start gap-2 border-t pt-3 sm:flex-row sm:justify-between sm:border-t-0 sm:pt-0 sm:pb-2">
                <div>
                  <span className="text-base font-medium text-gray-900 sm:text-lg">
                    Total Room Price
                  </span>
                </div>
                <div className="text-left sm:text-right">
                  {/* Conditionally show strikethrough price when promo is applied */}
                  {newInvoiceData.promo?.promo_code &&
                    newInvoiceData.totalBeforePromo >
                      newInvoiceData.totalPrice && (
                      <div className="mb-1 flex items-center justify-start gap-2 sm:justify-end">
                        <span className="text-sm text-gray-500 line-through">
                          {formatCurrency(
                            newInvoiceData.totalBeforePromo,
                            newInvoiceData.currency,
                          )}
                        </span>
                      </div>
                    )}
                  <p className="text-xl font-bold text-gray-900 sm:text-2xl">
                    {formatCurrency(
                      newInvoiceData.totalPrice,
                      newInvoiceData.currency,
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Note */}
          <div className="mb-3 border-b pt-4 pb-3 sm:mb-4 sm:pt-6 sm:pb-4 md:pt-8">
            <p className="text-xs text-gray-600 sm:text-sm">
              Payment and cancellation policy as per contract.
            </p>
          </div>
        </div>

        <DialogFooter className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-3 md:gap-8">
          {/* Payment Info */}
          <div>
            <h4 className="mb-2 text-sm font-semibold text-gray-900 sm:mb-3 sm:text-base">
              Payments
            </h4>
            <div className="space-y-1 text-xs text-gray-600 sm:text-sm">
              <p>Make checks payable to:</p>
              <p>Aina (Indira)</p>
              <p>CIMB Niaga 704 904 511 700</p>
              <p>KCP Teuku Umar - Denpasar</p>
            </div>
          </div>

          {/* Questions */}
          <div>
            <h4 className="mb-2 text-sm font-semibold text-gray-900 sm:mb-3 sm:text-base">
              Questions
            </h4>
            <div className="space-y-1 text-xs text-gray-600 sm:text-sm">
              <p>0361 4756583</p>
              <p className="break-all">info.wtmbali@gmail.com</p>
              <p>www.wtmbali.com</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-2 sm:gap-3">
            <Button
              className="w-full text-xs sm:text-sm"
              onClick={() => setUploadReceiptOpen(true)}
            >
              <IconCloudUpload className="h-4 w-4" />
              <span className="hidden sm:inline">Upload Payment Receipt</span>
              <span className="inline sm:hidden">Upload Receipt</span>
            </Button>
            {viewBtnReceipt && isReceiptAvailable && (
              <Button
                variant="outline"
                className="w-full bg-[#D0D6DB] text-xs sm:text-sm"
                onClick={() => setViewReceiptOpen(true)}
              >
                <IconReceipt className="h-4 w-4" /> View Receipt
              </Button>
            )}

            <Button
              variant="outline"
              className="w-full bg-[#D0D6DB] text-xs sm:text-sm"
              onClick={handleDownloadPDF}
              disabled={state.isGeneratingPDF}
            >
              {state.isGeneratingPDF ? (
                <>
                  <IconFileDescription className="h-4 w-4" /> Generating...
                </>
              ) : (
                <>
                  <IconFileDescription className="h-4 w-4" />
                  <span className="hidden sm:inline">
                    Download Invoice (.pdf)
                  </span>
                  <span className="inline sm:hidden">Download (.pdf)</span>
                </>
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
      <UploadReceiptDialog
        open={uploadReceiptOpen}
        onOpenChange={setUploadReceiptOpen}
        subBookingId={newInvoiceData.subBookingId}
        onSuccess={() => {
          toast.success("Receipt uploaded successfully!");
        }}
      />
      <ViewReceiptDialog
        open={viewReceiptOpen}
        onOpenChange={setViewReceiptOpen}
        booking={booking as any}
        receipt={invoice?.receipt}
        invoiceIndex={currentInvoiceIndex}
      />
    </Dialog>
  );
};

export default ViewInvoiceDialog;
