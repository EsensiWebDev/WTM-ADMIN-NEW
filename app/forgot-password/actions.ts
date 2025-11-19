"use server";

import { z } from "zod";

const AUTH_API_BASE_URL =
  process.env.AUTH_API_BASE_URL ?? "http://54.255.206.242:4816/api";

const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

export async function forgotPasswordAction(email: string) {
  try {
    // Validate email
    const validatedData = forgotPasswordSchema.parse({ email });

    const body = {
      email: validatedData.email,
    };

    console.log({ body });

    const response = await fetch(`${AUTH_API_BASE_URL}/forgot-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      cache: "no-store",
    });

    console.log("Password reset requested for:", validatedData.email);

    if (!response.ok) {
      const errorData = await response.json();

      return {
        success: false,
        message:
          errorData.message ||
          "Reset password success! you will receive a password reset link shortly",
      };
    }

    const data = await response.json();

    return {
      success: true,
      message:
        data.message ||
        "Reset password success! you will receive a password reset link shortly",
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        error: error.errors[0].message || "Invalid email address",
      };
    }

    console.error("Forgot password action error:", error);
    return {
      error:
        "An error occurred while processing your request. Please try again.",
    };
  }
}
