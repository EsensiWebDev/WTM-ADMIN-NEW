"use client";

import { exportHistoryBookingLog } from "@/app/(dashboard)/booking-management/history-booking-log/actions";
import { HistoryBookingLog } from "@/app/(dashboard)/booking-management/history-booking-log/types";

import {
  getCompanyOptions,
  getData,
} from "@/app/(dashboard)/booking-management/history-booking-log/fetch";
import { DataTable } from "@/components/data-table/data-table";
import { DataTableToolbar } from "@/components/data-table/data-table-toolbar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useDataTable } from "@/hooks/use-data-table";
import type { DataTableRowAction } from "@/types/data-table";
import { IconChevronDown, IconCloudDownload } from "@tabler/icons-react";
import { useSearchParams } from "next/navigation";
import React, { useTransition } from "react";
import { toast } from "sonner";
import { getHistoryBookingLogTableColumns } from "./history-booking-log-columns";

interface HistoryBookingLogTableProps {
  promises: Promise<
    [
      Awaited<ReturnType<typeof getData>>,
      Awaited<ReturnType<typeof getCompanyOptions>>
    ]
  >;
}

const HistoryBookingLogTable = ({ promises }: HistoryBookingLogTableProps) => {
  const [isPending, startTransition] = useTransition();
  const [isExporting, startExportTransition] = useTransition();
  const [{ data, pageCount }, companyOptions] = React.use(promises);
  const [rowAction, setRowAction] =
    React.useState<DataTableRowAction<HistoryBookingLog> | null>(null);
  const searchParams = useSearchParams();

  const columns = React.useMemo(
    () =>
      getHistoryBookingLogTableColumns({
        setRowAction,
        companyOptions,
      }),
    []
  );

  const { table } = useDataTable({
    data,
    columns,
    pageCount,
    getRowId: (originalRow) => originalRow.booking_id,
    shallow: false,
    clearOnDefault: true,
    startTransition,
  });

  // Download functionality
  const handleDownload = (format: "csv" | "excel" = "csv") => {
    startExportTransition(async () => {
      try {
        // Convert URLSearchParams to plain object
        const params: Record<string, string | string[]> = {};
        searchParams.forEach((value, key) => {
          if (params[key]) {
            // If key already exists, convert to array or add to existing array
            if (Array.isArray(params[key])) {
              (params[key] as string[]).push(value);
            } else {
              params[key] = [params[key] as string, value];
            }
          } else {
            params[key] = value;
          }
        });

        const result = await exportHistoryBookingLog(params, format);

        if (result.success && result.data) {
          let blob: Blob;

          // Handle different data types (string for CSV, Uint8Array for Excel)
          if (typeof result.data === "string") {
            // CSV format
            blob = new Blob([result.data], {
              type: result.mimeType || "text/csv;charset=utf-8;",
            });
          } else {
            // Excel format (Uint8Array)
            blob = new Blob([result.data], {
              type:
                result.mimeType ||
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            });
          }
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = url;
          link.download = result.filename || `history-booking-log.${format}`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);

          toast.success(
            `Successfully exported ${
              result.totalRecords
            } records to ${format.toUpperCase()}`
          );
        } else {
          toast.error(result.error || "Failed to export data");
        }
      } catch (error) {
        console.error("Export error:", error);
        toast.error("An error occurred while exporting data");
      }
    });
  };

  return (
    <>
      <div className="relative">
        <DataTable table={table} isPending={isPending}>
          <DataTableToolbar table={table} isPending={isPending}>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  size={"sm"}
                  variant={"outline"}
                  className="bg-white border-primary"
                  disabled={isExporting}
                >
                  <IconCloudDownload />
                  {isExporting ? "Exporting..." : "Download"}
                  <IconChevronDown className="ml-1 h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleDownload("csv")}>
                  Download as CSV
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleDownload("excel")}>
                  Download as Excel
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </DataTableToolbar>
        </DataTable>
      </div>
    </>
  );
};

export default HistoryBookingLogTable;
