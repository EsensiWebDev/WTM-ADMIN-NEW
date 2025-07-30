import { updateRoomAvailability } from "@/app/(dashboard)/hotel-listing/room-availability/actions";
import { RoomAvailabilityHotel } from "@/app/(dashboard)/hotel-listing/room-availability/types";
import { ConfirmationDialog } from "@/components/confirmation-dialog";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import React from "react";
import { toast } from "sonner";

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
}

function AvailabilityTable({
  localHotel,
  roomAvailabilityHotel,
  days,
  setLocalHotel,
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
                        className={`h-8 w-full rounded cursor-pointer transition-colors hover:opacity-80
                          ${isAvailable ? "bg-green-500" : "bg-red-500"}
                          ${
                            isEdited
                              ? "bg-amber-300 border-2 border-amber-400"
                              : ""
                          }
                        `}
                        onClick={() => {
                          const updatedHotel = JSON.parse(
                            JSON.stringify(localHotel)
                          );
                          updatedHotel.rooms[roomIndex].availability[dayIndex] =
                            !isAvailable;
                          setLocalHotel(updatedHotel);
                        }}
                        title={`Click to toggle availability for ${
                          roomType.name
                        } on day ${dayIndex + 1}`}
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

// --- Main Drawer Component ---

interface UpdateRoomAvailabilityDrawerProps
  extends React.ComponentPropsWithoutRef<typeof Dialog> {
  roomAvailabilityHotel: RoomAvailabilityHotel | null;
  period: string | null;
  showTrigger?: boolean;
  onSuccess?: () => void;
}

export const UpdateRoomAvailabilityDrawer = ({
  roomAvailabilityHotel,
  period,
  onSuccess,
  ...props
}: UpdateRoomAvailabilityDrawerProps) => {
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
    <Drawer {...props}>
      <DrawerHeader>
        <DrawerTitle className="sr-only">Update Room Availability</DrawerTitle>
      </DrawerHeader>
      <DrawerContent aria-describedby="update-room-availability-drawer">
        <div className="max-w-full lg:max-w-7xl mx-auto px-6 pt-10 pb-12 space-y-8">
          {/* Hotel Name */}
          <h3 className="text-2xl font-semibold text-center">
            {localHotel?.name}
          </h3>

          {/* Availability Table */}
          <AvailabilityTable
            localHotel={localHotel}
            roomAvailabilityHotel={roomAvailabilityHotel}
            days={days}
            setLocalHotel={setLocalHotel}
          />

          {/* Legend and Save Button */}
          <div className="flex items-center justify-between">
            <AvailabilityLegend />
            {/* Trigger Button */}
            <Button size="sm" onClick={() => setOpen(true)}>
              Save Changes
            </Button>
            {/* Confirmation Dialog */}
            <ConfirmationDialog
              open={open}
              onOpenChange={setOpen}
              onConfirm={onUpdate}
              onCancel={onCancel}
              isLoading={isUpdatePending}
              title="Save Room Availability"
              description="Are you sure you want to save the changes to room availability?"
            />
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
};
