"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { memo, useMemo } from "react";

interface TabsPageChangerProps {
  tabItems: {
    href: string;
    label: string;
  }[];
  defaultValue: string;
}

const TabsPageChanger = memo(
  ({ tabItems, defaultValue }: TabsPageChangerProps) => {
    const pathname = usePathname();

    const defaultTabs = useMemo(() => {
      return (
        tabItems.find((item) => pathname === item.href)?.href ||
        tabItems[0]?.href ||
        defaultValue
      );
    }, [pathname, tabItems, defaultValue]);

    const renderedTabs = useMemo(() => {
      return tabItems.map((item) => (
        <Link key={item.href} href={item.href} scroll={false}>
          <TabsTrigger value={item.href}>{item.label}</TabsTrigger>
        </Link>
      ));
    }, [tabItems]);

    return (
      <Tabs defaultValue={defaultTabs}>
        <TabsList className="gap-1">{renderedTabs}</TabsList>
      </Tabs>
    );
  }
);

TabsPageChanger.displayName = "TabsPageChanger";

export default TabsPageChanger;
