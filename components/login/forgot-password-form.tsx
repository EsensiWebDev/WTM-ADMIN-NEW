"use client";

import { forgotPasswordAction } from "@/app/forgot-password/actions";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader, CheckCircle, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import React from "react";
import { useForm } from "react-hook-form";
import z from "zod";
import {
  IconAlertCircleFilled,
  IconCircleCheckFilled,
} from "@tabler/icons-react";

const forgotPasswordSchema = z.object({
  email: z
    .string()
    .email("Please enter a valid email address")
    .min(1, "Email is required"),
});

type ForgotPasswordSchema = z.infer<typeof forgotPasswordSchema>;

type ForgotPasswordFormProps = React.ComponentProps<"div">;

type DialogState = {
  open: boolean;
  type: "success" | "error";
  title: string;
  message: string;
};

export function ForgotPasswordForm({
  className,
  ...props
}: ForgotPasswordFormProps) {
  const [isPending, startTransition] = React.useTransition();
  const router = useRouter();
  const [dialog, setDialog] = React.useState<DialogState>({
    open: false,
    type: "success",
    title: "",
    message: "",
  });

  const form = useForm<ForgotPasswordSchema>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  function onSubmit(input: ForgotPasswordSchema) {
    startTransition(async () => {
      try {
        const result = await forgotPasswordAction(input.email);

        if (!result.success) {
          setDialog({
            open: true,
            type: "error",
            title: "Error",
            message: result.message || "An error occurred. Please try again.",
          });
          return;
        }

        setDialog({
          open: true,
          type: "success",
          title: "Success",
          message:
            result.message || "Password reset link has been sent to your email",
        });
        form.reset();
      } catch (err) {
        console.error("Forgot password error:", err);
        setDialog({
          open: true,
          type: "error",
          title: "Error",
          message: "An error occurred. Please try again.",
        });
      }
    });
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>Forgot your password?</CardTitle>
          <CardDescription>
            Enter your email address and we'll send you a link to reset your
            password
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-3">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email address"
                  {...form.register("email")}
                  disabled={isPending}
                />
                {form.formState.errors.email && (
                  <p className="text-sm text-red-600">
                    {form.formState.errors.email.message}
                  </p>
                )}
              </div>
              <div className="flex flex-col gap-3">
                <Button type="submit" className="w-full" disabled={isPending}>
                  {isPending && (
                    <Loader className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {isPending ? "Sending..." : "Send Reset Link"}
                </Button>
              </div>
              <div className="text-center">
                <a
                  href="/login"
                  className="text-sm underline-offset-4 hover:underline"
                >
                  Back to login
                </a>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>

      <Dialog
        open={dialog.open}
        onOpenChange={(open) => setDialog({ ...dialog, open })}
      >
        <DialogContent className="text-center" showCloseButton={false}>
          <DialogHeader className="flex flex-col items-center gap-4">
            <div>
              {dialog.type === "success" ? (
                <IconCircleCheckFilled className="mx-auto h-12 w-12 text-green-600" />
              ) : (
                <IconAlertCircleFilled className="mx-auto h-12 w-12 text-red-600" />
              )}
            </div>
            <DialogTitle
              className={
                dialog.type === "success" ? "text-green-600" : "text-red-600"
              }
            >
              {dialog.title}
            </DialogTitle>
            <DialogDescription>{dialog.message}</DialogDescription>
          </DialogHeader>
          <div className="flex justify-center">
            <Button onClick={() => setDialog({ ...dialog, open: false })}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
