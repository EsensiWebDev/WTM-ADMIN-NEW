import { HeroHeader } from "@/components/header/header";
import React from "react";

const DashboardLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  return (
    <>
      <HeroHeader />
      <main className="@container/main px-6 mx-auto max-w-7xl transition-all duration-300 overflow-x-hidden pt-30 pb-12">
        {children}
      </main>
    </>
  );
};

export default DashboardLayout;
