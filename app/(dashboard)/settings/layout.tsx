"use client";

import TabsPageChanger from "@/components/tabs-page-changer";
import React from "react";

const tabItems = [
  {
    href: "/settings/account-setting",
    label: "Account Setting",
  },
];

const SettingsLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Settings</h1>
      </div>

      {/* <Tabs defaultValue="account" className="mb-8">
        <TabsList className="gap-2 bg-transparent">
          <TabsTrigger
            value="account"
            className="data-[state=active]:bg-[#2d3e3f] data-[state=active]:text-white px-4 py-2 rounded-md"
          >
            Account Setting
          </TabsTrigger>
          <TabsTrigger value="email-setting" className="px-4 py-2 rounded-md">
            E-mail Setting
          </TabsTrigger>
          <TabsTrigger value="email-log" className="px-4 py-2 rounded-md">
            E-mail Log
          </TabsTrigger>
          <TabsTrigger
            value="role-based-access"
            className="px-4 py-2 rounded-md"
          >
            Role Based Access
          </TabsTrigger>
        </TabsList>
      </Tabs> */}
      <TabsPageChanger tabItems={tabItems} defaultValue={tabItems[0].href} />

      <div className="w-full">{children}</div>
    </div>
  );
};

export default SettingsLayout;
