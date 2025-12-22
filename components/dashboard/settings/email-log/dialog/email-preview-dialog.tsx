"use client";

import { EmailLogDetail } from "@/app/(dashboard)/email/email-log/types";
import { getEmailLogDetail } from "@/app/(dashboard)/email/email-log/fetch";
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

interface EmailPreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  emailLogId: number | null;
}

export function EmailPreviewDialog({
  open,
  onOpenChange,
  emailLogId,
}: EmailPreviewDialogProps) {
  const [emailLog, setEmailLog] = useState<EmailLogDetail | null>(null);
  const [isLoading, setIsLoading] = useState(false);

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
        toast.error(response.message || "Failed to load email details");
        onOpenChange(false);
      }
    } catch (error) {
      toast.error("Failed to load email details");
      onOpenChange(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Email Preview</DialogTitle>
        </DialogHeader>

        <div className="overflow-y-auto flex-grow space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader className="size-6 animate-spin" />
            </div>
          ) : emailLog ? (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-muted-foreground">Delivered At</Label>
                  <p className="font-medium">
                    {formatDateTimeWIB(emailLog.date_time)}
                  </p>
                </div>
                <div className="space-y-2">
                  <Label className="text-muted-foreground">From</Label>
                  <p className="font-medium text-sm text-muted-foreground">
                    System Email
                  </p>
                </div>
                <div className="space-y-2 col-span-2">
                  <Label className="text-muted-foreground">To</Label>
                  <p className="font-medium">{emailLog.to}</p>
                </div>
                <div className="space-y-2 col-span-2">
                  <Label className="text-muted-foreground">Subject</Label>
                  <p className="font-medium">{emailLog.subject}</p>
                </div>
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
              No email details found
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

