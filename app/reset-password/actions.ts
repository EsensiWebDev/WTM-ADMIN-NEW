"use server";

import { z } from "zod";

const AUTH_API_BASE_URL =
  process.env.AUTH_API_BASE_URL ?? "http://54.255.206.242:4816/api";

const resetPasswordSchema = z.object({
  token: z.string().min(1, "Token is required"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
});

type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

export async function resetPasswordAction(token: string, password: string) {
  try {
    // Validate input
    const validatedData = resetPasswordSchema.parse({ token, password });

    const body = {
      token: validatedData.token,
      password: validatedData.password,
    };

    const response = await fetch(`${AUTH_API_BASE_URL}/reset-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      cache: "no-store",
    });


    if (!response.ok) {
      const errorData = await response.json();

      return {
        success: false,
        message:
          errorData.message || "Failed to reset password. Please try again.",
      };
    }

    const data = await response.json();

    return {
      success: true,
      message: data.message || "Your password has been reset successfully.",
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        message: error.errors[0].message || "Invalid input data",
      };
    }

    console.error("Reset password action error:", error);
    return {
      success: false,
      message:
        "An error occurred while processing your request. Please try again.",
    };
  }
}
