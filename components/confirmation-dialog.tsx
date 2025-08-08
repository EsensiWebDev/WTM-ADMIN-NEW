import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { AlertTriangle, Loader, type LucideIcon } from "lucide-react";

interface ConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading: boolean;
  title?: string;
  description?: string;
  children?: React.ReactNode; // Custom content (e.g., reason textarea)
  confirmDisabled?: boolean;
  icon?: LucideIcon;
  iconClassName?: string;
}

/**
 * A generic confirmation dialog for critical actions.
 */
export function ConfirmationDialog({
  open,
  onOpenChange,
  onConfirm,
  onCancel,
  isLoading,
  title = "Confirm Changes",
  description = "Are you sure you want to save the changes?",
  children,
  confirmDisabled,
  icon: Icon = AlertTriangle,
  iconClassName,
}: ConfirmationDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>{null}</DialogTrigger>
      <DialogContent showCloseButton={false}>
        <div className="flex flex-col items-center text-center gap-1">
          {Icon && (
            <Icon
              className={cn("mb-2 size-10 text-yellow-500", iconClassName)}
              aria-hidden="true"
            />
          )}
          <DialogTitle>{title}</DialogTitle>
          <div className="my-2 w-full">
            <div className="border-t border-muted-foreground/20 w-full" />
          </div>
          <DialogDescription className="whitespace-pre-line">
            {description}
          </DialogDescription>
        </div>
        {children}
        <DialogFooter className="sm:justify-center">
          <Button variant="outline" onClick={onCancel} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={onConfirm} disabled={isLoading || confirmDisabled}>
            {isLoading && (
              <Loader className="mr-2 size-4 animate-spin" aria-hidden="true" />
            )}
            Apply Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
