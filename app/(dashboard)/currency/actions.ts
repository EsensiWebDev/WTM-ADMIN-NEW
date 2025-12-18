"use server";

import { CreateCurrencySchema } from "@/components/dashboard/currency/dialog/create-currency-dialog";
import { EditCurrencySchema } from "@/components/dashboard/currency/dialog/edit-currency-dialog";
import { apiCall } from "@/lib/api";
import { revalidatePath } from "next/cache";

export async function createCurrency(input: CreateCurrencySchema) {
  try {
    const body = {
      code: input.code.toUpperCase(),
      name: input.name,
      symbol: input.symbol,
      is_active: input.is_active ?? true,
    };

    const response = await apiCall("currencies", {
      method: "POST",
      body: JSON.stringify(body),
    });

    if (response.status !== 200) {
      return {
        success: false,
        message: response.message || "Failed to create currency",
      };
    }

    revalidatePath("/currency", "layout");

    return {
      success: true,
      message: response.message || "Currency created successfully",
    };
  } catch (error) {
    console.error("Error creating currency:", error);

    if (error && typeof error === "object" && "message" in error) {
      return {
        success: false,
        message: error.message as string,
      };
    }

    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to create currency",
    };
  }
}

export async function editCurrency(input: EditCurrencySchema & { id: string }) {
  try {
    const body = {
      name: input.name,
      symbol: input.symbol,
      is_active: input.is_active,
    };

    const response = await apiCall(`currencies/${input.id}`, {
      method: "PUT",
      body: JSON.stringify(body),
    });

    if (response.status !== 200) {
      return {
        success: false,
        message: response.message || "Failed to update currency",
      };
    }

    revalidatePath("/currency", "layout");

    return {
      success: true,
      message: response.message || "Currency updated successfully",
    };
  } catch (error) {
    console.error("Error updating currency:", error);

    if (error && typeof error === "object" && "message" in error) {
      return {
        success: false,
        message: error.message as string,
      };
    }

    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to update currency",
    };
  }
}

