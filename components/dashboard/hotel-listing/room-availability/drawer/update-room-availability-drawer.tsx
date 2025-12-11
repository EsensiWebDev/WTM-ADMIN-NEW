import { updateRoomAvailability } from "@/app/(dashboard)/hotel-listing/room-availability/actions";
import { RoomAvailabilityHotel } from "@/app/(dashboard)/hotel-listing/room-availability/types";
import { Hotel } from "@/app/(dashboard)/hotel-listing/types";
import { ConfirmationDialog } from "@/components/confirmation-dialog";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Item, ItemContent, ItemMedia, ItemTitle } from "@/components/ui/item";
import { MonthPicker } from "@/components/ui/monthpicker";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";
import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns/format";
import { CalendarIcon, ChevronsUpDown } from "lucide-react";
import React, { useCallback } from "react";
import { toast } from "sonner";

function AvailabilityLegend() {
  return (
    <div className="flex items-center space-x-6">
      <div className="flex items-center space-x-2">
        <div className="w-6 h-6 bg-green-500 rounded" />
        <span>Available</span>
      </div>
      <div className="flex items-center space-x-2">
        <div className="w-6 h-6 bg-red-500 rounded" />
        <span>Not Available</span>
      </div>
    </div>
  );
}

interface AvailabilityTableProps {
  localHotel: RoomAvailabilityHotel[] | null;
  roomAvailabilityHotel: RoomAvailabilityHotel[] | null;
  setLocalHotel: React.Dispatch<
    React.SetStateAction<RoomAvailabilityHotel[] | null>
  >;
  isEdit?: boolean;
}

function AvailabilityTable({
  localHotel,
  roomAvailabilityHotel,
  setLocalHotel,
  isEdit = false,
}: AvailabilityTableProps) {
  const handleCellClick = useCallback(
    (roomIndex: number, dayIndex: number) => {
      if (!isEdit || !localHotel) return;

      setLocalHotel((prev) => {
        if (!prev) return prev;

        const updatedHotel = [...prev];
        const room = { ...updatedHotel[roomIndex] };
        const availability = [...room.available];

        availability[dayIndex] = {
          ...availability[dayIndex],
          available: !availability[dayIndex].available,
        };

        room.available = availability;
        updatedHotel[roomIndex] = room;

        return updatedHotel;
      });
    },
    [isEdit, localHotel, setLocalHotel]
  );

  if (!localHotel) return null;
  if (!roomAvailabilityHotel) return null;

  return (
    <div className="rounded-lg border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th
                className="text-left p-4 font-semibold min-w-[200px] border-r"
                rowSpan={2}
              >
                Room Type
              </th>
              <th
                className="text-center p-2 font-semibold"
                colSpan={roomAvailabilityHotel?.[0]?.available.length}
              >
                Date
              </th>
            </tr>
            <tr className="border-b">
              {roomAvailabilityHotel?.[0]?.available.map((avail) => (
                <th
                  key={`d-${avail.day}`}
                  className="text-center p-2 font-semibold min-w-[40px]"
                >
                  {avail.day}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {localHotel.map((room, roomIndex) => (
              <tr key={roomIndex} className="border-b">
                <td className="p-4 font-medium">{room.room_type_name}</td>
                {room.available.map((roomDay, dayIndex) => {
                  const isAvailable = roomDay.available;
                  const original =
                    roomAvailabilityHotel?.[roomIndex]?.available?.[dayIndex]
                      ?.available;
                  const isEdited =
                    original !== undefined && isAvailable !== original;
                  return (
                    <td key={dayIndex} className="p-1">
                      <div
                        className={`h-8 w-full rounded transition-colors
                          ${isAvailable ? "bg-green-500" : "bg-red-500"}
                          ${
                            isEdited
                              ? "bg-amber-300 border-2 border-amber-400"
                              : ""
                          }
                          ${
                            isEdit
                              ? "cursor-pointer hover:opacity-80"
                              : "cursor-default"
                          }
                        `}
                        onClick={() => handleCellClick(roomIndex, dayIndex)}
                        title={
                          isEdit
                            ? `Click to toggle availability for ${
                                room.room_type_name
                              } on day ${dayIndex + 1}`
                            : undefined
                        }
                      />
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// --- Main Dialog Component ---

interface UpdateRoomAvailabilityDrawerProps
  extends React.ComponentPropsWithoutRef<typeof Dialog> {
  roomAvailabilityHotel: RoomAvailabilityHotel[] | null;
  showTrigger?: boolean;
  onSuccess?: () => void;
  isEdit?: boolean;
  date: Date;
  dataHotel: Hotel | null;
  isPending: boolean;
  setDate: React.Dispatch<React.SetStateAction<Date>>;
}

export const UpdateRoomAvailabilityDrawer = ({
  roomAvailabilityHotel,
  onSuccess,
  isEdit = false,
  date,
  dataHotel,
  isPending,
  setDate,
  ...props
}: UpdateRoomAvailabilityDrawerProps) => {
  const queryClient = useQueryClient();
  // State
  const [isUpdatePending, startUpdateTransition] = React.useTransition();
  const [open, setOpen] = React.useState(false);
  const [localHotel, setLocalHotel] = React.useState<
    RoomAvailabilityHotel[] | null
  >(null);

  // Sync localHotel with prop
  React.useEffect(() => {
    setLocalHotel(
      roomAvailabilityHotel
        ? JSON.parse(JSON.stringify(roomAvailabilityHotel))
        : null
    );
  }, [roomAvailabilityHotel]);

  // Check if there are any changes
  const hasChanges = React.useMemo(() => {
    if (!localHotel || !roomAvailabilityHotel) return false;

    return localHotel.some((room, roomIndex) => {
      const originalRoom = roomAvailabilityHotel[roomIndex];
      if (!originalRoom) return false;

      return room.available.some((avail, dayIndex) => {
        const isAvailable = avail.available;
        const originalAvailability =
          originalRoom?.available?.[dayIndex]?.available;
        return (
          originalAvailability !== undefined &&
          isAvailable !== originalAvailability
        );
      });
    });
  }, [localHotel, roomAvailabilityHotel]);

  // Handle update
  function onUpdate() {
    if (!date) {
      toast.error("Please select a period");
      return;
    }
    if (!localHotel) {
      toast.error("Please select a hotel");
      return;
    }
    startUpdateTransition(async () => {
      const { success, message } = await updateRoomAvailability(
        format(date, "yyyy-MM"),
        localHotel
      );
      if (!success) {
        toast.error(message || "Failed to update room availability");
        return;
      }

      toast.success(message || "Room availability updated successfully");

      setOpen(false);
      props.onOpenChange?.(false);
      onSuccess?.();
      queryClient.invalidateQueries({
        queryKey: ["room-availability", format(date, "yyyy-MM"), dataHotel?.id],
        exact: true,
      });
    });
  }

  function onCancel() {
    setOpen(false);
  }

  return (
    <Dialog {...props}>
      <DialogContent
        aria-describedby="update-room-availability-dialog"
        className="sm:max-w-7xl max-h-[85vh] overflow-hidden p-0 gap-0"
      >
        <DialogTitle className="sr-only">Update Room Availability</DialogTitle>
        <div
          id="update-room-availability-dialog"
          className="max-h-[85vh] overflow-y-auto px-6 pt-10 pb-12 space-y-8"
        >
          <div className="flex items-center justify-between">
            {/* Hotel Name */}
            <h3 className="text-2xl font-semibold text-left">
              {dataHotel?.name}
            </h3>

            <Popover>
              <PopoverTrigger asChild>
                <Button
                  className={cn(
                    "justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "MMM yyyy") : <span>Select Period</span>}
                  <ChevronsUpDown className="ml-auto text-white opacity-100" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <MonthPicker
                  selectedMonth={date}
                  onMonthSelect={setDate}
                  // minDate={new Date("2023-01-01")}
                  // maxDate={new Date("2024-12-31")}
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Availability Table */}
          {isPending && (
            <div className="flex w-full max-w-xs flex-col gap-4 [--radius:1rem]">
              <Item>
                <ItemMedia>
                  <Spinner />
                </ItemMedia>
                <ItemContent>
                  <ItemTitle className="line-clamp-1">Loading...</ItemTitle>
                </ItemContent>
              </Item>
            </div>
          )}
          {!isPending && (
            <AvailabilityTable
              localHotel={localHotel}
              roomAvailabilityHotel={roomAvailabilityHotel}
              setLocalHotel={setLocalHotel}
              isEdit={isEdit}
            />
          )}

          {/* Legend and Save Button */}
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <AvailabilityLegend />
            {/* Trigger Button */}
            {isEdit && (
              <div className="flex items-center justify-end">
                <Button
                  size="sm"
                  onClick={() => setOpen(true)}
                  disabled={!hasChanges}
                >
                  Save Changes
                </Button>
              </div>
            )}
            {/* Confirmation Dialog */}
            {isEdit && (
              <ConfirmationDialog
                open={open}
                onOpenChange={setOpen}
                onConfirm={onUpdate}
                onCancel={onCancel}
                isLoading={isUpdatePending}
                title="Save Room Availability"
                description="Are you sure you want to save the changes to room availability?"
              />
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
