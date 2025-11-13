import { Room } from "@/app/(dashboard)/hotel-listing/create/types";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  IconArrowAutofitWidth,
  IconBed,
  IconFriends,
} from "@tabler/icons-react";
import { Cigarette, CigaretteOff, Eye, PlusCircle, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { ImageUpload } from "./image-upload";

interface RoomCardInputProps extends Room {
  onUpdate?: (room: Room) => void;
  onRemove?: (id: string) => void;
}

export function RoomCardInput({
  id,
  name,
  images,
  options,
  features,
  onUpdate,
  onRemove,
}: RoomCardInputProps) {
  // Ensure room has an ID, generate one if missing
  const roomId =
    id || `room-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  const [roomName, setRoomName] = useState(name);
  const [withoutBreakfastPrice, setWithoutBreakfastPrice] = useState<number>(
    options?.[0]?.price ?? 0
  );
  const [withBreakfastPrice, setWithBreakfastPrice] = useState<number>(
    options?.[1]?.price ?? 0
  );
  const [additionalLabel, setAdditionalLabel] = useState("Free Additional");
  const [additionalPrice, setAdditionalPrice] = useState<number>(0);
  const [roomSizeSqm, setRoomSizeSqm] = useState<number>(0);
  const [numGuests, setNumGuests] = useState<number>(0);
  const [smokingPolicy, setSmokingPolicy] = useState<"smoking" | "non-smoking">(
    "non-smoking"
  );
  const [bedType, setBedType] = useState<string>("");

  // Memoize the update function to prevent unnecessary re-renders
  const updateParent = useCallback(() => {
    if (onUpdate) {
      const updatedRoom: Room = {
        id: roomId,
        name: roomName,
        images: images,
        options: [
          {
            label: "Without Breakfast",
            price: withoutBreakfastPrice,
          },
          {
            label: "With Breakfast",
            price: withBreakfastPrice,
          },
        ],
        features: features,
      };
      onUpdate(updatedRoom);
    }
  }, [
    roomId,
    roomName,
    withoutBreakfastPrice,
    withBreakfastPrice,
    additionalLabel,
    additionalPrice,
    roomSizeSqm,
    numGuests,
    smokingPolicy,
    bedType,
    images,
    features,
    onUpdate,
  ]);

  // Only update parent when values actually change
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      updateParent();
    }, 300); // Debounce updates to prevent excessive calls

    return () => clearTimeout(timeoutId);
  }, [updateParent]);

  // Update local state when props change (e.g., when editing existing room)
  useEffect(() => {
    setRoomName(name);
    setWithoutBreakfastPrice(options?.[0]?.price ?? 0);
    setWithBreakfastPrice(options?.[1]?.price ?? 0);
  }, [name, options]);

  return (
    <Card className="grid grid-cols-1 rounded px-4 py-6 lg:grid-cols-10 lg:px-6">
      <div className="col-span-full flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 flex-1">
          <Input
            id="room-name"
            placeholder="Enter room name"
            value={roomName}
            className="bg-gray-200"
            onChange={(e) => setRoomName(e.target.value)}
          />
          {onRemove && (
            <Button
              type="button"
              size="icon"
              variant="destructive"
              onClick={() => onRemove(roomId)}
            >
              <Trash2 className="size-4" />
            </Button>
          )}
        </div>
      </div>
      <div className="col-span-full grid grid-cols-1 gap-6 lg:col-span-4">
        <ImageUpload onImagesChange={() => {}} />
      </div>
      <div className="col-span-full mt-6 flex flex-col lg:col-span-6 lg:mt-0">
        <div className="flex h-full flex-col space-y-2">
          <div>
            <h3 className="text-lg font-semibold">Room Options</h3>
            <div
              className={`flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center`}
            >
              <div
                className={`flex w-full flex-1 items-start justify-between py-4 sm:items-center`}
              >
                <div>
                  <h4 className="font-medium">Without Breakfast</h4>
                </div>
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <Input
                      className="bg-gray-200 pl-10"
                      placeholder="Rp"
                      value={
                        withoutBreakfastPrice === 0 ? "" : withoutBreakfastPrice
                      }
                      onChange={(e) =>
                        setWithoutBreakfastPrice(Number(e.target.value || 0))
                      }
                    />
                    <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold">
                      Rp
                    </span>
                  </div>
                </div>
              </div>
              <Button variant={"ghost"} type="button" size={"icon"}>
                <Eye className="size-4" />
              </Button>
            </div>
            <Separator />
            <div
              className={`flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center`}
            >
              <div
                className={`flex w-full flex-1 items-start justify-between py-4 sm:items-center`}
              >
                <div>
                  <h4 className="font-medium">With Breakfast</h4>
                </div>
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <Input
                      className="bg-gray-200 pl-10"
                      placeholder="Rp"
                      value={withBreakfastPrice === 0 ? "" : withBreakfastPrice}
                      onChange={(e) =>
                        setWithBreakfastPrice(Number(e.target.value || 0))
                      }
                    />
                    <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold">
                      Rp
                    </span>
                  </div>
                </div>
              </div>
              <Button variant={"ghost"} type="button" size={"icon"}>
                <Eye className="size-4" />
              </Button>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Input
              className="w-64 bg-gray-200"
              placeholder="Free Additional"
              value={additionalLabel}
              onChange={(e) => setAdditionalLabel(e.target.value)}
            />
            <div className="relative w-40">
              <Input
                className="bg-gray-200 pl-8"
                value={additionalPrice === 0 ? "" : additionalPrice}
                onChange={(e) =>
                  setAdditionalPrice(Number(e.target.value || 0))
                }
              />
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold">
                Rp
              </span>
            </div>
            <Button type="button" className="inline-flex items-center gap-2">
              <PlusCircle className="size-4" /> Add
            </Button>
          </div>
          <div className="mt-auto pt-10 lg:pt-4">
            <div className="mb-4 flex flex-wrap gap-4 md:gap-6">
              <div className="flex items-center gap-2">
                <IconArrowAutofitWidth className="h-5 w-5" />
                <div className="relative">
                  <Input
                    placeholder="0"
                    className="bg-gray-200 w-24 pr-11"
                    value={roomSizeSqm === 0 ? "" : roomSizeSqm}
                    onChange={(e) =>
                      setRoomSizeSqm(Number(e.target.value || 0))
                    }
                  />
                  <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm font-semibold">
                    sqm
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <IconFriends className="h-5 w-5" />
                <div className="relative">
                  <Input
                    placeholder="0"
                    className="bg-gray-200 w-26 pr-19"
                    value={numGuests === 0 ? "" : numGuests}
                    onChange={(e) => setNumGuests(Number(e.target.value || 0))}
                  />
                  <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm font-semibold">
                    Guest(s)
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {smokingPolicy === "smoking" ? (
                  <Cigarette className="h-5 w-5" />
                ) : (
                  <CigaretteOff className="h-5 w-5" />
                )}
                <Select
                  value={smokingPolicy}
                  onValueChange={(value: "smoking" | "non-smoking") =>
                    setSmokingPolicy(value)
                  }
                >
                  <SelectTrigger className="bg-gray-200 w-32">
                    <SelectValue placeholder="Select smoking" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="non-smoking">
                      <div className="flex items-center gap-2">
                        <span>Non Smoking</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="smoking">
                      <div className="flex items-center gap-2">
                        <span>Smoking</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-2">
                <IconBed className="h-5 w-5" />
                <div className="relative">
                  <Input
                    placeholder="bed size"
                    className="bg-gray-200 w-26"
                    value={bedType}
                    onChange={(e) => setBedType(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>
          {/* <div className="mt-2">
            <Link
              href="#"
              className="inline-flex items-center gap-2 text-xs text-blue-600 hover:underline"
            >
              See Room Details & Benefits
              <ChevronRight size={14} className="ml-1" />
            </Link>
          </div> */}
        </div>
      </div>
    </Card>
  );
}
