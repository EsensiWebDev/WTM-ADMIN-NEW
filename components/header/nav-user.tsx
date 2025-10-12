"use client";

import { ChevronsUpDown, Loader2, LogOut, Settings } from "lucide-react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import React from "react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

type NavUserProps = {
  user?: {
    name?: string | null;
    email?: string | null;
    username?: string | null;
    avatar?: string | null;
  } | null;
};

export const NavUser = ({ user }: NavUserProps) => {
  const [isLoggingOut, setIsLoggingOut] = React.useState(false);
  const isMounted = React.useRef(true);

  React.useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  const displayName =
    user?.name || user?.username || user?.email || "Authenticated User";
  const displayEmail = user?.email || user?.username || "";
  const displayAvatar =
    user?.avatar && user.avatar.trim().length > 0
      ? user.avatar
      : "/avatars/shadcn.jpg";

  const initials = React.useMemo(() => {
    if (!displayName) return "U";
    return displayName
      .split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  }, [displayName]);

  const handleLogout = React.useCallback(
    async (event: React.MouseEvent | React.KeyboardEvent) => {
      event.preventDefault();
      if (isLoggingOut) return;

      setIsLoggingOut(true);
      try {
        const response = await fetch("/api/logout", {
          method: "POST",
        });

        const data = await response.json().catch(() => null);

        if (response.ok) {
          toast.success(
            (data && typeof data === "object" && "message" in data
              ? (data as { message?: string }).message
              : undefined) ?? "Logout successfully"
          );
        } else {
          const message =
            data && typeof data === "object" && "message" in data
              ? (data as { message?: string }).message
              : undefined;
          toast.error(message ?? "Failed to logout from server");
        }
      } catch (error) {
        console.error("Logout error", error);
        toast.error("Something went wrong while logging out");
      } finally {
        try {
          await signOut({ callbackUrl: "/login" });
        } finally {
          if (isMounted.current) {
            setIsLoggingOut(false);
          }
        }
      }
    },
    [isLoggingOut]
  );

  if (!user) {
    return (
      <Button asChild variant="ghost" size="lg" className="text-white">
        <Link href="/login">Login</Link>
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant={"ghost"}
          size={"lg"}
          className="text-white data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
        >
          <Avatar className="h-8 w-8 rounded-lg">
            <AvatarImage src={displayAvatar} alt={displayName} />
            <AvatarFallback className="rounded-lg">{initials}</AvatarFallback>
          </Avatar>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-medium">{displayName}</span>
            <span className="truncate text-xs">{displayEmail}</span>
          </div>
          <ChevronsUpDown className="ml-auto size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-(--radix-dropdown-menu-trigger-width) min-w-30 rounded-lg">
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link href={"/settings/account-setting"}>
              <Settings />
              Settings
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="gap-2"
        >
          {isLoggingOut ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <LogOut className="size-4" />
          )}
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
