import { ChevronDown } from "lucide-react";
import Link from "next/link";
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
    childs: {
      name: string;
      href: string;
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
          {menu.childs.map((item, index) => (
            <DropdownMenuItem key={index}>
              <Link href={item.href}>{item.name}</Link>
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
