"use server";

import { CreateAgentSchema } from "@/components/dashboard/account/agent-control/dialog/create-agent-control-dialog";
import { EditAgentSchema } from "@/components/dashboard/account/agent-control/dialog/edit-agent-control-dialog";
import { apiCall } from "@/lib/api";
import { revalidatePath } from "next/cache";

export async function updateAgentStatus(agentId: string, status: string) {
  console.table({ agentId, status: status.toLowerCase() === "active" });

  try {
    const body = {
      id: Number(agentId),
      is_active: status.toLowerCase() === "active",
    };

    const response = await apiCall(`users/status`, {
      method: "POST",
      body: JSON.stringify(body),
    });


    if (response.status !== 200) {
      return {
        success: false,
        message: response.message || "Failed to update user status",
      };
    }

    revalidatePath("/account/agent-overview/agent-control", "layout");

    return {
      success: true,
      message: response.message || "User status updated successfully",
    };
  } catch (error) {
    console.error("Error updating user status:", error);

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
        error instanceof Error ? error.message : "Failed to update user status",
    };
  }
}

export async function deleteAgent(agentId: string) {
  // Simulate API call delay
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Simulate success response
  return { success: true, message: `Agent deleted` };
}

export async function createAgent(input: CreateAgentSchema) {

  // Simulate API call delay
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Simulate success response
  return { success: true, message: `Agent created` };
}

export async function editAgent(input: EditAgentSchema & { id: string }) {

  // Simulate API call delay
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Simulate success response
  return { success: true, message: `Agent edited` };
}
