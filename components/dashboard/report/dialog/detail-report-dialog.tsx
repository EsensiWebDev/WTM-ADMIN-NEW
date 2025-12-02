"use client";

import {
  ColumnDef,
  PaginationState,
  SortingState,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import * as React from "react";

import { DataTable } from "@/components/data-table/data-table";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

import { format } from "date-fns";
import { ReportAgentDetail } from "@/app/(dashboard)/report/types";
import { UseQueryResult } from "@tanstack/react-query";
import { ApiResponse } from "@/types";

interface DetailReportDialogProps
  extends React.ComponentPropsWithoutRef<typeof Dialog> {
  onSuccess?: () => void;
  query: UseQueryResult<ApiResponse<ReportAgentDetail[]>, Error>;
}

// Column definitions for the booking details table
const columns: ColumnDef<ReportAgentDetail>[] = [
  {
    id: "no",
    header: "No",
    cell: ({ row }) => row.index + 1,
    enableSorting: false,
    enableHiding: false,
    size: 60,
  },
  {
    id: "guest_name",
    accessorKey: "guest_name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Guest Name" />
    ),
    cell: ({ row }) => (
      <div className="font-medium">{row.original.guest_name}</div>
    ),
    enableColumnFilter: true,
    meta: {
      label: "Guest Name",
      placeholder: "Search guest name...",
      variant: "text",
    },
    enableHiding: false,
    enableSorting: false,
  },
  {
    id: "room_type",
    accessorKey: "room_type",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Room Type" />
    ),
    cell: ({ row }) => row.original.room_type,
    enableColumnFilter: true,
    meta: {
      label: "Room Type",
      placeholder: "Search room type...",
      variant: "text",
    },
    enableHiding: false,
    enableSorting: false,
  },
  {
    id: "date_in",
    accessorKey: "date_in",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Date In" />
    ),
    cell: ({ row }) => {
      const dateIn = new Date(row.original.date_in);
      return <div className="text-sm">{format(dateIn, "dd MMMM yyyy")}</div>;
    },
    enableSorting: false,
    enableHiding: false,
  },
  {
    id: "date_out",
    accessorKey: "date_out",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Date Out" />
    ),
    cell: ({ row }) => {
      const dateOut = new Date(row.original.date_out);
      return <div className="text-sm">{format(dateOut, "dd MMMM yyyy")}</div>;
    },
    enableSorting: false,
  },
  {
    id: "capacity",
    accessorKey: "capacity",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Capacity" />
    ),
    cell: ({ row }) => (
      <div className="text-center font-medium">{row.original.capacity}</div>
    ),
    enableSorting: false,
    size: 100,
    enableHiding: false,
  },
  {
    id: "additional",
    accessorKey: "additional",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Additional" />
    ),
    cell: ({ row }) => (
      <div className="max-w-[200px] truncate" title={row.original.additional}>
        {row.original.additional || "-"}
      </div>
    ),
    enableColumnFilter: true,
    meta: {
      label: "Additional",
      placeholder: "Search additional...",
      variant: "text",
    },
    enableHiding: false,
    enableSorting: false,
  },
];

export function DetailReportDialog({
  onSuccess,
  query,
  ...props
}: DetailReportDialogProps) {
  // State for server-side pagination and sorting
  const [pagination, setPagination] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  const [sorting, setSorting] = React.useState<SortingState>([
    { id: "date_in", desc: false },
  ]);

  const table = useReactTable({
    data: query.data?.data || [],
    columns,
    pageCount: query.data?.pagination?.total_pages || 1,
    state: {
      pagination,
      sorting,
    },
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    manualSorting: true,
  });

  return (
    <Dialog {...props}>
      <DialogContent className="sm:max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="sr-only">Report Details </DialogTitle>
        </DialogHeader>
        <div className="flex-1 overflow-hidden flex flex-col">
          {query.isLoading ? (
            <div className="flex items-center justify-center h-48">
              <div className="flex items-center gap-2">
                <LoadingSpinner className="h-4 w-4" />
                <span className="text-sm text-muted-foreground">
                  Loading booking details...
                </span>
              </div>
            </div>
          ) : query.isError ? (
            <div className="flex items-center justify-center h-48">
              <div className="text-center">
                <p className="text-sm text-destructive mb-2">
                  Failed to load booking details
                </p>
              </div>
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-auto relative">
                {query.isPending && (
                  <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/50 backdrop-blur-sm">
                    <div className="flex items-center gap-2 rounded-lg bg-background p-3 shadow-lg border">
                      <LoadingSpinner className="h-4 w-4" />
                      <span className="text-sm text-muted-foreground">
                        Updating data...
                      </span>
                    </div>
                  </div>
                )}
                <DataTable table={table} showPagination={false} />
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
