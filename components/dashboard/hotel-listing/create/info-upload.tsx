"use client";

import { HotelInfoProps } from "@/app/(dashboard)/hotel-listing/create/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { MapPin, PlusCircle, Trash2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

interface HotelInfoUploadProps extends HotelInfoProps {
  onChange?: (data: HotelInfoProps) => void;
}

// Star rating component
const StarRating = ({
  rating,
  onRatingChange,
}: {
  rating: number;
  onRatingChange: (rating: number) => void;
}) => (
  <div className="flex items-center gap-2">
    {Array.from({ length: 5 }).map((_, index) => {
      const starValue = index + 1;
      const isActive = starValue <= rating;
      return (
        <button
          key={starValue}
          type="button"
          aria-label={`Set rating to ${starValue}`}
          onClick={() => onRatingChange(starValue)}
          className={`text-xl transition-colors ${
            isActive ? "text-yellow-500" : "text-muted-foreground"
          }`}
        >
          ★
        </button>
      );
    })}
  </div>
);

// Nearby place item component
const NearbyPlaceItem = ({
  place,
  index,
  onUpdate,
  onRemove,
}: {
  place: { name: string; distance: string };
  index: number;
  onUpdate: (index: number, place: { name: string; distance: string }) => void;
  onRemove: (index: number) => void;
}) => (
  <div className="flex items-center gap-2">
    <MapPin size={16} />
    <Input
      className="bg-gray-200"
      placeholder="Location Name"
      value={place.name}
      onChange={(e) => onUpdate(index, { ...place, name: e.target.value })}
    />
    <Input
      className="flex-1 bg-gray-200"
      placeholder="Radius"
      value={place.distance}
      onChange={(e) => onUpdate(index, { ...place, distance: e.target.value })}
    />
    <Button
      type="button"
      variant="destructive"
      size="icon"
      aria-label={`Remove near place ${index + 1}`}
      onClick={() => onRemove(index)}
    >
      <Trash2 className="size-4" />
    </Button>
  </div>
);

// Facility item component
const FacilityItem = ({
  facility,
  index,
  onUpdate,
  onRemove,
}: {
  facility: string;
  index: number;
  onUpdate: (index: number, value: string) => void;
  onRemove: (index: number) => void;
}) => (
  <div className="flex items-center gap-2">
    <Input
      className="bg-gray-200"
      placeholder="Insert Hotel Facilities"
      value={facility}
      onChange={(e) => onUpdate(index, e.target.value)}
    />
    <Button
      type="button"
      variant="destructive"
      size="icon"
      aria-label={`Remove facility ${index + 1}`}
      onClick={() => onRemove(index)}
    >
      <Trash2 className="size-4" />
    </Button>
  </div>
);

export function HotelInfoUpload({
  name,
  location,
  rating,
  isPromoted,
  promoText,
  price,
  description,
  facilities,
  nearby,
  onChange,
}: HotelInfoUploadProps) {
  // Local state
  const [hotelName, setHotelName] = useState(name);
  const [hotelLocation, setHotelLocation] = useState(location);
  const [hotelRating, setHotelRating] = useState<number>(rating);
  const [hotelDescription, setHotelDescription] = useState(description);
  const [hotelNearby, setHotelNearby] = useState([...nearby]);
  const [hotelFacilities, setHotelFacilities] = useState([...facilities]);
  const [hotelPrice, setHotelPrice] = useState<number>(price);
  const [hotelIsPromoted, setHotelIsPromoted] = useState<boolean>(
    isPromoted || false
  );
  const [hotelPromoText, setHotelPromoText] = useState<string>(promoText || "");

  // Memoized current hotel data
  const currentHotelData = useMemo(
    () => ({
      name: hotelName,
      location: hotelLocation,
      rating: hotelRating,
      description: hotelDescription,
      facilities: hotelFacilities,
      nearby: hotelNearby,
      price: hotelPrice,
      isPromoted: hotelIsPromoted,
      promoText: hotelPromoText,
    }),
    [
      hotelName,
      hotelLocation,
      hotelRating,
      hotelDescription,
      hotelFacilities,
      hotelNearby,
      hotelPrice,
      hotelIsPromoted,
      hotelPromoText,
    ]
  );

  // Notify parent component of changes
  useEffect(() => {
    onChange?.(currentHotelData);
  }, [currentHotelData, onChange]);

  // Event handlers
  const handleNearbyUpdate = useCallback(
    (index: number, place: { name: string; distance: string }) => {
      setHotelNearby((prev) => {
        const next = [...prev];
        next[index] = place;
        return next;
      });
    },
    []
  );

  const handleNearbyRemove = useCallback((index: number) => {
    setHotelNearby((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleNearbyAdd = useCallback(() => {
    setHotelNearby((prev) => [...prev, { name: "", distance: "" }]);
  }, []);

  const handleFacilityUpdate = useCallback((index: number, value: string) => {
    setHotelFacilities((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  }, []);

  const handleFacilityRemove = useCallback((index: number) => {
    setHotelFacilities((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleFacilityAdd = useCallback(() => {
    setHotelFacilities((prev) => [...prev, ""]);
  }, []);

  return (
    <>
      <div className="mb-10 grid grid-cols-1 gap-8 sm:grid-cols-3">
        {/* Rating and Basic Info */}
        <div className="flex flex-col gap-1">
          <StarRating rating={hotelRating} onRatingChange={setHotelRating} />
          <Input
            id="hotel-name"
            placeholder="Enter hotel name"
            value={hotelName}
            className="bg-gray-200"
            onChange={(e) => setHotelName(e.target.value)}
          />
          <Input
            id="hotel-location"
            placeholder="Enter location"
            value={hotelLocation}
            className="bg-gray-200"
            onChange={(e) => setHotelLocation(e.target.value)}
          />
        </div>

        {/* Promotion Settings */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="is-promoted"
              checked={hotelIsPromoted}
              onChange={(e) => setHotelIsPromoted(e.target.checked)}
              className="rounded border-gray-300"
            />
            <label htmlFor="is-promoted" className="text-sm font-medium">
              Promote this hotel
            </label>
          </div>
          {hotelIsPromoted && (
            <Input
              id="promo-text"
              placeholder="Enter promotion text"
              value={hotelPromoText}
              onChange={(e) => setHotelPromoText(e.target.value)}
              className="bg-gray-200"
            />
          )}
        </div>

        {/* Price */}
        <div className="flex flex-col items-end justify-end gap-1">
          <p className="text-muted-foreground text-sm">Start from</p>
          <Input
            id="hotel-price"
            placeholder="Enter price"
            value={hotelPrice}
            className="bg-gray-200 text-right"
            onChange={(e) => setHotelPrice(Number(e.target.value) || 0)}
          />
          <p className="text-muted-foreground text-sm">per room, per night</p>
        </div>
      </div>

      {/* Hotel Details */}
      <div className="mb-10 grid grid-cols-1 gap-8 sm:grid-cols-3">
        {/* Description */}
        <div className="flex flex-col gap-3">
          <h2 className="text-lg font-bold">Description & Benefit</h2>
          <Textarea
            className="h-full bg-gray-200"
            placeholder="Insert Hotel Description here"
            value={hotelDescription}
            onChange={(e) => setHotelDescription(e.target.value)}
          />
        </div>

        {/* Nearby Places */}
        <div className="flex flex-col gap-3">
          <h2 className="text-lg font-bold">Near Us</h2>
          <div className="space-y-3">
            {hotelNearby.map((place, index) => (
              <NearbyPlaceItem
                key={index}
                place={place}
                index={index}
                onUpdate={handleNearbyUpdate}
                onRemove={handleNearbyRemove}
              />
            ))}
            <div className="flex justify-end">
              <Button
                type="button"
                className="inline-flex items-center gap-2"
                onClick={handleNearbyAdd}
              >
                <PlusCircle className="size-4" /> Add List
              </Button>
            </div>
          </div>
        </div>

        {/* Facilities */}
        <div className="flex flex-col gap-3">
          <h2 className="text-lg font-bold">Main Facilities</h2>
          <div className="space-y-3">
            {hotelFacilities.map((facility, index) => (
              <FacilityItem
                key={index}
                facility={facility}
                index={index}
                onUpdate={handleFacilityUpdate}
                onRemove={handleFacilityRemove}
              />
            ))}
            <div className="flex justify-end">
              <Button type="button" onClick={handleFacilityAdd}>
                <PlusCircle className="size-4" /> Add List
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
