"use client";

import TabsPageChanger from "@/components/tabs-page-changer";
import { useAuthorization } from "@/hooks/use-authorization";
import { redirect, usePathname } from "next/navigation";
import React from "react";

const tabItems = [
  {
    href: "/email/email-setting?type=confirm",
    label: "E-mail Setting",
    requiredRole: "Super Admin" as const,
  },
  {
    href: "/email/email-log",
    label: "E-mail Log",
  },
];

const EmailLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  const pathname = usePathname();
  const { hasRole } = useAuthorization();

  if (pathname === "/email/email-setting" && !hasRole("Super Admin"))
    redirect("/unauthorized");

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Email</h1>
      </div>

      <TabsPageChanger tabItems={tabItems} defaultValue={tabItems[0].href} />

      <div className="w-full">{children}</div>
    </div>
  );
};

export default EmailLayout;

