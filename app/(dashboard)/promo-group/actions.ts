"use server";

import { apiCall } from "@/lib/api";
import { revalidatePath } from "next/cache";
import { CreatePromoGroupSchema, EditPromoGroupSchema } from "./types";
import { AddMemberPromoGroupSchemaType } from "@/components/dashboard/promo-group/dialog/add-member-promo-group-dialog";
import { AddAgentCompanySchema } from "@/components/dashboard/promo-group/dialog/add-agent-company-dialog";
import { AddPromoSchemaType } from "@/components/dashboard/promo-group/dialog/add-promo-dialog";

// Define a standard response type
interface ActionResponse {
  success: boolean;
  message: string;
}
// Promo Group
export async function deletePromoGroup(input: {
  id: number;
}): Promise<ActionResponse> {
  try {
    const response = await apiCall(`promo-groups/${input.id}`, {
      method: "DELETE",
    });

    if (response.status !== 200) {
      return {
        success: false,
        message: response.message || "Failed to remove promo group promo",
      };
    }

    revalidatePath("/promo-group", "layout");

    return {
      success: true,
      message: response.message || "Promo group has been successfully removed",
    };
  } catch (error) {
    console.error("Error removing promo group promo:", error);

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
        error instanceof Error
          ? error.message
          : "Failed to remove promo group promo",
    };
  }
}

export async function createPromoGroup(
  input: CreatePromoGroupSchema
): Promise<ActionResponse> {
  try {
    const body = {
      ...input,
    };

    const response = await apiCall("promo-groups", {
      method: "POST",
      body: JSON.stringify(body),
    });

    if (response.status !== 200) {
      return {
        success: false,
        message: response.message || "Failed to create promo group",
      };
    }

    revalidatePath("/promo-group", "layout");

    return {
      success: true,
      message: response.message || "Promo group created",
    };
  } catch (error) {
    console.error("Error creating promo group:", error);

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
        error instanceof Error ? error.message : "Failed to create promo group",
    };
  }
}

export async function editPromoGroup(
  input: EditPromoGroupSchema & { id: string }
): Promise<ActionResponse> {

  // Simulate API call delay
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Simulate success response
  return { success: true, message: `Promo edited` };
}

// Members
export async function addPromoGroupMembers(input: {
  promo_group_id: string;
  member_id: string;
}): Promise<ActionResponse> {
  try {
    const body = {
      promo_group_id: Number(input.promo_group_id),
      member_id: Number(input.member_id),
    };

    const response = await apiCall("promo-groups/members", {
      method: "POST",
      body: JSON.stringify(body),
    });

    if (response.status !== 200) {
      return {
        success: false,
        message: response.message || "Failed to create promo group",
      };
    }

    revalidatePath("/promo-group", "layout");

    return {
      success: true,
      message: response.message || "Members has been added",
    };
  } catch (error) {
    console.error("Error adding members to promo group:", error);

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
        error instanceof Error
          ? error.message
          : "Failed to add members to promo group",
    };
  }
}

export async function addPromoGroupMembersByAgentCompany(
  input: AddAgentCompanySchema & { promo_group_id: string }
): Promise<ActionResponse> {
  try {
    const body = {
      promo_group_id: Number(input.promo_group_id),
      agent_company_id: Number(input.agent_company_id),
    };

    const response = await apiCall("promo-groups/members", {
      method: "POST",
      body: JSON.stringify(body),
    });

    if (response.status !== 200) {
      return {
        success: false,
        message: response.message || "Failed to create promo group",
      };
    }

    revalidatePath("/promo-group/[slug]/edit", "layout");

    return {
      success: true,
      message: response.message || "Members has been added",
    };
  } catch (error) {
    console.error("Error adding members to promo group:", error);

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
        error instanceof Error
          ? error.message
          : "Failed to add members to promo group",
    };
  }
}

export async function removePromoGroupMembers(input: {
  member_id: number;
  promo_group_id: number;
}): Promise<ActionResponse> {
  try {
    const body = {
      ...input,
    };

    const response = await apiCall("promo-groups/members", {
      method: "DELETE",
      body: JSON.stringify(body),
    });

    if (response.status !== 200) {
      return {
        success: false,
        message: response.message || "Failed to remove promo group member",
      };
    }

    revalidatePath("/promo-group/[slug]/edit", "layout");

    return {
      success: true,
      message: response.message || "Members has been removed",
    };
  } catch (error) {
    console.error("Error removing promo group member:", error);

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
        error instanceof Error
          ? error.message
          : "Failed to add members to promo group",
    };
  }
}

// Promos
export async function addPromoGroupPromos(
  input: AddPromoSchemaType & { promo_group_id: string }
) {
  try {
    const body = {
      promo_group_id: Number(input.promo_group_id),
      promo_id: Number(input.promo_id),
    };

    const response = await apiCall("promo-groups/promo", {
      method: "POST",
      body: JSON.stringify(body),
    });

    if (response.status !== 200) {
      return {
        success: false,
        message: response.message || "Failed to add promo to promo group",
      };
    }

    revalidatePath("/promo-group/[slug]/edit", "layout");

    return {
      success: true,
      message: response.message || "Promo has been added",
    };
  } catch (error) {
    console.error("Error adding promo to promo group:", error);

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
        error instanceof Error
          ? error.message
          : "Failed to add promo to promo group",
    };
  }
}

export async function removePromoGroupPromos(input: {
  promo_id: number;
  promo_group_id: number;
}): Promise<ActionResponse> {
  try {
    const body = {
      ...input,
    };

    const response = await apiCall("promo-groups/promo", {
      method: "DELETE",
      body: JSON.stringify(body),
    });

    if (response.status !== 200) {
      return {
        success: false,
        message: response.message || "Failed to remove promo group promo",
      };
    }

    revalidatePath("/promo-group/[slug]/edit", "layout");

    return {
      success: true,
      message: response.message || "Promo has been removed",
    };
  } catch (error) {
    console.error("Error removing promo group promo:", error);

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
        error instanceof Error
          ? error.message
          : "Failed to remove promo group promo",
    };
  }
}
