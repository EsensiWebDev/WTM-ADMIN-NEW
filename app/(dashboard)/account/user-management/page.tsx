import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Suspense } from "react";
import { userSuperAdmin } from "./data-super-admin";
import TableSuperAdmin from "./table-super-admin";

export const getData = async () => {
  await new Promise((resolve) => setTimeout(resolve, 1000));
  return userSuperAdmin.splice(1, 5);
};

const UserManagement = async () => {
  // const { data: users, isLoading, error, refetch } = useSuperAdminUsers();

  const promise = getData();

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">User Management</h1>
      </div>

      <Tabs
        defaultValue="super_admin"
        className="w-full flex-col justify-start gap-6"
      >
        <TabsList>
          <TabsTrigger value="super_admin">super_admin</TabsTrigger>
          <TabsTrigger value="agent">agent</TabsTrigger>
          <TabsTrigger value="admin">admin</TabsTrigger>
          <TabsTrigger value="support">support</TabsTrigger>
        </TabsList>
        <TabsContent value="super_admin">
          {/* <DataTable data={users || []} columns={columns} /> */}
          <Suspense fallback="Loading...">
            <TableSuperAdmin promise={promise} />
          </Suspense>
        </TabsContent>
        <TabsContent value="agent">
          <div className="aspect-video w-full flex-1 rounded-lg border border-dashed justify-center flex items-center text-xl">
            Agent
          </div>
        </TabsContent>
        <TabsContent value="admin">
          <div className="aspect-video w-full flex-1 rounded-lg border border-dashed justify-center flex items-center text-xl">
            admin
          </div>
        </TabsContent>
        <TabsContent value="support">
          <div className="aspect-video w-full flex-1 rounded-lg border border-dashed justify-center flex items-center text-xl">
            support
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UserManagement;
