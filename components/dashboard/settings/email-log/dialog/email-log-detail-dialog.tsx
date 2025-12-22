"use client";

import { EmailLogDetail } from "@/app/(dashboard)/email/email-log/types";
import { getEmailLogDetail, retryEmail } from "@/app/(dashboard)/email/email-log/fetch";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { formatDateTimeWIB } from "@/lib/format";
import { Loader } from "lucide-react";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";

interface EmailLogDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  emailLogId: number | null;
  onSuccess?: () => void;
}

export function EmailLogDetailDialog({
  open,
  onOpenChange,
  emailLogId,
  onSuccess,
}: EmailLogDetailDialogProps) {
  const [emailLog, setEmailLog] = useState<EmailLogDetail | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  const [isRetryPending, setIsRetryPending] = useState(false);

  useEffect(() => {
    if (open && emailLogId) {
      loadEmailLogDetail();
    } else {
      setEmailLog(null);
    }
  }, [open, emailLogId]);

  const loadEmailLogDetail = async () => {
    if (!emailLogId) return;

    setIsLoading(true);
    try {
      const response = await getEmailLogDetail(emailLogId);
      // Check if response is successful (status 200-299) and has data
      if (response.status >= 200 && response.status < 300 && response.data) {
        setEmailLog(response.data);
        // Don't show success toast for loading - it's expected behavior
      } else {
        toast.error(response.message || "Failed to load email log details");
        onOpenChange(false);
      }
    } catch (error) {
      toast.error("Failed to load email log details");
      onOpenChange(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetry = async () => {
    if (!emailLogId || !emailLog) return;

    setIsRetrying(true);
    setIsRetryPending(true);

    try {
      const response = await retryEmail(emailLogId);
      // Check if response is successful and the retry operation succeeded
      if (
        response.status >= 200 &&
        response.status < 300 &&
        response.data?.success
      ) {
        toast.success(response.data.message || "Email resent successfully");
        // Reload the detail to get updated status
        await loadEmailLogDetail();
        onSuccess?.();
      } else {
        toast.error(
          response.data?.message || response.message || "Failed to resend email"
        );
      }
    } catch (error) {
      toast.error("Failed to resend email");
    } finally {
      setIsRetrying(false);
      setIsRetryPending(false);
    }
  };

  const statusVariant =
    emailLog?.status.toLowerCase() === "success"
      ? "success"
      : emailLog?.status.toLowerCase() === "failed"
      ? "failed"
      : "pending";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Email Log Details</DialogTitle>
        </DialogHeader>

        {isRetryPending && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
            <div className="bg-white rounded-lg p-6 flex flex-col items-center gap-4">
              <Loader className="size-8 animate-spin text-primary" />
              <p className="text-lg font-medium">Resending email...</p>
              <p className="text-sm text-muted-foreground">
                Please wait while we resend the email
              </p>
            </div>
          </div>
        )}

        <div className="overflow-y-auto flex-grow space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader className="size-6 animate-spin" />
            </div>
          ) : emailLog ? (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-muted-foreground">Date & Time</Label>
                  <p className="font-medium">
                    {formatDateTimeWIB(emailLog.date_time)}
                  </p>
                </div>
                <div className="space-y-2">
                  <Label className="text-muted-foreground">Status</Label>
                  <div>
                    <Badge variant={statusVariant} className="capitalize">
                      {emailLog.status}
                    </Badge>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-muted-foreground">Email Type</Label>
                  <p className="font-medium">{emailLog.email_type || "-"}</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-muted-foreground">Hotel Name</Label>
                  <p className="font-medium">{emailLog.hotel_name || "-"}</p>
                </div>
                <div className="space-y-2 col-span-2">
                  <Label className="text-muted-foreground">To</Label>
                  <p className="font-medium">{emailLog.to}</p>
                </div>
                <div className="space-y-2 col-span-2">
                  <Label className="text-muted-foreground">Subject</Label>
                  <p className="font-medium">{emailLog.subject}</p>
                </div>
                {emailLog.notes && (
                  <div className="space-y-2 col-span-2">
                    <Label className="text-muted-foreground">Notes</Label>
                    <p className="font-medium text-sm text-muted-foreground">
                      {emailLog.notes}
                    </p>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label className="text-muted-foreground">Email Body</Label>
                <div className="border rounded-md p-4 bg-muted/50 max-h-96 overflow-y-auto">
                  <div
                    dangerouslySetInnerHTML={{ __html: emailLog.body }}
                    className="prose prose-sm max-w-none"
                  />
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No email log details found
            </div>
          )}
        </div>

        <DialogFooter>
          {emailLog?.status.toLowerCase() === "failed" && (
            <Button
              onClick={handleRetry}
              disabled={isRetrying || isLoading}
              variant="default"
            >
              {isRetrying && (
                <Loader className="mr-2 size-4 animate-spin" />
              )}
              Retry Email
            </Button>
          )}
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

