"use client";

import { columns } from "@/components/dashboard/account/user-management/super-admin/columns";
import { DataTable } from "@/components/dashboard/account/user-management/super-admin/data-table";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSuperAdminUsers } from "@/hooks/use-users";

const UserManagement = () => {
  const { data: users, isLoading, error, refetch } = useSuperAdminUsers();

  if (isLoading) {
    return (
      <div className="space-y-8">
        <h1 className="text-3xl font-bold">User Management</h1>
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center gap-2">
            <LoadingSpinner />
            <span className="text-lg">Loading users...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-8">
        <h1 className="text-3xl font-bold">User Management</h1>
        <div className="flex items-center justify-center h-64">
          <div className="text-center space-y-4">
            <div className="text-lg text-red-600">Error loading users</div>
            <Button onClick={() => refetch()}>Try Again</Button>
          </div>
        </div>
      </div>
    );
  }

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
          <DataTable data={users || []} columns={columns} />
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
