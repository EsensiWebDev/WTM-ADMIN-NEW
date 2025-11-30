import EditHotelForm from "@/components/dashboard/hotel-listing/form/edit-hotel-form";
import RoomForm from "@/components/dashboard/hotel-listing/form/room-form";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import { getHotelDetails } from "../../fetch";

const EditHotelPage = async ({
  params,
}: {
  params: Promise<{ id: string }>;
}) => {
  const { id } = await params;
  const response = await getHotelDetails(id);
  const { data: hotel, status, error } = response;

  if (error) {
    return <div>{error}</div>;
  }

  if (status !== 200) {
    return <div>Failed to load data</div>;
  }

  // Create a unique key based on hotel data to force re-render on update
  const hotelKey = hotel
    ? `${hotel.id}-${JSON.stringify(hotel.photos)}-${JSON.stringify(
        hotel.nearby_place
      )}-${JSON.stringify(hotel.room_type)}`
    : id;

  return (
    <div className="space-y-8">
      <Button variant={"ghost"} asChild>
        <Link href={"/hotel-listing"}>
          <ChevronLeft />
          Back
        </Link>
      </Button>

      {status !== 200 && <p>Error fetching hotel data</p>}
      {status === 200 && (
        <Suspense fallback={<p>Loading...</p>} key={hotelKey}>
          <EditHotelForm hotel={hotel} hotelId={id} />
          <RoomForm hotelId={id} rooms={hotel.room_type} />
        </Suspense>
      )}
    </div>
  );
};

export default EditHotelPage;
