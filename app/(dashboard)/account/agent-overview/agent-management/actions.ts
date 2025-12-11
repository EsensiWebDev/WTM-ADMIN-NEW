"use server";

import { apiCall } from "@/lib/api";
import { ExportConfigs } from "@/lib/export-client";
import { ExportService } from "@/lib/export-service";
import { ExportColumn, ExportFormat, ExportResult } from "@/lib/export-types";
import { SearchParams } from "@/types";
import { revalidatePath } from "next/cache";
import { getAgentData } from "./fetch";
import { Agent } from "./types";

export async function updatePromoGroup(
  agentId: number,
  promo_group_id: number
) {
  console.log("Update Agent Promo Group");
  await new Promise((resolve) => setTimeout(resolve, 1000));
  return {
    success: true,
    message: `Agent(${agentId}) Promo Group updated to ${promo_group_id}`,
  };
}

export async function deleteAgent(agentId: string) {
  console.log(`Delete Agent: ${agentId}`);
  await new Promise((resolve) => setTimeout(resolve, 1000));
  return { success: true, message: `Agent deleted` };
}

export async function createAgent(formData: FormData) {
  try {
    const response = await apiCall("users", {
      method: "POST",
      body: formData,
    });

    if (response.status !== 200) {
      return {
        success: false,
        message: response.message || "Failed to create agent",
      };
    }

    revalidatePath("/account/agent-overview", "layout");

    return {
      success: true,
      message: response.message ?? `Agent created`,
    };
  } catch (error) {
    console.error("Error creating agent:", error);

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
        error instanceof Error ? error.message : "Failed to create admin",
    };
  }
}

export async function editAgent(formData: FormData) {
  console.log("Edit Agent:");

  try {
    const response = await apiCall("users", {
      method: "PUT",
      body: formData,
    });

    if (response.status !== 200) {
      return {
        success: false,
        message: response.message || "Failed to edit agent",
      };
    }

    revalidatePath("/account/agent-overview", "layout");

    return {
      success: true,
      message: response.message ?? `Agent edited`,
    };
  } catch (error) {
    console.error("Error editing agent:", error);

    // Handle API error responses with specific messages
    if (error && typeof error === "object" && "message" in error) {
      return {
        success: false,
        message: error.message as string,
      };
    }

    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to edit admin",
    };
  }
}

// Define columns for export
const exportColumns: ExportColumn<Agent>[] = [
  {
    key: "id",
    header: "ID",
    accessor: (item) => item.id,
    width: 8,
  },
  {
    key: "name",
    header: "Name",
    accessor: (item) => item.name,
    width: 20,
  },
  {
    key: "company",
    header: "Company",
    accessor: (item) => item.agent_company_name,
    width: 25,
  },
  {
    key: "promo_group",
    header: "Promo Group",
    accessor: (item) => item.promo_group_id,
    width: 15,
  },
  {
    key: "email",
    header: "Email",
    accessor: (item) => item.email,
    width: 30,
  },
  {
    key: "kakao_id",
    header: "Kakao ID",
    accessor: (item) => item.kakao_talk_id,
    width: 15,
  },
  {
    key: "phone",
    header: "Phone",
    accessor: (item) => item.phone_number,
    width: 15,
  },
  {
    key: "status",
    header: "Status",
    accessor: (item) => item.status,
    formatter: (value) => (value ? "Active" : "Inactive"),
    width: 10,
  },
];

export async function exportAgent(
  searchParams: SearchParams,
  format: ExportFormat = "csv"
): Promise<ExportResult> {
  try {
    const exportSearchParams = {
      ...searchParams,
      limit: "0",
    };

    console.log("Export request:", { searchParams, format });

    const { data, status, message } = await getAgentData({
      searchParams: exportSearchParams,
    });

    if (status !== 200) {
      throw new Error(message);
      // return { success: false, message: message || "Failed to export data" };
    }

    return await ExportService.exportData(
      data,
      exportColumns,
      ExportConfigs.agentList,
      format
    );
  } catch (error) {
    console.error("Error exporting agent data:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to export data",
    };
  }
}
