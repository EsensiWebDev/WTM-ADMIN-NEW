"use client";

import { BookingSummary } from "@/app/(dashboard)/booking-management/booking-summary/types";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatUrl } from "@/lib/format";
import {
  IconChevronLeft,
  IconChevronRight,
  IconFileText,
} from "@tabler/icons-react";
import Image from "next/image";
import React, { useState } from "react";
import { toast } from "sonner";

interface ViewReceiptDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  receipts?: string[] | null;
  booking?: BookingSummary | null;
  invoiceIndex?: number;
}

const ViewReceiptDialog: React.FC<ViewReceiptDialogProps> = ({
  open,
  onOpenChange,
  receipts: receiptsProp,
  booking,
  invoiceIndex,
}) => {
  const [currentReceiptIndex, setCurrentReceiptIndex] = useState(0);

  // Reset index when dialog opens/closes or receipts change
  React.useEffect(() => {
    if (open) {
      setCurrentReceiptIndex(0);
    }
  }, [open, receiptsProp, booking]);

  // Priority: use receipts prop directly, then booking receipts, then empty array
  const allReceipts = receiptsProp || booking?.receipts || [];
  const receipts =
    invoiceIndex !== undefined && allReceipts[invoiceIndex]
      ? [allReceipts[invoiceIndex]]
      : allReceipts;
  const hasReceipts = receipts.length > 0;
  const currentReceipt = receipts[currentReceiptIndex];
  const showNavigation = invoiceIndex === undefined && receipts.length > 1;

  const navigateToPrevious = () => {
    if (currentReceiptIndex > 0) {
      setCurrentReceiptIndex(currentReceiptIndex - 1);
    }
  };

  const navigateToNext = () => {
    if (currentReceiptIndex < receipts.length - 1) {
      setCurrentReceiptIndex(currentReceiptIndex + 1);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] min-w-4xl overflow-y-auto bg-white px-8">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <IconFileText className="h-5 w-5" />
              Payment Receipt
            </div>

            {/* Navigation arrows for multiple receipts */}
            {showNavigation && (
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={navigateToPrevious}
                  disabled={currentReceiptIndex === 0}
                  className="h-8 w-8 p-0"
                >
                  <IconChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-muted-foreground text-sm font-normal">
                  {currentReceiptIndex + 1} of {receipts.length}
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={navigateToNext}
                  disabled={currentReceiptIndex === receipts.length - 1}
                  className="h-8 w-8 p-0"
                >
                  <IconChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Receipt Display */}
          {hasReceipts ? (
            <div className="space-y-4">
              {/* Receipt Image Container */}
              <div className="relative overflow-x-auto rounded-lg border bg-gray-50 p-4">
                <Image
                  src={formatUrl(currentReceipt) || ""}
                  alt={`Receipt ${currentReceiptIndex + 1}`}
                  width={800}
                  height={1000}
                  className="w-full rounded-lg"
                  style={{ minWidth: "600px" }}
                  priority
                />
              </div>
            </div>
          ) : (
            <div className="flex min-h-[200px] flex-col items-center justify-center rounded-lg border border-dashed bg-gray-50 p-8">
              <IconFileText className="mb-2 h-12 w-12 text-gray-400" />
              <p className="text-center text-sm font-medium text-gray-900">
                No Receipt Available
              </p>
              <p className="text-center text-sm text-gray-600">
                No payment receipt has been uploaded for this booking yet.
              </p>
            </div>
          )}
        </div>

        <DialogFooter className="flex flex-col gap-3 sm:flex-row">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="bg-gray-100"
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ViewReceiptDialog;
