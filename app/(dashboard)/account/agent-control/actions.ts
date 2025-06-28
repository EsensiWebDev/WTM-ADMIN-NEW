"use server";

export async function updateAgentStatus(agentId: string, status: string) {
  // Simulate API call delay
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Simulate success response
  return { success: true, message: `Agent status updated to ${status}` };
}
