"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuthorization } from "@/hooks/use-authorization";
import type { UserRole } from "@/lib/authorization";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { memo, useMemo } from "react";

interface TabsPageChangerProps {
  tabItems: {
    href: string;
    label: string;
    requiredRole?: UserRole | UserRole[];
    minimumRole?: UserRole;
  }[];
  defaultValue: string;
}

const TabsPageChanger = memo(
  ({ tabItems, defaultValue }: TabsPageChangerProps) => {
    const pathname = usePathname();
    const { hasRole, hasMinimumRole, isLoading } = useAuthorization();

    // Filter tabs based on user role
    const filteredTabs = useMemo(() => {
      if (isLoading) return [];

      return tabItems.filter((item) => {
        // If no role requirement, show the tab
        if (!item.requiredRole && !item.minimumRole) return true;

        // Check required role
        if (item.requiredRole && !hasRole(item.requiredRole)) return false;

        // Check minimum role
        if (item.minimumRole && !hasMinimumRole(item.minimumRole)) return false;

        return true;
      });
    }, [tabItems, hasRole, hasMinimumRole, isLoading]);

    const defaultTabs = useMemo(() => {
      return (
        filteredTabs.find((item) => pathname === item.href)?.href ||
        filteredTabs[0]?.href ||
        defaultValue
      );
    }, [pathname, filteredTabs, defaultValue]);

    const renderedTabs = useMemo(() => {
      return filteredTabs.map((item) => (
        <Link key={item.href} href={item.href} scroll={false}>
          <TabsTrigger value={item.href}>{item.label}</TabsTrigger>
        </Link>
      ));
    }, [filteredTabs]);

    if (isLoading) return null;

    return (
      <Tabs defaultValue={defaultTabs}>
        <TabsList className="gap-1">{renderedTabs}</TabsList>
      </Tabs>
    );
  }
);

TabsPageChanger.displayName = "TabsPageChanger";

export default TabsPageChanger;
