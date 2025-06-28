"use client";

import { deleteUser } from "@/app/(dashboard)/account/user-management/actions";
import { SuperAdmin } from "@/app/(dashboard)/account/user-management/data-super-admin";
import { UserForm } from "@/components/dashboard/account/user-management/super-admin/form";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button, buttonVariants } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { IconDotsVertical } from "@tabler/icons-react";
import { useQueryClient } from "@tanstack/react-query";
import { ColumnDef } from "@tanstack/react-table";
import { CheckCircle, Text, XCircle } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

export const columns: ColumnDef<SuperAdmin>[] = [
  {
    id: "select",
    size: 32,
    header: ({ table }) => (
      <div className="flex items-center justify-center">
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      </div>
    ),
    cell: ({ row }) => (
      <div className="flex items-center justify-center">
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      </div>
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    id: "name",
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Agent Name" />
    ),
    cell: ({ row }) => {
      return row.original.name;
    },
    meta: {
      label: "Name",
      placeholder: "Search name...",
      variant: "text",
      icon: Text,
    },
    enableColumnFilter: true,
    enableHiding: false,
  },
  {
    id: "agent",
    accessorKey: "agent",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Agent Company" />
    ),
    cell: ({ row }) => {
      return row.original.agent;
    },
    meta: {
      label: "Agent",
      variant: "multiSelect",
      options: [
        { label: "Active", value: "active", icon: CheckCircle },
        { label: "Inactive", value: "inactive", icon: XCircle },
      ],
    },
    enableColumnFilter: true,
  },
  {
    id: "Promo Group",
    accessorKey: "promo_group",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Promo Group" />
    ),
    cell: ({ row }) => {
      return (
        <>
          <Label htmlFor={`${row.original.id}-promo-group`} className="sr-only">
            Promo Group
          </Label>
          <Select defaultValue={row.original.promo_group}>
            <SelectTrigger
              className="w-38 **:data-[slot=select-value]:block **:data-[slot=select-value]:truncate"
              size="sm"
              id={`${row.original.id}-promo-group`}
            >
              <SelectValue placeholder="Assign promo group" />
            </SelectTrigger>
            <SelectContent align="end">
              <SelectItem value="group_a">Promo Group A</SelectItem>
              <SelectItem value="group_b">Promo Group B</SelectItem>
              <SelectItem value="group_c">Promo Group C</SelectItem>
              <SelectSeparator />
              <SelectItemLink href={"/dummy"}>Create New Group</SelectItemLink>
            </SelectContent>
          </Select>
        </>
      );
    },
  },
  {
    id: "Email",
    accessorKey: "email",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="E-mail" />
    ),
    meta: {
      label: "Email",
      variant: "multiSelect",
      options: [
        { label: "Active", value: "active", icon: CheckCircle },
        { label: "Inactive", value: "inactive", icon: XCircle },
      ],
    },
    enableColumnFilter: true,
  },
  {
    id: "Phone",
    accessorKey: "phone",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Phone Number" />
    ),
  },
  {
    id: "actions",
    size: 32,
    cell: ({ row }) => {
      const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
      const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
      const [isDeleting, setIsDeleting] = useState(false);
      const queryClient = useQueryClient();

      const handleDelete = async () => {
        setIsDeleting(true);
        try {
          const result = await deleteUser(row.original.id);

          if (result.success) {
            toast.success("User deleted successfully!");
            setIsDeleteDialogOpen(false);

            // Invalidate and refetch the users query to update the data
            await queryClient.invalidateQueries({
              queryKey: ["users", "super-admin"],
            });
          } else {
            toast.error(result.error || "Failed to delete user");
          }
        } catch (error) {
          console.error("Error deleting user:", error);
          toast.error("An unexpected error occurred");
        } finally {
          setIsDeleting(false);
        }
      };

      return (
        <>
          <AlertDialog
            open={isDeleteDialogOpen}
            onOpenChange={setIsDeleteDialogOpen}
          >
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="data-[state=open]:bg-muted text-muted-foreground flex size-8"
                    size="icon"
                  >
                    <IconDotsVertical />
                    <span className="sr-only">Open menu</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-32">
                  <DialogTrigger asChild>
                    <DropdownMenuItem>Edit</DropdownMenuItem>
                  </DialogTrigger>
                  <DropdownMenuSeparator />
                  <AlertDialogTrigger asChild>
                    <DropdownMenuItem variant="destructive">
                      Delete
                    </DropdownMenuItem>
                  </AlertDialogTrigger>
                </DropdownMenuContent>
              </DropdownMenu>

              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Edit User</DialogTitle>
                  <DialogDescription>
                    Make changes to the user profile. Click save when you're
                    done.
                  </DialogDescription>
                </DialogHeader>
                <UserForm
                  user={row.original}
                  open={isEditDialogOpen}
                  onOpenChange={setIsEditDialogOpen}
                  onSuccess={() => {
                    // Invalidate and refetch the users query to update the data
                    queryClient.invalidateQueries({
                      queryKey: ["users", "super-admin"],
                    });
                  }}
                />
              </DialogContent>
            </Dialog>

            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete
                  this user account and remove their data from our servers.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={isDeleting}>
                  Cancel
                </AlertDialogCancel>
                <Button
                  type="submit"
                  className={buttonVariants({ variant: "destructive" })}
                  onClick={handleDelete}
                  disabled={isDeleting}
                >
                  {isDeleting ? "Deleting..." : "Delete"}
                </Button>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </>
      );
    },
  },
];

const SelectItemLink = ({
  href,
  children,
  className,
}: React.ComponentProps<typeof Link>) => {
  return (
    <Link
      href={href}
      className={cn(
        "hover:bg-accent hover:text-accent-foreground [&_svg:not([class*='text-'])]:text-muted-foreground relative flex w-full cursor-default items-center gap-2 rounded-sm py-1.5 pr-8 pl-2 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 *:[span]:last:flex *:[span]:last:items-center *:[span]:last:gap-2",
        className
      )}
    >
      {children}
    </Link>
  );
};
