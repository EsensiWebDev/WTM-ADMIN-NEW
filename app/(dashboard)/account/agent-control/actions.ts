"use server";

import { CreateAgentSchema } from "@/components/dashboard/account/agent-control/dialog/create-agent-control-dialog";
import { EditAgentSchema } from "@/components/dashboard/account/agent-control/dialog/edit-agent-control-dialog";

export async function updateAgentStatus(agentId: string, status: string) {
  console.log("Update Agent Status");
  // Simulate API call delay
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Simulate success response
  return { success: true, message: `Agent status updated to ${status}` };
}

export async function deleteAgent(agentId: string) {
  console.log("Delete Agent");
  // Simulate API call delay
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Simulate success response
  return { success: true, message: `Agent deleted` };
}

export async function createAgent(input: CreateAgentSchema) {
  console.log("Create Agent:");
  console.log({ input });

  // Simulate API call delay
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Simulate success response
  return { success: true, message: `Agent created` };
}

export async function editAgent(input: EditAgentSchema & { id: string }) {
  console.log("Edit Agent:");
  console.log({ input });

  // Simulate API call delay
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Simulate success response
  return { success: true, message: `Agent edited` };
}
