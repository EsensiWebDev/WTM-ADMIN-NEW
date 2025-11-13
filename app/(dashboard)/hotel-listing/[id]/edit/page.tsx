import EditHotelForm from "@/components/dashboard/hotel-listing/form/edit-hotel-form";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { getHotelDetails } from "../../fetch";

const EditHotelPage = async ({
  params,
}: {
  params: Promise<{ id: string }>;
}) => {
  const { id } = await params;
  const response = await getHotelDetails(id);
  const hotel = response.data;

  return (
    <div className="space-y-8">
      <Button variant={"ghost"} asChild>
        <Link href={"/hotel-listing"}>
          <ChevronLeft />
          Back
        </Link>
      </Button>

      <EditHotelForm hotel={hotel} hotelId={id} />
    </div>
  );
};

export default EditHotelPage;
