"use server";

import { CreatePromoSchema } from "@/components/dashboard/promo/dialog/create-promo-dialog";
import { EditPromoSchema } from "@/components/dashboard/promo/dialog/edit-promo-dialog";
import { apiCall } from "@/lib/api";
import { revalidatePath } from "next/cache";

export async function updatePromoStatus(promoId: string, status: boolean) {
  try {
    const body = {
      is_active: status,
    };

    const response = await apiCall(`promos/${promoId}`, {
      method: "PUT",
      body: JSON.stringify(body),
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
    const body = {
      description: input.description,
      detail: input.detail.toString(),
      end_date: input.end_date,
      is_active: input.is_active,
      promo_code: input.promo_code,
      promo_name: input.promo_name,
      promo_type: Number(input.promo_type),
      room_types: [
        {
          room_type_id: input.room_type_id,
          total_night: input.total_night,
        },
      ],
      start_date: input.start_date,
    };

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
    const body = {
      description: input.description,
      detail: input.detail.toString(),
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
