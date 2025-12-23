"use client";

import { fetchAccountProfile } from "@/app/(dashboard)/settings/account-setting/fetch";
import type { UserRole } from "@/lib/authorization";
import { useQuery } from "@tanstack/react-query";
import { Menu, X } from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import React from "react";
import { AuthorizationGuard } from "../authorization-guard";
import { Logo } from "../logo";
import { NavDropdown } from "./nav-dropdown";
import { NavUser } from "./nav-user";

type MenuItem = {
  name: string;
  href: string;
  requiredRole?: UserRole;
  childs?: {
    name: string;
    href: string;
    requiredRole?: UserRole;
  }[];
};

const menuItems: MenuItem[] = [
  {
    name: "Account",
    href: "#link",
    childs: [
      { name: "Agent Overview", href: "/account/agent-overview/agent-control" },
      {
        name: "Role Based Access",
        href: "/account/role-based-access",
        requiredRole: "Super Admin" as const, // Restrict to super admin only
      },
      {
        name: "User Management",
        href: "/account/user-management/support",
        requiredRole: "Admin" as const,
      },
      {
        name: "User Management",
        href: "/account/user-management/super-admin",
        requiredRole: "Super Admin" as const,
      },
    ],
  },
  { name: "Banner", href: "/banner" },
  {
    name: "Booking Management",
    href: "/booking-management/booking-summary",
  },
  { name: "Currency", href: "/currency" },
  {
    name: "Email",
    href: "#link",
    childs: [
      {
        name: "E-mail Setting",
        href: "/email/email-setting?type=confirm",
        requiredRole: "Super Admin" as const,
      },
      { name: "E-mail Log", href: "/email/email-log" },
    ],
  },
  {
    name: "Hotel Listing",
    href: "#link",
    childs: [
          { name: "Hotel Listing", href: "/hotel-listing" },
      { name: "Room Availability", href: "/hotel-listing/room-availability" },
    ],
  },
  { name: "Promo", href: "/promo" },
  { name: "Promo Group", href: "/promo-group" },
  { name: "Report", href: "/report" },
];

export const HeroHeader = () => {
  const [menuState, setMenuState] = React.useState(false);
  const { status } = useSession();

  const {
    data: profileData,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["profile"],
    queryFn: fetchAccountProfile,
    staleTime: 1000 * 60 * 60 * 24, // 24 hours - only refetch once per day
    retry: 1, // Reduce retries since this isn't critical data
    refetchOnWindowFocus: false, // Don't refetch when window regains focus
    refetchOnReconnect: false, // Don't refetch on network reconnect
    refetchIntervalInBackground: false, // Don't refetch when tab is in background
  });

  return (
    <header>
      <nav
        data-state={menuState && "active"}
        className="bg-primary fixed z-20 w-full border-b backdrop-blur-3xl"
      >
        <div className="px-6 transition-all duration-300">
          <div className="relative flex flex-wrap lg:flex-nowrap items-center justify-between gap-6 py-3 lg:gap-0 lg:py-4">
            <div className="flex w-full items-center justify-between gap-12 lg:w-auto">
              <Link
                href="/"
                aria-label="home"
                className="flex items-center space-x-2"
              >
                <Logo />
              </Link>

              <div className="flex items-center gap-2 lg:hidden">
                {!isLoading && !isError && status !== "loading" && (
                  <NavUser user={profileData?.data} compact />
                )}
                <button
                  onClick={() => setMenuState(!menuState)}
                  aria-label={menuState == true ? "Close Menu" : "Open Menu"}
                  className="relative z-20 -m-2.5 -mr-4 block cursor-pointer p-2.5"
                >
                  <Menu className="text-white in-data-[state=active]:rotate-180 in-data-[state=active]:scale-0 in-data-[state=active]:opacity-0 m-auto size-6 duration-200" />
                  <X className="text-white in-data-[state=active]:rotate-0 in-data-[state=active]:scale-100 in-data-[state=active]:opacity-100 absolute inset-0 m-auto size-6 -rotate-180 scale-0 opacity-0 duration-200" />
                </button>
              </div>

              {/* Menu Desktop  */}
              <div className="hidden lg:block">
                <ul className="flex flex-wrap items-center gap-4 xl:gap-8 text-sm">
                  {menuItems.map((item, index) => {
                    if (item.childs) {
                      return (
                        <li key={index}>
                          <NavDropdown menu={item} />
                        </li>
                      );
                    }

                    // Handle menu items with role restrictions
                    if (item.requiredRole) {
                      return (
                        <AuthorizationGuard
                          key={index}
                          requiredRole={item.requiredRole as UserRole}
                        >
                          <li>
                            <Link
                              href={item.href}
                              className="text-white block duration-150"
                            >
                              <span>{item.name}</span>
                            </Link>
                          </li>
                        </AuthorizationGuard>
                      );
                    }

                    return (
                      <li key={index}>
                        <Link
                          href={item.href}
                          className="text-white block duration-150"
                        >
                          <span>{item.name}</span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>

            {/* Menu Mobile  */}
            <div className="bg-background in-data-[state=active]:block lg:in-data-[state=active]:flex mb-6 hidden w-full flex-wrap items-center justify-end space-y-8 rounded-3xl border p-6 shadow-2xl shadow-zinc-300/20 md:flex-nowrap lg:m-0 lg:flex lg:w-fit lg:gap-6 lg:space-y-0 lg:border-transparent lg:bg-transparent lg:p-0 lg:shadow-none dark:shadow-none dark:lg:bg-transparent">
              <div className="lg:hidden">
                <ul className="space-y-6 text-base">
                  {menuItems.map((item, index) => {
                    if (item.childs) {
                      return (
                        <li key={index}>
                          <NavDropdown menu={item} />
                        </li>
                      );
                    }

                    // Handle menu items with role restrictions
                    if (item.requiredRole) {
                      return (
                        <AuthorizationGuard
                          key={index}
                          requiredRole={item.requiredRole as UserRole}
                        >
                          <li>
                            <Link
                              href={item.href}
                              className="text-muted-foreground hover:text-accent-foreground block duration-150"
                            >
                              <span>{item.name}</span>
                            </Link>
                          </li>
                        </AuthorizationGuard>
                      );
                    }

                    return (
                      <li key={index}>
                        <Link
                          href={item.href}
                          className="text-muted-foreground hover:text-accent-foreground block duration-150"
                        >
                          <span>{item.name}</span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
              {/* Desktop NavUser */}
              {!isLoading && !isError && (
                <div className="hidden w-full flex-col space-y-3 sm:flex-row sm:gap-3 sm:space-y-0 md:w-fit lg:flex">
                  {status === "loading" ? null : (
                    <NavUser user={profileData?.data} />
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
};
