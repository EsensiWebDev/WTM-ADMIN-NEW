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
  const { data: hotel, status } = response;

  console.log({ hotel, status });

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
        <Suspense fallback={<p>Loading...</p>} key={hotel.id}>
          <EditHotelForm hotel={hotel} hotelId={id} />
          <RoomForm hotelId={id} rooms={hotel.room_type} />
        </Suspense>
      )}
    </div>
  );
};

export default EditHotelPage;
