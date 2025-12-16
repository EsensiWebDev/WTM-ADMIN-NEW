"use server";

import { CreatePromoSchema } from "@/components/dashboard/promo/dialog/create-promo-dialog";
import { EditPromoSchema } from "@/components/dashboard/promo/dialog/edit-promo-dialog";
import { apiCall } from "@/lib/api";
import { revalidatePath } from "next/cache";

export async function updatePromoStatus(formData: FormData) {
  try {
    const response = await apiCall(`promos/status`, {
      method: "PUT",
      body: formData,
    });

    if (response.status !== 200) {
      return {
        success: false,
        message: response.message || "Failed to update promo status",
      };
    }

    revalidatePath("/promo", "layout");

    return {
      success: true,
      message: response.message || "Promo status updated successfully",
    };
  } catch (error) {
    console.error("Error editing promo:", error);

    // Handle API error responses with specific messages
    if (error && typeof error === "object" && "message" in error) {
      return {
        success: false,
        message: error.message as string,
      };
    }

    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to edit promo",
    };
  }
}

export async function deletePromo(promoId: string) {
  try {
    const response = await apiCall(`promos/${promoId}`, {
      method: "DELETE",
    });

    if (response.status !== 200) {
      return {
        success: false,
        message: response.message || "Failed to remove promo",
      };
    }

    revalidatePath("/promo", "layout");

    return {
      success: true,
      message: response.message || "Promo has been successfully removed",
    };
  } catch (error) {
    console.error("Error removing promo :", error);

    // Handle API error responses with specific messages
    if (error && typeof error === "object" && "message" in error) {
      return {
        success: false,
        message: error.message as string,
      };
    }

    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to remove promo",
    };
  }
}

export async function createPromo(input: CreatePromoSchema) {
  try {
    // For fixed price promo type (2), use prices if available, otherwise fall back to detail
    let detailValue: string;
    if (input.promo_type === "2" && input.prices && Object.keys(input.prices).length > 0) {
      // Multi-currency prices - backend expects prices in the detail field as JSON or separate prices field
      // For now, we'll send both detail (for backward compatibility) and prices
      detailValue = input.prices.IDR?.toString() || "0";
    } else {
      detailValue = input.detail?.toString() || "";
    }

    const body: any = {
      description: input.description,
      detail: detailValue,
      end_date: input.end_date,
      promo_code: input.promo_code,
      promo_name: input.promo_name,
      promo_type: Number(input.promo_type),
      room_types: [
        {
          room_type_id: Number(input.room_type_id),
          total_night: input.total_night,
        },
      ],
      start_date: input.start_date,
    };

    // Add prices if it's a fixed price promo and prices are provided
    if (input.promo_type === "2" && input.prices && Object.keys(input.prices).length > 0) {
      body.prices = input.prices;
    }

    const response = await apiCall("promos", {
      method: "POST",
      body: JSON.stringify(body),
    });

    if (response.status !== 200) {
      return {
        success: false,
        message: response.message || "Failed to create promo",
      };
    }

    revalidatePath("/promo", "layout");

    return {
      success: true,
      message: response.message || "Promo created",
    };
  } catch (error) {
    console.error("Error creating promo:", error);

    // Handle API error responses with specific messages
    if (error && typeof error === "object" && "message" in error) {
      return {
        success: false,
        message: error.message as string,
      };
    }

    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to create promo",
    };
  }
}

export async function editPromo(input: EditPromoSchema & { id: string }) {
  try {
    // For fixed price promo type (2), use prices if available, otherwise fall back to detail
    let detailValue: string;
    if (input.promo_type === "2" && input.prices && Object.keys(input.prices).length > 0) {
      detailValue = input.prices.IDR?.toString() || "0";
    } else {
      detailValue = input.detail?.toString() || "";
    }

    const body: any = {
      description: input.description,
      detail: detailValue,
      end_date: input.end_date,
      is_active: input.is_active,
      promo_code: input.promo_code,
      promo_name: input.promo_name,
      promo_type: Number(input.promo_type),
      room_types: [
        {
          room_type_id: Number(input.room_type_id),
          total_night: input.total_night,
        },
      ],
      start_date: input.start_date,
    };

    // Add prices if it's a fixed price promo and prices are provided
    if (input.promo_type === "2" && input.prices && Object.keys(input.prices).length > 0) {
      body.prices = input.prices;
    }

    const response = await apiCall(`promos/${input.id}`, {
      method: "PUT",
      body: JSON.stringify(body),
    });

    if (response.status !== 200) {
      return {
        success: false,
        message: response.message || "Failed to edit promo",
      };
    }

    revalidatePath("/promo", "layout");

    return {
      success: true,
      message: response.message || "Promo edited",
    };
  } catch (error) {
    console.error("Error editing promo:", error);

    // Handle API error responses with specific messages
    if (error && typeof error === "object" && "message" in error) {
      return {
        success: false,
        message: error.message as string,
      };
    }

    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to edit promo",
    };
  }
}
