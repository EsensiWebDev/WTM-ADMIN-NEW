"use server";

export async function updateRBA({
  pageId,
  roleId,
  status,
}: {
  pageId: string;
  roleId: string;
  status: boolean;
}) {
  console.log(`Update pageId:${pageId} roleId:${roleId}  Status:${status}`);
  await new Promise((resolve) => setTimeout(resolve, 1000));
  return {
    success: true,
    message: `${pageId}:${roleId} status updated to ${
      status ? "Active" : "Inactive"
    }`,
  };
}

export async function createRoleBasedAccessPage(input: any) {
  console.log("Create Role Based Access Page:", input);
  await new Promise((resolve) => setTimeout(resolve, 1000));
  return { success: true, message: `Role Based Access Page created` };
}

export async function editRoleBasedAccessPage(input: any) {
  console.log("Edit Role Based Access Page:", input);
  await new Promise((resolve) => setTimeout(resolve, 1000));
  return { success: true, message: `Role Based Access Page edited` };
}

export async function deleteRoleBasedAccessPage(id: string) {
  console.log("Delete Role Based Access Page:", id);
  await new Promise((resolve) => setTimeout(resolve, 1000));
  return { success: true, message: `Role Based Access Page deleted` };
}
