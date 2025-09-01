import { CreateHotelForm } from "@/components/dashboard/hotel-listing/create/create-hotel-form";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { fetchHotelDetail } from "./fetch";

const CreateHotelPage = async () => {
  const hotel = await fetchHotelDetail();

  return (
    <div className="space-y-8">
      <Button variant={"ghost"} asChild>
        <Link href={"/hotel-listing"}>
          <ChevronLeft />
          Back
        </Link>
      </Button>

      <CreateHotelForm hotel={hotel} />
    </div>
  );
};

export default CreateHotelPage;
