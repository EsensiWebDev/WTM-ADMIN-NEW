import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CirclePlus, Search } from "lucide-react";
import React from "react";

import data from "./data.json";
import DataTable from "./data-table";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const tabs = [
  {
    label: "Super Admin",
    key: "super_admin",
  },
  {
    label: "Agent",
    key: "agent",
  },
  {
    label: "Admin",
    key: "admin",
  },
  {
    label: "Support",
    key: "support",
  },
];

const UserManagement = () => {
  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">User Management</h1>
      {/* Tabs */}
      <TabsUserManagement />
    </div>
  );
};

const TabsUserManagement = () => {
  return (
    <Tabs
      defaultValue="super_admin"
      className="w-full flex-col justify-start gap-6"
    >
      <div className="flex items-center justify-between">
        <Label htmlFor="Role-selector" className="sr-only">
          Role
        </Label>
        <Select defaultValue="super_admin">
          <SelectTrigger
            className="flex w-fit @4xl/main:hidden"
            size="sm"
            id="role-selector"
          >
            <SelectValue placeholder="Select a role" />
          </SelectTrigger>
          <SelectContent>
            {tabs.map((tab) => (
              <SelectItem value={tab.key} key={tab.key}>
                {tab.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <TabsList className="**:data-[slot=badge]:bg-muted-foreground/30 hidden **:data-[slot=badge]:size-5 **:data-[slot=badge]:rounded-full **:data-[slot=badge]:px-1 @4xl/main:flex">
          {tabs.map((tab) => (
            <TabsTrigger value={tab.key} key={tab.key}>
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </div>

      <div className="flex justify-between gap-2">
        <div className="flex w-full items-center gap-2 max-w-sm">
          <Input type="search" placeholder="Search Agent Name Here..." />
          <Button type="submit" variant={"secondary"}>
            <Search /> Search
          </Button>
        </div>

        <AddSuperAdmin />
      </div>

      <TabsContent
        value="super_admin"
        className="relative flex flex-col gap-4 overflow-auto "
      >
        <DataTable data={data} />
      </TabsContent>
      <TabsContent value="agent" className="flex flex-col ">
        <div className="aspect-video w-full flex-1 rounded-lg border border-dashed justify-center flex items-center text-xl">
          agent
        </div>
      </TabsContent>
      <TabsContent value="admin" className="flex flex-col ">
        <div className="aspect-video w-full flex-1 rounded-lg border border-dashed justify-center flex items-center text-xl">
          admin
        </div>
      </TabsContent>
      <TabsContent value="support" className="flex flex-col ">
        <div className="aspect-video w-full flex-1 rounded-lg border border-dashed justify-center flex items-center text-xl">
          support
        </div>
      </TabsContent>
    </Tabs>
  );
};

function AddSuperAdmin() {
  return (
    <Dialog>
      <form>
        <DialogTrigger asChild>
          <Button>
            <CirclePlus /> Add
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add profile</DialogTitle>
            <DialogDescription>
              Make changes to your profile here. Click save when you&apos;re
              done.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid gap-3">
              <Label htmlFor="name-1">Name</Label>
              <Input id="name-1" name="name" defaultValue="Pedro Duarte" />
            </div>
            <div className="grid gap-3">
              <Label htmlFor="username-1">Username</Label>
              <Input id="username-1" name="username" defaultValue="@peduarte" />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button type="submit">Save changes</Button>
          </DialogFooter>
        </DialogContent>
      </form>
    </Dialog>
  );
}

export default UserManagement;
