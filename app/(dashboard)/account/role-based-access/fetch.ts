import { Action, RoleBasedAccessTableResponse } from "./types";

export const getRoleBasedAccessData =
  async (): Promise<RoleBasedAccessTableResponse> => {
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const data = [
      {
        id: "1",
        name: "Page 1",
        actions: [
          {
            action: "View" as Action,
            permissions: { Admin: true, Agent: true, Support: true },
          },
          {
            action: "Create" as Action,
            permissions: { Admin: true, Agent: true, Support: false },
          },
          {
            action: "Edit" as Action,
            permissions: { Admin: true, Agent: true, Support: false },
          },
          {
            action: "Delete" as Action,
            permissions: { Admin: true, Agent: false, Support: false },
          },
          {
            action: "Confirmation" as Action,
            permissions: { Admin: true, Agent: false, Support: false },
          },
        ],
      },
      {
        id: "2",
        name: "Page 2",
        actions: [
          {
            action: "View" as Action,
            permissions: { Admin: true, Agent: false, Support: false },
          },
          {
            action: "Create" as Action,
            permissions: { Admin: true, Agent: false, Support: false },
          },
          {
            action: "Edit" as Action,
            permissions: { Admin: true, Agent: false, Support: false },
          },
          {
            action: "Delete" as Action,
            permissions: { Admin: true, Agent: false, Support: false },
          },
          {
            action: "Confirmation" as Action,
            permissions: { Admin: true, Agent: false, Support: false },
          },
        ],
      },
    ];

    return {
      success: true,
      data,
      pageCount: 1,
    };
  };
