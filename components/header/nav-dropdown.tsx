import type { UserRole } from "@/lib/authorization";
import { ChevronDown } from "lucide-react";
import Link from "next/link";
import { AuthorizationGuard } from "../authorization-guard";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

export const NavDropdown = ({
  menu,
}: {
  menu: {
    name: string;
    href: string;
    childs?: {
      name: string;
      href: string;
      requiredRole?: UserRole;
    }[];
  };
}) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="text-muted-foreground inline-flex items-center justify-center sm:text-white hover:text-gray-200 duration-150 cursor-pointer">
          <span>{menu.name}</span>
          <ChevronDown className="ml-2 size-4 transition-transform duration-200 group-data-[state=open]:rotate-180" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-(--radix-dropdown-menu-trigger-width) min-w-40 rounded-lg">
        <DropdownMenuGroup>
          {menu.childs?.map((item, index) => {
            // If item has role restriction, wrap with AuthorizationGuard
            if (item.requiredRole) {
              return (
                <AuthorizationGuard
                  key={index}
                  requiredRole={item.requiredRole}
                >
                  <DropdownMenuItem asChild>
                    <Link href={item.href} className="w-full">
                      {item.name}
                    </Link>
                  </DropdownMenuItem>
                </AuthorizationGuard>
              );
            }

            // No role restriction, render normally
            return (
              <DropdownMenuItem key={index} asChild>
                <Link href={item.href} className="w-full">
                  {item.name}
                </Link>
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
