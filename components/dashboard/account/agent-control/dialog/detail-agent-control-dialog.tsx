"use client";

// import type { Task } from "@/db/schema";
import type { Row } from "@tanstack/react-table";
import { Loader } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";

import { updateAgentStatus } from "@/app/(dashboard)/account/agent-overview/agent-control/actions";
import { AgentControl } from "@/app/(dashboard)/account/agent-overview/agent-control/types";
import { ImageGrid } from "@/components/dashboard/account/agent-control/image-grid";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatUrl } from "@/lib/format";

interface DetailAgentControlDialogProps
  extends React.ComponentPropsWithoutRef<typeof Dialog> {
  agentControl: Row<AgentControl>["original"] | null;
  onSuccess?: () => void;
}

// Helper function to validate if a string is an absolute URL
function isValidAbsoluteUrl(url: string): boolean {
  // If URL starts with "54.255.206.242", it's not a valid absolute URL yet (missing protocol)
  if (url.startsWith("54.255.206.242")) {
    return false;
  }

  try {
    const parsedUrl = new URL(url);
    return parsedUrl.protocol === "http:" || parsedUrl.protocol === "https:";
  } catch {
    return false;
  }
}

export function DetailAgentControlDialog({
  agentControl,
  onSuccess,
  ...props
}: DetailAgentControlDialogProps) {
  const [isUpdatePending, startUpdateTransition] = React.useTransition();
  const [variant, setVariant] = React.useState<"active" | "rejected" | null>(
    null
  );

  // Map agentControl data to images array for ImageGrid
  const images = agentControl
    ? [
        {
          title: "Agent Selfie Photo",
          src: formatUrl(agentControl.photo) || "",
          alt: "Agent Selfie Photo",
        },
        {
          title: "Identity Card",
          src: formatUrl(agentControl.id_card) || "",
          alt: "Identity Card",
        },
        {
          title: "Certificate",
          src: formatUrl(agentControl.certificate) || "",
          alt: "Certificate",
        },
        {
          title: "Name Card",
          src: formatUrl(agentControl.name_card) || "",
          alt: "Name Card",
        },
      ]
    : [];

  function onUpdate({ variant }: { variant: "active" | "rejected" }) {
    setVariant(variant);

    if (!agentControl) return;

    startUpdateTransition(async () => {
      const { success, message } = await updateAgentStatus(
        agentControl.id.toString(),
        variant
      );
      if (!success) {
        toast.error(message || "Failed to update agent status");
        return;
      }

      toast.success(message || "Agent status updated successfully");

      props.onOpenChange?.(false);
      onSuccess?.();
      setVariant(null);
    });
  }

  return (
    <Dialog {...props}>
      <DialogContent className="sm:max-w-6xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="sr-only">Detail Agent Control</DialogTitle>
        </DialogHeader>
        <div className="overflow-y-auto flex-grow">
          <ImageGrid images={images} />
        </div>
        <DialogFooter className="gap-2 sm:space-x-0 sm:justify-center">
          <Button
            aria-label="Approve Agent"
            onClick={() => onUpdate({ variant: "active" })}
            disabled={isUpdatePending || !agentControl}
          >
            {variant === "active" && isUpdatePending && (
              <Loader className="mr-2 size-4 animate-spin" aria-hidden="true" />
            )}
            Approve
          </Button>
          <Button
            aria-label="Reject Agent"
            variant="destructive"
            onClick={() => onUpdate({ variant: "rejected" })}
            disabled={isUpdatePending || !agentControl}
          >
            {variant === "rejected" && isUpdatePending && (
              <Loader className="mr-2 size-4 animate-spin" aria-hidden="true" />
            )}
            Reject
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
