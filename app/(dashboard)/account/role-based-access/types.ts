export interface RoleAccess {
  role: string;
  access: Record<string, Record<string, boolean>>;
}

export interface Access {
  account: Actions;
  booking: Actions;
  hotel: Actions;
  promo: Actions;
  "promo-group": Actions;
  report: Actions;
}

export interface Actions {
  create: boolean;
  delete: boolean;
  edit: boolean;
  view: boolean;
}

export type Action = string;

export type ModuleKey = string;

// UI representation for the table
export interface RoleBasedAccessPageData {
  id: string;
  name: string;
  actions: {
    action: string;
    actionKey: string;
    permissions: Record<string, boolean>;
  }[];
}
