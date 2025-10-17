import { updateRoomAvailability } from "@/app/(dashboard)/hotel-listing/room-availability/actions";
import { RoomAvailabilityHotel } from "@/app/(dashboard)/hotel-listing/room-availability/types";
import { ConfirmationDialog } from "@/components/confirmation-dialog";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns/format";
import { CalendarIcon, ChevronsUpDown } from "lucide-react";
import React from "react";
import { toast } from "sonner";
import { SelectPeriod } from "../table/room-availability-table";

// --- Subcomponents ---

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
  localHotel: RoomAvailabilityHotel | null;
  roomAvailabilityHotel: RoomAvailabilityHotel | null;
  days: string[];
  setLocalHotel: (hotel: RoomAvailabilityHotel) => void;
  isEdit?: boolean;
}

function AvailabilityTable({
  localHotel,
  roomAvailabilityHotel,
  days,
  setLocalHotel,
  isEdit = false,
}: AvailabilityTableProps) {
  if (!localHotel) return null;
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
                colSpan={days.length}
              >
                {localHotel.period}
              </th>
            </tr>
            <tr className="border-b">
              {days.map((day) => (
                <th
                  key={day}
                  className="text-center p-2 font-semibold min-w-[40px]"
                >
                  {day}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {localHotel.rooms.map((roomType, roomIndex) => (
              <tr key={roomIndex} className="border-b">
                <td className="p-4 font-medium">{roomType.name}</td>
                {roomType.availability.map((isAvailable, dayIndex) => {
                  const original =
                    roomAvailabilityHotel?.rooms?.[roomIndex]?.availability?.[
                      dayIndex
                    ];
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
                        onClick={
                          isEdit
                            ? () => {
                                const updatedHotel = JSON.parse(
                                  JSON.stringify(localHotel)
                                );
                                updatedHotel.rooms[roomIndex].availability[
                                  dayIndex
                                ] = !isAvailable;
                                setLocalHotel(updatedHotel);
                              }
                            : undefined
                        }
                        title={
                          isEdit
                            ? `Click to toggle availability for ${
                                roomType.name
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
  roomAvailabilityHotel: RoomAvailabilityHotel | null;
  showTrigger?: boolean;
  onSuccess?: () => void;
  isEdit?: boolean;
  date: Date;
  setDate: React.Dispatch<React.SetStateAction<Date>>;
}

export const UpdateRoomAvailabilityDrawer = ({
  roomAvailabilityHotel,
  onSuccess,
  isEdit = false,
  date,
  setDate,
  ...props
}: UpdateRoomAvailabilityDrawerProps) => {
  const period = date ? format(date, "MM-yyyy") : null;

  // State
  const [isUpdatePending, startUpdateTransition] = React.useTransition();
  const [open, setOpen] = React.useState(false);
  const [localHotel, setLocalHotel] =
    React.useState<RoomAvailabilityHotel | null>(null);

  // Sync localHotel with prop
  React.useEffect(() => {
    setLocalHotel(
      roomAvailabilityHotel
        ? JSON.parse(JSON.stringify(roomAvailabilityHotel))
        : null
    );
  }, [roomAvailabilityHotel]);

  // Days array for table header
  const days =
    localHotel?.rooms?.length && localHotel?.rooms[0]?.availability
      ? Array.from(
          { length: localHotel.rooms[0].availability.length },
          (_, i) => String(i + 1).padStart(2, "0")
        )
      : [];

  // Check if there are any changes
  const hasChanges = React.useMemo(() => {
    if (!localHotel || !roomAvailabilityHotel) return false;

    return localHotel.rooms.some((room, roomIndex) => {
      const originalRoom = roomAvailabilityHotel.rooms[roomIndex];
      if (!originalRoom) return false;

      return room.availability.some((isAvailable, dayIndex) => {
        const originalAvailability = originalRoom.availability[dayIndex];
        return (
          originalAvailability !== undefined &&
          isAvailable !== originalAvailability
        );
      });
    });
  }, [localHotel, roomAvailabilityHotel]);

  // Handle update
  function onUpdate() {
    if (!period) {
      toast.error("Please select a period");
      return;
    }
    if (!localHotel) {
      toast.error("Please select a hotel");
      return;
    }
    startUpdateTransition(async () => {
      const hotelId = String(localHotel.id);
      toast.promise(updateRoomAvailability(hotelId, period, localHotel), {
        success: (data) => data.message,
        error: "Failed to update room availability",
      });
      setOpen(false);
      props.onOpenChange?.(false);
      onSuccess?.();
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
              {localHotel?.name}
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
                <SelectPeriod date={date} setDate={setDate} />
              </PopoverContent>
            </Popover>
          </div>

          {/* Availability Table */}
          <AvailabilityTable
            localHotel={localHotel}
            roomAvailabilityHotel={roomAvailabilityHotel}
            days={days}
            setLocalHotel={setLocalHotel}
            isEdit={isEdit}
          />

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
