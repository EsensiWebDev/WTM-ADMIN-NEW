"use client";

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
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader } from "lucide-react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";

const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

type LoginSchema = z.infer<typeof loginSchema>;

type LoginFormProps = React.ComponentProps<"div"> & {
  callbackUrl?: string;
};

export function LoginForm({
  className,
  callbackUrl,
  ...props
}: LoginFormProps) {
  const [isPending, startTransition] = React.useTransition();
  const router = useRouter();
  const safeCallbackUrl = React.useMemo(() => {
    if (!callbackUrl) return null;
    const trimmed = callbackUrl.trim();

    if (!trimmed.startsWith("/")) return null;
    if (trimmed.startsWith("//")) return null;

    return trimmed;
  }, [callbackUrl]);

  const form = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  function onSubmit(input: LoginSchema) {
    startTransition(async () => {
      try {
        const result = await signIn("credentials", {
          redirect: false,
          username: input.username,
          password: input.password,
          callbackUrl: safeCallbackUrl ?? undefined,
        });

        if (result?.error) {
          const message =
            result.error === "CredentialsSignin"
              ? "Invalid username or password"
              : result.error;
          toast.error(message || "Login failed. Please try again.");
          return;
        }

        if (result?.ok) {
          toast.success("Login successful");
          router.push(
            safeCallbackUrl ?? "/account/user-management/super-admin"
          );
        } else {
          toast.error("Login failed. Please try again.");
        }
      } catch (err) {
        console.error("Login error:", err);
        toast.error("An error occurred. Please try again.");
      }
    });
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>Login to your account</CardTitle>
          <CardDescription>
            Enter your credentials below to login to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-3">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Enter your username"
                  {...form.register("username")}
                  disabled={isPending}
                />
                {form.formState.errors.username && (
                  <p className="text-sm text-red-600">
                    {form.formState.errors.username.message}
                  </p>
                )}
              </div>
              <div className="grid gap-3">
                <div className="flex items-center">
                  <Label htmlFor="password">Password</Label>
                  <a
                    href="/forgot-password"
                    className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                  >
                    Forgot your password?
                  </a>
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  {...form.register("password")}
                  disabled={isPending}
                />
                {form.formState.errors.password && (
                  <p className="text-sm text-red-600">
                    {form.formState.errors.password.message}
                  </p>
                )}
              </div>
              <div className="flex flex-col gap-3">
                <Button type="submit" className="w-full" disabled={isPending}>
                  {isPending && (
                    <Loader className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {isPending ? "Logging in..." : "Login"}
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
