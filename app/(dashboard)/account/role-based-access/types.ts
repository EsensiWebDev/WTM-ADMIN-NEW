export type Role = "Admin" | "Agent" | "Support";

export type Action = "View" | "Create" | "Edit" | "Delete" | "Confirmation";

export interface PageAction {
  action: Action;
  permissions: Record<Role, boolean>;
}

export interface RoleBasedAccessPageData {
  id: string;
  name: string;
  actions: PageAction[];
}

export interface RoleBasedAccessTableResponse {
  success: boolean;
  data: RoleBasedAccessPageData[];
  pageCount: number;
}
